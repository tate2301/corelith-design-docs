/* Corelith DS — Shell injector
 * Each system/ page declares <body class="ds-doc" data-page="p-button"> and a
 * <main class="ds-content"> with the actual content. This script injects the
 * top nav, sidebar, and footer using path-aware links.
 *
 * Add to head:
 *   <script src="../system-shell.js" defer></script>
 */
(function () {
  // Are we in /system/ or root?
  const inSystem = /\/system\//.test(location.pathname);
  const root = inSystem ? '../' : '';
  const sys  = inSystem ? '' : 'system/';

  const current = (location.pathname.split('/').pop() || '').replace('.html', '');

  // SIDEBAR STRUCTURE
  const sidebarGroups = [
    { label: 'Get started', items: [
      ['Overview',  inSystem ? '../index.html' : 'index.html', 'index'],
      ['Principles', sys + 'principles.html', 'principles'],
      ['Install',    sys + 'install.html', 'install'],
      ['Changelog',  sys + 'changelog.html', 'changelog', 'v0.3'],
    ]},
    { label: 'Foundations', items: [
      ['Colors',         sys + 'colors.html', 'colors'],
      ['Typography',     sys + 'typography.html', 'typography'],
      ['Spacing & layout', sys + 'spacing.html', 'spacing'],
      ['Elevation',      sys + 'elevation.html', 'elevation'],
      ['Motion',         sys + 'motion.html', 'motion'],
      ['Iconography',    sys + 'iconography.html', 'iconography'],
      ['Voice & writing', sys + 'voice.html', 'voice'],
    ]},
    { label: 'Components', items: [
      ['Button',           sys + 'p-button.html', 'p-button'],
      ['Button group',     sys + 'p-button-group.html', 'p-button-group'],
      ['Segmented control', sys + 'p-segmented-control.html', 'p-segmented-control'],
      ['Input & field',    sys + 'p-input.html', 'p-input'],
      ['Input group',      sys + 'p-input-group.html', 'p-input-group'],
      ['Input OTP',        sys + 'p-input-otp.html', 'p-input-otp'],
      ['Select & combobox', sys + 'p-select.html', 'p-select'],
      ['Combobox',         sys + 'p-combobox.html', 'p-combobox'],
      ['Date picker',      sys + 'p-date-picker.html', 'p-date-picker'],
      ['Calendar',         sys + 'p-calendar.html', 'p-calendar'],
      ['Checkbox & radio', sys + 'p-checkbox.html', 'p-checkbox'],
      ['Switch & toggle',  sys + 'p-switch.html', 'p-switch'],
      ['Accordion',        sys + 'p-accordion.html', 'p-accordion'],
      ['Badge & pill',     sys + 'p-badge.html', 'p-badge'],
      ['Status indicator', sys + 'p-status.html', 'p-status'],
      ['Avatar',           sys + 'p-avatar.html', 'p-avatar'],
      ['Chip & tag',       sys + 'p-chip.html', 'p-chip'],
      ['Tooltip',          sys + 'p-tooltip.html', 'p-tooltip'],
      ['Kbd',              sys + 'p-kbd.html', 'p-kbd'],
      ['Alert',            sys + 'p-alert.html', 'p-alert'],
      ['Alert dialog',     sys + 'p-alert-dialog.html', 'p-alert-dialog'],
      ['Dropdown menu',    sys + 'p-dropdown-menu.html', 'p-dropdown-menu'],
      ['Popover',          sys + 'p-popover.html', 'p-popover'],
      ['Hover card',       sys + 'p-hover-card.html', 'p-hover-card'],
      ['Command palette',  sys + 'p-command.html', 'p-command'],
      ['Progress & meter', sys + 'p-progress.html', 'p-progress'],
      ['Spinner & skeleton', sys + 'p-spinner.html', 'p-spinner'],
      ['Mobile list',      sys + 'p-mobile-list.html', 'p-mobile-list'],
      ['Mobile action bar', sys + 'p-mobile-action-bar.html', 'p-mobile-action-bar'],
      ['Scroll container', sys + 'p-scroll-container.html', 'p-scroll-container'],
      ['Page section',     sys + 'p-page-section.html', 'p-page-section'],
      ['Attachment center', sys + 'p-attachment-center.html', 'p-attachment-center'],
      ['Export menu',      sys + 'p-export-menu.html', 'p-export-menu'],
      ['Numeric cell',     sys + 'p-numeric-cell.html', 'p-numeric-cell'],
      ['Item row',         sys + 'p-item.html', 'p-item'],
    ]},
    { label: 'Blocks', items: [
      ['Page header',      sys + 'b-page-header.html', 'b-page-header'],
      ['Page intro',       sys + 'b-page-intro.html', 'b-page-intro'],
      ['Stat card',        sys + 'b-stat-card.html', 'b-stat-card'],
      ['KPI grid',         sys + 'b-kpi-grid.html', 'b-kpi-grid'],
      ['Module matrix',    sys + 'b-module-matrix.html', 'b-module-matrix'],
      ['Summary bar',      sys + 'b-summary-bar.html', 'b-summary-bar'],
      ['Critical strip',   sys + 'b-critical-strip.html', 'b-critical-strip'],
      ['Quick links',      sys + 'b-quick-links.html', 'b-quick-links'],
      ['Highlights',       sys + 'b-highlights.html', 'b-highlights'],
      ['Card & panel',     sys + 'b-card.html', 'b-card'],
      ['Detail hero',      sys + 'b-detail-hero.html', 'b-detail-hero'],
      ['List page shell',  sys + 'b-list-page-shell.html', 'b-list-page-shell'],
      ['Detail page shell', sys + 'b-detail-page-shell.html', 'b-detail-page-shell'],
      ['Form shell',       sys + 'b-form-shell.html', 'b-form-shell'],
      ['Master data shell', sys + 'b-master-data-shell.html', 'b-master-data-shell'],
      ['Data toolbar',     sys + 'b-data-toolbar.html', 'b-data-toolbar'],
      ['Activity feed',    sys + 'b-activity.html', 'b-activity'],
      ['Comment thread',   sys + 'b-comment.html', 'b-comment'],
      ['Callout',          sys + 'b-callout.html', 'b-callout'],
      ['Empty state',      sys + 'b-empty-state.html', 'b-empty-state'],
      ['Status state',     sys + 'b-status-state.html', 'b-status-state'],
      ['Offline banner',   sys + 'b-offline-banner.html', 'b-offline-banner'],
      ['Sync panel',       sys + 'b-sync-panel.html', 'b-sync-panel'],
      ['Conflict dialog',  sys + 'b-conflict-dialog.html', 'b-conflict-dialog'],
      ['Record saved banner', sys + 'b-record-saved-banner.html', 'b-record-saved-banner'],
      ['Export bar',       sys + 'b-export-bar.html', 'b-export-bar'],
    ]},
    { label: 'Patterns', items: [
      ['App shell',        sys + 'x-app-shell.html', 'x-app-shell'],
      ['Settings',         sys + 'x-settings.html', 'x-settings'],
      ['Data table',       sys + 'x-data-table.html', 'x-data-table'],
      ['Detail view',      sys + 'x-detail-view.html', 'x-detail-view'],
      ['Detail tabs',      sys + 'x-detail-tabs.html', 'x-detail-tabs'],
      ['Modal & sheet',    sys + 'x-modal.html', 'x-modal'],
      ['Notifications',    sys + 'x-notifications.html', 'x-notifications'],
      ['Auth flow',        sys + 'x-auth.html', 'x-auth'],
      ['Executive dashboard', sys + 'x-executive-dashboard.html', 'x-executive-dashboard'],
      ['Command palette',  sys + 'x-command-palette.html', 'x-command-palette'],
      ['Offline runtime',  sys + 'x-offline-runtime.html', 'x-offline-runtime'],
      ['Onboarding',       sys + 'x-onboarding.html', 'x-onboarding'],
      ['Role gate',        sys + 'x-role-gate.html', 'x-role-gate'],
      ['Master data',      sys + 'x-master-data.html', 'x-master-data'],
      ['Import wizard',    sys + 'x-import-wizard.html', 'x-import-wizard'],
      ['Audit view',       sys + 'x-audit-view.html', 'x-audit-view'],
      ['Approval flow',    sys + 'x-approval-flow.html', 'x-approval-flow'],
      ['Bulk edit',        sys + 'x-bulk-edit.html', 'x-bulk-edit'],
      ['Help center',      sys + 'x-help-center.html', 'x-help-center'],
    ]},
    { label: 'Shells', items: [
      ['All shells',       sys + 'shells.html', 'shells'],
      ['Dashboard',        inSystem ? '../kits/overview.html' : 'kits/overview.html', '__'],
      ['Settings',         inSystem ? '../kits/settings.html' : 'kits/settings.html', '__'],
      ['POS portal',       inSystem ? '../portals/pos/index.html' : 'portals/pos/index.html', '__'],
      ['Parent portal',    inSystem ? '../portals/parent/index.html' : 'portals/parent/index.html', '__'],
      ['Student portal',   inSystem ? '../portals/student/index.html' : 'portals/student/index.html', '__'],
      ['Teacher portal',   inSystem ? '../portals/teacher/index.html' : 'portals/teacher/index.html', '__'],
    ]},
    { label: 'Pages', items: [
      ['Overview dashboard', sys + 'pg-overview.html', 'pg-overview'],
      ['Data tables',      sys + 'pg-data.html', 'pg-data'],
      ['Detail pages',     sys + 'pg-detail.html', 'pg-detail'],
      ['Import & ETL',     sys + 'pg-import.html', 'pg-import'],
      ['Posting Studio',   sys + 'pg-posting.html', 'pg-posting'],
      ['Retail / POS',     sys + 'pg-retail.html', 'pg-retail', 'New'],
      ['POS terminal',     sys + 'pg-pos.html', 'pg-pos'],
      ['Product catalog',  sys + 'pg-products.html', 'pg-products'],
      ['Inventory',        sys + 'pg-inventory.html', 'pg-inventory'],
      ['Customers',        sys + 'pg-customers.html', 'pg-customers'],
      ['Sign-in',          sys + 'pg-signin.html', 'pg-signin'],
    ]},
  ];

  // TOP NAV
  const topNav = [
    ['Overview',    inSystem ? '../index.html' : 'index.html', ['index']],
    ['Foundations', sys + 'foundations.html', ['foundations','colors','typography','spacing','elevation','motion','iconography','voice','principles']],
    ['Components',  sys + 'primitives.html',  ['primitives','p-button','p-button-group','p-segmented-control','p-input','p-input-group','p-input-otp','p-select','p-combobox','p-date-picker','p-calendar','p-checkbox','p-switch','p-accordion','p-badge','p-status','p-avatar','p-chip','p-tooltip','p-kbd','p-alert','p-alert-dialog','p-dropdown-menu','p-popover','p-hover-card','p-command','p-progress','p-spinner','p-mobile-list','p-mobile-action-bar','p-scroll-container','p-page-section','p-attachment-center','p-export-menu','p-numeric-cell','p-item']],
    ['Blocks',      sys + 'blocks.html',      ['blocks','b-page-header','b-page-intro','b-stat-card','b-kpi-grid','b-module-matrix','b-summary-bar','b-critical-strip','b-quick-links','b-highlights','b-card','b-detail-hero','b-list-page-shell','b-detail-page-shell','b-form-shell','b-master-data-shell','b-data-toolbar','b-activity','b-comment','b-callout','b-empty-state','b-status-state','b-offline-banner','b-sync-panel','b-conflict-dialog','b-record-saved-banner','b-export-bar']],
    ['Patterns',    sys + 'patterns.html',    ['patterns','x-app-shell','x-settings','x-data-table','x-detail-view','x-detail-tabs','x-modal','x-notifications','x-auth','x-executive-dashboard','x-command-palette','x-offline-runtime','x-onboarding','x-role-gate','x-master-data','x-import-wizard','x-audit-view','x-approval-flow','x-bulk-edit','x-help-center']],
    ['Shells',      sys + 'shells.html',      ['shells']],
    ['Kits',        inSystem ? '../index.html#kits' : 'index.html#kits', []],
    ['Portals',     inSystem ? '../index.html#portals' : 'index.html#portals', []],
  ];

  // BUILD
  const layout = document.createElement('div');
  layout.className = 'ds-layout';

  // Top bar
  const topbar = document.createElement('header');
  topbar.className = 'ds-topbar';
  topbar.innerHTML = `
    <a class="ds-brand" href="${inSystem ? '../index.html' : 'index.html'}">
      <span class="mark" data-icon="corelith" data-icon-size="22"></span>
      Huchu
      <span class="ds-badge">DS · 0.5</span>
    </a>
    <nav class="ds-nav">
      ${topNav.map(([label, href, keys]) => {
        const isCurrent = keys.includes(current);
        return `<a href="${href}" class="${isCurrent ? 'current' : ''}">${label}</a>`;
      }).join('')}
    </nav>
    <div class="ds-search">
      <span data-icon="search"></span>
      <input placeholder="Search…" />
      <span class="kbd-hint">⌘K</span>
    </div>
    <div class="ds-actions">
      <a href="${root}kits/overview.html">Live demo →</a>
    </div>
  `;
  layout.appendChild(topbar);

  // Sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'ds-sidebar';
  sidebar.innerHTML = sidebarGroups.map(g => `
    <h4>${g.label}</h4>
    ${g.items.map(([label, href, key, tag]) => {
      const isCurrent = key === current;
      return `<a href="${href}" class="${isCurrent ? 'current' : ''}">${label}${tag ? `<span class="tag" ${tag === 'New' ? 'style="background: var(--tone-success-bg); color: var(--tone-success);"' : ''}>${tag}</span>` : ''}</a>`;
    }).join('')}
  `).join('');
  layout.appendChild(sidebar);

  // Existing <main> content (move into the layout)
  const main = document.querySelector('main.ds-content');
  if (main) layout.appendChild(main);

  // Footer
  const footer = document.createElement('footer');
  footer.className = 'ds-footer';
  footer.innerHTML = `
    <span>© 2026 Huchu Enterprises · Design System v0.5</span>
    <span><a href="${sys}changelog.html">Changelog</a> · <a href="${sys}install.html">Install</a> · <a href="${root}kits/overview.html">Demo</a></span>
  `;
  layout.appendChild(footer);

  // Mount: replace body content with layout
  const mount = () => {
    // Remove the original <main> from its current position
    if (main && main.parentNode && main.parentNode !== layout) {
      main.parentNode.removeChild(main);
      layout.insertBefore(main, footer);
    }
    document.body.insertBefore(layout, document.body.firstChild);
    // Render any icons now that DOM is updated
    if (window.Icons && window.Icons.render) window.Icons.render(layout);
  };

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
