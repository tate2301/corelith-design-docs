/* Huchu DS — Portal kit nav
 * Each portal screen page declares <body data-portal-kit="pos" data-portal-screen="sale">.
 * This script renders a compact "in this portal" navigation strip across the
 * top of the page (above the device chrome) so you can flip between screens
 * without going back to the portal hub.
 *
 * Add to head:
 *   <script src="../../portal-kit-nav.js" defer></script>
 */
(function () {
  const KITS = {
    pos: {
      label: 'POS terminal',
      home: 'index.html',
      screens: [
        ['sale',          'New sale',     'Mobile'],
        ['cashup',        'Cash-up',      'Tablet'],
        ['counter',       'Counter',      'Desktop'],
        ['refund',        'Refund',       'Mobile'],
        ['customer',      'Customer',     'Tablet'],
        ['z-report',      'Z-report',     'Desktop'],
        ['void',          'Void',         'Mobile'],
        ['item-search',   'Item search',  'Mobile'],
      ],
    },
    parent: {
      label: 'Parent portal',
      home: 'index.html',
      screens: [
        ['dashboard',       'Dashboard',     'Mobile'],
        ['fees',            'Fees',          'Mobile'],
        ['attendance',      'Attendance',    'Mobile'],
        ['notice',          'Notice',        'Mobile'],
        ['profile',         'Profile',       'Mobile'],
        ['payment-history', 'Payments',     'Mobile'],
      ],
    },
    student: {
      label: 'Student portal',
      home: 'index.html',
      screens: [
        ['dashboard',   'Dashboard',   'Mobile'],
        ['timetable',   'Timetable',   'Mobile'],
        ['marks',       'Marks',       'Mobile'],
        ['assignments', 'Assignments', 'Mobile'],
        ['profile',     'Profile',     'Mobile'],
        ['library',     'Library',     'Mobile'],
      ],
    },
    teacher: {
      label: 'Teacher portal',
      home: 'index.html',
      screens: [
        ['dashboard',        'Dashboard',     'Tablet'],
        ['marks',            'Marks entry',   'Tablet'],
        ['attendance-take',  'Take roll',     'Mobile'],
        ['gradebook',        'Gradebook',     'Desktop'],
        ['communications',   'Comms',         'Tablet'],
        ['schedule',         'Schedule',      'Tablet'],
        ['lesson-planner',   'Lessons',       'Tablet'],
      ],
    },
    staff: {
      label: 'Staff portal',
      home: 'index.html',
      screens: [
        ['dashboard',  'Dashboard',  'Desktop'],
        ['leave',      'Leave',      'Desktop'],
        ['payslip',    'Payslip',    'Desktop'],
        ['time-clock', 'Time clock', 'Mobile'],
        ['directory',  'Directory',  'Desktop'],
      ],
    },
    admin: {
      label: 'Admin portal',
      home: 'index.html',
      screens: [
        ['dashboard',     'Dashboard',    'Desktop'],
        ['users',         'Users',        'Desktop'],
        ['audit',         'Audit log',    'Desktop'],
        ['billing',       'Billing',      'Desktop'],
        ['integrations',  'Integrations', 'Desktop'],
      ],
    },
  };

  function mount() {
    const body = document.body;
    const kitId = body.dataset.portalKit;
    const currentScreen = body.dataset.portalScreen || '';
    if (!kitId || !KITS[kitId]) return;
    const kit = KITS[kitId];

    const bar = document.createElement('div');
    bar.className = 'pk-nav';
    bar.innerHTML = `
      <a class="pk-home" href="${kit.home}" title="Back to ${kit.label} hub">
        <span data-icon="back" data-icon-size="14"></span>
        <span class="pk-home-label">${kit.label}</span>
      </a>
      <span class="pk-sep">·</span>
      <nav class="pk-screens" aria-label="Screens in this portal">
        ${kit.screens.map(([slug, label, device]) => {
          const cur = slug === currentScreen ? ' current' : '';
          return `<a href="${slug}.html" class="pk-screen${cur}" data-device="${device.toLowerCase()}">
            <span class="pk-screen-label">${label}</span>
            <span class="pk-screen-device">${device}</span>
          </a>`;
        }).join('')}
      </nav>
      <a class="pk-out" href="../../index.html" title="Huchu Design System home">
        <span data-icon="home" data-icon-size="14"></span>
      </a>
    `;
    body.insertBefore(bar, body.firstChild);

    // Render icons now that the nav is in the DOM
    if (window.Icons && window.Icons.render) window.Icons.render(bar);
  }

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
