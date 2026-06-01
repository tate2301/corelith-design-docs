/* Huchu DS — hx-topbar mobile drawer
 * Looks for the .hx-topbar in any hub page (portals, verticals, kits, shared)
 * and adds a hamburger menu button + a global navigation drawer with links to
 * every major area of the site. Active section detected by URL.
 *
 * Add to head:
 *   <script src="<path-to-root>hx-nav.js" defer></script>
 */
(function () {
  // Detect path-relative root (count slashes after the first /)
  function rootFromPath() {
    const path = location.pathname;
    // Strip leading slash + trailing filename
    const segs = path.replace(/^\/+/, '').split('/').filter(Boolean);
    // Last segment is the file, so depth = segs.length - 1
    const depth = Math.max(0, segs.length - 1);
    return '../'.repeat(depth);
  }

  const root = rootFromPath();
  const path = location.pathname;

  const NAV = [
    { label: 'Get started', items: [
      ['Home',        root + 'index.html',                'home',         /\/index\.html$|\/$/, ['home']],
      ['Foundations', root + 'system/foundations.html',   'sparkles',     /\/foundations\.html$/, ['foundations', 'colors', 'typography', 'spacing', 'motion', 'elevation', 'iconography', 'voice', 'principles']],
      ['Install',     root + 'system/install.html',       'download',     /\/install\.html$/, []],
      ['Changelog',   root + 'system/changelog.html',     'clock',        /\/changelog\.html$/, []],
    ]},
    { label: 'Build with', items: [
      ['Components',  root + 'system/primitives.html',    'dashboard',    /\/(primitives|p-)/, []],
      ['Blocks',      root + 'system/blocks.html',        'list',         /\/(blocks|b-)/, []],
      ['Patterns',    root + 'system/patterns.html',      'layers',       /\/(patterns|x-)/, []],
      ['Shells',      root + 'system/shells.html',        'sidebar',      /\/shells\.html$/, []],
      ['Pages',       root + 'system/pages.html',         'grid',         /\/(pages|pg-)/, []],
    ]},
    { label: 'Portals', items: [
      ['All portals',      root + 'portals/index.html',         'grid',     /\/portals\/index\.html$/, []],
      ['POS terminal',     root + 'portals/pos/index.html',     'receipt',  /\/portals\/pos\//, []],
      ['Parent portal',    root + 'portals/parent/index.html',  'user',     /\/portals\/parent\//, []],
      ['Student portal',   root + 'portals/student/index.html', 'book',     /\/portals\/student\//, []],
      ['Teacher portal',   root + 'portals/teacher/index.html', 'edit',     /\/portals\/teacher\//, []],
      ['Staff portal',     root + 'portals/staff/index.html',   'user',     /\/portals\/staff\//, []],
      ['Admin portal',     root + 'portals/admin/index.html',   'shield',   /\/portals\/admin\//, []],
    ]},
    { label: 'Verticals', items: [
      ['All verticals', root + 'verticals/index.html',              'grid',     /\/verticals\/index\.html$/, []],
      ['Gold',         root + 'verticals/gold/index.html',         'gem',      /\/verticals\/gold\//, []],
      ['Scrap',        root + 'verticals/scrap/index.html',        'recycle',  /\/verticals\/scrap\//, []],
      ['Retail',       root + 'verticals/retail/index.html',       'bag',      /\/verticals\/retail\//, []],
      ['Schools',      root + 'verticals/schools/index.html',      'book',     /\/verticals\/schools\//, []],
      ['Auto',         root + 'verticals/auto/index.html',         'car',      /\/verticals\/auto\//, []],
      ['Multisite',    root + 'verticals/multisite/index.html',    'branch',   /\/verticals\/multisite\//, []],
      ['HR',           root + 'verticals/hr/index.html',           'user',     /\/verticals\/hr\//, []],
      ['CCTV',         root + 'verticals/cctv/index.html',         'camera',   /\/verticals\/cctv\//, []],
      ['Warehouses',   root + 'verticals/warehouses/index.html',   'warehouse',/\/verticals\/warehouses\//, []],
      ['Thrift',       root + 'verticals/thrift/index.html',       'tag',      /\/verticals\/thrift\//, []],
      ['Compliance',   root + 'verticals/compliance/index.html',   'shield',   /\/verticals\/compliance\//, []],
      ['Maintenance',  root + 'verticals/maintenance/index.html',  'settings', /\/verticals\/maintenance\//, []],
      ['Accounting',   root + 'verticals/accounting/index.html',   'wallet',   /\/verticals\/accounting\//, []],
    ]},
    { label: 'Kits & live demos', items: [
      ['Dashboard',     root + 'kits/overview.html',         'dashboard', /\/kits\/overview\.html$/, []],
      ['Settings',      root + 'kits/settings.html',         'settings',  /\/kits\/settings\.html$/, []],
      ['Sign-in',       root + 'kits/signin.html',           'lock',      /\/kits\/signin\.html$/, []],
      ['POS demo',      root + 'portals/pos/demo.html',      'play',      /\/portals\/pos\/demo\.html$/, []],
    ]},
    { label: 'Reference', items: [
      ['Sitemap',       root + 'sitemap.html',               'list',      /\/sitemap\.html$/, []],
      ['Install',       root + 'system/install.html',        'download',  /\/install\.html$/, []],
      ['Changelog',     root + 'system/changelog.html',      'clock',     /\/changelog\.html$/, []],
      ['GitHub',        'https://github.com/tate2301/huchu', 'external',  /^$/, []],
    ]},
  ];

  function mount() {
    // Always build the drawer so window.HuchuNav.toggle() works on any page
    // (demos, kits, etc). Only auto-insert the hamburger button into a
    // recognized topbar; other pages can render their own button that calls
    // window.HuchuNav.toggle().
    const topbar = document.querySelector('.hx-topbar, .ds-slim-nav');
    if (topbar && !topbar.querySelector('.hx-menu-btn')) {
      // Insert hamburger button at the start of the topbar
      const btn = document.createElement('button');
      btn.className = 'hx-menu-btn';
      btn.setAttribute('aria-label', 'Open menu');
      btn.innerHTML = '<span data-icon="menu" data-icon-size="18"></span>';
      topbar.insertBefore(btn, topbar.firstChild);
    } else if (document.querySelector('.hx-drawer')) {
      return; // already mounted
    } else if (!topbar) {
      // Page has no recognized topbar (demos / kits) — drop a floating
      // pill in the top-left so users always have a way back to the
      // global site navigation. Suppressed by body.no-hx-float-btn or in
      // fullscreen preview mode.
      const btn = document.createElement('button');
      btn.className = 'hx-float-btn';
      btn.setAttribute('aria-label', 'Open site navigation');
      btn.setAttribute('data-hx-nav-trigger', '');
      btn.innerHTML = '<span data-icon="menu" data-icon-size="14"></span><span class="lbl">Huchu</span>';
      document.body.appendChild(btn);
    }

    // Build scrim + drawer
    const scrim = document.createElement('div');
    scrim.className = 'hx-drawer-scrim';
    document.body.appendChild(scrim);

    const drawer = document.createElement('aside');
    drawer.className = 'hx-drawer';
    drawer.innerHTML = `
      <div class="hx-d-head">
        <a class="brand" href="${root}index.html">
          <span class="mark" data-icon="corelith" data-icon-size="20"></span>
          Huchu
        </a>
        <button class="close" aria-label="Close menu"><span data-icon="x" data-icon-size="14"></span></button>
      </div>
      ${NAV.map(group => `
        <h4>${group.label}</h4>
        ${group.items.map(([label, href, icon, re]) => {
          const isCur = re.test(path);
          return `<a href="${href}" class="${isCur ? 'current' : ''}">
            <span class="ic"><span data-icon="${icon}" data-icon-size="14"></span></span>
            <span>${label}</span>
          </a>`;
        }).join('')}
      `).join('')}
      <div class="hx-d-foot">
        Huchu Design System · 0.5<br/>
        <a href="${root}system/changelog.html" style="color: var(--brand-strong); display: inline; padding: 0; background: transparent;">Changelog</a> ·
        <a href="${root}system/install.html" style="color: var(--brand-strong); display: inline; padding: 0; background: transparent;">Install</a>
      </div>
    `;
    document.body.appendChild(drawer);

    function open() {
      drawer.classList.add('open');
      scrim.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('open');
      scrim.classList.remove('open');
      document.body.style.overflow = '';
    }
    function toggle() {
      if (drawer.classList.contains('open')) close(); else open();
    }

    // Expose a global API so demos / kits can trigger the drawer from
    // their own hamburger buttons without re-implementing the markup.
    window.HuchuNav = { open, close, toggle };

    // Auto-wire any element with data-hx-nav-trigger anywhere on the page
    document.querySelectorAll('[data-hx-nav-trigger]').forEach(el => {
      el.addEventListener('click', toggle);
    });

    const btn = topbar ? topbar.querySelector('.hx-menu-btn') : null;
    if (btn) btn.addEventListener('click', open);
    scrim.addEventListener('click', close);
    drawer.querySelector('.close').addEventListener('click', close);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setTimeout(close, 100)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    if (window.Icons && window.Icons.render) {
      if (btn) window.Icons.render(btn);
      window.Icons.render(drawer);
    }
  }

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
