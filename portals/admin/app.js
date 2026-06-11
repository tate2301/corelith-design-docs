/* =====================================================================
   Admin portal · app.js
   Shared state ops + simulated-OAuth for the click-around prototype.
   Loaded by demo.html as a classic script (no module). Exposes:
     window.AdminApp = { Store, DEFAULTS, util }
   ===================================================================== */
(function (global) {
  'use strict';

  const KEY_PREFIX = 'corelith:admin:';

  /* ------------------------- Seed data ------------------------- */
  const DEFAULTS = {
    users: [
      { id: 'u_001', name: 'Tendai Ncube',       email: 'tendai.n@corelithzw.com',     role: 'owner',   roleLabel: 'Owner',              status: 'active', last: 'Just now',    branch: 'All branches' },
      { id: 'u_002', name: 'Faith Moyo',         email: 'faith.m@corelithzw.com',      role: 'admin',   roleLabel: 'Manager',            status: 'active', last: '2 min ago',   branch: 'Park Centre' },
      { id: 'u_003', name: 'Tatenda Marongedza', email: 'tatenda.m@corelithzw.com',    role: 'op',      roleLabel: 'Cashier',            status: 'active', last: '14 min ago',  branch: 'Westgate' },
      { id: 'u_004', name: 'Rumbidzai Chivasa',  email: 'rumbidzai.c@corelithzw.com',  role: 'op',      roleLabel: 'Cashier',            status: 'sus',    last: '12 Jun 2026', branch: 'Avondale' },
      { id: 'u_005', name: 'Tariro Mhondiwa',    email: 'tariro.m@corelithzw.com',     role: 'view',    roleLabel: 'Viewer',             status: 'active', last: '2 hr ago',    branch: 'HQ' },
      { id: 'u_006', name: 'Munyaradzi Mhike',   email: 'munya.m@corelithzw.com',      role: 'admin',   roleLabel: 'Manager',            status: 'inv',    last: '— never',     branch: 'Bulawayo · Main' },
    ],

    audit: buildAuditSeed(),

    integrations: [
      { id: 'stripe',   nm: 'Stripe',           desc: 'Take USD card payments — online and tap-to-pay.',          connected: false, connectedAt: null },
      { id: 'ecocash',  nm: 'EcoCash',          desc: 'Take ZWG and USD wallet payments at the till.',            connected: false, connectedAt: null },
      { id: 'nmb',      nm: 'NMB Bank',         desc: 'Daily payout summary and per-branch settlement accounts.', connected: false, connectedAt: null },
      { id: 'slack',    nm: 'Slack',            desc: 'Send activity warnings to #corelith-alerts.',              connected: false, connectedAt: null },
      { id: 'google',   nm: 'Google Workspace', desc: 'Sign in with Google and sync staff directory.',            connected: false, connectedAt: null },
      { id: 'zoho',     nm: 'Zoho Books',       desc: 'Push daily sales into Zoho Books as journal entries.',     connected: false, connectedAt: null },
      { id: 'pastel',   nm: 'Pastel',           desc: 'Sync chart of accounts with Sage Pastel Partner.',         connected: false, connectedAt: null },
      { id: 'mailersend', nm: 'MailerSend',     desc: 'Send transactional and marketing email at scale.',         connected: false, connectedAt: null },
    ],

    settings: {
      currentRoute: 'dashboard',
    },
  };

  function buildAuditSeed() {
    // ~25 seed events with realistic before/after data.
    const A = 'Tendai Ncube', B = 'Faith Moyo', C = 'Tatenda Marongedza', D = 'system';
    const evts = [
      ['user.login',          A, 'tendai.n@corelithzw.com', null, { ip: '196.43.118.12', device: 'macOS · Safari' }],
      ['user.login',          B, 'faith.m@corelithzw.com',  null, { ip: '196.43.118.84', device: 'Windows · Chrome' }],
      ['user.role-change',    A, 'tatenda.m@corelithzw.com', { role: 'Viewer' }, { role: 'Cashier' }],
      ['integration.toggled', A, 'EcoCash',                  { connected: false }, { connected: true }],
      ['user.invited',        A, 'munya.m@corelithzw.com',   null, { role: 'Manager', branch: 'Bulawayo · Main' }],
      ['settings.changed',    A, 'session_timeout',          { minutes: 30 }, { minutes: 60 }],
      ['user.suspended',      A, 'rumbidzai.c@corelithzw.com', { status: 'Active' }, { status: 'Suspended' }],
      ['billing.changed',     A, 'plan',                     { plan: 'Starter' }, { plan: 'Growth · yearly' }],
      ['user.login',          C, 'tatenda.m@corelithzw.com', null, { ip: '196.43.118.61', device: 'Android · Chrome' }],
      ['user.login-failed',   D, 'unknown@example.com',      null, { attempts: 5, ip: '102.213.55.18' }],
      ['integration.toggled', A, 'Slack',                    { connected: false }, { connected: true }],
      ['user.removed',        A, 'old.intern@corelithzw.com', { role: 'Cashier', status: 'Active' }, { removed: true }],
      ['settings.changed',    A, 'brand_color',              { color: '#0B5DF0' }, { color: '#7C3AED' }],
      ['user.login',          A, 'tendai.n@corelithzw.com',  null, { ip: '196.43.118.12', device: 'iOS · Safari' }],
      ['integration.toggled', A, 'Zoho Books',               { connected: true }, { connected: false }],
      ['user.role-change',    A, 'faith.m@corelithzw.com',   { role: 'Cashier' }, { role: 'Manager' }],
      ['user.login',          B, 'faith.m@corelithzw.com',   null, { ip: '196.43.118.84', device: 'Windows · Chrome' }],
      ['billing.changed',     A, 'card',                     { last4: '4218' }, { last4: '0091' }],
      ['user.login-failed',   D, 'unknown@example.com',      null, { attempts: 12, ip: '102.213.55.18' }],
      ['user.login',          C, 'tatenda.m@corelithzw.com', null, { ip: '196.43.118.61', device: 'Android · Chrome' }],
      ['integration.toggled', A, 'NMB Bank',                 { connected: false }, { connected: true }],
      ['settings.changed',    A, 'two_factor',               { enabled: false }, { enabled: true }],
      ['user.invited',        A, 'precious.j@corelithzw.com', null, { role: 'Cashier', branch: 'Mutare' }],
      ['user.login',          A, 'tendai.n@corelithzw.com',  null, { ip: '196.43.118.12', device: 'macOS · Safari' }],
      ['user.role-change',    A, 'tariro.m@corelithzw.com',  { role: 'Cashier' }, { role: 'Viewer' }],
    ];
    // Spread the timestamps over the past 3 days, newest first.
    const now = Date.parse('2026-06-11T09:42:00');
    return evts.map((e, idx) => {
      const ts = new Date(now - idx * 47 * 60 * 1000);
      return {
        id: 'evt_' + String(1001 + idx),
        ts: ts.toISOString(),
        actor: e[0] === 'user.login-failed' ? 'system' : e[1],
        action: e[0],
        object: e[2],
        before: e[3],
        after: e[4],
      };
    });
  }

  /* ------------------------- Persistence ------------------------- */
  const Store = {
    load(key, fallback) {
      try {
        const raw = localStorage.getItem(KEY_PREFIX + key);
        if (!raw) return clone(fallback);
        return JSON.parse(raw);
      } catch (_) {
        return clone(fallback);
      }
    },
    save(key, value) {
      try {
        localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
      } catch (_) {}
    },
    clear(key) {
      try { localStorage.removeItem(KEY_PREFIX + key); } catch (_) {}
    },
    /** Append a new audit entry and persist. Returns the new entry. */
    logAudit(actor, action, object, before, after) {
      const list = Store.load('audit', DEFAULTS.audit);
      const entry = {
        id: 'evt_' + Math.random().toString(36).slice(2, 8),
        ts: new Date().toISOString(),
        actor: actor || 'You',
        action,
        object: object == null ? '' : String(object),
        before: before == null ? null : before,
        after: after == null ? null : after,
      };
      list.unshift(entry);
      Store.save('audit', list);
      return entry;
    },
    keyPrefix: KEY_PREFIX,
  };

  /* ------------------------- Utilities ------------------------- */
  const util = {
    /** "2026-06-11" */
    isoDate(d) {
      const dt = d ? new Date(d) : new Date();
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
    /** "11 Jun 2026, 09:42" */
    humanDate(d) {
      const dt = d ? new Date(d) : new Date();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}, ${hh}:${mm}`;
    },
    validateEmail(s) {
      if (!s) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
    },
    initials(name) {
      return String(name || '').trim().split(/\s+/).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '?';
    },
    randId(prefix) {
      return (prefix || 'id_') + Math.random().toString(36).slice(2, 8);
    },
    /** Pretty-print a JSON value for diff display. */
    fmtJson(v) {
      if (v == null) return 'null';
      try { return JSON.stringify(v, null, 2); } catch (_) { return String(v); }
    },
    /** Map an action tag to a human verb. */
    actionLabel(tag) {
      const map = {
        'user.invited':       'Invited user',
        'user.role-change':   'Changed role',
        'user.suspended':     'Suspended user',
        'user.reactivated':   'Reactivated user',
        'user.removed':       'Removed user',
        'user.login':         'Signed in',
        'user.login-failed':  'Failed sign-in',
        'integration.toggled':'Toggled integration',
        'billing.changed':    'Updated billing',
        'settings.changed':   'Changed setting',
      };
      return map[tag] || tag;
    },
    /** Categorise an action tag into a top-level event type chip. */
    actionCategory(tag) {
      if (tag === 'user.login' || tag === 'user.login-failed') return 'login';
      if (tag === 'user.role-change') return 'role-change';
      if (tag === 'user.removed') return 'user-removed';
      if (tag === 'integration.toggled') return 'integration-toggled';
      if (tag === 'billing.changed') return 'billing-changed';
      if (tag === 'settings.changed') return 'settings-changed';
      if (tag === 'user.invited' || tag === 'user.suspended' || tag === 'user.reactivated') return 'user-removed';
      return 'settings-changed';
    },
  };

  function clone(v) {
    if (v == null) return v;
    try { return JSON.parse(JSON.stringify(v)); } catch (_) { return v; }
  }

  /* ------------------------- Simulated OAuth ------------------------- */
  /**
   * Open a faux OAuth modal for a provider.
   * @param {Object} opts
   * @param {string} opts.providerName  Display name (e.g. "Stripe")
   * @param {Function} opts.onAllow     Called after the simulated handshake completes.
   * @param {Function} [opts.onCancel]  Optional cancel callback.
   * @param {HTMLElement} [opts.host]   Modal host element; defaults to #modal-host then body.
   */
  function openOAuthModal(opts) {
    const provider = opts.providerName || 'this app';
    const host = opts.host || document.getElementById('modal-host') || document.body;

    const wrap = document.createElement('div');
    wrap.className = 'oauth-scrim';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', `Authorize ${provider}`);
    wrap.innerHTML = `
      <div class="oauth-modal" data-stop>
        <div class="oauth-head">
          <div class="oauth-brand">
            <span class="oauth-logo">${escapeHtmlLocal(provider.slice(0, 2).toUpperCase())}</span>
            <span class="oauth-url">sso.${slug(provider)}.com / oauth / authorize</span>
          </div>
        </div>
        <div class="oauth-body">
          <h3>Authorize Corelith to access ${escapeHtmlLocal(provider)}</h3>
          <p>This will let Corelith:</p>
          <ul>
            <li>Read account info and connected resources</li>
            <li>Receive webhooks for events</li>
            <li>Refresh access on your behalf</li>
          </ul>
          <p class="muted">You can disconnect at any time from Connections.</p>
        </div>
        <div class="oauth-foot">
          <button type="button" class="oauth-cancel" data-oauth="cancel">Cancel</button>
          <button type="button" class="oauth-allow" data-oauth="allow">Allow</button>
        </div>
      </div>
    `;
    host.appendChild(wrap);

    function cleanup() {
      wrap.removeEventListener('keydown', onKey);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); doCancel(); }
    }
    function doCancel() {
      cleanup();
      if (typeof opts.onCancel === 'function') opts.onCancel();
    }
    function doAllow() {
      // Show spinner state in the modal for 800ms.
      const body = wrap.querySelector('.oauth-body');
      const foot = wrap.querySelector('.oauth-foot');
      body.innerHTML = `
        <div class="oauth-spin">
          <span class="oauth-spinner" aria-hidden="true"></span>
          <span>Connecting to ${escapeHtmlLocal(provider)}…</span>
        </div>
      `;
      foot.innerHTML = '';
      setTimeout(() => {
        cleanup();
        if (typeof opts.onAllow === 'function') opts.onAllow();
      }, 800);
    }

    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) doCancel();
    });
    wrap.querySelector('[data-stop]').addEventListener('click', (e) => e.stopPropagation());
    wrap.querySelector('[data-oauth="cancel"]').addEventListener('click', doCancel);
    wrap.querySelector('[data-oauth="allow"]').addEventListener('click', doAllow);
    wrap.tabIndex = -1;
    wrap.addEventListener('keydown', onKey);
    // Focus the Allow button so keyboard users can hit Enter.
    setTimeout(() => {
      const a = wrap.querySelector('[data-oauth="allow"]');
      if (a) a.focus();
    }, 0);
  }

  function escapeHtmlLocal(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ------------------------- Export ------------------------- */
  global.AdminApp = {
    Store,
    DEFAULTS,
    util,
    openOAuthModal,
  };
})(window);
