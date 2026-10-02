(function attach(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) {
    root.ResumePaper = api;
    if (root.document) {
      root.document.documentElement.classList.add('js');
      root.addEventListener('DOMContentLoaded', () => api.init(root.document, root));
    }
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function createApi() {
  'use strict';

  function setMenuState(button, menu, open) {
    button.setAttribute('aria-expanded', String(Boolean(open)));
    menu.hidden = !open;
  }

  function handleMenuEscape(event, button, menu) {
    if (event.key !== 'Escape' || menu.hidden) return;
    setMenuState(button, menu, false);
    button.focus();
  }

  function languageForClasses(classes) {
    return Array.from(classes || []).find((name) => name !== 'highlight') || '';
  }

  function copyLabelForLocale(locale, copied) {
    const chinese = String(locale).toLowerCase().startsWith('zh');
    if (chinese) return copied ? '已复制' : '复制';
    return copied ? 'Copied' : 'Copy';
  }

  function clipboardWrite(text, navigatorRef, windowRef) {
    if (!navigatorRef || !navigatorRef.clipboard || !navigatorRef.clipboard.writeText) return Promise.resolve(false);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (copied) => {
        if (settled) return;
        settled = true;
        resolve(copied);
      };
      try {
        Promise.resolve(navigatorRef.clipboard.writeText(text)).then(() => finish(true), () => finish(false));
      } catch (error) {
        finish(false);
      }
      windowRef.setTimeout(() => finish(false), 400);
    });
  }

  async function copyText(text, documentRef, navigatorRef, windowRef) {
    if (await clipboardWrite(text, navigatorRef, windowRef)) return true;
    if (typeof documentRef.execCommand !== 'function') return false;
    const field = documentRef.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    documentRef.body.appendChild(field);
    try {
      field.select();
      return documentRef.execCommand('copy') !== false;
    } catch (error) {
      return false;
    } finally {
      field.remove();
    }
  }

  function initMenu(documentRef, windowRef) {
    const button = documentRef.querySelector('.menu-toggle');
    const menu = documentRef.getElementById('primary-menu');
    if (!button || !menu) return;
    const media = windowRef.matchMedia('(max-width: 767px)');
    const sync = () => setMenuState(button, menu, media.matches ? false : true);
    sync();
    button.addEventListener('click', () => setMenuState(button, menu, button.getAttribute('aria-expanded') !== 'true'));
    documentRef.addEventListener('keydown', (event) => {
      if (media.matches) handleMenuEscape(event, button, menu);
    });
    menu.addEventListener('click', (event) => {
      if (media.matches && event.target.closest('a')) setMenuState(button, menu, false);
    });
    if (media.addEventListener) media.addEventListener('change', sync);
    else media.addListener(sync);
  }

  function initCodeCopy(documentRef, windowRef) {
    const locale = documentRef.documentElement.lang || 'zh-CN';
    for (const figure of documentRef.querySelectorAll('figure.highlight')) {
      const code = figure.querySelector('.code pre') || figure.querySelector('pre');
      if (!code || figure.querySelector('.copy-code')) continue;
      const language = languageForClasses(figure.classList);
      if (language) {
        const label = documentRef.createElement('span');
        label.className = 'code-language';
        label.textContent = language;
        figure.prepend(label);
      }
      const button = documentRef.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = copyLabelForLocale(locale, false);
      button.addEventListener('click', async () => {
        const copied = await copyText(code.textContent, documentRef, windowRef.navigator, windowRef);
        if (!copied) return;
        button.textContent = copyLabelForLocale(locale, true);
        windowRef.setTimeout(() => { button.textContent = copyLabelForLocale(locale, false); }, 1200);
      });
      figure.prepend(button);
    }
  }

  function wantsEnglish(search) {
    return /(?:^|[?&])lang=en(?:&|$)/u.test(String(search || ''));
  }

  function withEnglishParam(href) {
    if (!href || href.charAt(0) !== '/' || wantsEnglish(href.split('#')[0].split('?')[1])) return href;
    const [base, hash] = href.split('#');
    const joined = base + (base.includes('?') ? '&' : '?') + 'lang=en';
    return hash === undefined ? joined : `${joined}#${hash}`;
  }

  function applyEnglishLabels(documentRef, windowRef) {
    const search = windowRef && windowRef.location ? windowRef.location.search : '';
    if (!wantsEnglish(search)) return false;
    documentRef.documentElement.lang = 'en';
    for (const element of documentRef.querySelectorAll('[data-en]')) element.textContent = element.getAttribute('data-en');
    for (const element of documentRef.querySelectorAll('[data-en-label]')) element.setAttribute('aria-label', element.getAttribute('data-en-label'));
    for (const element of documentRef.querySelectorAll('[data-en-href]')) element.setAttribute('href', element.getAttribute('data-en-href'));
    const pagination = documentRef.querySelector('.pagination[data-en-prev]');
    if (pagination) {
      for (const link of pagination.querySelectorAll('a')) {
        if (link.classList.contains('prev')) link.textContent = pagination.getAttribute('data-en-prev');
        if (link.classList.contains('next')) link.textContent = pagination.getAttribute('data-en-next');
      }
    }
    // Keep English mode while moving between archive, tag index, tag pages and their pagination.
    for (const link of documentRef.querySelectorAll('[data-en-propagate] a')) {
      link.setAttribute('href', withEnglishParam(link.getAttribute('href')));
    }
    return true;
  }

  function init(documentRef, windowRef) {
    applyEnglishLabels(documentRef, windowRef);
    initMenu(documentRef, windowRef);
    initCodeCopy(documentRef, windowRef);
  }

  return { setMenuState, handleMenuEscape, languageForClasses, copyLabelForLocale, wantsEnglish, withEnglishParam, applyEnglishLabels, init };
}));
