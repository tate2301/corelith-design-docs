/* ============================================================
   OWNER PORTAL — functional prototype
   Vanilla ES module. Persistent state via localStorage.
   Implements 3 flows:
     1. Today + per-location drilldown
     2. Cash balances + move-money
     3. Compliance dates + mark-paid
   ============================================================ */

/* ---------- Storage helpers ---------- */
const NS = 'corelith:owner:';
const load = (k, fallback) => {
  try {
    const raw = localStorage.getItem(NS + k);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
};
const save = (k, v) => { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch {} };

/* ---------- Formatters ---------- */
const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const usd2 = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const zwl = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n || 0) + ' ZWL';
const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Date helpers ---------- */
const TODAY = new Date();
const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const monthShort = (m) => ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m];

/* Compute next due date for a recurring spec. Returns Date. */
function nextDue(spec) {
  // spec.kind: 'monthly'|'annual', spec.day (1-31), spec.month (0-11) for annual
  const y = TODAY.getFullYear();
  const m = TODAY.getMonth();
  if (spec.kind === 'annual') {
    let date = new Date(y, spec.month, spec.day);
    if (date < new Date(y, TODAY.getMonth(), TODAY.getDate())) {
      date = new Date(y + 1, spec.month, spec.day);
    }
    return date;
  }
  // monthly — pick this month if day not yet passed, else next month
  let date = new Date(y, m, spec.day);
  const todayOnly = new Date(y, m, TODAY.getDate());
  if (date < todayOnly) date = new Date(y, m + 1, spec.day);
  return date;
}
function daysUntil(date) {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const b = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  return Math.round((a - b) / 86400000);
}

/* ---------- Seed data ---------- */
const LOCATIONS_SEED = [
  { id: 'avd-shop', name: 'Avondale Shop',         city: 'Avondale, Harare',  kind: 'Retail · hardware' },
  { id: 'park-shop', name: 'Park Centre Shop',     city: 'Harare CBD',         kind: 'Retail · hardware' },
  { id: 'btb-yard', name: 'Beitbridge Border Yard', city: 'Beitbridge',        kind: 'Cross-border depot' },
  { id: 'bnd-mine', name: 'Bindura Mine',           city: 'Bindura',           kind: 'Mining ops' },
  { id: 'avd-scrap', name: 'Avondale Scrap Yard',   city: 'Avondale, Harare',  kind: 'Scrap metal' },
];

/* Realistic-feeling daily sales (USD). Vary by location and weekday. */
function seedSales() {
  const out = {};
  const baselines = {
    'avd-shop':  1850,
    'park-shop': 2400,
    'btb-yard':  4200,
    'bnd-mine':  6800,
    'avd-scrap': 1200,
  };
  for (const loc of LOCATIONS_SEED) {
    const base = baselines[loc.id];
    const days = [];
    // 14 days back through today
    for (let i = 13; i >= 0; i--) {
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - i);
      const dow = d.getDay();
      // weekend dip for shops, boost for yard
      let mul = 1;
      if (loc.id.includes('shop') && (dow === 0)) mul *= 0.55;
      if (loc.id.includes('shop') && (dow === 6)) mul *= 1.15;
      if (loc.id === 'btb-yard' && (dow === 0 || dow === 6)) mul *= 0.7;
      // deterministic-ish jitter per day
      const seed = (loc.id.length * 7 + d.getDate() * 13 + d.getMonth() * 17) % 100;
      const jitter = 0.78 + (seed / 100) * 0.45;
      const val = Math.round(base * mul * jitter);
      days.push({ date: d.toISOString().slice(0,10), sales: val });
    }
    out[loc.id] = days;
  }
  return out;
}

function seedHourly() {
  // Sales by hour (8 AM to 8 PM) for today, per location
  const out = {};
  for (const loc of LOCATIONS_SEED) {
    const hours = [];
    const curve = [0.4, 0.7, 1.0, 1.2, 1.4, 1.1, 0.9, 1.0, 1.1, 0.9, 0.7, 0.5, 0.3];
    const baseline = loc.id === 'bnd-mine' ? 520 : loc.id === 'btb-yard' ? 320 : 190;
    for (let h = 0; h < 13; h++) {
      const seed = (loc.id.length * 3 + h * 11) % 100;
      const jitter = 0.75 + (seed / 100) * 0.5;
      hours.push(Math.round(baseline * curve[h] * jitter));
    }
    out[loc.id] = hours;
  }
  return out;
}

