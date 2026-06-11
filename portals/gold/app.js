/* ============================================================
   Gold Mine Clerk — functional prototype
   Vanilla ES module. Persists to localStorage under "corelith:gold:".
   Three flows:
     1. Record a pour (with auto-balance check)
     2. Send batch to FPR (with RBZ 25% retention)
     3. Reports preview (ZIMRA + MMCZ) — print to PDF
   Plus: Activity audit feed.
   ============================================================ */

const STORAGE_PREFIX = 'corelith:gold:';
const STORAGE_KEY = STORAGE_PREFIX + 'state.v1';

const MINES = ['Bindura', 'Mukaradzi', 'Mazowe River', 'Penhalonga', 'Renco'];
const REFINERY = { id: 'FPR', name: 'Fidelity Printers & Refiners', location: 'Harare, Zimbabwe' };
const RBZ_RETENTION = 0.25;
const CLERK = { id: 'CL-1184', name: 'Tendai Mhuriro' };

/* ---------- formatting helpers ---------- */
const fmtG = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const grams = (n) => fmtG.format(Number(n) || 0) + ' g';
const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const computeBalance = (p) =>
  Number(p.gross || 0) - Number(p.diesel || 0) - Number(p.shoots || 0) - Number(p.lcd || 0) - Number(p.workers || 0) - Number(p.company || 0);

/* ---------- Store ---------- */
const Store = (() => {
  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        return;
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }
    state = seed();
    save();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save', e);
    }
  }

  function get() {
    return state;
  }

  function reset() {
    state = seed();
    save();
  }

  function addPour(pour) {
    const id = 'PR-' + String(state.nextPourSeq).padStart(4, '0');
    state.nextPourSeq += 1;
    const record = {
      id,
      date: new Date().toISOString(),
      mine: pour.mine,
      gross: Number(pour.gross),
      diesel: Number(pour.diesel),
      shoots: Number(pour.shoots),
      lcd: Number(pour.lcd),
      workers: Number(pour.workers),
      company: Number(pour.company),
      batchId: null,
      status: 'open',
      clerk: CLERK.id,
    };
    state.pours.unshift(record);
    pushAudit('Recorded pour ' + id, `${pour.mine} · gross ${grams(record.gross)}, balance ${grams(computeBalance(record))}`);
    save();
    return record;
  }

  function sendBatch(pourIds) {
    const year = new Date().getFullYear();
    const seq = state.nextBatchSeq;
    state.nextBatchSeq += 1;
    const batchId = `FPR-${year}-${String(seq).padStart(3, '0')}`;
    const pours = state.pours.filter((p) => pourIds.includes(p.id));
    const totalGross = pours.reduce((s, p) => s + p.gross, 0);
    const totalBalance = pours.reduce((s, p) => s + computeBalance(p), 0);
    const retention = totalBalance * RBZ_RETENTION;
    const netPayable = totalBalance - retention;
    const batch = {
      id: batchId,
      date: new Date().toISOString(),
      refinery: REFINERY.id,
      pourIds: [...pourIds],
      totalGross,
      totalBalance,
      retention,
      netPayable,
      status: 'awaiting_payment',
      paymentDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      clerk: CLERK.id,
    };
    state.batches.unshift(batch);
    state.pours.forEach((p) => {
      if (pourIds.includes(p.id)) {
        p.batchId = batchId;
        p.status = 'sent';
      }
    });
    pushAudit(
      'Sent batch ' + batchId + ' to FPR',
      `${pours.length} pour(s) · gross ${grams(totalGross)} · RBZ retention ${grams(retention)} · net ${grams(netPayable)}`
    );
    save();
    return batch;
  }

  function pushAudit(action, detail) {
    state.audit.unshift({
      ts: new Date().toISOString(),
      clerk: CLERK.id,
      clerkName: CLERK.name,
      action,
      detail,
    });
    // Note: we DO NOT call save() here so the caller controls a single write.
  }

  return { load, save, get, reset, addPour, sendBatch, pushAudit };
})();

