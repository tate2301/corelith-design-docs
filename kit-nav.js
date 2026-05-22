/* Kit navigation bar — injects a sticky top strip linking all kit demos.
 * Include once per kit:  <script src="../kit-nav.js" defer></script>
 */
(function () {
  // Detect which folder we're in so links resolve correctly.
  // /kits/*.html  → prefix kits links with "" and preview links with "../preview/"
  // /preview/*.html → prefix kits links with "../kits/" and preview links with ""
  // /index.html → no prefix
  const path = location.pathname;
  const inKits    = /\/kits\//.test(path);
  const inPreview = /\/preview\//.test(path);
  const kitDir    = inKits ? '' : (inPreview ? '../kits/' : 'kits/');
  const prevDir   = inPreview ? '' : (inKits ? '../preview/' : 'preview/');
  const idxHref   = inKits || inPreview ? '../index.html' : 'index.html';

  const items = [
    { href: idxHref, label: '↩ Index', system: true },

    { group: 'Foundations' },
    { href: prevDir + 'typography.html', label: 'Type' },
    { href: prevDir + 'colors.html',     label: 'Colors' },
    { href: prevDir + 'spacing.html',    label: 'Spacing' },
    { href: prevDir + 'components.html', label: 'Components' },
    { href: prevDir + 'brand.html',      label: 'Brand' },

    { group: 'Kits' },
    { href: kitDir + 'overview.html',         label: 'Overview' },
    { href: kitDir + 'batch-detail.html',      label: 'Batch detail' },
    { href: kitDir + 'journal-detail.html',    label: 'Journal detail' },
    { href: kitDir + 'employee-detail.html',   label: 'Employee detail' },
    { href: kitDir + 'import-ledger.html',    label: 'Import' },
    { href: kitDir + 'data-heavy.html',       label: 'Data tables' },
    { href: kitDir + 'posting-studio.html',   label: 'Posting Studio' },
    { href: kitDir + 'notifications.html',    label: 'Notifications' },
    { href: kitDir + 'lists.html',            label: 'Lists' },
    { href: kitDir + 'settings.html',         label: 'Settings' },
    { href: kitDir + 'signin.html',           label: 'Sign-in' },
  ];

  const current = path.split('/').pop() || '';

  const css = `
    .__kitnav {
      position: sticky; top: 0; z-index: 99;
      display: flex; align-items: center; gap: 2px;
      padding: 8px 16px;
      background: rgba(20, 22, 30, 0.94);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-family: "Atkinson Hyperlegible Next", system-ui, sans-serif;
      font-size: 12px;
      overflow-x: auto;
    }
    .__kitnav a {
      color: rgba(255,255,255,0.62);
      text-decoration: none;
      padding: 6px 10px;
      border-radius: 6px;
      white-space: nowrap;
      transition: color 120ms, background-color 120ms;
    }
    .__kitnav a:hover { color: #fff; background: rgba(255,255,255,0.07); }
    .__kitnav a.current { color: #fff; background: rgba(255,255,255,0.13); font-weight: 500; }
    .__kitnav .__sep {
      color: rgba(255,255,255,0.5);
      margin-right: 8px;
      padding-right: 16px;
      border-right: 1px solid rgba(255,255,255,0.12);
    }
    .__kitnav .__group {
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 10px;
      padding: 0 10px 0 12px;
      white-space: nowrap;
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const nav = document.createElement('nav');
  nav.className = '__kitnav';
  nav.innerHTML = items.map(it => {
    if (it.group) return `<span class="__group">${it.group}</span>`;
    const hrefTail = (it.href || '').split('/').pop();
    const isCurrent = !it.system && current && hrefTail === current;
    const cls = (it.system ? '__sep ' : '') + (isCurrent ? 'current' : '');
    return `<a href="${it.href}" class="${cls.trim()}">${it.label}</a>`;
  }).join('');

  const mount = () => document.body.insertBefore(nav, document.body.firstChild);
  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
