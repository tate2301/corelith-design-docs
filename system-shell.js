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

  // Derive a `.tsx` filename for the code header from a TSX source string.
  // Prefers the first named import from @corelith/design-system; otherwise
  // falls back to a generic Example.tsx.
  function deriveFileName(src) {
    const m = src.match(/import\s*\{\s*([A-Za-z0-9_]+)/);
    if (m && m[1]) return m[1] + '.tsx';
    return 'Example.tsx';
  }

  // TSX highlighter. We process raw (unescaped) source so tag-vs-text regions
  // are unambiguous, escape inside each region, then emit syntax spans. This
  // avoids the chicken-and-egg of re-matching our own injected spans.
  //
  // Highlights: line + block comments, strings (', ", `), JSX tags
  // (component PascalCase vs lowercase intrinsic), JSX attribute names, and a
  // set of TSX keywords in the non-tag (expression) regions.
  const TSX_KEYWORDS = new Set([
    'import', 'from', 'export', 'default', 'function', 'return', 'const', 'let',
    'var', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue',
    'new', 'class', 'extends', 'interface', 'type', 'as', 'async', 'await',
    'typeof', 'instanceof', 'in', 'of', 'void', 'null', 'undefined', 'true',
    'false', 'this', 'super', 'yield',
  ]);

  // Highlight a region of TSX that is NOT inside a tag (imports, JS expressions,
  // text between tags). Keywords, strings and comments are coloured; the rest is
  // escaped verbatim.
  function highlightExpr(src) {
    let out = '';
    let i = 0;
    const N = src.length;
    while (i < N) {
      const ch = src[i];
      // Line comment
      if (ch === '/' && src[i + 1] === '/') {
        let j = i + 2;
        while (j < N && src[j] !== '\n') j++;
        out += `<span class="c">${escHtml(src.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      // Block comment
      if (ch === '/' && src[i + 1] === '*') {
        const end = src.indexOf('*/', i + 2);
        const stop = end === -1 ? N : end + 2;
        out += `<span class="c">${escHtml(src.slice(i, stop))}</span>`;
        i = stop;
        continue;
      }
      // String (single, double, template)
      if (ch === '"' || ch === "'" || ch === '`') {
        let j = i + 1;
        while (j < N) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === ch) { j++; break; }
          j++;
        }
        out += `<span class="s">${escHtml(src.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      // Identifier / keyword
      if (/[A-Za-z_$]/.test(ch)) {
        let j = i + 1;
        while (j < N && /[\w$]/.test(src[j])) j++;
        const word = src.slice(i, j);
        if (TSX_KEYWORDS.has(word)) out += `<span class="k">${word}</span>`;
        else if (/^[A-Z]/.test(word)) out += `<span class="t">${word}</span>`;
        else out += escHtml(word);
        i = j;
        continue;
      }
      out += escHtml(ch);
      i++;
    }
    return out;
  }

  function highlight(code, framework) {
    if (framework !== 'tsx') return escHtml(code);
    let out = '';
    let i = 0;
    const N = code.length;
    while (i < N) {
      // JSX comment {/* … */}
      if (code.startsWith('{/*', i)) {
        const end = code.indexOf('*/}', i + 3);
        const stop = end === -1 ? N : end + 3;
        out += `<span class="c">${escHtml(code.slice(i, stop))}</span>`;
        i = stop;
        continue;
      }
      // JSX tag region
      if (code[i] === '<' && /[a-zA-Z\/>]/.test(code[i + 1] || '')) {
        // Find matching '>'. Must ignore '>' inside quoted attribute values,
        // and inside `{...}` JSX-prop expressions (e.g. onClick={() => x}),
        // so the `>` of an arrow `=>` doesn't close the tag prematurely.
        let j = i + 1;
        let inQ = null;
        let braceDepth = 0;
        while (j < N) {
          const ch = code[j];
          if (inQ) {
            if (ch === '\\') { j += 2; continue; }
            if (ch === inQ) inQ = null;
          } else if (ch === '"' || ch === "'") {
            inQ = ch;
          } else if (ch === '{') {
            braceDepth++;
          } else if (ch === '}') {
            if (braceDepth > 0) braceDepth--;
          } else if (ch === '>' && braceDepth === 0) {
            break;
          }
          j++;
        }
        const tagSrc = code.slice(i, j + 1);
        out += highlightTag(tagSrc);
        i = j + 1;
        continue;
      }
      // Expression / text region — up to the next tag or JSX comment.
      let j = i;
      while (j < N) {
        if (code[j] === '<' && /[a-zA-Z\/>]/.test(code[j + 1] || '')) break;
        if (code.startsWith('{/*', j)) break;
        j++;
      }
      out += highlightExpr(code.slice(i, j));
      i = j;
    }
    return out;
  }

  // Highlight one JSX tag, e.g. `<Button variant="primary">` or `</Button>`.
  // Component names (PascalCase) get the `.t` class; intrinsic tags get `.k`.
  function highlightTag(tag) {
    const lead = tag.startsWith('</') ? '&lt;/' : '&lt;';
    let rest = tag.slice(lead === '&lt;/' ? 2 : 1, -1); // strip < / and >
    const nameMatch = rest.match(/^([A-Za-z][\w.\-]*)/);
    if (!nameMatch) return escHtml(tag);
    const tagName = nameMatch[1];
    rest = rest.slice(tagName.length);
    const nameCls = /^[A-Z]/.test(tagName) ? 't' : 'k';

    // Attribute area: highlight name={…}/name="value" pairs and bare attrs.
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
          let end = rest.indexOf(q, k + 1);
          if (end === -1) end = rest.length;
          const valWithQuotes = rest.slice(k, end + 1);
          attrs += `<span class="s">${escHtml(valWithQuotes)}</span>`;
          k = end + 1;
        } else if (q === '{') {
          // Expression value — find matching brace, highlight inside.
          let depth = 0;
          let end = k;
          while (end < rest.length) {
            if (rest[end] === '{') depth++;
            else if (rest[end] === '}') { depth--; if (depth === 0) { end++; break; } }
            end++;
          }
          const expr = rest.slice(k + 1, end - 1);
          attrs += `{${highlightExpr(expr)}}`;
          k = end;
        } else {
          const um = rest.slice(k).match(/^[^\s>]+/);
          if (um) {
            attrs += `<span class="s">${escHtml(um[0])}</span>`;
            k += um[0].length;
          }
        }
      }
    }
    return `${lead}<span class="${nameCls}">${escHtml(tagName)}</span>${attrs}&gt;`;
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
    // Pattern pages use `.comp-box` for compositions. Treat any .comp-box that
    // carries a `data-code` attribute as a specimen so it gets the Preview/Code
    // tab. (.comp-box without `data-code` is left alone — those pages may have
    // many compositions and only the first/representative one needs a snippet.)
    scope.querySelectorAll('.comp-box[data-code], .dt-cell[data-code]').forEach((el) => {
      if (el.closest('.ds-preview')) return;
      if (el.closest('.ds-specimen')) return;
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

      // The Code tab shows REACT/TSX only, sourced from the design-system
      // package. A specimen declares its example via `data-code` (preferred)
      // or the legacy `data-code-react` attribute — both hold HTML-entity-
      // escaped TSX, which the browser decodes for us in dataset.* access.
      // Legacy `data-code-html` / `data-code-vue` are intentionally ignored:
      // if a specimen has no React snippet, the Code tab is not rendered.
      const reactRaw = el.dataset.code || el.dataset.codeReact || '';
      const hasCode = kind === 'specimen' && !!reactRaw.trim();
      if (hasCode) wrap.classList.add('has-code');

      const toolbar = document.createElement('div');
      toolbar.className = 'ds-preview-toolbar';
      toolbar.innerHTML = `
        <span class="label">${titleText}</span>
        ${hasCode ? `
          <div class="ds-tab-group" role="tablist" aria-label="Preview or code">
            <button type="button" class="ds-tab-btn" data-tab="preview" role="tab" aria-selected="true" tabindex="0">
              <span data-icon="grid" data-icon-size="13"></span><span class="lbl">Preview</span>
            </button>
            <button type="button" class="ds-tab-btn" data-tab="code" role="tab" aria-selected="false" tabindex="-1">
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

      // ---- Code panel (React/TSX only) ----
      let codePanel = null;
      if (hasCode) {
        // Derive a component filename from the first import or the page slug,
        // e.g. `import { Button }` → Button.tsx; `p-page-header` → PageHeader.tsx.
        const fileName = deriveFileName(dedent(reactRaw));

        codePanel = document.createElement('div');
        codePanel.className = 'ds-code-panel';
        codePanel.hidden = true;
        codePanel.innerHTML = `
          <div class="ds-code-header">
            <div class="ds-code-fw single"><span class="ds-code-fw-btn" aria-pressed="true">React</span></div>
            <span class="spacer"></span>
            <span class="ds-code-filename">${escHtml(fileName)}</span>
          </div>
          <div class="ds-code-body-wrap" data-fw-render></div>
        `;
        wrap.appendChild(codePanel);
        codePanel.querySelector('[data-fw-render]').innerHTML = renderCodeBlock(reactRaw, 'tsx');
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
        // Tabs use ARIA tab/tabpanel pattern with roving tabindex.
        frame.setAttribute('role', 'tabpanel');
        if (codePanel) codePanel.setAttribute('role', 'tabpanel');
        toolbar.querySelectorAll('.ds-tab-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            wrap.dataset.tab = tab;
            toolbar.querySelectorAll('.ds-tab-btn').forEach((b) => {
              const sel = b === btn;
              b.setAttribute('aria-selected', sel ? 'true' : 'false');
              b.setAttribute('tabindex', sel ? '0' : '-1');
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
            const ok = await copyText(dedent(reactRaw));
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
