'use strict';
// Run: node --test tools/perf/site.test.js
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const site = require(path.join(__dirname, '..', '..', 'js', 'site.js'));

function classList(initial = []) {
  const set = new Set(initial);
  return {
    add: (name) => set.add(name),
    remove: (name) => set.delete(name),
    contains: (name) => set.has(name),
    [Symbol.iterator]: () => set.values(),
  };
}

function makeFigure(language, codeText) {
  const children = [];
  const code = { textContent: codeText };
  const figure = {
    classList: classList(['highlight', language]),
    children,
    querySelector: (selector) => {
      if (selector === '.code pre' || selector === 'pre') return code;
      if (selector === '.copy-code') return children.find((child) => child.className === 'copy-code') || null;
      return null;
    },
    prepend: (child) => {
      children.unshift(child);
      child.closest = (selector) => {
        if (selector === '.copy-code') return child.className === 'copy-code' ? child : null;
        if (selector === 'figure.highlight') return figure;
        return null;
      };
    },
  };
  return figure;
}

function makeDocument({ figures = [], lang = 'zh-CN', classes = [] } = {}) {
  const listeners = [];
  return {
    listeners,
    documentElement: { lang, classList: classList(classes) },
    querySelectorAll: (selector) => (selector === 'figure.highlight' ? figures : []),
    querySelector: () => null,
    getElementById: () => null,
    createElement: (tag) => ({ tagName: tag, className: '', textContent: '', setAttribute() {} }),
    addEventListener: (type, handler) => listeners.push({ type, handler }),
  };
}

function makeWindow(search = '') {
  const timers = [];
  const writes = [];
  return {
    timers,
    writes,
    location: { search },
    navigator: { clipboard: { writeText: (text) => { writes.push(text); return Promise.resolve(); } } },
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
  };
}

test('copyLabelForLocale picks Chinese or English labels', () => {
  assert.strictEqual(site.copyLabelForLocale('zh-CN', false), '复制');
  assert.strictEqual(site.copyLabelForLocale('zh', true), '已复制');
  assert.strictEqual(site.copyLabelForLocale('en', false), 'Copy');
  assert.strictEqual(site.copyLabelForLocale('en-US', true), 'Copied');
});

test('wantsEnglish matches only an exact lang=en param', () => {
  assert.strictEqual(site.wantsEnglish('?lang=en'), true);
  assert.strictEqual(site.wantsEnglish('?a=1&lang=en'), true);
  assert.strictEqual(site.wantsEnglish('?lang=en&b=2'), true);
  assert.strictEqual(site.wantsEnglish('?lang=english'), false);
  assert.strictEqual(site.wantsEnglish('?xlang=en'), false);
  assert.strictEqual(site.wantsEnglish(''), false);
  assert.strictEqual(site.wantsEnglish(undefined), false);
});

test('withEnglishParam appends lang=en to site-relative links only', () => {
  assert.strictEqual(site.withEnglishParam('/archives/'), '/archives/?lang=en');
  assert.strictEqual(site.withEnglishParam('/tags/?page=2'), '/tags/?page=2&lang=en');
  assert.strictEqual(site.withEnglishParam('/post/#top'), '/post/?lang=en#top');
  assert.strictEqual(site.withEnglishParam('/post/?lang=en'), '/post/?lang=en');
  assert.strictEqual(site.withEnglishParam('https://example.com/'), 'https://example.com/');
  assert.strictEqual(site.withEnglishParam(''), '');
});

test('init registers exactly one document click listener even when run twice', () => {
  const doc = makeDocument({ figures: [makeFigure('js', 'a'), makeFigure('css', 'b')] });
  const win = makeWindow();
  site.init(doc, win);
  site.init(doc, win);
  assert.strictEqual(doc.listeners.filter((entry) => entry.type === 'click').length, 1);
  // Buttons are not duplicated on a second init either.
  for (const figure of doc.querySelectorAll('figure.highlight')) {
    assert.strictEqual(figure.children.filter((child) => child.className === 'copy-code').length, 1);
    assert.strictEqual(figure.children.filter((child) => child.className === 'code-language').length, 1);
  }
});

test('init removes en-pending in both English and Chinese mode', () => {
  const enDoc = makeDocument({ classes: ['js', 'en-pending'] });
  site.init(enDoc, makeWindow('?lang=en'));
  assert.strictEqual(enDoc.documentElement.classList.contains('en-pending'), false);
  assert.strictEqual(enDoc.documentElement.lang, 'en');
  assert.strictEqual(enDoc.documentElement.classList.contains('js'), true);

  const zhDoc = makeDocument({ classes: ['en-pending'] });
  site.init(zhDoc, makeWindow(''));
  assert.strictEqual(zhDoc.documentElement.classList.contains('en-pending'), false);
});

test('delegated click copies the right figure code and resets the label after 1200ms', async () => {
  const figures = [makeFigure('js', 'first'), makeFigure('py', 'second')];
  const doc = makeDocument({ figures });
  const win = makeWindow();
  site.init(doc, win);
  const click = doc.listeners.find((entry) => entry.type === 'click').handler;
  const button = figures[1].children.find((child) => child.className === 'copy-code');
  assert.strictEqual(button.textContent, '复制');

  click({ target: button });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepStrictEqual(win.writes, ['second']);
  assert.strictEqual(button.textContent, '已复制');
  const reset = win.timers.find((timer) => timer.ms === 1200);
  assert.ok(reset);
  reset.fn();
  assert.strictEqual(button.textContent, '复制');

  // Clicks outside a copy button are ignored.
  click({ target: { closest: () => null } });
  click({ target: null });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepStrictEqual(win.writes, ['second']);
});

function makeMenuElement() {
  const attrs = {};
  return {
    hidden: false,
    setAttribute: (name, value) => { attrs[name] = String(value); },
    getAttribute: (name) => (name in attrs ? attrs[name] : null),
    removeAttribute: (name) => { delete attrs[name]; },
    toggleAttribute: (name, force) => { if (force) attrs[name] = ''; else delete attrs[name]; },
    addEventListener() {},
  };
}

test('init adds nav-ready once the mobile menu toggle is wired up', () => {
  const documentRef = makeDocument({ classes: ['js', 'nav-pending'] });
  const button = makeMenuElement();
  const menu = makeMenuElement();
  documentRef.querySelector = (selector) => (selector === '.menu-toggle' ? button : null);
  documentRef.getElementById = (id) => (id === 'primary-menu' ? menu : null);
  site.init(documentRef, makeWindow());
  assert.strictEqual(documentRef.documentElement.classList.contains('nav-ready'), true);
});

test('init does not add nav-ready when the menu toggle or list is missing', () => {
  const documentRef = makeDocument({ classes: ['js', 'nav-pending'] });
  site.init(documentRef, makeWindow());
  assert.strictEqual(documentRef.documentElement.classList.contains('nav-ready'), false);

  const onlyButton = makeDocument({ classes: ['js'] });
  const button = makeMenuElement();
  onlyButton.querySelector = (selector) => (selector === '.menu-toggle' ? button : null);
  site.init(onlyButton, makeWindow());
  assert.strictEqual(onlyButton.documentElement.classList.contains('nav-ready'), false);
});
