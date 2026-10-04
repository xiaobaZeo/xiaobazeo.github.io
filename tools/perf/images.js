#!/usr/bin/env node
'use strict';
// Adds decoding/loading/width/height to <img> tags in generated HTML pages.
// Intrinsic sizes are fetched (ranged GET) and cached in image-sizes.json.
// Idempotent: a second run makes zero changes.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CACHE = path.join(__dirname, 'image-sizes.json');
const EXCLUDE = new Set(['docs', 'assets', '.claude', '.codegraph', '.git', 'node_modules', 'tools']);
const MAX_BYTES = 8 * 1024 * 1024;
const IMG_RE = /<img\b[^>]*>/gi;

function walk(dir, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (dir === ROOT && EXCLUDE.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function getAttr(tag, name) {
  const m = tag.match(new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
}
function hasAttr(tag, name) {
  return new RegExp('\\s' + name + '(\\s*=|[\\s/>])', 'i').test(tag);
}
function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// ---- image header parsing ----
function parseSize(b) {
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47 && b.toString('ascii', 12, 16) === 'IHDR') {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  if (b.length >= 10 && b.toString('ascii', 0, 3) === 'GIF') {
    return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  }
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8L') {
      const v = b.readUInt32LE(21);
      return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    return { unknown: true };
  }
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const len = b.readUInt16BE(i + 2);
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      if (marker === 0xd9 || marker === 0xda) return { unknown: true };
      i += 2 + len;
    }
    return { needMore: true };
  }
  const head = b.toString('utf8', 0, Math.min(b.length, 512)).trimStart();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return { svg: true };
  return { unknown: true };
}

async function fetchBytes(url, n) {
  const res = await fetch(url, {
    headers: { Range: `bytes=0-${n - 1}`, 'User-Agent': 'Mozilla/5.0 (image-size probe)' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok && res.status !== 206) throw new Error('HTTP ' + res.status);
  // Read at most n bytes even if the server ignores Range.
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < n) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  reader.cancel().catch(() => {});
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return { buf: buf.subarray(0, n), complete: total < n, type: res.headers.get('content-type') || '' };
}

async function probe(url) {
  let n = 65536;
  for (;;) {
    const { buf, complete, type } = await fetchBytes(url, n);
    if (/svg/i.test(type)) return { error: 'svg' };
    const r = parseSize(buf);
    if (r.w && r.h) return { w: r.w, h: r.h };
    if (r.svg) return { error: 'svg' };
    if (r.needMore && !complete && n < MAX_BYTES) { n = Math.min(n * 4, MAX_BYTES); continue; }
    return { error: r.needMore ? 'jpeg SOF not found' : 'unknown format (' + type + ')' };
  }
}

// ---- tag rewriting ----
function rewriteTag(tag, eager, size) {
  const add = [];
  if (!hasAttr(tag, 'decoding')) add.push('decoding="async"');
  if (!eager && !hasAttr(tag, 'loading')) add.push('loading="lazy"');
  if (size && !hasAttr(tag, 'width') && !hasAttr(tag, 'height')) add.push(`width="${size.w}" height="${size.h}"`);
  if (!add.length) return tag;
  const m = tag.match(/(\s*\/?>)$/);
  return tag.slice(0, tag.length - m[1].length) + ' ' + add.join(' ') + m[1];
}

async function main() {
  const files = walk(ROOT, []);
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  const pages = [];
  const urls = new Set();
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const tags = html.match(IMG_RE);
    if (!tags) continue;
    pages.push({ f, html });
    for (const t of tags) {
      const src = getAttr(t, 'src');
      if (src && /^https?:\/\//i.test(src)) urls.add(decodeEntities(src));
    }
  }

  const todo = [...urls].filter((u) => !(u in cache));
  let next = 0;
  async function worker() {
    while (next < todo.length) {
      const u = todo[next++];
      try { cache[u] = await probe(u); } catch (e) { cache[u] = { error: String(e.message || e) }; }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  if (todo.length) {
    const sorted = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]]));
    fs.writeFileSync(CACHE, JSON.stringify(sorted, null, 2) + '\n');
  }

  let imgCount = 0, tagsChanged = 0, pagesChanged = 0;
  for (const { f, html } of pages) {
    // First <img> inside article content stays eager; fall back to first on page.
    let contentStart = html.indexOf('class="post-content"');
    if (contentStart < 0) contentStart = 0;
    let firstSeen = false;
    const out = html.replace(IMG_RE, (tag, offset) => {
      imgCount++;
      let eager = false;
      if (!firstSeen && offset >= contentStart) { eager = true; firstSeen = true; }
      const src = getAttr(tag, 'src');
      const info = src ? cache[decodeEntities(src)] : null;
      const size = info && info.w && info.h ? info : null;
      const nt = rewriteTag(tag, eager, size);
      if (nt !== tag) tagsChanged++;
      return nt;
    });
    if (out !== html) { fs.writeFileSync(f, out); pagesChanged++; }
  }

  const resolved = [...urls].filter((u) => cache[u] && cache[u].w);
  const failed = [...urls].filter((u) => !(cache[u] && cache[u].w));
  console.log(`pages with images: ${pages.length}`);
  console.log(`img tags: ${imgCount}, distinct remote srcs: ${urls.size}, newly fetched: ${todo.length}`);
  console.log(`sizes resolved: ${resolved.length}, failed/skipped: ${failed.length}`);
  for (const u of failed) console.log(`  - ${cache[u] ? cache[u].error : 'no entry'}: ${u}`);
  console.log(`tags changed: ${tagsChanged}, pages changed: ${pagesChanged}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