/* ---------- Seed ---------- */
function seed() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  // 12 historical pours across 5 mines, spread over ~3 weeks.
  const rows = [
    { mine: 'Bindura',      gross: 1240.00, diesel: 180.00, shoots: 120.00, lcd: 45.00, workers: 310.00, company: 120.00, daysAgo: 22 },
    { mine: 'Mukaradzi',    gross: 980.50,  diesel: 145.00, shoots: 90.00,  lcd: 38.00, workers: 245.00, company: 95.00,  daysAgo: 21 },
    { mine: 'Mazowe River', gross: 1620.00, diesel: 220.00, shoots: 165.00, lcd: 60.00, workers: 410.00, company: 160.00, daysAgo: 19 },
    { mine: 'Penhalonga',   gross: 870.25,  diesel: 130.00, shoots: 80.00,  lcd: 32.00, workers: 220.00, company: 85.00,  daysAgo: 18 },
    { mine: 'Renco',        gross: 2105.00, diesel: 295.00, shoots: 210.00, lcd: 78.00, workers: 525.00, company: 205.00, daysAgo: 17 },
    { mine: 'Bindura',      gross: 1335.00, diesel: 195.00, shoots: 130.00, lcd: 48.00, workers: 335.00, company: 130.00, daysAgo: 14 },
    { mine: 'Mazowe River', gross: 1480.50, diesel: 210.00, shoots: 150.00, lcd: 55.00, workers: 370.00, company: 145.00, daysAgo: 12, batched: 'first' },
    { mine: 'Renco',        gross: 1920.75, diesel: 270.00, shoots: 195.00, lcd: 72.00, workers: 480.00, company: 188.00, daysAgo: 11, batched: 'first' },
    { mine: 'Mukaradzi',    gross: 1085.00, diesel: 158.00, shoots: 105.00, lcd: 42.00, workers: 270.00, company: 105.00, daysAgo: 9,  batched: 'second' },
    { mine: 'Penhalonga',   gross: 945.50,  diesel: 140.00, shoots: 92.00,  lcd: 35.00, workers: 235.00, company: 92.00,  daysAgo: 8,  batched: 'second' },
    { mine: 'Bindura',      gross: 1410.00, diesel: 200.00, shoots: 140.00, lcd: 52.00, workers: 352.00, company: 138.00, daysAgo: 4 },
    { mine: 'Mazowe River', gross: 1560.00, diesel: 220.00, shoots: 155.00, lcd: 58.00, workers: 390.00, company: 153.00, daysAgo: 2 },
  ];

  const pours = rows.map((r, idx) => ({
    id: 'PR-' + String(idx + 1).padStart(4, '0'),
    date: new Date(now - r.daysAgo * day).toISOString(),
    mine: r.mine,
    gross: r.gross,
    diesel: r.diesel,
    shoots: r.shoots,
    lcd: r.lcd,
    workers: r.workers,
    company: r.company,
    batchId: null,
    status: 'open',
    clerk: CLERK.id,
    _batched: r.batched,
  }));

  // Two prior batches: first one paid, second pending
  const year = new Date().getFullYear();
  const firstPourIds = pours.filter((p) => p._batched === 'first').map((p) => p.id);
  const secondPourIds = pours.filter((p) => p._batched === 'second').map((p) => p.id);

  const makeBatch = (id, pourIds, daysAgo, status) => {
    const ps = pours.filter((p) => pourIds.includes(p.id));
    const totalGross = ps.reduce((s, p) => s + p.gross, 0);
    const totalBalance = ps.reduce((s, p) => s + computeBalance(p), 0);
    const retention = totalBalance * RBZ_RETENTION;
    return {
      id,
      date: new Date(now - daysAgo * day).toISOString(),
      refinery: REFINERY.id,
      pourIds,
      totalGross,
      totalBalance,
      retention,
      netPayable: totalBalance - retention,
      status,
      paymentDue: new Date(now - daysAgo * day + 14 * day).toISOString(),
      paidOn: status === 'paid' ? new Date(now - (daysAgo - 14) * day).toISOString() : null,
      clerk: CLERK.id,
    };
  };

  const batches = [
    makeBatch(`FPR-${year}-001`, firstPourIds, 11, 'paid'),
    makeBatch(`FPR-${year}-002`, secondPourIds, 8, 'awaiting_payment'),
  ];

  // Mark the batched pours
  pours.forEach((p) => {
    if (p._batched === 'first') { p.batchId = `FPR-${year}-001`; p.status = 'sent'; }
    if (p._batched === 'second') { p.batchId = `FPR-${year}-002`; p.status = 'sent'; }
    delete p._batched;
  });

  // Most recent first
  pours.sort((a, b) => (a.date < b.date ? 1 : -1));

  const audit = [
    {
      ts: new Date(now - 8 * day).toISOString(),
      clerk: CLERK.id, clerkName: CLERK.name,
      action: `Sent batch FPR-${year}-002 to FPR`,
      detail: `${secondPourIds.length} pour(s) · gross ${grams(batches[1].totalGross)} · RBZ retention ${grams(batches[1].retention)}`,
    },
    {
      ts: new Date(now - 11 * day).toISOString(),
      clerk: CLERK.id, clerkName: CLERK.name,
      action: `Sent batch FPR-${year}-001 to FPR`,
      detail: `${firstPourIds.length} pour(s) · gross ${grams(batches[0].totalGross)} · RBZ retention ${grams(batches[0].retention)}`,
    },
    {
      ts: new Date(now - 2 * day).toISOString(),
      clerk: CLERK.id, clerkName: CLERK.name,
      action: 'Recorded pour PR-0012',
      detail: 'Mazowe River · gross 1,560.00 g, balance 584.00 g',
    },
  ];

  return {
    pours,
    batches,
    audit,
    nextPourSeq: pours.length + 1,
    nextBatchSeq: 3,
  };
}

