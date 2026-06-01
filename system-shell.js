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

  // ── 3. Viewport preview switcher ─────────────────────────────────────
  const VIEWPORTS = [
    { id: 'mobile',  label: 'Mobile',  width: 375,  icon: 'phone' },
    { id: 'tablet',  label: 'Tablet',  width: 768,  icon: 'tablet' },
    { id: 'desktop', label: 'Desktop', width: 1280, icon: 'desktop' },
    { id: 'full',    label: 'Full',    width: null, icon: 'grid' },
  ];

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
      const initialW = VIEWPORTS.find(v => v.id === initialVp).width;
      wrap.style.setProperty('--ds-preview-w', initialW ? initialW + 'px' : '100%');

      let titleText = '';
      const bar = el.querySelector(':scope > .ds-specimen-bar .label');
      if (bar) titleText = bar.textContent.trim();
      if (!titleText) titleText = kind === 'grid' ? 'Variants' : 'Preview';

      const toolbar = document.createElement('div');
      toolbar.className = 'ds-preview-toolbar';
      toolbar.innerHTML = `
        <span class="label">${titleText}</span>
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
