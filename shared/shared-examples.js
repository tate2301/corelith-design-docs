/* Portal hub — Preview/Code example renderer
 *
 * Self-contained (vanilla, no framework). Turns
 *
 *   <div class="px-example"
 *        data-title="Sale line item"
 *        data-html="<div class='...'>…</div>"
 *        data-react="import { Button } from '@corelith/design-system' …">
 *   </div>
 *
 * into a TailwindUI-style card with a Preview | Code tab switch, where the
 * Code view itself offers HTML and React sub-tabs and a per-view Copy button.
 *
 * The highlight / dedent / code-block rendering mirrors the docs site's
 * system-shell.js so the two stay visually consistent. Depends only on
 * icons.js being present (for the toolbar glyphs + copy toast).
 */
(function () {
  'use strict';

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

  // Light HTML/JSX highlighter operating on raw source.
  function highlight(code, framework) {
    if (!(framework === 'html' || framework === 'react' || framework === 'vue')) {
      return escHtml(code);
    }
    let out = '';
    let i = 0;
    const N = code.length;
    while (i < N) {
      if (code.startsWith('<!--', i)) {
        const end = code.indexOf('-->', i + 4);
        const stop = end === -1 ? N : end + 3;
        out += `<span class="c">${escHtml(code.slice(i, stop))}</span>`;
        i = stop;
        continue;
      }
      if (code.startsWith('//', i)) {
        let j = i;
        while (j < N && code[j] !== '\n') j++;
        out += `<span class="c">${escHtml(code.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      if (code[i] === '<' && /[a-zA-Z\/]/.test(code[i + 1] || '')) {
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
        out += highlightTag(code.slice(i, j + 1));
        i = j + 1;
        continue;
      }
      let j = i;
      while (j < N && code[j] !== '<' && !code.startsWith('//', j)) j++;
      out += escHtml(code.slice(i, j));
      i = j;
    }
    return out;
  }

  function highlightTag(tag) {
    const lead = tag.startsWith('</') ? '&lt;/' : '&lt;';
    let rest = tag.slice(lead === '&lt;/' ? 2 : 1, -1);
    const nameMatch = rest.match(/^([a-zA-Z][\w-]*)/);
    if (!nameMatch) return escHtml(tag);
    const tagName = nameMatch[1];
    rest = rest.slice(tagName.length);

    let attrs = '';
    let k = 0;
    while (k < rest.length) {
      const ch = rest[k];
      if (/\s/.test(ch)) { attrs += escHtml(ch); k++; continue; }
      if (ch === '/') { attrs += escHtml(ch); k++; continue; }
      const am = rest.slice(k).match(/^([a-zA-Z@:{][\w\-:.]*)/);
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
          attrs += `<span class="s">${escHtml(rest.slice(k, end + 1))}</span>`;
          k = end + 1;
        } else if (q === '{') {
          let depth = 0, end = k;
          while (end < rest.length) {
            if (rest[end] === '{') depth++;
            else if (rest[end] === '}') { depth--; if (depth === 0) { end++; break; } }
            end++;
          }
          attrs += `<span class="s">${escHtml(rest.slice(k, end))}</span>`;
          k = end;
        } else {
          const um = rest.slice(k).match(/^[^\s>]+/);
          if (um) { attrs += `<span class="s">${escHtml(um[0])}</span>`; k += um[0].length; }
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
    const body = lines.map((l) => (l.length ? l : '​')).join('\n');
    return `<div class="px-code-block"><pre class="px-code-gutter" aria-hidden="true">${gutter}</pre><pre class="px-code-body"><code>${body}</code></pre></div>`;
  }

  let _toastHost = null;
  function showToast(msg) {
    if (!_toastHost) {
      _toastHost = document.createElement('div');
      _toastHost.className = 'px-toast-host';
      document.body.appendChild(_toastHost);
    }
    const el = document.createElement('div');
    el.className = 'px-toast';
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

  function build(node) {
    const title = node.dataset.title || 'Example';
    const htmlSrc = node.dataset.html || '';
    const reactSrc = node.dataset.react || '';

    const sources = [];
    if (htmlSrc) sources.push({ id: 'html', label: 'HTML', file: 'index.html', raw: htmlSrc });
    if (reactSrc) sources.push({ id: 'react', label: 'React', file: 'Example.jsx', raw: reactSrc });

    const card = document.createElement('div');
    card.className = 'px-card';
    card.dataset.tab = 'preview';

    const fwTabs = sources.map((c, idx) =>
      `<button type="button" class="px-code-fw-btn" data-fw="${c.id}" aria-pressed="${idx === 0 ? 'true' : 'false'}">${c.label}</button>`
    ).join('');

    card.innerHTML = `
      <div class="px-toolbar">
        <span class="px-title">${escHtml(title)}</span>
        <div class="px-tab-group" role="tablist" aria-label="Preview or code">
          <button type="button" class="px-tab-btn" data-tab="preview" aria-pressed="true">
            <span data-icon="grid" data-icon-size="13"></span><span class="lbl">Preview</span>
          </button>
          <button type="button" class="px-tab-btn" data-tab="code" aria-pressed="false">
            <span data-icon="code" data-icon-size="13"></span><span class="lbl">Code</span>
          </button>
        </div>
        <span class="px-spacer"></span>
        <button type="button" class="px-copy-btn" title="Copy code">
          <span data-icon="copy" data-icon-size="13"></span><span class="lbl">Copy code</span>
        </button>
      </div>
      <div class="px-preview"><div class="px-preview-stage">${htmlSrc}</div></div>
      <div class="px-code-panel" hidden>
        <div class="px-code-header">
          <div class="px-code-fw" role="tablist" aria-label="Framework">${fwTabs}</div>
          <span class="px-spacer"></span>
          <span class="px-code-filename"></span>
        </div>
        <div class="px-code-body-wrap" data-fw-render></div>
      </div>
    `;

    node.replaceWith(card);

    let activeFw = sources[0] ? sources[0].id : null;
    const panel = card.querySelector('.px-code-panel');
    const preview = card.querySelector('.px-preview');
    const renderEl = card.querySelector('[data-fw-render]');
    const filenameEl = card.querySelector('.px-code-filename');

    const renderActive = () => {
      const src = sources.find((c) => c.id === activeFw) || sources[0];
      if (!src) return;
      renderEl.innerHTML = renderCodeBlock(src.raw, src.id);
      filenameEl.textContent = src.file;
    };
    renderActive();

    card.querySelectorAll('.px-code-fw-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFw = btn.dataset.fw;
        card.querySelectorAll('.px-code-fw-btn').forEach((b) => {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderActive();
      });
    });

    card.querySelectorAll('.px-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        card.dataset.tab = tab;
        card.querySelectorAll('.px-tab-btn').forEach((b) => {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        const showCode = tab === 'code';
        preview.hidden = showCode;
        panel.hidden = !showCode;
      });
    });

    const copyBtn = card.querySelector('.px-copy-btn');
    copyBtn.addEventListener('click', async () => {
      const src = sources.find((c) => c.id === activeFw) || sources[0];
      if (!src) return;
      const ok = await copyText(dedent(src.raw));
      showToast(ok ? 'Copied!' : 'Copy failed');
    });

    if (window.Icons && window.Icons.render) window.Icons.render(card);
  }

  function mount() {
    document.querySelectorAll('.px-example').forEach(build);
    if (window.Icons && window.Icons.render) window.Icons.render(document.body);
  }

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