/* ---------- Toast ---------- */
function toast(msg, kind = '') {
  const host = $('#toast-host');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'gm-toast ' + (kind || '');
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 240);
  }, 2600);
}

/* ---------- App ---------- */
const App = {
  tab: 'open', // open | sent | reports | activity
  sheet: null, // 'pour' | 'batch' | null
  modal: null, // 'zimra' | 'mmcz' | null

  init() {
    Store.load();
    this.render();
    window.addEventListener('hashchange', () => this.handleHash());
    this.handleHash();
  },

  handleHash() {
    const h = (location.hash || '').replace('#/', '').replace('#', '');
    if (['open', 'sent', 'reports', 'activity'].includes(h)) {
      this.tab = h;
      this.render();
    }
  },

  setTab(tab) {
    this.tab = tab;
    location.hash = '#/' + tab;
    this.render();
  },

  render() {
    const root = $('#gm-root');
    if (!root) return;
    root.innerHTML = this.viewShell();
    this.bindShell();
    this.renderMain();
  },

  viewShell() {
    const state = Store.get();
    const openCount = state.pours.filter((p) => !p.batchId).length;
    const sentCount = state.pours.filter((p) => p.batchId).length;
    return `
      <header class="gm-bar">
        <div class="gm-brand">
          <span class="gm-mark" aria-hidden="true">Au</span>
          <div class="gm-brand-text">
            <div class="gm-brand-name">Gold Mine Clerk</div>
            <div class="gm-brand-sub">Zimbabwe · FPR ledger</div>
          </div>
        </div>
        <div class="gm-clerk">
          <span class="gm-clerk-av">${escapeHtml(CLERK.name.split(' ').map((s) => s[0]).join('').slice(0, 2))}</span>
          <span class="gm-clerk-nm">${escapeHtml(CLERK.name)}</span>
        </div>
      </header>
      <nav class="gm-tabs" role="tablist" aria-label="Sections">
        <button class="gm-tab ${this.tab === 'open' ? 'on' : ''}" data-tab="open" role="tab" aria-selected="${this.tab === 'open'}">
          Open ledger <span class="gm-tab-count">${openCount}</span>
        </button>
        <button class="gm-tab ${this.tab === 'sent' ? 'on' : ''}" data-tab="sent" role="tab" aria-selected="${this.tab === 'sent'}">
          Sent <span class="gm-tab-count">${sentCount}</span>
        </button>
        <button class="gm-tab ${this.tab === 'reports' ? 'on' : ''}" data-tab="reports" role="tab" aria-selected="${this.tab === 'reports'}">
          Reports
        </button>
        <button class="gm-tab ${this.tab === 'activity' ? 'on' : ''}" data-tab="activity" role="tab" aria-selected="${this.tab === 'activity'}">
          Activity
        </button>
      </nav>
      <main id="gm-main" class="gm-main" role="tabpanel"></main>
      <div id="gm-sheet-host"></div>
      <div id="gm-modal-host"></div>
    `;
  },

  bindShell() {
    $$('.gm-tab').forEach((b) => {
      b.addEventListener('click', () => this.setTab(b.dataset.tab));
    });
  },

  renderMain() {
    const main = $('#gm-main');
    if (!main) return;
    if (this.tab === 'open') main.innerHTML = this.viewOpenLedger();
    else if (this.tab === 'sent') main.innerHTML = this.viewSentLedger();
    else if (this.tab === 'reports') main.innerHTML = this.viewReports();
    else if (this.tab === 'activity') main.innerHTML = this.viewActivity();
    this.bindMain();
  },

  bindMain() {
    const newBtn = $('#gm-new-pour');
    if (newBtn) newBtn.addEventListener('click', () => this.openPourSheet());

    const sendBtn = $('#gm-send-batch');
    if (sendBtn) sendBtn.addEventListener('click', () => this.openBatchSheet());

    $$('[data-preview]').forEach((b) => {
      b.addEventListener('click', () => this.openReportModal(b.dataset.preview));
    });

    const resetBtn = $('#gm-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all local data to seed?')) {
          Store.reset();
          this.tab = 'open';
          location.hash = '#/open';
          this.render();
          toast('Data reset to seed', 'success');
        }
      });
    }
  },

  /* ---------- Open ledger view ---------- */
  viewOpenLedger() {
    const state = Store.get();
    const open = state.pours.filter((p) => !p.batchId);
    const totalGross = open.reduce((s, p) => s + p.gross, 0);
    const totalBalance = open.reduce((s, p) => s + computeBalance(p), 0);

    return `
      <div class="gm-page">
        <div class="gm-page-head">
          <div class="gm-page-meta">
            <h1>Open ledger</h1>
            <p class="gm-lede">Pours waiting to be batched and sent to FPR. Add a new pour or send a batch to the refinery.</p>
          </div>
          <div class="gm-page-acts">
            <button class="gm-btn primary" id="gm-new-pour" type="button">+ New pour</button>
            <button class="gm-btn gold" id="gm-send-batch" type="button" ${open.length === 0 ? 'disabled' : ''}>Send to FPR</button>
          </div>
        </div>

        <div class="gm-stats">
          <div class="gm-stat">
            <div class="gm-stat-l">Open pours</div>
            <div class="gm-stat-v">${open.length}</div>
          </div>
          <div class="gm-stat">
            <div class="gm-stat-l">Total gross</div>
            <div class="gm-stat-v">${grams(totalGross)}</div>
          </div>
          <div class="gm-stat gold">
            <div class="gm-stat-l">Total balance</div>
            <div class="gm-stat-v">${grams(totalBalance)}</div>
          </div>
        </div>

        ${open.length === 0 ? this.viewEmpty('No open pours', 'Tap "+ New pour" to record one.') : this.viewLedgerTable(open, false)}
      </div>
    `;
  },

  viewSentLedger() {
    const state = Store.get();
    const sent = state.pours.filter((p) => p.batchId);
    // Group by batch
    const byBatch = {};
    sent.forEach((p) => {
      if (!byBatch[p.batchId]) byBatch[p.batchId] = [];
      byBatch[p.batchId].push(p);
    });
    const batches = state.batches.slice();

    return `
      <div class="gm-page">
        <div class="gm-page-head">
          <div class="gm-page-meta">
            <h1>Sent to refinery</h1>
            <p class="gm-lede">Batches dispatched to ${escapeHtml(REFINERY.name)}. RBZ retention of 25% applies to every batch.</p>
          </div>
          <div class="gm-page-acts">
            <button class="gm-btn quiet" id="gm-reset" type="button" title="Reset all local data">Reset data</button>
          </div>
        </div>

        ${batches.length === 0 ? this.viewEmpty('No batches sent yet', 'Pick some open pours and tap "Send to FPR".') : ''}
        ${batches.map((b) => this.viewBatchCard(b, byBatch[b.id] || [])).join('')}
      </div>
    `;
  },

  viewBatchCard(batch, pours) {
    const statusLabel =
      batch.status === 'paid'
        ? `<span class="gm-badge ok">Paid · ${fmtDate(batch.paidOn)}</span>`
        : `<span class="gm-badge warn">Awaiting refinery payment · due ${fmtDate(batch.paymentDue)}</span>`;
    return `
      <section class="gm-batch-card">
        <header class="gm-batch-head">
          <div>
            <div class="gm-batch-id">${escapeHtml(batch.id)}</div>
            <div class="gm-batch-sub">Sent ${fmtDate(batch.date)} · ${pours.length} pour(s) · ${escapeHtml(REFINERY.name)}</div>
          </div>
          ${statusLabel}
        </header>
        ${this.viewLedgerTable(pours, true)}
        <div class="gm-batch-totals">
          <div class="gm-bt-row">
            <span>Total gross</span><strong>${grams(batch.totalGross)}</strong>
          </div>
          <div class="gm-bt-row">
            <span>Total balance (refinery receivable)</span><strong>${grams(batch.totalBalance)}</strong>
          </div>
          <div class="gm-bt-row gm-rbz">
            <span>RBZ retention (25%)</span><strong>− ${grams(batch.retention)}</strong>
          </div>
          <div class="gm-bt-row gm-net">
            <span>Net payable to mine</span><strong>${grams(batch.netPayable)}</strong>
          </div>
        </div>
      </section>
    `;
  },

  viewLedgerTable(pours, compact) {
    return `
      <div class="gm-tbl-wrap">
        <table class="gm-tbl">
          <thead>
            <tr>
              <th>Pour #</th>
              <th>Date</th>
              <th>Mine</th>
              <th class="num">Gross</th>
              <th class="num">Diesel</th>
              <th class="num">Shoots</th>
              <th class="num">LCD</th>
              <th class="num">Workers</th>
              <th class="num">Company</th>
              <th class="num">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${pours.map((p) => {
              const bal = computeBalance(p);
              const cls = bal < 0 ? 'gm-bad' : '';
              return `
                <tr>
                  <td><code>${escapeHtml(p.id)}</code></td>
                  <td>${fmtDate(p.date)}</td>
                  <td>${escapeHtml(p.mine)}</td>
                  <td class="num">${grams(p.gross)}</td>
                  <td class="num">${grams(p.diesel)}</td>
                  <td class="num">${grams(p.shoots)}</td>
                  <td class="num">${grams(p.lcd)}</td>
                  <td class="num">${grams(p.workers)}</td>
                  <td class="num">${grams(p.company)}</td>
                  <td class="num ${cls}"><strong>${grams(bal)}</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  viewEmpty(title, sub) {
    return `<div class="gm-empty"><div class="gm-empty-t">${escapeHtml(title)}</div><div class="gm-empty-s">${escapeHtml(sub)}</div></div>`;
  },

  /* ---------- Reports ---------- */
  viewReports() {
    const state = Store.get();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPours = state.pours.filter((p) => new Date(p.date) >= monthStart);
    const totalG = monthPours.reduce((s, p) => s + p.gross, 0);
    const totalB = monthPours.reduce((s, p) => s + computeBalance(p), 0);
    const monthLabel = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    return `
      <div class="gm-page">
        <div class="gm-page-head">
          <div class="gm-page-meta">
            <h1>Reports</h1>
            <p class="gm-lede">Statutory return previews populated from this month's pours. Print to save as PDF.</p>
          </div>
        </div>

        <div class="gm-stats">
          <div class="gm-stat">
            <div class="gm-stat-l">Reporting period</div>
            <div class="gm-stat-v gm-stat-v-sm">${escapeHtml(monthLabel)}</div>
          </div>
          <div class="gm-stat">
            <div class="gm-stat-l">Pours this month</div>
            <div class="gm-stat-v">${monthPours.length}</div>
          </div>
          <div class="gm-stat gold">
            <div class="gm-stat-l">Gross this month</div>
            <div class="gm-stat-v">${grams(totalG)}</div>
          </div>
        </div>

        <div class="gm-report-cards">
          <article class="gm-report-card">
            <div class="gm-rc-head">
              <div class="gm-rc-badge zimra">ZIMRA</div>
              <h3>Gold export return</h3>
            </div>
            <p>Zimbabwe Revenue Authority · monthly gold export declaration. Auto-populated from logged pours and dispatched batches.</p>
            <div class="gm-rc-acts">
              <button class="gm-btn primary" type="button" data-preview="zimra">Preview</button>
            </div>
          </article>
          <article class="gm-report-card">
            <div class="gm-rc-head">
              <div class="gm-rc-badge mmcz">MMCZ</div>
              <h3>Minerals declaration</h3>
            </div>
            <p>Minerals Marketing Corporation of Zimbabwe · marketing agent declaration of gold produced and dispatched.</p>
            <div class="gm-rc-acts">
              <button class="gm-btn primary" type="button" data-preview="mmcz">Preview</button>
            </div>
          </article>
        </div>
      </div>
    `;
  },

  /* ---------- Activity ---------- */
  viewActivity() {
    const state = Store.get();
    return `
      <div class="gm-page">
        <div class="gm-page-head">
          <div class="gm-page-meta">
            <h1>Activity</h1>
            <p class="gm-lede">Audit feed — every clerk action with timestamp.</p>
          </div>
        </div>
        ${state.audit.length === 0
          ? this.viewEmpty('No activity yet', 'Audit entries will appear here when you act.')
          : `<ol class="gm-audit">
              ${state.audit.map((a) => `
                <li class="gm-audit-row">
                  <div class="gm-audit-av">${escapeHtml((a.clerkName || a.clerk).split(' ').map((s) => s[0]).join('').slice(0, 2))}</div>
                  <div class="gm-audit-body">
                    <div class="gm-audit-ttl">${escapeHtml(a.action)}</div>
                    <div class="gm-audit-detail">${escapeHtml(a.detail || '')}</div>
                    <div class="gm-audit-sub">${escapeHtml(a.clerkName || a.clerk)} · <code>${escapeHtml(a.clerk)}</code></div>
                  </div>
                  <time class="gm-audit-ts">${fmtDateTime(a.ts)}</time>
                </li>
              `).join('')}
            </ol>`
        }
      </div>
    `;
  },

  /* ============================================================
     FLOW 1 — Record a pour
     ============================================================ */
  openPourSheet() {
    const host = $('#gm-sheet-host');
    if (!host) return;
    host.innerHTML = `
      <div class="gm-sheet-scrim" data-close></div>
      <aside class="gm-sheet" role="dialog" aria-modal="true" aria-labelledby="pour-sheet-title">
        <header class="gm-sheet-head">
          <h2 id="pour-sheet-title">Record a pour</h2>
          <button class="gm-sheet-close" type="button" data-close aria-label="Close">×</button>
        </header>
        <form class="gm-sheet-body" id="gm-pour-form" autocomplete="off" novalidate>
          <div class="gm-field">
            <label for="pf-mine">Mine</label>
            <select id="pf-mine" name="mine" required>
              <option value="">Select mine…</option>
              ${MINES.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('')}
            </select>
          </div>
          <div class="gm-field">
            <label for="pf-gross">Gross (g) — total gold produced</label>
            <input type="number" id="pf-gross" name="gross" step="0.01" min="0.01" required inputmode="decimal" />
          </div>
          <div class="gm-grid-2">
            <div class="gm-field">
              <label for="pf-diesel">Diesel (g)</label>
              <input type="number" id="pf-diesel" name="diesel" step="0.01" min="0" value="0" inputmode="decimal" />
            </div>
            <div class="gm-field">
              <label for="pf-shoots">Shoots (g)</label>
              <input type="number" id="pf-shoots" name="shoots" step="0.01" min="0" value="0" inputmode="decimal" />
            </div>
            <div class="gm-field">
              <label for="pf-lcd">LCD (g)</label>
              <input type="number" id="pf-lcd" name="lcd" step="0.01" min="0" value="0" inputmode="decimal" />
            </div>
            <div class="gm-field">
              <label for="pf-workers">Workers (g)</label>
              <input type="number" id="pf-workers" name="workers" step="0.01" min="0" value="0" inputmode="decimal" />
            </div>
            <div class="gm-field gm-field-wide">
              <label for="pf-company">Company (g)</label>
              <input type="number" id="pf-company" name="company" step="0.01" min="0" value="0" inputmode="decimal" />
            </div>
          </div>

          <div class="gm-balance" id="gm-balance-box">
            <div class="gm-balance-l">Balance (owner's share)</div>
            <div class="gm-balance-v" id="gm-balance-v">0.00 g</div>
            <div class="gm-balance-warn" id="gm-balance-warn" hidden>Deductions exceed gross</div>
          </div>

          <div class="gm-sheet-foot">
            <button type="button" class="gm-btn quiet" data-close>Cancel</button>
            <button type="submit" class="gm-btn primary" id="gm-pour-save">Save pour</button>
          </div>
        </form>
      </aside>
    `;

    const form = $('#gm-pour-form');
    const inputs = $$('input[type="number"]', form);
    const mineSel = $('#pf-mine', form);
    const balV = $('#gm-balance-v');
    const balWarn = $('#gm-balance-warn');
    const balBox = $('#gm-balance-box');

    const recompute = () => {
      const v = {
        gross: parseFloat($('#pf-gross', form).value) || 0,
        diesel: parseFloat($('#pf-diesel', form).value) || 0,
        shoots: parseFloat($('#pf-shoots', form).value) || 0,
        lcd: parseFloat($('#pf-lcd', form).value) || 0,
        workers: parseFloat($('#pf-workers', form).value) || 0,
        company: parseFloat($('#pf-company', form).value) || 0,
      };
      const bal = computeBalance(v);
      balV.textContent = grams(bal);
      if (bal < 0) {
        balBox.classList.add('bad');
        balWarn.hidden = false;
      } else {
        balBox.classList.remove('bad');
        balWarn.hidden = true;
      }
    };

    inputs.forEach((i) => i.addEventListener('input', recompute));
    recompute();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const mine = mineSel.value;
      const gross = parseFloat($('#pf-gross', form).value);
      const diesel = parseFloat($('#pf-diesel', form).value) || 0;
      const shoots = parseFloat($('#pf-shoots', form).value) || 0;
      const lcd = parseFloat($('#pf-lcd', form).value) || 0;
      const workers = parseFloat($('#pf-workers', form).value) || 0;
      const company = parseFloat($('#pf-company', form).value) || 0;

      if (!mine) { toast('Select a mine', 'danger'); mineSel.focus(); return; }
      if (!(gross > 0)) { toast('Gross must be greater than 0', 'danger'); $('#pf-gross', form).focus(); return; }
      for (const [n, v] of Object.entries({ diesel, shoots, lcd, workers, company })) {
        if (v < 0 || Number.isNaN(v)) { toast(`${n} must be a non-negative number`, 'danger'); return; }
      }
      const bal = gross - diesel - shoots - lcd - workers - company;
      if (bal < 0) {
        if (!confirm('Balance is negative (deductions exceed gross). Save anyway?')) return;
      }

      Store.addPour({ mine, gross, diesel, shoots, lcd, workers, company });
      this.closeSheet();
      this.render();
      toast('Pour recorded', 'success');
    });

    host.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => this.closeSheet()));

    // a11y — focus first field
    setTimeout(() => mineSel.focus(), 50);

    // Esc to close
    this._escHandler = (e) => { if (e.key === 'Escape') this.closeSheet(); };
    document.addEventListener('keydown', this._escHandler);
  },

  closeSheet() {
    const host = $('#gm-sheet-host');
    if (host) host.innerHTML = '';
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  },

  /* ============================================================
     FLOW 2 — Send batch to FPR
     ============================================================ */
  openBatchSheet() {
    const state = Store.get();
    const open = state.pours.filter((p) => !p.batchId);
    if (open.length === 0) {
      toast('No open pours to send', 'warn');
      return;
    }
    const host = $('#gm-sheet-host');
    host.innerHTML = `
      <div class="gm-sheet-scrim" data-close></div>
      <aside class="gm-sheet" role="dialog" aria-modal="true" aria-labelledby="batch-sheet-title">
        <header class="gm-sheet-head">
          <h2 id="batch-sheet-title">Send to ${escapeHtml(REFINERY.name)}</h2>
          <button class="gm-sheet-close" type="button" data-close aria-label="Close">×</button>
        </header>
        <div class="gm-sheet-body">
          <p class="gm-sheet-lede">Select pours to include in this batch. The 25% RBZ retention will apply on the balance.</p>
          <ul class="gm-pour-pick" id="gm-pour-pick">
            ${open.map((p) => {
              const bal = computeBalance(p);
              return `
                <li>
                  <label class="gm-pick">
                    <input type="checkbox" data-pour="${escapeHtml(p.id)}" data-gross="${p.gross}" data-balance="${bal}" />
                    <div class="gm-pick-meta">
                      <div class="gm-pick-id"><code>${escapeHtml(p.id)}</code> · ${escapeHtml(p.mine)}</div>
                      <div class="gm-pick-sub">${fmtDate(p.date)}</div>
                    </div>
                    <div class="gm-pick-nums">
                      <div>Gross <strong>${grams(p.gross)}</strong></div>
                      <div>Balance <strong>${grams(bal)}</strong></div>
                    </div>
                  </label>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
        <footer class="gm-sheet-foot gm-batch-foot">
          <div class="gm-bs-totals">
            <div><span>Total gross</span><strong id="gm-bs-gross">0.00 g</strong></div>
            <div><span>Total balance</span><strong id="gm-bs-balance">0.00 g</strong></div>
            <div class="gm-rbz-line"><span>RBZ retention (25%)</span><strong id="gm-bs-rbz">− 0.00 g</strong></div>
          </div>
          <div class="gm-bs-acts">
            <button type="button" class="gm-btn quiet" data-close>Cancel</button>
            <button type="button" class="gm-btn gold" id="gm-bs-confirm" disabled>Confirm batch</button>
          </div>
        </footer>
      </aside>
    `;

    const checks = $$('#gm-pour-pick input[type="checkbox"]', host);
    const grossEl = $('#gm-bs-gross');
    const balEl = $('#gm-bs-balance');
    const rbzEl = $('#gm-bs-rbz');
    const confirmBtn = $('#gm-bs-confirm');

    const recompute = () => {
      let tg = 0, tb = 0, n = 0;
      checks.forEach((c) => {
        if (c.checked) {
          n += 1;
          tg += parseFloat(c.dataset.gross) || 0;
          tb += parseFloat(c.dataset.balance) || 0;
        }
      });
      grossEl.textContent = grams(tg);
      balEl.textContent = grams(tb);
      rbzEl.textContent = '− ' + grams(tb * RBZ_RETENTION);
      confirmBtn.disabled = n === 0;
    };
    checks.forEach((c) => c.addEventListener('change', recompute));
    recompute();

    confirmBtn.addEventListener('click', () => {
      const picked = checks.filter((c) => c.checked).map((c) => c.dataset.pour);
      if (picked.length === 0) return;
      // simulate "sending"
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="gm-spinner" aria-hidden="true"></span> Sending…';
      setTimeout(() => {
        const batch = Store.sendBatch(picked);
        this.closeSheet();
        this.tab = 'sent';
        location.hash = '#/sent';
        this.render();
        toast(`Batch ${batch.id} created · ${grams(batch.totalGross)} gross`, 'success');
      }, 800);
    });

    host.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => this.closeSheet()));

    setTimeout(() => {
      const first = checks[0];
      if (first) first.focus();
    }, 50);

    this._escHandler = (e) => { if (e.key === 'Escape') this.closeSheet(); };
    document.addEventListener('keydown', this._escHandler);
  },

  /* ============================================================
     FLOW 3 — Reports preview modal
     ============================================================ */
  openReportModal(kind) {
    const host = $('#gm-modal-host');
    if (!host) return;
    const state = Store.get();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const pours = state.pours.filter((p) => new Date(p.date) >= monthStart);
    const totalG = pours.reduce((s, p) => s + p.gross, 0);
    const totalB = pours.reduce((s, p) => s + computeBalance(p), 0);
    const monthLabel = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const isZimra = kind === 'zimra';
    const title = isZimra ? 'ZIMRA — Gold Export Return' : 'MMCZ — Minerals Declaration';
    const code = isZimra ? 'ZIMRA / Form GET-04' : 'MMCZ / Form GOLD-12';

    host.innerHTML = `
      <div class="gm-modal-scrim" data-close></div>
      <div class="gm-modal report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <header class="gm-modal-head no-print">
          <div>
            <h2 id="report-title">${escapeHtml(title)}</h2>
            <p class="gm-modal-sub">${escapeHtml(monthLabel)} · ${escapeHtml(code)}</p>
          </div>
          <div class="gm-modal-acts">
            <button class="gm-btn primary" id="gm-print-btn" type="button">Download (Print to PDF)</button>
            <button class="gm-btn quiet" type="button" data-close>Close</button>
          </div>
        </header>
        <div class="gm-modal-body">
          <article class="gm-report-doc">
            <header class="gm-report-doc-head">
              <div class="gm-report-doc-org">
                <div class="gm-report-doc-crest">${isZimra ? 'ZIMRA' : 'MMCZ'}</div>
                <div>
                  <div class="gm-report-doc-title">${escapeHtml(title)}</div>
                  <div class="gm-report-doc-sub">${escapeHtml(isZimra ? 'Zimbabwe Revenue Authority' : 'Minerals Marketing Corporation of Zimbabwe')}</div>
                </div>
              </div>
              <div class="gm-report-doc-meta">
                <div><span>Form</span> ${escapeHtml(code)}</div>
                <div><span>Period</span> ${escapeHtml(monthLabel)}</div>
                <div><span>Clerk</span> ${escapeHtml(CLERK.name)} (${escapeHtml(CLERK.id)})</div>
                <div><span>Refinery</span> ${escapeHtml(REFINERY.name)}</div>
              </div>
            </header>

            <table class="gm-report-tbl">
              <thead>
                <tr>
                  <th>Pour #</th>
                  <th>Date</th>
                  <th>Mine</th>
                  <th class="num">Gross (g)</th>
                  <th class="num">Balance (g)</th>
                  <th>Batch #</th>
                </tr>
              </thead>
              <tbody>
                ${pours.length === 0
                  ? `<tr><td colspan="6" style="text-align:center;padding:24px;color:#666;">No pours for this period.</td></tr>`
                  : pours.map((p) => `
                      <tr>
                        <td>${escapeHtml(p.id)}</td>
                        <td>${fmtDate(p.date)}</td>
                        <td>${escapeHtml(p.mine)}</td>
                        <td class="num">${grams(p.gross)}</td>
                        <td class="num">${grams(computeBalance(p))}</td>
                        <td>${p.batchId ? escapeHtml(p.batchId) : '<em>unbatched</em>'}</td>
                      </tr>
                    `).join('')
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3"><strong>Totals (${pours.length} pour(s))</strong></td>
                  <td class="num"><strong>${grams(totalG)}</strong></td>
                  <td class="num"><strong>${grams(totalB)}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <section class="gm-report-decl">
              <p>I, <strong>${escapeHtml(CLERK.name)}</strong>, declare that the information provided above is true and correct to the best of my knowledge, and reflects all gold pours produced and dispatched during the stated period.</p>
              <div class="gm-report-sig">
                <div class="gm-report-sig-block">
                  <div class="gm-report-sig-line"></div>
                  <div>Clerk signature</div>
                </div>
                <div class="gm-report-sig-block">
                  <div class="gm-report-sig-line"></div>
                  <div>Date</div>
                </div>
                <div class="gm-report-sig-block">
                  <div class="gm-report-sig-line"></div>
                  <div>Official stamp</div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    `;

    $('#gm-print-btn').addEventListener('click', () => window.print());
    host.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => this.closeModal()));

    this._modalEsc = (e) => { if (e.key === 'Escape') this.closeModal(); };
    document.addEventListener('keydown', this._modalEsc);
  },

  closeModal() {
    const host = $('#gm-modal-host');
    if (host) host.innerHTML = '';
    if (this._modalEsc) {
      document.removeEventListener('keydown', this._modalEsc);
      this._modalEsc = null;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
