#!/usr/bin/env node
'use strict';
// Injects an early inline script (and, where needed, an OSS preconnect hint) into
// the <head> of every generated page that loads /js/site.js.
// Idempotent: a second run makes zero changes. Only the <head> section is edited.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set(['docs', 'assets', 'tools', 'node_modules', '.git', '.claude', '.codegraph']);
const OSS = 'https://pengzihao166.oss-cn-beijing.aliyuncs.com';

const HEAD_SCRIPT = "<script data-perf-head>(function(d){d.classList.add('js');d.classList.add('nav-pending');setTimeout(function(){d.classList.remove('nav-pending')},3000);if(/(?:^|[?&])lang=en(?:&|$)/.test(location.search)){d.lang='en';d.classList.add('en-pending');setTimeout(function(){d.classList.remove('en-pending')},3000)}})(document.documentElement)</script>";
const HEAD_SCRIPT_RE = /<script data-perf-head>[\s\S]*?<\/script>/;
const PRECONNECT = '<link rel="preconnect" href="' + OSS + '"/>';

const STYLESHEET_RE = /<link rel="stylesheet" href="\/css\/main\.css(?:\?v=[^"]*)?"\s*\/?>/;
const OSS_IMG_RE = /<img\b[^>]*\bsrc=["']https:\/\/pengzihao166\.oss-cn-beijing\.aliyuncs\.com[/"']/i;

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir === ROOT && SKIP_DIRS.has(entry.name)) continue;
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const stats = { scanned: 0, script: 0, replaced: 0, preconnect: 0, missingStylesheet: [] };

for (const file of walk(ROOT, [])) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('/js/site.js')) continue;
  stats.scanned++;

  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) { stats.missingStylesheet.push(path.relative(ROOT, file)); continue; }
  let head = html.slice(0, headEnd);
  const rest = html.slice(headEnd);

  const m = STYLESHEET_RE.exec(head);
  if (!m) { stats.missingStylesheet.push(path.relative(ROOT, file)); continue; }

  let insert = '';
  if (OSS_IMG_RE.test(rest) && !head.includes('rel="preconnect" href="' + OSS + '"')) {
    insert += PRECONNECT;
    stats.preconnect++;
  }
  if (!HEAD_SCRIPT_RE.test(head)) {
    insert += HEAD_SCRIPT;
    stats.script++;
  }

  let updated = head.slice(0, m.index) + insert + head.slice(m.index);
  // Replace an older injected head script in place so re-runs never duplicate it.
  updated = updated.replace(HEAD_SCRIPT_RE, (found) => {
    if (found !== HEAD_SCRIPT) stats.replaced++;
    return HEAD_SCRIPT;
  });
  if (updated === head) continue;
  fs.writeFileSync(file, updated + rest);
}

console.log('pages scanned:        ' + stats.scanned);
console.log('script inserted:      ' + stats.script);
console.log('script replaced:      ' + stats.replaced);
console.log('preconnect inserted:  ' + stats.preconnect);
if (stats.missingStylesheet.length) {
  console.log('skipped (no </head> or main.css link): ' + stats.missingStylesheet.join(', '));
}