function seedLocations(sales) {
  // Add cash on hand + staff + extras to each location
  const meta = {
    'avd-shop':  { cash: 4280, staff: 6, drawers: [{ name: 'Front till 1', usd: 1480 }, { name: 'Front till 2', usd: 1240 }, { name: 'Office safe', usd: 1560 }] },
    'park-shop': { cash: 5640, staff: 8, drawers: [{ name: 'Till 1', usd: 1820 }, { name: 'Till 2', usd: 1620 }, { name: 'Till 3', usd: 980 }, { name: 'Office safe', usd: 1220 }] },
    'btb-yard':  { cash: 12420, staff: 11, drawers: [{ name: 'Border float', usd: 6200 }, { name: 'Yard safe', usd: 4820 }, { name: 'Petty cash', usd: 1400 }] },
    'bnd-mine':  { cash: 18920, staff: 24, drawers: [{ name: 'Site safe', usd: 12400 }, { name: 'Camp float', usd: 4200 }, { name: 'Petty cash', usd: 2320 }] },
    'avd-scrap': { cash: 3120, staff: 4, drawers: [{ name: 'Buy float', usd: 2400 }, { name: 'Petty cash', usd: 720 }] },
  };
  const items = {
    'avd-shop':  [{ name: 'Cement 50kg',  units: 38, rev: 456 }, { name: 'Paint 5L white', units: 14, rev: 420 }, { name: 'Nails 1kg', units: 62, rev: 124 }, { name: 'Roofing nails', units: 22, rev: 88 }, { name: 'PVC pipe 4m', units: 8, rev: 144 }],
    'park-shop': [{ name: 'Cement 50kg',  units: 52, rev: 624 }, { name: 'Tile adhesive', units: 28, rev: 392 }, { name: 'Hand tools set', units: 6, rev: 270 }, { name: 'Paint roller', units: 18, rev: 90 }, { name: 'Light bulb LED', units: 44, rev: 132 }],
    'btb-yard':  [{ name: 'Clearing fee', units: 24, rev: 1920 }, { name: 'Storage day', units: 86, rev: 1290 }, { name: 'Crane lift', units: 4, rev: 480 }, { name: 'Manifest doc', units: 18, rev: 270 }, { name: 'Forklift hire', units: 6, rev: 360 }],
    'bnd-mine':  [{ name: 'Gold oz · sale', units: 3.2, rev: 6240 }, { name: 'Tailings recovery', units: 18, rev: 540 }, { name: 'Equipment hire', units: 4, rev: 320 }],
    'avd-scrap': [{ name: 'Copper kg',     units: 84, rev: 504 }, { name: 'Aluminium kg', units: 142, rev: 284 }, { name: 'Steel kg', units: 312, rev: 156 }, { name: 'Brass kg', units: 36, rev: 180 }],
  };
  const recent = {
    'avd-shop':  [{ t: '14:22', who: 'Walk-in',     amt: 124 }, { t: '14:08', who: 'M. Sibanda', amt: 86 }, { t: '13:54', who: 'Tendai Hardware', amt: 312 }, { t: '13:41', who: 'Walk-in', amt: 48 }],
    'park-shop': [{ t: '14:30', who: 'BlueSky Ltd', amt: 642 }, { t: '14:14', who: 'Walk-in',     amt: 32 }, { t: '14:02', who: 'Greenfield',    amt: 184 }, { t: '13:48', who: 'Walk-in', amt: 96 }],
    'btb-yard':  [{ t: '14:35', who: 'ZimFreight',  amt: 1820 }, { t: '14:01', who: 'CrossBorder Ent.', amt: 940 }, { t: '13:22', who: 'Manica Pty', amt: 420 }],
    'bnd-mine':  [{ t: '12:00', who: 'Fidelity buy', amt: 6240 }, { t: '11:20', who: 'Tailings collector', amt: 540 }],
    'avd-scrap': [{ t: '14:11', who: 'Walk-in', amt: 48 }, { t: '13:42', who: 'Mukoma Scrap', amt: 184 }, { t: '13:18', who: 'Walk-in', amt: 32 }, { t: '12:54', who: 'Walk-in', amt: 24 }],
  };

  return LOCATIONS_SEED.map(loc => {
    const today = sales[loc.id][sales[loc.id].length - 1].sales;
    return {
      ...loc,
      todaySales: today,
      cash: meta[loc.id].cash,
      staff: meta[loc.id].staff,
      drawers: meta[loc.id].drawers,
      topItems: items[loc.id],
      recent: recent[loc.id],
    };
  });
}

