/* Huchu DS — system page enhancement
 *
 * Originally this file injected a topbar + sidebar + footer. That chrome is
 * now produced by the unified huchu-nav.js. This file is now responsible for:
 *
 *   1. Loading huchu-nav.css / huchu-nav.js on system/* pages so authors
 *      don't have to add the tags by hand.
 *   2. The viewport preview switcher around .ds-specimen / .ds-variant-grid
 *      (Tailwind-UI style frame with mobile/tablet/desktop/full toggles).
 *   3. Light footer at the end of the content column.
 *
 * Authoring contract is unchanged:
 *   <body class="ds-doc" data-page="p-button">
 *   <main class="ds-content"> … </main>
 */
(function () {
  const inSystem = /\/system\//.test(location.pathname);
  const root = inSystem ? '../' : '';
  const sys  = inSystem ? '' : 'system/';

  // ── 1. Ensure unified nav is present on every system page ────────────
  function ensureNavAssets() {
    if (!document.querySelector('link[data-huchu-nav]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = root + 'huchu-nav.css';
      link.setAttribute('data-huchu-nav', '');
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-huchu-nav]')) {
      const s = document.createElement('script');
      s.src = root + 'huchu-nav.js';
      s.defer = true;
      s.setAttribute('data-huchu-nav', '');
      document.head.appendChild(s);
    }
  }
  ensureNavAssets();

  // ── 2. Footer (slim, content-area only) ──────────────────────────────
  function appendFooter(main) {
    if (!main || main.querySelector('.ds-footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'ds-footer';
    footer.innerHTML = `
      <span>© 2026 Huchu Enterprises · Design System v0.5</span>
      <span><a href="${sys}changelog.html">Changelog</a> · <a href="${sys}install.html">Install</a> · <a href="${root}kits/overview.html">Demo</a></span>
    `;
    main.appendChild(footer);
  }

  // ── 3. Viewport preview switcher (+ Preview/Code tab) ────────────────
  const VIEWPORTS = [
    { id: 'mobile',  label: 'Mobile',  width: 375,  icon: 'phone' },
    { id: 'tablet',  label: 'Tablet',  width: 768,  icon: 'tablet' },
    { id: 'desktop', label: 'Desktop', width: 1280, icon: 'desktop' },
    { id: 'full',    label: 'Full',    width: null, icon: 'grid' },
  ];

  // ---------- Code-tab helpers ----------
  const escHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Strip a common leading-whitespace indent; drop leading/trailing blank lines.
  function dedent(raw) {
    if (!raw) return '';
    let text = String(raw).replace(/\r\n?/g, '\n');
    text = text.replace(/^\n+/, '').replace(/\s+$/, '');
    const lines = text.split('\n');
    let minIndent = Infinity;
    for (const line of lines) {
      if (!line.trim()) continue;
      const m = line.match(/^[ \t]*/);
      const len = m ? m[0].length : 0;
      if (len < minIndent) minIndent = len;
    }
    if (!isFinite(minIndent) || minIndent === 0) return text;
    return lines.map((l) => l.slice(minIndent)).join('\n');
  }

  // Light HTML/JSX/Vue highlighter. We process raw (unescaped) source so the
  // tag-vs-text regions are unambiguous, escape inside each region, then emit
  // syntax spans. This avoids the chicken-and-egg of re-matching our own
  // injected spans.
  function highlight(code, framework) {
    if (!(framework === 'html' || framework === 'vue' || framework === 'react')) {
      return escHtml(code);
    }
    let out = '';
    let i = 0;
    const N = code.length;
    while (i < N) {
      // Comment block
      if (code.startsWith('<!--', i)) {
        const end = code.indexOf('-->', i + 4);
        const stop = end === -1 ? N : end + 3;
        out += `<span class="c">${escHtml(code.slice(i, stop))}</span>`;
        i = stop;
        continue;
      }
      // Tag region
      if (code[i] === '<' && /[a-zA-Z\/]/.test(code[i + 1] || '')) {
        // Find matching '>' (ignoring those inside quoted attribute values)
        let j = i + 1;
        let inQ = null;
        while (j < N) {
          const ch = code[j];
          if (inQ) {
            if (ch === inQ) inQ = null;
          } else if (ch === '"' || ch === "'") {
            inQ = ch;
          } else if (ch === '>') {
            break;
          }
          j++;
        }
        const tagSrc = code.slice(i, j + 1);
        out += highlightTag(tagSrc);
        i = j + 1;
        continue;
      }
      // Plain text — just escape
      // Find next interesting char
      let j = i;
      while (j < N && code[j] !== '<') j++;
      out += escHtml(code.slice(i, j));
      i = j;
    }
    return out;
  }

  // Highlight one tag, e.g. `<button class="btn">` or `</button>`.
  function highlightTag(tag) {
    // tag begins with < and ends with >
    const lead = tag.startsWith('</') ? '&lt;/' : '&lt;';
    let rest = tag.slice(lead === '&lt;/' ? 2 : 1, -1); // strip < / and >
    // Pull out tag name
    const nameMatch = rest.match(/^([a-zA-Z][\w-]*)/);
    if (!nameMatch) return escHtml(tag);
    const tagName = nameMatch[1];
    rest = rest.slice(tagName.length);

    // Inside the attribute area: highlight name="value" pairs and bare attrs.
    // We scan character by character.
    let attrs = '';
    let k = 0;
    while (k < rest.length) {
      const ch = rest[k];
      if (/\s/.test(ch)) { attrs += escHtml(ch); k++; continue; }
      if (ch === '/') { attrs += escHtml(ch); k++; continue; }
      // Attribute name
      const am = rest.slice(k).match(/^([a-zA-Z@:][\w\-:.]*)/);
      if (!am) { attrs += escHtml(ch); k++; continue; }
      const attrName = am[1];
      k += attrName.length;
      attrs += `<span class="v">${escHtml(attrName)}</span>`;
      if (rest[k] === '=') {
        attrs += '=';
        k++;
        const q = rest[k];
        if (q === '"' || q === "'") {
          // Find closing quote
          let end = rest.indexOf(q, k + 1);
          if (end === -1) end = rest.length;
          const valWithQuotes = rest.slice(k, end + 1);
          attrs += `<span class="s">${escHtml(valWithQuotes)}</span>`;
          k = end + 1;
        } else {
          // Unquoted value
          const um = rest.slice(k).match(/^[^\s>]+/);
          if (um) {
            attrs += `<span class="s">${escHtml(um[0])}</span>`;
            k += um[0].length;
          }
        }
      }
    }
    return `${lead}<span class="k">${escHtml(tagName)}</span>${attrs}&gt;`;
  }

  function renderCodeBlock(codeRaw, framework) {
    const code = dedent(codeRaw);
    const hi = highlight(code, framework);
    const lines = hi.split('\n');
    const gutter = lines.map((_, i) => `<span>${i + 1}</span>`).join('\n');
    const body = lines.map((l) => l.length ? l : '​').join('\n');
    return `<div class="ds-code-block"><pre class="ds-code-gutter" aria-hidden="true">${gutter}</pre><pre class="ds-code-body"><code>${body}</code></pre></div>`;
  }

  let _toastHost = null;
  function showToast(msg) {
    if (!_toastHost) {
      _toastHost = document.createElement('div');
      _toastHost.className = 'ds-toast-host';
      document.body.appendChild(_toastHost);
    }
    const el = document.createElement('div');
    el.className = 'ds-toast';
    el.innerHTML = `<span data-icon="check" data-icon-size="14"></span><span>${escHtml(msg)}</span>`;
    _toastHost.appendChild(el);
    if (window.Icons && window.Icons.render) window.Icons.render(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 220);
    }, 1800);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) { /* fall through */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (_) { return false; }
  }

  function enhancePreviews(scope) {
    const targets = [];
    scope.querySelectorAll('.ds-specimen').forEach((el) => {
      if (el.closest('.ds-preview')) return;
      if (el.closest('.ds-variant-grid')) return;
      targets.push({ el, kind: 'specimen' });
    });
    scope.querySelectorAll('.ds-variant-grid').forEach((el) => {
      if (el.closest('.ds-preview')) return;
      if (el.closest('.ds-specimen')) return;
      targets.push({ el, kind: 'grid' });
    });

    const initialVp = window.innerWidth <= 720 ? 'mobile' : 'full';

    targets.forEach(({ el, kind }) => {
      const wrap = document.createElement('div');
      wrap.className = 'ds-preview';
      wrap.dataset.viewport = initialVp;
      wrap.dataset.tab = 'preview';
      const initialW = VIEWPORTS.find(v => v.id === initialVp).width;
      wrap.style.setProperty('--ds-preview-w', initialW ? initialW + 'px' : '100%');

      let titleText = '';
      const bar = el.querySelector(':scope > .ds-specimen-bar .label');
      if (bar) titleText = bar.textContent.trim();
      if (!titleText) titleText = kind === 'grid' ? 'Variants' : 'Preview';

      // Collect code samples from data-code-* attributes on the specimen.
      // The browser decodes HTML entities for attribute values automatically,
      // so dataset.codeHtml / codeReact / codeVue returns the raw string.
      const codeSources = [];
      if (kind === 'specimen') {
        if (el.dataset.codeHtml)  codeSources.push({ id: 'html',  label: 'HTML',  raw: el.dataset.codeHtml });
        if (el.dataset.codeReact) codeSources.push({ id: 'react', label: 'React', raw: el.dataset.codeReact });
        if (el.dataset.codeVue)   codeSources.push({ id: 'vue',   label: 'Vue',   raw: el.dataset.codeVue });
      }
      const hasCode = codeSources.length > 0;
      if (hasCode) wrap.classList.add('has-code');

      const toolbar = document.createElement('div');
      toolbar.className = 'ds-preview-toolbar';
      toolbar.innerHTML = `
        <span class="label">${titleText}</span>
        ${hasCode ? `
          <div class="ds-tab-group" role="tablist" aria-label="Preview or code">
            <button type="button" class="ds-tab-btn" data-tab="preview" aria-pressed="true">
              <span data-icon="grid" data-icon-size="13"></span><span class="lbl">Preview</span>
            </button>
            <button type="button" class="ds-tab-btn" data-tab="code" aria-pressed="false">
              <span data-icon="code" data-icon-size="13"></span><span class="lbl">Code</span>
            </button>
          </div>
        ` : ''}
        <span class="spacer"></span>
        <div class="ds-viewport-group" role="group" aria-label="Preview viewport">
          ${VIEWPORTS.map(v => `
            <button type="button"
              class="ds-viewport-btn"
              data-vp="${v.id}"
              aria-pressed="${v.id === initialVp ? 'true' : 'false'}"
              title="${v.label}${v.width ? ' · ' + v.width + 'px' : ''}">
              <span data-icon="${v.icon}" data-icon-size="13"></span>
              <span class="lbl">${v.label}</span>
            </button>
          `).join('')}
        </div>
        <span class="ds-viewport-meta">${initialW ? initialW + 'px' : '100%'}</span>
        ${hasCode ? `
          <button type="button" class="ds-copy-btn" title="Copy code">
            <span data-icon="copy" data-icon-size="13"></span><span class="lbl">Copy code</span>
          </button>
        ` : ''}
      `;

      const frame = document.createElement('div');
      frame.className = 'ds-preview-frame' + (kind === 'grid' ? ' flush' : '');
      const stage = document.createElement('div');
      stage.className = 'ds-preview-stage';

      el.parentNode.insertBefore(wrap, el);
      stage.appendChild(el);
      frame.appendChild(stage);
      wrap.appendChild(toolbar);
      wrap.appendChild(frame);

      // ---- Code panel ----
      let codePanel = null;
      let activeFw = codeSources[0]?.id || null;
      if (hasCode) {
        codePanel = document.createElement('div');
        codePanel.className = 'ds-code-panel';
        codePanel.hidden = true;

        const fwTabs = codeSources.length > 1
          ? `<div class="ds-code-fw" role="tablist" aria-label="Framework">
              ${codeSources.map((c) => `
                <button type="button" class="ds-code-fw-btn" data-fw="${c.id}" aria-pressed="${c.id === activeFw ? 'true' : 'false'}">${c.label}</button>
              `).join('')}
            </div>`
          : `<div class="ds-code-fw single"><span class="ds-code-fw-btn" aria-pressed="true">${codeSources[0].label}</span></div>`;

        codePanel.innerHTML = `
          <div class="ds-code-header">
            ${fwTabs}
            <span class="spacer"></span>
            <span class="ds-code-filename"></span>
          </div>
          <div class="ds-code-body-wrap" data-fw-render></div>
        `;
        wrap.appendChild(codePanel);

        const filenameFor = (id) => id === 'react' ? 'Example.jsx' : id === 'vue' ? 'Example.vue' : 'index.html';
        const renderActive = () => {
          const src = codeSources.find((c) => c.id === activeFw) || codeSources[0];
          codePanel.querySelector('[data-fw-render]').innerHTML = renderCodeBlock(src.raw, src.id);
          const fnEl = codePanel.querySelector('.ds-code-filename');
          if (fnEl) fnEl.textContent = filenameFor(src.id);
        };
        renderActive();

        codePanel.querySelectorAll('.ds-code-fw-btn[data-fw]').forEach((btn) => {
          btn.addEventListener('click', () => {
            activeFw = btn.dataset.fw;
            codePanel.querySelectorAll('.ds-code-fw-btn').forEach((b) => {
              b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            renderActive();
          });
        });
      }

      const centerScroll = () => {
        const sw = frame.scrollWidth;
        const cw = frame.clientWidth;
        if (sw > cw) frame.scrollLeft = (sw - cw) / 2;
        else frame.scrollLeft = 0;
      };

      toolbar.querySelectorAll('.ds-viewport-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const vpId = btn.dataset.vp;
          const vp = VIEWPORTS.find(v => v.id === vpId);
          toolbar.querySelectorAll('.ds-viewport-btn').forEach((b) => {
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          wrap.dataset.viewport = vpId;
          if (vp.width) {
            wrap.style.setProperty('--ds-preview-w', vp.width + 'px');
            toolbar.querySelector('.ds-viewport-meta').textContent = vp.width + 'px';
          } else {
            wrap.style.setProperty('--ds-preview-w', '100%');
            toolbar.querySelector('.ds-viewport-meta').textContent = '100%';
          }
          requestAnimationFrame(() => requestAnimationFrame(centerScroll));
          setTimeout(centerScroll, 240);
        });
      });

      if (hasCode) {
        toolbar.querySelectorAll('.ds-tab-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            wrap.dataset.tab = tab;
            toolbar.querySelectorAll('.ds-tab-btn').forEach((b) => {
              b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            const showCode = tab === 'code';
            frame.hidden = showCode;
            if (codePanel) codePanel.hidden = !showCode;
            if (!showCode) requestAnimationFrame(centerScroll);
          });
        });

        const copyBtn = toolbar.querySelector('.ds-copy-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', async () => {
            const src = codeSources.find((c) => c.id === activeFw) || codeSources[0];
            const ok = await copyText(dedent(src.raw));
            showToast(ok ? 'Copied!' : 'Copy failed');
          });
        }
      }

      requestAnimationFrame(centerScroll);
    });
  }

  function mount() {
    const main = document.querySelector('main.ds-content');
    if (main) {
      enhancePreviews(main);
      appendFooter(main);
    }
    if (window.Icons && window.Icons.render) window.Icons.render(document.body);
  }

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
