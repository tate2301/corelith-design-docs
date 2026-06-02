/* Huchu DS — Unified navigation (main nav + kit nav + drawer sidebar)
 *
 * This is the single source of truth for site navigation. It replaces:
 *   - hx-nav.js (old mobile drawer)
 *   - the sidebar/topbar injection inside system-shell.js
 *   - portal-kit-nav.js (folded into the kit-nav rendering here)
 *   - hand-rolled .ds-slim-nav / .hx-topbar markup in hub pages
 *
 * MARKUP CONTRACT
 *   <body data-kit-nav="pos">              -> renders a kit nav below the main nav
 *   <body class="hx-no-nav">               -> opt out entirely (fullscreen demos)
 *   <body class="is-fullscreen">           -> same as hx-no-nav (legacy alias)
 *
 * EXPORTS
 *   window.HuchuNav = { open, close, toggle, pin, unpin, togglePin }
 */
(function () {
  // -------- Path / link helpers -------------------------------------------
  function rootFromPath() {
    const segs = location.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    const depth = Math.max(0, segs.length - 1);
    return '../'.repeat(depth);
  }
  const ROOT = rootFromPath();
  const PATH = location.pathname;
  const CURRENT_FILE = (PATH.split('/').pop() || '').replace('.html', '');

  // -------- Single-source-of-truth link config ----------------------------
  // Top-level main nav. Four super-sections instead of ten flat links so the
  // user always knows which "neighbourhood" they're in:
  //   Design system · Components · Apps · Catalogs
  const SECTIONS = [
    { label: 'Design',     href: ROOT + 'system/foundations.html',
      match: /\/(get-started|install|changelog|foundations|colors|typography|spacing|elevation|motion|iconography|principles|accessibility|content|voice|tokens)\.html$/ },
    { label: 'Build',      href: ROOT + 'system/primitives.html',
      match: /\/(primitives|p-[a-z-]+|blocks|b-[a-z-]+|patterns|x-[a-z-]+|shells|pages|guides|guide-[a-z-]+)\.html$/ },
    { label: 'Apps',       href: ROOT + 'portals/index.html',
      match: /\/portals\// },
    { label: 'Catalogs',   href: ROOT + 'kits/overview.html',
      match: /\/(kits|verticals)\// },
  ];

  // Sidebar (full IA, single source of truth). Reorganised into four
  // intuitive super-sections so the drawer is scannable on phones:
  //   Get started   – overview, install, principles, changelog
  //   Design system – foundations, tokens, content, accessibility
  //   Build with    – components, blocks, patterns, shells, templates, guides
  //   Apps          – the 9 live portal demos (apps you can sign into)
  //   Catalogs      – kits + verticals (UI catalogues, not apps)
  //   Reference     – sitemap + repo
  //
  // Groups render as <details> in the drawer so users can collapse what they
  // don't need. The active group auto-expands. See renderSidebar().
  const SIDEBAR = [
    { label: 'Get started', items: [
      ['Overview',          ROOT + 'index.html',                'index'],
      ['Introduction & install', ROOT + 'system/get-started.html', 'get-started', 'New'],
      ['Install',           ROOT + 'system/install.html',       'install'],
      ['Principles',        ROOT + 'system/principles.html',    'principles'],
      ['Changelog',         ROOT + 'system/changelog.html',     'changelog', 'v0.5'],
    ]},
    { label: 'Design system', items: [
      ['Foundations',       ROOT + 'system/foundations.html',   'foundations'],
      ['Colors',            ROOT + 'system/colors.html',        'colors'],
      ['Typography',        ROOT + 'system/typography.html',    'typography'],
      ['Spacing & layout',  ROOT + 'system/spacing.html',       'spacing'],
      ['Elevation',         ROOT + 'system/elevation.html',     'elevation'],
      ['Motion',            ROOT + 'system/motion.html',        'motion'],
      ['Iconography',       ROOT + 'system/iconography.html',   'iconography'],
      ['Accessibility',     ROOT + 'system/accessibility.html', 'accessibility', 'New'],
      ['Token reference',   ROOT + 'system/tokens.html',        'tokens'],
      ['Voice & tone',      ROOT + 'system/voice.html',         'voice'],
      ['Writing guidelines',ROOT + 'system/content.html',       'content'],
    ]},
    { label: 'Components', items: [
      ['Button',            ROOT + 'system/p-button.html',      'p-button'],
      ['Button group',      ROOT + 'system/p-button-group.html','p-button-group'],
      ['Segmented control', ROOT + 'system/p-segmented-control.html', 'p-segmented-control'],
      ['Input & field',     ROOT + 'system/p-input.html',       'p-input'],
      ['Input group',       ROOT + 'system/p-input-group.html', 'p-input-group'],
      ['Input OTP',         ROOT + 'system/p-input-otp.html',   'p-input-otp'],
      ['Select & combobox', ROOT + 'system/p-select.html',      'p-select'],
      ['Combobox',          ROOT + 'system/p-combobox.html',    'p-combobox'],
      ['Date picker',       ROOT + 'system/p-date-picker.html', 'p-date-picker'],
      ['Calendar',          ROOT + 'system/p-calendar.html',    'p-calendar'],
      ['Checkbox & radio',  ROOT + 'system/p-checkbox.html',    'p-checkbox'],
      ['Switch & toggle',   ROOT + 'system/p-switch.html',      'p-switch'],
      ['Accordion',         ROOT + 'system/p-accordion.html',   'p-accordion'],
      ['Badge & pill',      ROOT + 'system/p-badge.html',       'p-badge'],
      ['Status indicator',  ROOT + 'system/p-status.html',      'p-status'],
      ['Avatar',            ROOT + 'system/p-avatar.html',      'p-avatar'],
      ['Chip & tag',        ROOT + 'system/p-chip.html',        'p-chip'],
      ['Tooltip',           ROOT + 'system/p-tooltip.html',     'p-tooltip'],
      ['Kbd',               ROOT + 'system/p-kbd.html',         'p-kbd'],
      ['Alert',             ROOT + 'system/p-alert.html',       'p-alert'],
      ['Alert dialog',      ROOT + 'system/p-alert-dialog.html','p-alert-dialog'],
      ['Dropdown menu',     ROOT + 'system/p-dropdown-menu.html','p-dropdown-menu'],
      ['Popover',           ROOT + 'system/p-popover.html',     'p-popover'],
      ['Hover card',        ROOT + 'system/p-hover-card.html',  'p-hover-card'],
      ['Command palette',   ROOT + 'system/p-command.html',     'p-command'],
      ['Progress & meter',  ROOT + 'system/p-progress.html',    'p-progress'],
      ['Spinner & skeleton',ROOT + 'system/p-spinner.html',     'p-spinner'],
      ['Mobile list',       ROOT + 'system/p-mobile-list.html', 'p-mobile-list'],
      ['Mobile action bar', ROOT + 'system/p-mobile-action-bar.html', 'p-mobile-action-bar'],
      ['Item row',          ROOT + 'system/p-item.html',        'p-item'],
    ]},
    { label: 'Blocks', items: [
      ['Page header',       ROOT + 'system/b-page-header.html', 'b-page-header'],
      ['Stat card',         ROOT + 'system/b-stat-card.html',   'b-stat-card'],
      ['KPI grid',          ROOT + 'system/b-kpi-grid.html',    'b-kpi-grid'],
      ['Module matrix',     ROOT + 'system/b-module-matrix.html','b-module-matrix'],
      ['Card & panel',      ROOT + 'system/b-card.html',        'b-card'],
      ['Data toolbar',      ROOT + 'system/b-data-toolbar.html','b-data-toolbar'],
      ['Empty state',       ROOT + 'system/b-empty-state.html', 'b-empty-state'],
      ['Callout',           ROOT + 'system/b-callout.html',     'b-callout'],
    ]},
    { label: 'Patterns', items: [
      ['App shell',         ROOT + 'system/x-app-shell.html',   'x-app-shell'],
      ['Data table',        ROOT + 'system/x-data-table.html',  'x-data-table'],
      ['Detail view',       ROOT + 'system/x-detail-view.html', 'x-detail-view'],
      ['Modal & sheet',     ROOT + 'system/x-modal.html',       'x-modal'],
      ['Auth flow',         ROOT + 'system/x-auth.html',        'x-auth'],
      ['Command palette',   ROOT + 'system/x-command-palette.html', 'x-command-palette'],
      ['All shells',        ROOT + 'system/shells.html',        'shells'],
      ['All page templates',ROOT + 'system/pages.html',         'pages'],
    ]},
    { label: 'Guides', items: [
      ['All guides',        ROOT + 'system/guides.html',        'guides', 'New'],
      ['Compose a page',    ROOT + 'system/guide-compose-page.html',     'guide-compose-page'],
      ['Compose a pattern', ROOT + 'system/guide-compose-pattern.html',  'guide-compose-pattern'],
      ['New feature module',ROOT + 'system/guide-new-feature.html',      'guide-new-feature'],
      ['Block vs. pattern', ROOT + 'system/guide-block-vs-pattern.html', 'guide-block-vs-pattern'],
      ['Mobile adaptation', ROOT + 'system/guide-mobile-adaptation.html','guide-mobile-adaptation'],
    ]},
    // Apps = live, sign-in-able portal demos. One CTA per row: open the app.
    // The portal index page is the "hub" — accessed via the All apps link.
    { label: 'Apps', icon: 'grid', items: [
      ['All apps',          ROOT + 'portals/index.html',        '__portals'],
      ['POS terminal',      ROOT + 'portals/pos/demo.html',     '__', null, 'receipt'],
      ['Parent portal',     ROOT + 'portals/parent/demo.html',  '__', null, 'user'],
      ['Student portal',    ROOT + 'portals/student/demo.html', '__', null, 'book'],
      ['Teacher portal',    ROOT + 'portals/teacher/demo.html', '__', null, 'edit'],
      ['Staff portal',      ROOT + 'portals/staff/demo.html',   '__', null, 'user'],
      ['Admin portal',      ROOT + 'portals/admin/demo.html',   '__', 'Dark', 'shield'],
      ['Owner / Manager',   ROOT + 'portals/owner/demo.html',   '__', 'Dark', 'chart'],
      ['Gold Mine Clerk',   ROOT + 'portals/gold/demo.html',    '__', null, 'gem'],
      ['Scrap Yard Clerk',  ROOT + 'portals/scrap/demo.html',   '__', 'New', 'recycle'],
    ]},
    // Catalogs = product UI kits + vertical catalogues. NOT apps — they are
    // libraries of pre-composed pages you can drop into your own product.
    { label: 'Catalogs', icon: 'folder', items: [
      ['All catalogs',      ROOT + 'kits/overview.html',        '__catalogs'],
      ['Verticals',         ROOT + 'verticals/index.html',      '__verticals'],
      ['Dashboard kit',     ROOT + 'kits/overview.html',        '__'],
      ['Gold mining',       ROOT + 'verticals/gold/index.html', '__'],
      ['Scrap metal',       ROOT + 'verticals/scrap/index.html','__'],
      ['Retail',            ROOT + 'verticals/retail/index.html','__'],
      ['Schools',           ROOT + 'verticals/schools/index.html','__'],
      ['Auto',              ROOT + 'verticals/auto/index.html', '__'],
      ['Warehouses',        ROOT + 'verticals/warehouses/index.html','__'],
      ['Accounting',        ROOT + 'verticals/accounting/index.html','__'],
      ['HR',                ROOT + 'verticals/hr/index.html',   '__'],
      ['Maintenance',       ROOT + 'verticals/maintenance/index.html','__'],
      ['CCTV',              ROOT + 'verticals/cctv/index.html', '__'],
      ['Compliance',        ROOT + 'verticals/compliance/index.html','__'],
      ['Multisite',         ROOT + 'verticals/multisite/index.html','__'],
      ['Thrift',            ROOT + 'verticals/thrift/index.html','__'],
    ]},
    { label: 'Reference', items: [
      ['Sitemap',           ROOT + 'sitemap.html',              'sitemap'],
      ['GitHub',            'https://github.com/tate2301/huchu','__'],
    ]},
  ];

  // Kit nav configs (replaces portal-kit-nav.js)
  const KITS = {
    pos: {
      label: 'POS terminal', home: 'index.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['POS', null]],
      screens: [
        ['sale',        'Sale'],
        ['cashup',      'Cash-up'],
        ['counter',     'Counter'],
        ['refund',      'Refund'],
        ['customer',    'Customer'],
        ['z-report',    'Z-report'],
        ['void',        'Void'],
        ['item-search', 'Item search'],
        ['demo',        'Full demo'],
      ],
    },
    parent: {
      label: 'Parent portal', home: 'index.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Parent', null]],
      screens: [
        ['dashboard',       'Dashboard'],
        ['fees',            'Fees'],
        ['attendance',      'Attendance'],
        ['notice',          'Notice'],
        ['profile',         'Profile'],
        ['payment-history', 'Payments'],
        ['demo',            'Full demo'],
      ],
    },
    student: {
      label: 'Student portal', home: 'index.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Student', null]],
      screens: [
        ['dashboard',   'Dashboard'],
        ['timetable',   'Timetable'],
        ['marks',       'Marks'],
        ['assignments', 'Assignments'],
        ['profile',     'Profile'],
        ['library',     'Library'],
        ['demo',        'Full demo'],
      ],
    },
    teacher: {
      label: 'Teacher portal', home: 'index.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Teacher', null]],
      screens: [
        ['dashboard',       'Dashboard'],
        ['marks',           'Marks'],
        ['attendance-take', 'Take roll'],
        ['gradebook',       'Gradebook'],
        ['communications',  'Comms'],
        ['schedule',        'Schedule'],
        ['lesson-planner',  'Lessons'],
        ['demo',            'Full demo'],
      ],
    },
    staff: {
      label: 'Staff portal', home: 'index.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Staff', null]],
      screens: [
        ['dashboard',  'Dashboard'],
        ['leave',      'Leave'],
        ['payslip',    'Payslip'],
        ['time-clock', 'Time clock'],
        ['directory',  'Directory'],
        ['demo',       'Full demo'],
      ],
    },
    admin: {
      label: 'Admin portal', home: 'index.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Admin', null]],
      screens: [
        ['dashboard',    'Dashboard'],
        ['users',        'Users'],
        ['audit',        'Audit log'],
        ['billing',      'Billing'],
        ['integrations', 'Integrations'],
        ['demo',         'Full demo'],
      ],
    },
    gold: {
      label: 'Gold Mine Clerk', home: 'index.html',
      // Single-page kit: every screen below is a hash route inside demo.html;
      // the `demo` entry opens the demo home (no hash).
      singlePage: 'demo.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Gold Mine Clerk', null]],
      screens: [
        ['day-open',     'Day open'],
        ['pour-log',     'New pour'],
        ['pours',        'Pours'],
        ['shifts',       'Shifts'],
        ['groups',       'Groups'],
        ['people',       'Workers'],
        ['buy-gold',     'Buy gold'],
        ['my-day',       'My day'],
        ['dispatch',     'Dispatch'],
        ['sales',        'Sales'],
        ['batches',      'Batches'],
        ['shipments',    'Shipments'],
        ['settlements',  'Settlements'],
        ['vault',        'Vault'],
        ['royalty',      'Royalty'],
        ['demo',         'Full demo'],
      ],
    },
    scrap: {
      label: 'Scrap Yard Clerk', home: 'index.html',
      singlePage: 'demo.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Scrap Yard Clerk', null]],
      screens: [
        ['day-open',     'Day open'],
        ['intake',       'Weigh ticket'],
        ['suppliers',    'Suppliers'],
        ['payouts',      'Payouts'],
        ['stockpile',    'Stockpile'],
        ['dispatch',     'Dispatch'],
        ['reports',      'Reports'],
        ['end-of-day',   'End of day'],
        ['demo',         'Full demo'],
      ],
    },
    owner: {
      label: 'Owner / Manager', home: 'index.html',
      singlePage: 'demo.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Portals', ROOT + 'portals/index.html'], ['Owner / Manager', null]],
      screens: [
        ['today',        'Today'],
        ['lobs',         'Lines of business'],
        ['branches',     'Branches'],
        ['cash',         'Cash on hand'],
        ['ar',           'Money owed to you'],
        ['ap',           'Money you owe'],
        ['flags',        'Flags'],
        ['pnl',          'Profit & loss'],
        ['forecast',     'Expected cash'],
        ['demo',         'Owner app'],
      ],
    },
    dashboard: {
      label: 'Dashboard kit', home: ROOT + 'index.html',
      crumbs: [['Home', ROOT + 'index.html'], ['Kits', ROOT + 'index.html#kits'], ['Dashboard', null]],
      screens: [
        ['overview',        'Overview'],
        ['data-heavy',      'Data tables'],
        ['lists',           'Lists'],
        ['posting-studio',  'Posting'],
        ['journal-detail',  'Journal'],
        ['batch-detail',    'Batch'],
        ['employee-detail', 'Employee'],
        ['import-ledger',   'Import'],
        ['notifications',   'Notifications'],
        ['settings',        'Settings'],
        ['signin',          'Sign-in'],
      ],
    },
  };

  // -------- Render helpers ------------------------------------------------
  function isActiveSection(s) {
    if (s.match instanceof RegExp) return s.match.test(PATH);
    return false;
  }

  function renderMainNav() {
    const nav = document.createElement('header');
    nav.className = 'hx-main-nav';
    nav.innerHTML = `
      <div class="hx-main-nav-l">
        <button class="hx-nav-toggle" aria-label="Toggle navigation" aria-expanded="false" title="Toggle sidebar (\\)">
          <span data-icon="menu" data-icon-size="18"></span>
        </button>
        <a class="hx-brand" href="${ROOT}index.html">
          <span class="mark" data-icon="corelith" data-icon-size="22"></span>
          <span class="name">Huchu</span>
          <span class="badge">DS&nbsp;·&nbsp;0.5</span>
        </a>
      </div>
      <nav class="hx-main-nav-c" aria-label="Primary">
        ${SECTIONS.map(s => `
          <a href="${s.href}" class="${isActiveSection(s) ? 'current' : ''}">${s.label}</a>
        `).join('')}
      </nav>
      <div class="hx-main-nav-r">
        <div class="hx-search" role="search">
          <span data-icon="search" data-icon-size="14"></span>
          <input type="search" placeholder="Search the system…" aria-label="Search" />
          <span class="kbd-hint">⌘K</span>
        </div>
        <a class="hx-icon-btn" href="https://github.com/tate2301/huchu" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub">
          <span data-icon="external" data-icon-size="14"></span>
        </a>
        <button class="hx-icon-btn hx-theme-toggle" type="button" aria-label="Toggle theme" title="Theme (coming soon)">
          <span data-icon="sparkles" data-icon-size="14"></span>
        </button>
      </div>
    `;
    return nav;
  }

  // Resolve the active screen slug for a kit. For single-page kits the
  // active state lives in `location.hash` (#/<slug>), not in the filename.
  // For multi-page kits each screen has its own .html so we use the filename.
  // The 'demo' slug stays active when the user is on the demo home (no hash).
  function activeScreenFor(kit) {
    if (kit.singlePage) {
      const h = location.hash.replace(/^#\/?/, '');
      if (h) return h;
      if (CURRENT_FILE === 'demo') return 'demo';
      return null;
    }
    return CURRENT_FILE;
  }

  function renderKitNav() {
    const kitId = document.body.dataset.kitNav;
    if (!kitId || !KITS[kitId]) return null;
    // Live demo apps opt out — their own bottom-tab nav is the primary nav.
    // The huchu kit-nav is only useful on multi-page catalogs/kits where it
    // helps jump between sibling pages. Live SPAs already have that built in.
    if (document.body.classList.contains('hx-no-kit-nav')) return null;
    const kit = KITS[kitId];
    const current = activeScreenFor(kit);

    const nav = document.createElement('div');
    nav.className = 'hx-kit-nav';
    nav.innerHTML = `
      <div class="hx-kit-nav-l">
        <nav class="hx-crumbs" aria-label="Breadcrumb">
          ${kit.crumbs.map(([label, href], i, arr) => {
            const last = i === arr.length - 1;
            const sep = last ? '' : '<span class="sep">/</span>';
            return href
              ? `<a href="${href}">${label}</a>${sep}`
              : `<span class="cur">${label}</span>${sep}`;
          }).join('')}
        </nav>
      </div>
      <nav class="hx-kit-nav-c" aria-label="Kit screens">
        ${kit.screens.map(([slug, label]) => {
          const cur = slug === current ? ' current' : '';
          // Single-page kits route everything through demo.html#/<slug>;
          // the demo entry itself drops the hash to land on the demo home.
          const href = kit.singlePage
            ? (slug === 'demo' ? kit.singlePage : `${kit.singlePage}#/${slug}`)
            : `${slug}.html`;
          return `<a href="${href}" class="hx-kit-tab${cur}">${label}</a>`;
        }).join('')}
      </nav>
      <div class="hx-kit-nav-r">
        <a class="hx-icon-btn" href="${current}.html" target="_blank" rel="noopener" aria-label="Open in new tab" title="Open in new tab">
          <span data-icon="external" data-icon-size="14"></span>
        </a>
        <button class="hx-icon-btn hx-fullscreen-toggle" type="button" aria-label="Toggle fullscreen" title="Fullscreen">
          <span data-icon="grid" data-icon-size="14"></span>
        </button>
      </div>
    `;
    return nav;
  }

  // Which sidebar group should be highlighted for the current URL?
  // A group is active if any of its items matches the current file, or if
  // the page belongs to that section's catalog (p-*, b-*, x-*, guide-*, etc.).
  function activeGroupLabel() {
    // 1. Direct item-key match wins.
    for (const group of SIDEBAR) {
      for (const item of group.items) {
        const key = item[2];
        if (key && key !== '__' && key === CURRENT_FILE) return group.label;
      }
    }
    // 2. Catalog/prefix matching for component-style pages.
    const f = CURRENT_FILE;
    if (/^p-/.test(f) || f === 'primitives') return 'Components';
    if (/^b-/.test(f) || f === 'blocks')     return 'Blocks';
    if (/^x-/.test(f) || f === 'patterns' || /^pg-/.test(f) || f === 'pages' || f === 'shells') return 'Patterns';
    if (/^guide-/.test(f) || f === 'guides') return 'Guides';
    if (['colors','typography','spacing','elevation','motion','iconography','accessibility','principles','foundations','voice','content','tokens'].includes(f)) return 'Design system';
    if (['get-started','install','changelog'].includes(f)) return 'Get started';
    if (/\/portals\//.test(PATH))             return 'Apps';
    if (/\/(kits|verticals)\//.test(PATH))    return 'Catalogs';
    if (f === 'sitemap')                      return 'Reference';
    return null;
  }

  function renderSidebar() {
    const aside = document.createElement('aside');
    aside.className = 'hx-sidebar';
    aside.setAttribute('aria-label', 'Site navigation');
    const activeGroup = activeGroupLabel();
    aside.innerHTML = `
      <div class="hx-sidebar-head">
        <a class="hx-brand" href="${ROOT}index.html">
          <span class="mark" data-icon="corelith" data-icon-size="20"></span>
          <span class="name">Huchu</span>
          <span class="badge">DS&nbsp;·&nbsp;0.5</span>
        </a>
        <button class="hx-icon-btn hx-pin-toggle" type="button" aria-label="Pin sidebar" title="Pin sidebar (desktop)">
          <span data-icon="sidebar" data-icon-size="14"></span>
        </button>
        <button class="hx-icon-btn hx-sidebar-close" type="button" aria-label="Close sidebar">
          <span data-icon="x" data-icon-size="14"></span>
        </button>
      </div>
      <div class="hx-sidebar-body">
        ${SIDEBAR.map(group => {
          const isActive = group.label === activeGroup;
          const openAttr = isActive ? ' open' : '';
          return `
          <details class="hx-side-group${isActive ? ' active' : ''}"${openAttr}>
            <summary>
              <span class="lb">${group.label}</span>
              <span class="hx-side-chev" data-icon="chevron" data-icon-size="14"></span>
            </summary>
            <div class="hx-side-items">
              ${group.items.map(item => {
                const [label, href, key, tag, icon] = item;
                const isCur = key && key !== '__' && key === CURRENT_FILE;
                const iconHtml = icon ? `<span class="hx-side-ic" data-icon="${icon}" data-icon-size="14"></span>` : '';
                const tagHtml = tag ? `<span class="hx-side-tag">${tag}</span>` : '';
                return `<a href="${href}" class="${isCur ? 'current' : ''}">${iconHtml}<span class="hx-side-lb">${label}</span>${tagHtml}</a>`;
              }).join('')}
            </div>
          </details>`;
        }).join('')}
      </div>
      <div class="hx-sidebar-foot">
        © 2026 Huchu · <a href="${ROOT}system/changelog.html">Changelog</a> · <a href="${ROOT}system/install.html">Install</a>
      </div>
    `;
    return aside;
  }

  // -------- Mount + wiring ------------------------------------------------
  const PIN_KEY = 'huchu-nav-sidebar-pinned';
  const DESKTOP_MIN = 1280;

  function setNavHeights(mainEl, kitEl) {
    const mh = mainEl ? mainEl.offsetHeight : 0;
    const kh = kitEl ? kitEl.offsetHeight : 0;
    document.documentElement.style.setProperty('--hx-main-nav-h', mh + 'px');
    document.documentElement.style.setProperty('--hx-kit-nav-h', kh + 'px');
    document.documentElement.style.setProperty('--hx-nav-h', (mh + kh) + 'px');
  }

  function mount() {
    // Opt out
    if (document.body.classList.contains('hx-no-nav') ||
        document.body.classList.contains('is-fullscreen')) {
      return;
    }
    if (document.querySelector('.hx-main-nav')) return; // already mounted

    // Strip legacy nav markup so we don't double-nav. We keep their <header>s
    // intact by removing only the ones we know we're replacing.
    document.querySelectorAll('.ds-slim-nav, .hx-topbar').forEach(el => el.remove());

    document.body.classList.add('hx-nav-mounted');

    const mainNav = renderMainNav();
    const kitNav  = renderKitNav();
    const sidebar = renderSidebar();
    const scrim   = document.createElement('div');
    scrim.className = 'hx-sidebar-scrim';

    document.body.insertBefore(mainNav, document.body.firstChild);
    if (kitNav) mainNav.insertAdjacentElement('afterend', kitNav);
    document.body.appendChild(sidebar);
    document.body.appendChild(scrim);

    // Centre the active screen tab in view. On mobile the screen tabs are
    // pinned to the bottom as a horizontally-scrollable bar, so we make
    // sure the .current chip is always visible without the user dragging.
    function scrollActiveTabIntoView() {
      const tab = document.querySelector('.hx-kit-tab.current');
      if (!tab) return;
      try {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch (e) { /* older browsers */ }
    }
    scrollActiveTabIntoView();

    // For single-page kits, sync the kit-nav active tab to the current hash
    // every time the user navigates. The kit-nav re-renders so the .current
    // class lands on the right tab without a page reload.
    const kitId = document.body.dataset.kitNav;
    if (kitId && KITS[kitId] && KITS[kitId].singlePage) {
      window.addEventListener('hashchange', () => {
        const old = document.querySelector('.hx-kit-nav');
        if (!old) return;
        const fresh = renderKitNav();
        if (fresh) {
          old.replaceWith(fresh);
          if (window.Icons && window.Icons.render) window.Icons.render(fresh);
          scrollActiveTabIntoView();
        }
      });
    }

    // Compute + maintain nav heights as CSS vars
    const measure = () => setNavHeights(mainNav, kitNav);
    measure();
    window.addEventListener('resize', measure);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(measure);
      ro.observe(mainNav);
      if (kitNav) ro.observe(kitNav);
    }

    // ── Sidebar drawer / pin behaviour ────────────────────────────────
    const toggleBtn   = mainNav.querySelector('.hx-nav-toggle');
    const closeBtn    = sidebar.querySelector('.hx-sidebar-close');
    const pinBtn      = sidebar.querySelector('.hx-pin-toggle');

    function isDesktop() { return window.innerWidth >= DESKTOP_MIN; }

    function open() {
      sidebar.classList.add('open');
      scrim.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      sidebar.classList.remove('open');
      scrim.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      if (document.body.classList.contains('sidebar-pinned')) {
        // When pinned, the toggle button unpins
        unpin();
        return;
      }
      if (sidebar.classList.contains('open')) close(); else open();
    }

    function pin() {
      if (!isDesktop()) return; // pin is desktop-only
      document.body.classList.add('sidebar-pinned');
      sidebar.classList.add('pinned');
      sidebar.classList.remove('open');
      scrim.classList.remove('open');
      pinBtn.setAttribute('aria-pressed', 'true');
      try { localStorage.setItem(PIN_KEY, '1'); } catch (e) {}
    }
    function unpin() {
      document.body.classList.remove('sidebar-pinned');
      sidebar.classList.remove('pinned');
      pinBtn.setAttribute('aria-pressed', 'false');
      try { localStorage.setItem(PIN_KEY, '0'); } catch (e) {}
    }
    function togglePin() {
      if (document.body.classList.contains('sidebar-pinned')) unpin(); else pin();
    }

    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);
    pinBtn.addEventListener('click', togglePin);
    scrim.addEventListener('click', close);
    // Close drawer on sidebar link click (but not when pinned)
    sidebar.addEventListener('click', (e) => {
      if (!e.target.closest('a')) return;
      if (document.body.classList.contains('sidebar-pinned')) return;
      setTimeout(close, 80);
    });

    // Keyboard: Escape closes; \ toggles
    document.addEventListener('keydown', (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
      if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
      if (e.key === '\\' && !inField && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggle();
      }
    });

    // Restore pinned state (desktop only)
    try {
      if (localStorage.getItem(PIN_KEY) === '1' && isDesktop()) pin();
    } catch (e) {}

    // If viewport shrinks below desktop while pinned, auto-unpin
    window.addEventListener('resize', () => {
      if (document.body.classList.contains('sidebar-pinned') && !isDesktop()) {
        unpin();
      }
      // Update pin button visibility
      pinBtn.style.display = isDesktop() ? '' : 'none';
    });
    pinBtn.style.display = isDesktop() ? '' : 'none';

    // ── Kit nav: fullscreen toggle / open-in-new-tab ──────────────────
    if (kitNav) {
      const fs = kitNav.querySelector('.hx-fullscreen-toggle');
      if (fs) {
        fs.addEventListener('click', () => {
          // Add ?fullscreen=1 — pages that want it can read the param.
          // Without a clear shared contract, simplest behavior is to navigate
          // to current page with the param so the page can choose to hide chrome.
          const u = new URL(location.href);
          if (u.searchParams.get('fullscreen') === '1') {
            u.searchParams.delete('fullscreen');
          } else {
            u.searchParams.set('fullscreen', '1');
          }
          location.href = u.toString();
        });
      }
    }

    // ── Cmd/Ctrl+K focuses search ─────────────────────────────────────
    const searchInput = mainNav.querySelector('.hx-search input');
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });

    // ── Fullscreen-from-query: if ?fullscreen=1, hide chrome ──────────
    const params = new URLSearchParams(location.search);
    if (params.get('fullscreen') === '1') {
      document.body.classList.add('is-fullscreen');
      mainNav.style.display = 'none';
      if (kitNav) kitNav.style.display = 'none';
      sidebar.style.display = 'none';
      scrim.style.display = 'none';
      document.documentElement.style.setProperty('--hx-nav-h', '0px');
    }

    // Expose API
    window.HuchuNav = { open, close, toggle, pin, unpin, togglePin };

    // Render icons inside the injected chrome
    if (window.Icons && window.Icons.render) {
      window.Icons.render(mainNav);
      if (kitNav) window.Icons.render(kitNav);
      window.Icons.render(sidebar);
    }
  }

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