const ACCOUNTS_SEED = [
  { id: 'nmb-usd',  name: 'NMB Current USD',   kind: 'Bank',         balance: 24580, prev: 22340, currency: 'USD' },
  { id: 'nmb-zwl',  name: 'NMB ZWL',           kind: 'Bank',         balance: 8420000, prev: 8240000, currency: 'ZWL' },
  { id: 'stb-usd',  name: 'Stanbic USD',       kind: 'Bank',         balance: 12420, prev: 13180, currency: 'USD' },
  { id: 'eco-flt',  name: 'EcoCash Float',     kind: 'Mobile money', balance: 1840, prev: 1620, currency: 'USD' },
  { id: 'one-flt',  name: 'OneMoney Float',    kind: 'Mobile money', balance: 920, prev: 1140, currency: 'USD' },
  { id: 'petty',    name: 'Petty Cash',        kind: 'Cash',         balance: 348, prev: 412, currency: 'USD' },
];

const COMPLIANCE_SEED = [
  { id: 'vat',    name: 'ZIMRA VAT',          schedule: { kind: 'monthly', day: 25 },             amount: 4280,  body: 'Monthly Value Added Tax return — file & remit by the 25th of each month.' },
  { id: 'paye',   name: 'ZIMRA PAYE',         schedule: { kind: 'monthly', day: 10 },             amount: 3640,  body: 'Pay As You Earn — monthly employee tax. Due by the 10th.' },
  { id: 'nssa',   name: 'NSSA contributions', schedule: { kind: 'monthly', day: 10 },             amount: 920,   body: 'National Social Security Authority — employee + employer contributions due 10th.' },
  { id: 'nec',    name: 'NEC industry levy',  schedule: { kind: 'monthly', day: 15 },             amount: 410,   body: 'National Employment Council levy for the trade — by the 15th.' },
  { id: 'wcif',   name: "Workers Compensation",schedule: { kind: 'annual', month: 5, day: 30 },   amount: 1840,  body: "Workers Compensation Insurance Fund — annual premium, due 30 June." },
  { id: 'tin',    name: 'Tax Clearance (TIN)',schedule: { kind: 'annual', month: 11, day: 31 },   amount: 0,     body: 'Tax Identification Number / Tax Clearance Certificate — annual renewal.' },
];

/* ---------- State load + persistence ---------- */
const SEED_SALES = seedSales();
const HOURLY = seedHourly();
const LOCATIONS = seedLocations(SEED_SALES);

let accounts = load('accounts', null) || ACCOUNTS_SEED.map(a => ({ ...a }));
let ledger = load('ledger', []);
let compliance = load('compliance', null) || COMPLIANCE_SEED.map(c => ({ ...c, status: 'open' }));
// Things to approve (synthetic)
let approvals = load('approvals', null) || [
  { id: 'ap-1', kind: 'Purchase order', subject: 'PO-204 · Cement 200 bags', amount: 2400 },
  { id: 'ap-2', kind: 'Refund',        subject: 'INV-118 · Greenfield',     amount: 320 },
  { id: 'ap-3', kind: 'Wage advance',  subject: 'M. Sibanda · Avondale',    amount: 180 },
];

function persistAccounts() { save('accounts', accounts); }
function persistLedger()   { save('ledger', ledger); }
function persistCompliance() { save('compliance', compliance); }

