#!/usr/bin/env node
// Cache busting: append ?v=<sha256[0:8]> to the main.css <link> href and the
// site.js <script> src in every generated HTML page. Files are not renamed.
// Idempotent: a second run with unchanged assets makes zero changes.
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set(['docs', 'assets', 'tools', 'node_modules', '.git', '.claude', '.codegraph']);

function shortHash(rel) {
  const buf = fs.readFileSync(path.join(ROOT, rel));
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (dir === ROOT && SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function main() {
  const cssV = shortHash('css/main.css');
  const jsV = shortHash('js/site.js');

  // Only touch the attribute inside the specific tag.
  const linkRe = /(<link\b[^>]*\bhref=")\/css\/main\.css(?:\?v=[^"]*)?(")/g;
  const scriptRe = /(<script\b[^>]*\bsrc=")\/js\/site\.js(?:\?v=[^"]*)?(")/g;

  const files = walk(ROOT, []);
  let changedFiles = 0;
  let cssRefs = 0;
  let jsRefs = 0;

  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const out = src
      .replace(linkRe, (m, a, b) => { cssRefs++; return `${a}/css/main.css?v=${cssV}${b}`; })
      .replace(scriptRe, (m, a, b) => { jsRefs++; return `${a}/js/site.js?v=${jsV}${b}`; });
    if (out !== src) {
      fs.writeFileSync(file, out);
      changedFiles++;
    }
  }

  console.log(`css/main.css v=${cssV}, js/site.js v=${jsV}`);
  console.log(`scanned ${files.length} html files; css refs ${cssRefs}, js refs ${jsRefs}; files changed ${changedFiles}`);
}

main();