/* ---------- Route / view state ---------- */
const state = {
  route: location.hash.replace(/^#\/?/, '') || 'today',
  locationId: null, // for drilldown
  modal: null,
};

const ROUTES = new Set(['today', 'cash', 'compliance', 'location']);

function go(route, params = {}) {
  state.route = route;
  if ('locationId' in params) state.locationId = params.locationId;
  const hash = route === 'location' ? `#/location/${params.locationId}` : `#/${route}`;
  if (location.hash !== hash) {
    history.pushState(null, '', hash);
  }
  render();
}

window.addEventListener('hashchange', () => {
  const raw = location.hash.replace(/^#\/?/, '');
  if (raw.startsWith('location/')) {
    state.route = 'location';
    state.locationId = raw.slice('location/'.length);
  } else if (ROUTES.has(raw)) {
    state.route = raw;
  } else {
    state.route = 'today';
  }
  render();
});

/* ---------- Aggregates ---------- */
function totals() {
  const salesToday = LOCATIONS.reduce((a, l) => a + l.todaySales, 0);
  const cashOnHand = accounts.reduce((a, x) => x.currency === 'USD' ? a + x.balance : a, 0);
  const openOrders = 18; // synthetic
  const toApprove = approvals.length;
  return { salesToday, cashOnHand, openOrders, toApprove };
}

/* ---------- Sparkline SVG ---------- */
function sparkline(values, { width = 280, height = 56, stroke = '#5B8DEF', fill = 'rgba(91,141,239,0.16)' } = {}) {
  if (!values || values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 1;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1 || 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = pts.join(' ');
  const area = `${pad},${pad + h} ${line} ${(pad + w).toFixed(1)},${pad + h}`;
  return `
    <svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <polygon points="${area}" fill="${fill}" />
      <polyline points="${line}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function miniSpark(values, { stroke = '#5B8DEF' } = {}) {
  return sparkline(values, { width: 80, height: 24, stroke, fill: 'transparent' }).replace('class="spark"', 'class="spark-mini"');
}

/* ---------- View: Today ---------- */
function viewToday() {
  const t = totals();
  const todayStr = TODAY.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return `
    <div class="pg-head">
      <div class="crumb">Today</div>
      <h2>${todayStr}</h2>
      <div class="sub">Cross-business overview · 5 locations</div>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="lbl">Sales today</div><div class="v">${escapeHtml(usd(t.salesToday))}</div><div class="meta">across all locations</div></div>
      <div class="kpi"><div class="lbl">Cash on hand</div><div class="v">${escapeHtml(usd(t.cashOnHand))}</div><div class="meta">USD accounts &amp; floats</div></div>
      <div class="kpi ${t.openOrders > 12 ? 'warn' : ''}"><div class="lbl">Open orders</div><div class="v">${t.openOrders}</div><div class="meta">awaiting fulfilment</div></div>
      <div class="kpi ${t.toApprove > 0 ? 'warn' : ''}"><div class="lbl">To approve</div><div class="v">${t.toApprove}</div><div class="meta">${t.toApprove === 0 ? 'all clear' : 'tap a location for more'}</div></div>
    </div>

    <div class="section-h"><h3>Per location</h3><span class="spacer"></span></div>
    <div class="loc-grid">
      ${LOCATIONS.map(loc => {
        const series = SEED_SALES[loc.id].map(d => d.sales);
        return `
          <button class="loc-card" data-loc="${loc.id}">
            <div class="top">
              <div style="flex:1;min-width:0;">
                <div class="nm">${escapeHtml(loc.name)}</div>
                <div class="city">${escapeHtml(loc.city)} · ${escapeHtml(loc.kind)}</div>
              </div>
              <div class="arrow">›</div>
            </div>
            <div class="mini">
              <div class="m"><div class="l">Sales</div><div class="v">${escapeHtml(usd(loc.todaySales))}</div></div>
              <div class="m"><div class="l">Cash</div><div class="v">${escapeHtml(usd(loc.cash))}</div></div>
              <div class="m"><div class="l">On duty</div><div class="v">${loc.staff}</div></div>
            </div>
            <div style="margin-top:10px;">${miniSpark(series)}</div>
          </button>
        `;
      }).join('')}
    </div>

    <div class="section-h" style="margin-top:24px;"><h3>Things to approve</h3></div>
    ${approvals.length === 0 ? `<div class="empty">All clear.</div>` : approvals.map(a => `
      <div class="row">
        <div class="lead">
          <div class="nm">${escapeHtml(a.subject)}</div>
          <div class="sb">${escapeHtml(a.kind)} · ${escapeHtml(usd(a.amount))}</div>
        </div>
        <div class="right">
          <button class="btn sm primary" data-approve="${a.id}">Approve</button>
        </div>
      </div>
    `).join('')}
  `;
}

/* ---------- View: Location drilldown ---------- */
function viewLocation() {
  const loc = LOCATIONS.find(l => l.id === state.locationId);
  if (!loc) {
    return `<div class="empty">Location not found. <button class="btn sm" data-go="today" style="margin-top:10px;">Back to Today</button></div>`;
  }
  const series = SEED_SALES[loc.id].map(d => d.sales);
  const hours = HOURLY[loc.id];
  const total = loc.todaySales;
  const drawerTotal = loc.drawers.reduce((a, d) => a + d.usd, 0);
  return `
    <div class="pg-head" style="display:flex;align-items:flex-start;gap:8px;">
      <button class="back-btn" data-go="today" title="Back" style="margin-left:-8px;">‹</button>
      <div style="flex:1;min-width:0;">
        <div class="crumb">Today › ${escapeHtml(loc.name)}</div>
        <h2>${escapeHtml(loc.name)}</h2>
        <div class="sub">${escapeHtml(loc.city)} · ${escapeHtml(loc.kind)}</div>
      </div>
    </div>

    <div class="drill-stats">
      <div class="s"><div class="l">Sales today</div><div class="v">${escapeHtml(usd(total))}</div></div>
      <div class="s"><div class="l">Cash on hand</div><div class="v">${escapeHtml(usd(drawerTotal))}</div></div>
      <div class="s"><div class="l">Staff</div><div class="v">${loc.staff}</div></div>
    </div>

    <div class="card">
      <div class="ttl">Sales by hour <span class="sub">8 AM → 8 PM</span></div>
      ${sparkline(hours, { stroke: '#5B8DEF', fill: 'rgba(91,141,239,0.18)' })}
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ow-text-sub);margin-top:6px;">
        <span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span>
      </div>
    </div>

    <div class="card">
      <div class="ttl">Cash by drawer</div>
      <ul class="simple-list">
        ${loc.drawers.map(d => `
          <li><span class="nm">${escapeHtml(d.name)}</span><span class="vl">${escapeHtml(usd(d.usd))}</span></li>
        `).join('')}
      </ul>
    </div>

    <div class="card">
      <div class="ttl">Top 5 items today</div>
      <ul class="simple-list">
        ${loc.topItems.slice(0,5).map(it => `
          <li>
            <span class="nm">${escapeHtml(it.name)}</span>
            <span class="sb">×${it.units}</span>
            <span class="vl">${escapeHtml(usd(it.rev))}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="card">
      <div class="ttl">Recent sales</div>
      <ul class="simple-list">
        ${loc.recent.map(r => `
          <li>
            <span class="sb" style="width:48px;">${escapeHtml(r.t)}</span>
            <span class="nm">${escapeHtml(r.who)}</span>
            <span class="vl">${escapeHtml(usd(r.amt))}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <button class="btn block" data-go="today" style="margin-top:6px;">‹ Back to Today</button>
  `;
}

/* ---------- View: Cash ---------- */
function viewCash() {
  const usdTotal = accounts.filter(a => a.currency === 'USD').reduce((s, a) => s + a.balance, 0);
  const zwlTotal = accounts.filter(a => a.currency === 'ZWL').reduce((s, a) => s + a.balance, 0);
  return `
    <div class="pg-head">
      <div class="crumb">Cash</div>
      <h2>Cash balances</h2>
      <div class="sub">${escapeHtml(usd(usdTotal))} USD · ${escapeHtml(zwl(zwlTotal))}</div>
    </div>

    <button class="btn primary block" data-action="move-money" style="margin-bottom:16px;">+ Move money</button>

    ${accounts.map(a => {
      const delta = a.balance - a.prev;
      const cls = delta > 0 ? 'up' : delta < 0 ? 'dn' : 'flat';
      const sym = delta > 0 ? '▲' : delta < 0 ? '▼' : '·';
      const fmtBal = a.currency === 'USD' ? usd(a.balance) : zwl(a.balance);
      const fmtDelta = a.currency === 'USD' ? usd(Math.abs(delta)) : zwl(Math.abs(delta));
      return `
        <div class="row">
          <div class="lead">
            <div class="nm">${escapeHtml(a.name)}</div>
            <div class="sb">${escapeHtml(a.kind)} · ${escapeHtml(a.currency)}</div>
          </div>
          <div class="right">
            <div class="val">${escapeHtml(fmtBal)}</div>
            <div class="delta ${cls}">${sym} ${escapeHtml(fmtDelta)} <span style="color:var(--ow-text-sub);">24h</span></div>
          </div>
        </div>
      `;
    }).join('')}

    <div class="section-h" style="margin-top:24px;"><h3>Treasury log</h3></div>
    ${ledger.length === 0 ? `<div class="empty">No transfers yet. Move money to start a log.</div>` : `
      <div class="card" style="padding:8px 14px;">
        <ul class="simple-list">
          ${ledger.slice().reverse().slice(0, 20).map(e => {
            const fromAcc = accounts.find(a => a.id === e.fromId);
            const toAcc = accounts.find(a => a.id === e.toId);
            return `
              <li>
                <div style="flex:1;min-width:0;">
                  <div class="nm" style="font-size:13px;">${escapeHtml(fromAcc?.name || e.fromId)} → ${escapeHtml(toAcc?.name || e.toId)}</div>
                  <div class="sb">${escapeHtml(e.when)}${e.note ? ' · ' + escapeHtml(e.note) : ''}</div>
                </div>
                <span class="vl">${escapeHtml(usd(e.amount))}</span>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `}
  `;
}

/* ---------- View: Compliance ---------- */
function viewCompliance() {
  // Build derived items with due dates / days-until
  const items = compliance.map(c => {
    const due = nextDue(c.schedule);
    const dleft = daysUntil(due);
    let live = c.status;
    if (live === 'paid') {
      // paid stays paid for current cycle; auto-reopen if cycle has rolled past
      if (c.paidForCycle && c.paidForCycle === cycleKey(c.schedule, due)) {
        live = 'paid';
      } else {
        live = 'open';
      }
    }
    let pillCls = 'open', pillLabel = 'Open';
    if (live === 'paid') { pillCls = 'paid'; pillLabel = 'Paid'; }
    else if (dleft < 0) { pillCls = 'overdue'; pillLabel = 'Overdue'; }
    return { c, due, dleft, live, pillCls, pillLabel };
  });

  // Sort: overdue first, then soonest open, then paid last
  items.sort((a, b) => {
    const sa = a.live === 'paid' ? 2 : (a.dleft < 0 ? 0 : 1);
    const sb = b.live === 'paid' ? 2 : (b.dleft < 0 ? 0 : 1);
    if (sa !== sb) return sa - sb;
    return a.dleft - b.dleft;
  });

  return `
    <div class="pg-head">
      <div class="crumb">Compliance</div>
      <h2>Statutory dates</h2>
      <div class="sub">Today is ${escapeHtml(TODAY.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}</div>
    </div>

    ${items.map(({ c, due, dleft, live, pillCls, pillLabel }) => {
      const overdue = dleft < 0 && live !== 'paid';
      const soon = !overdue && dleft <= 7 && live !== 'paid';
      const whenCls = overdue ? 'bad' : soon ? 'warn' : '';
      const daysCls = overdue ? 'bad' : soon ? 'warn' : '';
      const daysText = live === 'paid' ? 'Paid' : (dleft < 0 ? `${Math.abs(dleft)}d overdue` : dleft === 0 ? 'Today' : `in ${dleft}d`);
      return `
        <div class="row" data-comp="${c.id}">
          <div class="comp-when ${whenCls}">
            <div class="d">${due.getDate()}</div>
            <div class="m">${monthShort(due.getMonth())}</div>
          </div>
          <div class="lead">
            <div class="nm" style="display:flex;align-items:center;gap:6px;">
              ${overdue ? '<span class="dot bad"></span>' : ''}
              ${escapeHtml(c.name)}
            </div>
            <div class="sb">${escapeHtml(due.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }))} · ${escapeHtml(c.amount ? usd(c.amount) : '—')}</div>
          </div>
          <div class="right">
            <span class="pill ${pillCls}">${pillLabel}</span>
            <div class="days-pill ${daysCls}" style="margin-top:4px;">${daysText}</div>
          </div>
        </div>
      `;
    }).join('')}
  `;
}

function cycleKey(schedule, due) {
  if (schedule.kind === 'monthly') return `${due.getFullYear()}-${due.getMonth()}`;
  return `${due.getFullYear()}`;
}

/* ---------- Modal: Move Money ---------- */
function openMoveMoneyModal() {
  const usdAccounts = accounts.filter(a => a.currency === 'USD');
  state.modal = {
    kind: 'move-money',
    html: `
      <div class="modal-scrim" data-close>
        <div class="modal" role="dialog" aria-label="Move money">
          <div class="handle"></div>
          <div class="m-head">
            <h3>Move money</h3>
            <div class="sb">Transfer between accounts. USD accounts only.</div>
          </div>
          <form class="m-body" id="move-form">
            <div class="field">
              <label for="mm-from">From</label>
              <select id="mm-from" required>
                ${usdAccounts.map(a => `<option value="${a.id}">${escapeHtml(a.name)} · ${escapeHtml(usd(a.balance))}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="mm-to">To</label>
              <select id="mm-to" required>
                ${usdAccounts.map((a, i) => `<option value="${a.id}" ${i === 1 ? 'selected' : ''}>${escapeHtml(a.name)} · ${escapeHtml(usd(a.balance))}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="mm-amt">Amount (USD)</label>
              <input id="mm-amt" type="number" min="0.01" step="0.01" placeholder="0.00" required />
            </div>
            <div class="field">
              <label for="mm-note">Note</label>
              <input id="mm-note" type="text" placeholder="e.g. Refill EcoCash float" maxlength="80" />
            </div>
          </form>
          <div class="m-foot">
            <button class="btn" type="button" data-close>Cancel</button>
            <button class="btn primary" type="submit" form="move-form">Move money</button>
          </div>
        </div>
      </div>
    `,
  };
  renderModal();
  // Wire form
  const form = document.getElementById('move-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fromId = document.getElementById('mm-from').value;
    const toId   = document.getElementById('mm-to').value;
    const amount = parseFloat(document.getElementById('mm-amt').value || '0');
    const note   = document.getElementById('mm-note').value.trim();
    if (fromId === toId) { toast('Pick two different accounts', 'danger'); return; }
    if (!(amount > 0)) { toast('Enter an amount', 'danger'); return; }
    const from = accounts.find(a => a.id === fromId);
    const to   = accounts.find(a => a.id === toId);
    if (amount > from.balance) { toast(`Not enough in ${from.name}`, 'danger'); return; }
    // Update balances. Both prev unchanged so the delta reflects the move.
    from.balance = +(from.balance - amount).toFixed(2);
    to.balance   = +(to.balance + amount).toFixed(2);
    ledger.push({
      id: 'TR-' + Date.now().toString(36).toUpperCase().slice(-6),
      fromId, toId, amount,
      note,
      when: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    });
    persistAccounts();
    persistLedger();
    closeModal();
    toast(`Moved ${usd(amount)} · ${from.name} → ${to.name}`, 'success');
    render();
  });
}

/* ---------- Modal: Compliance detail ---------- */
function openComplianceModal(id) {
  const item = compliance.find(c => c.id === id);
  if (!item) return;
  const due = nextDue(item.schedule);
  const dleft = daysUntil(due);
  const isPaid = item.status === 'paid' && item.paidForCycle === cycleKey(item.schedule, due);
  const scheduleText = item.schedule.kind === 'monthly'
    ? `Monthly · every ${ordinal(item.schedule.day)}`
    : `Annual · ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;

  state.modal = {
    kind: 'compliance',
    html: `
      <div class="modal-scrim" data-close>
        <div class="modal" role="dialog" aria-label="Compliance detail">
          <div class="handle"></div>
          <div class="m-head">
            <h3>${escapeHtml(item.name)}</h3>
            <div class="sb">${escapeHtml(scheduleText)}</div>
          </div>
          <div class="m-body">
            <div class="drill-stats">
              <div class="s"><div class="l">Due</div><div class="v">${due.getDate()} ${monthShort(due.getMonth())}</div></div>
              <div class="s"><div class="l">Days</div><div class="v">${dleft < 0 ? Math.abs(dleft) + 'd over' : dleft === 0 ? 'today' : dleft + 'd'}</div></div>
              <div class="s"><div class="l">Amount</div><div class="v" style="font-size:14px;">${escapeHtml(item.amount ? usd(item.amount) : '—')}</div></div>
            </div>
            <p style="color:var(--ow-text-mute);font-size:13px;line-height:1.5;margin:6px 0 0;">${escapeHtml(item.body)}</p>
            ${isPaid ? `<div style="margin-top:14px;padding:10px 12px;background:var(--ow-good-soft);color:var(--ow-good);border-radius:9px;font-size:13px;">✓ Marked paid for this cycle.</div>` : ''}
          </div>
          <div class="m-foot">
            <button class="btn" type="button" data-close>Close</button>
            ${isPaid
              ? `<button class="btn" type="button" data-comp-reopen="${item.id}">Re-open</button>`
              : `<button class="btn good" type="button" data-comp-paid="${item.id}">Mark paid</button>`}
          </div>
        </div>
      </div>
    `,
  };
  renderModal();
}

function ordinal(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* ---------- Modal plumbing ---------- */
function renderModal() {
  const host = document.getElementById('modal-host');
  if (!host) return;
  host.innerHTML = state.modal ? state.modal.html : '';
}
function closeModal() {
  state.modal = null;
  renderModal();
}

/* ---------- Toast ---------- */
function toast(msg, kind = '') {
  const host = document.getElementById('toast-host');
  if (!host) return;
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('out'); }, 2400);
  setTimeout(() => { el.remove(); }, 2700);
}

/* ---------- Main render ---------- */
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  let body = '';
  if (state.route === 'today') body = viewToday();
  else if (state.route === 'location') body = viewLocation();
  else if (state.route === 'cash') body = viewCash();
  else if (state.route === 'compliance') body = viewCompliance();
  else body = viewToday();

  const showBack = state.route === 'location';
  app.innerHTML = `
    <div class="ow-app">
      <header class="ow-top">
        ${showBack ? `<button class="back-btn" data-go="today" aria-label="Back">‹</button>` : `<div class="brand">O</div>`}
        <div class="who">
          <div class="ttl">Sunrise Holdings</div>
          <div class="sub">Owner · ${escapeHtml(LOCATIONS.length)} locations</div>
        </div>
        <span class="pill"><span class="dot"></span>Live</span>
      </header>
      <main class="ow-main">${body}</main>
      <nav class="ow-tabs" role="tablist">
        <button data-go="today" class="${state.route === 'today' || state.route === 'location' ? 'on' : ''}" role="tab">
          <span class="ic">⌂</span><span>Today</span>
        </button>
        <button data-go="cash" class="${state.route === 'cash' ? 'on' : ''}" role="tab">
          <span class="ic">$</span><span>Cash</span>
        </button>
        <button data-go="compliance" class="${state.route === 'compliance' ? 'on' : ''}" role="tab">
          <span class="ic">⎈</span><span>Compliance</span>
        </button>
      </nav>
    </div>
  `;
}

/* ---------- Global event delegation ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  if (!(t instanceof Element)) return;

  // Close button inside modal
  const closeBtn = t.closest('button[data-close]');
  if (closeBtn) {
    e.preventDefault();
    closeModal();
    return;
  }
  // Scrim click (outside the .modal box)
  if (t.classList.contains('modal-scrim')) {
    closeModal();
    return;
  }

  // Route changes
  const goBtn = t.closest('[data-go]');
  if (goBtn) {
    e.preventDefault();
    go(goBtn.getAttribute('data-go'));
    return;
  }

  // Location card → drilldown
  const locBtn = t.closest('[data-loc]');
  if (locBtn) {
    e.preventDefault();
    go('location', { locationId: locBtn.getAttribute('data-loc') });
    return;
  }

  // Move money
  const action = t.closest('[data-action]');
  if (action && action.getAttribute('data-action') === 'move-money') {
    openMoveMoneyModal();
    return;
  }

  // Compliance row → modal
  const compRow = t.closest('[data-comp]');
  if (compRow) {
    openComplianceModal(compRow.getAttribute('data-comp'));
    return;
  }

  // Mark paid
  const paidBtn = t.closest('[data-comp-paid]');
  if (paidBtn) {
    const id = paidBtn.getAttribute('data-comp-paid');
    const item = compliance.find(c => c.id === id);
    if (item) {
      const due = nextDue(item.schedule);
      item.status = 'paid';
      item.paidForCycle = cycleKey(item.schedule, due);
      persistCompliance();
      closeModal();
      toast(`${item.name} marked paid`, 'success');
      render();
    }
    return;
  }

  // Re-open compliance
  const reopenBtn = t.closest('[data-comp-reopen]');
  if (reopenBtn) {
    const id = reopenBtn.getAttribute('data-comp-reopen');
    const item = compliance.find(c => c.id === id);
    if (item) {
      item.status = 'open';
      delete item.paidForCycle;
      persistCompliance();
      closeModal();
      toast(`${item.name} re-opened`);
      render();
    }
    return;
  }

  // Approve
  const apprBtn = t.closest('[data-approve]');
  if (apprBtn) {
    e.preventDefault();
    const id = apprBtn.getAttribute('data-approve');
    const idx = approvals.findIndex(a => a.id === id);
    if (idx >= 0) {
      const item = approvals[idx];
      approvals.splice(idx, 1);
      save('approvals', approvals);
      toast(`Approved: ${item.subject}`, 'success');
      render();
    }
    return;
  }
});

/* Esc closes modal */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.modal) closeModal();
});

/* ---------- Init ---------- */
function init() {
  const raw = location.hash.replace(/^#\/?/, '');
  if (raw.startsWith('location/')) {
    state.route = 'location';
    state.locationId = raw.slice('location/'.length);
  } else if (ROUTES.has(raw)) {
    state.route = raw;
  } else {
    state.route = 'today';
  }
  render();
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
