/* ============================================================
   Scrap Yard Operator — functional prototype
   Three flows: open day, weigh load, pay supplier.
   Vanilla JS · localStorage prefix "corelith:scrap:"
   ============================================================ */

(function () {
  'use strict';

  const LS_PREFIX = 'corelith:scrap:';
  const LS_KEYS = {
    day: LS_PREFIX + 'day',
    loads: LS_PREFIX + 'loads',
    suppliers: LS_PREFIX + 'suppliers',
    seq: LS_PREFIX + 'seq',
  };

  // ---- Materials (USD/kg, Zim 2026 realistic) ----
  const MATERIALS = [
    { id: 'copper',    name: 'Copper',    price: 6.20, icon: 'Cu' },
    { id: 'aluminium', name: 'Aluminium', price: 1.40, icon: 'Al' },
    { id: 'brass',     name: 'Brass',     price: 5.10, icon: 'Br' },
    { id: 'steel',     name: 'Steel',     price: 0.45, icon: 'Fe' },
    { id: 'lead',      name: 'Lead',      price: 1.85, icon: 'Pb' },
    { id: 'stainless', name: 'Stainless', price: 1.20, icon: 'Ss' },
  ];

  const PAYMENT_METHODS = [
    { id: 'ecocash',  name: 'EcoCash',  icon: '✉',  sub: 'Push to phone' },
    { id: 'onemoney', name: 'OneMoney', icon: '☎',  sub: 'Push to phone' },
    { id: 'cash',     name: 'Cash',     icon: '$',       sub: 'In-person hand-over' },
    { id: 'bank',     name: 'Bank',     icon: '#',       sub: 'EFT transfer' },
  ];

  // ---- Seed data ----
  const SEED_SUPPLIERS = [
    { id: 'sup-1', name: 'Tendai Moyo',         phone: '0772 184 921', idn: '63-184921D63' },
    { id: 'sup-2', name: 'Mhondoro Salvage',    phone: '0712 480 022', idn: '08-220880Q08' },
    { id: 'sup-3', name: 'Bhebhe Hardware',     phone: '0782 010 776', idn: '08-110204K08' },
    { id: 'sup-4', name: 'Sipho Ncube',         phone: '0719 487 112', idn: '63-220117Z63' },
    { id: 'sup-5', name: 'Glen Park Spares',    phone: '0775 332 891', idn: '63-998144C63' },
  ];

  // Seed: 3 prior loads already paid, 2 unpaid loads (mix of suppliers)
  function seedLoads() {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const earlier = Date.now() - 4 * 60 * 60 * 1000;
    return [
      // Paid history (3)
      { id: 'L-1001', supplierId: 'sup-1', materialId: 'copper',    weight: 12.40, price: 6.20, total: 76.88, photos: ['photo-1.jpg'],            paid: true, paidMethod: 'ecocash', confirmation: 'EC-78321', createdAt: yesterday, paidAt: yesterday + 1800000 },
      { id: 'L-1002', supplierId: 'sup-2', materialId: 'steel',     weight: 248.50, price: 0.45, total: 111.83, photos: ['photo-1.jpg', 'photo-2.jpg'], paid: true, paidMethod: 'cash',    confirmation: 'CSH-44012', createdAt: yesterday, paidAt: yesterday + 2400000 },
      { id: 'L-1003', supplierId: 'sup-3', materialId: 'aluminium', weight: 36.20, price: 1.40, total: 50.68, photos: ['photo-1.jpg'],            paid: true, paidMethod: 'bank',    confirmation: 'BNK-91022', createdAt: yesterday, paidAt: yesterday + 3200000 },
      // Unpaid (2)
      { id: 'L-1004', supplierId: 'sup-1', materialId: 'brass',     weight: 8.80,  price: 5.10, total: 44.88, photos: ['photo-1.jpg'],            paid: false, createdAt: earlier },
      { id: 'L-1005', supplierId: 'sup-4', materialId: 'copper',    weight: 4.20,  price: 6.20, total: 26.04, photos: ['photo-1.jpg'],            paid: false, createdAt: earlier + 600000 },
    ];
  }

  // ---- Storage ----
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { /* ignore quota */ }
  }

  // ---- Helpers ----
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function money(n) { return '$' + (Number(n) || 0).toFixed(2); }
  function kg(n) { return (Number(n) || 0).toFixed(2) + ' kg'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function nextId(prefix) {
    const seq = load(LS_KEYS.seq, {});
    seq[prefix] = (seq[prefix] || 1000) + 1;
    save(LS_KEYS.seq, seq);
    return prefix + '-' + seq[prefix];
  }
  function timeStr(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  function dayStr(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // ---- State ----
  const state = {
    tab: 'home',     // home | new-load | pay
    day: null,       // { operator, openedAt }
    loads: [],
    suppliers: [],
    modal: null,     // { type, ... }
    wizard: null,    // multi-step new-load
    pay: null,       // pay supplier flow
    receipt: null,   // last receipt for slide preview
  };

  function init() {
    // first launch — seed
    if (load(LS_KEYS.suppliers, null) == null) {
      save(LS_KEYS.suppliers, SEED_SUPPLIERS);
    }
    if (load(LS_KEYS.loads, null) == null) {
      save(LS_KEYS.loads, seedLoads());
    }
    state.suppliers = load(LS_KEYS.suppliers, []);
    state.loads = load(LS_KEYS.loads, []);
    state.day = load(LS_KEYS.day, null);
    render();
  }

  function persistLoads() { save(LS_KEYS.loads, state.loads); }
  function persistSuppliers() { save(LS_KEYS.suppliers, state.suppliers); }
  function persistDay() { save(LS_KEYS.day, state.day); }

  // ---- Toast ----
  function toast(msg, kind) {
    const host = $('#sy-toast-host');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'sy-toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  // ---- Render entrypoint ----
  function render() {
    const root = $('#app');
    root.innerHTML = `
      <div class="sy-shell" role="application" aria-label="Scrap yard operator">
        ${renderTopbar()}
        <main class="sy-main" id="sy-main">${renderMain()}</main>
        ${state.day ? renderTabs() : ''}
      </div>
      ${renderModal()}
    `;
    wire();
  }

  function renderTopbar() {
    return `
      <header class="sy-topbar">
        <div class="mark">SY</div>
        <div>
          <div class="ttl">Mukamba Scrap</div>
          <div class="sb">Workington · Operator</div>
        </div>
        <div class="spacer"></div>
        ${state.day
          ? `<span class="pill live"><span class="dot"></span>Day open</span>`
          : `<span class="pill">Day closed</span>`}
      </header>
    `;
  }

  function renderMain() {
    if (!state.day) return renderBlocker();
    if (state.tab === 'new-load' && state.wizard) return renderWizard();
    if (state.tab === 'pay' && state.pay) return renderPayFlow();
    if (state.tab === 'pay') return renderPayList();
    return renderHome();
  }

  function renderTabs() {
    const tabs = [
      { id: 'home', label: 'Home', ic: '⌂' },
      { id: 'new-load', label: 'New load', ic: '+' },
      { id: 'pay', label: 'Pay', ic: '$' },
    ];
    return `
      <nav class="sy-tabs" role="tablist">
        ${tabs.map(t => `
          <button role="tab" aria-selected="${state.tab === t.id}" class="${state.tab === t.id ? 'active' : ''}" data-tab="${t.id}">
            <span class="ic">${t.ic}</span>
            <span>${t.label}</span>
          </button>
        `).join('')}
      </nav>
    `;
  }

  // ============================================================
  // FLOW 1 — Open day blocker + calibration
  // ============================================================
  function renderBlocker() {
    return `
      <div class="sy-blocker">
        <div class="ic-big">⚖</div>
        <h1>Open the day</h1>
        <p>Calibrate the scale and sign in to start weighing loads. Nothing else works until the day is open.</p>
        <button class="sy-btn warm" id="sy-open-day-btn" style="max-width:280px;">Open the day</button>
      </div>
    `;
  }

  function openDayModal() {
    state.modal = {
      type: 'open-day',
      operator: '',
      testWeight: 5.00, // expected kg
      actualWeight: '',
    };
    render();
    setTimeout(() => { const f = $('#sy-operator'); if (f) f.focus(); }, 50);
  }

  function renderOpenDayModal() {
    const m = state.modal;
    const actual = parseFloat(m.actualWeight);
    const diff = isFinite(actual) ? Math.abs(actual - m.testWeight) : null;
    const hasActual = m.actualWeight !== '' && isFinite(actual);
    const calibrated = hasActual && diff <= 0.05;
    const offset = hasActual && diff > 0.05;
    const canConfirm = m.operator.trim().length >= 2 && calibrated;
    return `
      <div class="sy-scrim" data-scrim>
        <div class="sy-sheet" role="dialog" aria-modal="true" aria-labelledby="sy-open-day-title">
          <h2 id="sy-open-day-title">Open the day</h2>
          <p class="sub">Enter the operator name and verify the scale with the 5 kg test weight.</p>

          <div class="sy-field">
            <label class="sy-label" for="sy-operator">Operator name</label>
            <input class="sy-input" id="sy-operator" type="text" autocomplete="name" value="${esc(m.operator)}" placeholder="e.g. Tendai Ncube" />
          </div>

          <div class="sy-field">
            <label class="sy-label" for="sy-actual">Place the 5 kg test weight on the scale</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <div style="flex:1;">
                <div class="sy-help" style="margin-top:0;">Expected</div>
                <div style="font:700 22px/1 var(--font-mono); color: var(--text-strong); margin-top:4px;">5.00 kg</div>
              </div>
              <div style="flex:1;">
                <label class="sy-help" for="sy-actual" style="margin-top:0;">Actual</label>
                <input class="sy-input" id="sy-actual" type="number" step="0.01" min="0" inputmode="decimal" value="${esc(m.actualWeight)}" placeholder="0.00" style="margin-top:4px;" />
              </div>
            </div>
            ${calibrated ? `<div class="sy-ok"><span>✓</span> Calibrated · within ${diff.toFixed(2)} kg of expected</div>` : ''}
            ${offset ? `<div class="sy-warn"><span>⚠</span> Off by ${diff.toFixed(2)} kg — re-zero the scale and try again</div>` : ''}
          </div>

          <div class="sy-sheet-foot">
            <button class="sy-btn ghost" data-cancel>Cancel</button>
            <button class="sy-btn warm" id="sy-confirm-day" ${canConfirm ? '' : 'disabled'}>Open day</button>
          </div>
        </div>
      </div>
    `;
  }

  function wireOpenDayModal() {
    const op = $('#sy-operator');
    const ac = $('#sy-actual');
    op && op.addEventListener('input', (e) => { state.modal.operator = e.target.value; rerenderModal(); });
    ac && ac.addEventListener('input', (e) => { state.modal.actualWeight = e.target.value; rerenderModal(); });
    const confirm = $('#sy-confirm-day');
    confirm && confirm.addEventListener('click', () => {
      state.day = { operator: state.modal.operator.trim(), openedAt: Date.now() };
      persistDay();
      state.modal = null;
      state.tab = 'home';
      render();
      toast('Day open. Ready to weigh.', 'success');
    });
  }

  function closeDay() {
    if (!confirm('Close the day? You won’t be able to weigh loads until you re-open.')) return;
    state.day = null;
    persistDay();
    state.tab = 'home';
    render();
    toast('Day closed.');
  }

  // ============================================================
  // HOME — today's loads, day status, CTA
  // ============================================================
  function renderHome() {
    const today = state.loads.filter(isToday).sort((a,b) => b.createdAt - a.createdAt);
    const todayTotalKg = today.reduce((s,l) => s + l.weight, 0);
    const todayTotalUsd = today.reduce((s,l) => s + l.total, 0);
    const unpaidUsd = today.filter(l => !l.paid).reduce((s,l) => s + l.total, 0);

    return `
      <div class="sy-day-status">
        <div class="av">⚖</div>
        <div>
          <div class="ttl">Day open · ${esc(state.day.operator)}</div>
          <div class="sb">Since ${esc(timeStr(state.day.openedAt))} · ${esc(dayStr(state.day.openedAt))}</div>
        </div>
        <button id="sy-close-day">Close day</button>
      </div>

      <button class="sy-cta" id="sy-new-load"><span class="ic">+</span> New load</button>

      <div class="sy-stat-row">
        <div class="sy-stat"><div class="lbl">Loads</div><div class="v">${today.length}</div></div>
        <div class="sy-stat"><div class="lbl">Weight</div><div class="v">${todayTotalKg.toFixed(1)}</div></div>
        <div class="sy-stat"><div class="lbl">Total</div><div class="v">${money(todayTotalUsd)}</div></div>
      </div>

      ${unpaidUsd > 0 ? `
        <div class="sy-card" style="background:var(--scrap-warm-soft); border-color:var(--scrap-warm);">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="flex:1;">
              <h3>Suppliers waiting</h3>
              <p class="sub">${money(unpaidUsd)} owed across today’s loads</p>
            </div>
            <button class="sy-btn warm compact" data-tab-go="pay">Pay now</button>
          </div>
        </div>
      ` : ''}

      <div class="sy-section-h">Today’s loads</div>
      ${today.length === 0
        ? `<div class="sy-card sy-empty"><div class="ic">⚖</div>No loads weighed yet today. Tap “New load” to start.</div>`
        : `<div class="sy-card">${today.map(renderLoadRow).join('')}</div>`}
    `;
  }

  function isToday(load) {
    if (!state.day) return false;
    const d = new Date(load.createdAt);
    const day = new Date(state.day.openedAt);
    return d.toDateString() === day.toDateString();
  }

  function renderLoadRow(l) {
    const sup = state.suppliers.find(s => s.id === l.supplierId);
    const mat = MATERIALS.find(m => m.id === l.materialId);
    return `
      <div class="sy-row">
        <div class="av">${mat ? esc(mat.icon) : '?'}</div>
        <div>
          <div class="nm">${esc(sup ? sup.name : 'Unknown')}</div>
          <div class="sb">${mat ? esc(mat.name) : ''} · ${esc(kg(l.weight))} · ${esc(timeStr(l.createdAt))}</div>
        </div>
        <div class="right">
          <div class="amt">${money(l.total)}</div>
          <span class="tag ${l.paid ? 'paid' : 'unpaid'}">${l.paid ? 'Paid' : 'Unpaid'}</span>
        </div>
      </div>
    `;
  }

  // ============================================================
  // FLOW 2 — New load wizard
  // ============================================================
  function startWizard() {
    state.wizard = {
      step: 1,
      materialId: null,
      weight: '',
      photos: [],
      supplierId: null,
      supplierSearch: '',
      newSupplier: null, // { name, phone, idn }
    };
    state.tab = 'new-load';
    render();
  }

  function renderWizard() {
    const w = state.wizard;
    const TOTAL_STEPS = 5;
    const mat = w.materialId ? MATERIALS.find(m => m.id === w.materialId) : null;
    const weightNum = parseFloat(w.weight);
    const total = (mat && isFinite(weightNum) && weightNum > 0) ? mat.price * weightNum : 0;

    let body = '';
    if (w.step === 1) body = renderStepMaterial(w);
    if (w.step === 2) body = renderStepWeight(w, mat, total);
    if (w.step === 3) body = renderStepPhotos(w);
    if (w.step === 4) body = renderStepSupplier(w);
    if (w.step === 5) body = renderStepReview(w, mat, total);

    return `
      <button class="sy-back" id="sy-wiz-back">← ${w.step === 1 ? 'Cancel' : 'Back'}</button>
      <div class="sy-stepper" aria-label="Step ${w.step} of ${TOTAL_STEPS}">
        ${Array.from({length: TOTAL_STEPS}, (_,i) => `<span class="st ${i < w.step ? 'on' : ''}"></span>`).join('')}
      </div>
      <div class="sy-step-meta">Step ${w.step} of ${TOTAL_STEPS}</div>
      ${body}
    `;
  }

  function renderStepMaterial(w) {
    return `
      <h1 class="sy-step-h">Which material?</h1>
      <p class="sy-step-sub">Pick the metal being weighed.</p>
      <div class="sy-mat-grid">
        ${MATERIALS.map(m => `
          <button class="sy-mat ${w.materialId === m.id ? 'on' : ''}" data-mat="${m.id}" aria-pressed="${w.materialId === m.id}">
            <span class="nm">${esc(m.name)}</span>
            <span class="pr">${money(m.price)} / kg</span>
          </button>
        `).join('')}
      </div>
      <div style="margin-top:18px;">
        <button class="sy-btn warm" id="sy-wiz-next" ${w.materialId ? '' : 'disabled'}>Next</button>
      </div>
    `;
  }

  function renderStepWeight(w, mat, total) {
    return `
      <h1 class="sy-step-h">Weight</h1>
      <p class="sy-step-sub">Read the scale and enter kilograms.</p>
      <div class="sy-field">
        <label class="sy-label" for="sy-weight">${esc(mat.name)} · ${money(mat.price)} per kg</label>
        <input class="sy-input big" id="sy-weight" type="number" step="0.01" min="0" inputmode="decimal" value="${esc(w.weight)}" placeholder="0.00" />
        <div class="sy-help">Enter to two decimal places (kg).</div>
      </div>
      <div class="sy-live-total">
        <div class="lbl">Live total</div>
        <div class="v">${money(total)}</div>
        <div class="sb">${esc(kg(parseFloat(w.weight) || 0))} × ${money(mat.price)}/kg</div>
      </div>
      <button class="sy-btn warm" id="sy-wiz-next" ${total > 0 ? '' : 'disabled'}>Next</button>
    `;
  }

  function renderStepPhotos(w) {
    return `
      <h1 class="sy-step-h">Photo</h1>
      <p class="sy-step-sub">Snap the load for the record. You can take more than one.</p>
      <button class="sy-dropzone" id="sy-photo-drop" type="button" aria-label="Capture photo">
        <span class="ic">⎘</span>
        <span>Tap to capture a photo</span>
        <span style="font-size:11.5px; opacity:0.7;">Demo · generates a mock image</span>
      </button>
      ${w.photos.length > 0 ? `
        <div class="sy-photo-list">
          ${w.photos.map((p, i) => `
            <div class="sy-photo">
              <span>⎘ ${esc(p)}</span>
              <button data-rm-photo="${i}" aria-label="Remove ${esc(p)}">✕</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div style="margin-top:18px;">
        <button class="sy-btn warm" id="sy-wiz-next">${w.photos.length === 0 ? 'Skip' : 'Next'}</button>
      </div>
    `;
  }

  function renderStepSupplier(w) {
    const q = (w.supplierSearch || '').toLowerCase();
    const filtered = state.suppliers.filter(s =>
      !q || s.name.toLowerCase().includes(q) || s.phone.includes(q)
    );
    return `
      <h1 class="sy-step-h">Supplier</h1>
      <p class="sy-step-sub">Search the register, or add a new walk-in.</p>
      <div class="sy-field sy-sup-search">
        <input class="sy-input" id="sy-sup-search" type="search" placeholder="Search name or phone" value="${esc(w.supplierSearch)}" autocomplete="off" />
      </div>
      <div class="sy-sup-list">
        ${filtered.length === 0 ? `<div class="sy-empty" style="padding:18px;">No matches.</div>` : filtered.map(s => `
          <button class="sy-sup-item ${w.supplierId === s.id ? 'on' : ''}" data-sup="${s.id}">
            <span class="av">${esc(s.name.slice(0,1).toUpperCase())}</span>
            <span>
              <div class="nm">${esc(s.name)}</div>
              <div class="sb">${esc(s.phone)}</div>
            </span>
          </button>
        `).join('')}
      </div>
      <div style="margin-top:12px;">
        <button class="sy-btn ghost" id="sy-add-sup">+ Add new supplier</button>
      </div>
      <div style="margin-top:18px;">
        <button class="sy-btn warm" id="sy-wiz-next" ${w.supplierId ? '' : 'disabled'}>Next</button>
      </div>
    `;
  }

  function renderStepReview(w, mat, total) {
    const sup = state.suppliers.find(s => s.id === w.supplierId);
    return `
      <h1 class="sy-step-h">Review the load</h1>
      <p class="sy-step-sub">Check everything before saving.</p>
      <div class="sy-card">
        <div class="sy-rev-row"><span class="l">Supplier</span><span class="r">${esc(sup ? sup.name : '')}</span></div>
        <div class="sy-rev-row"><span class="l">Phone</span><span class="r">${esc(sup ? sup.phone : '')}</span></div>
        <div class="sy-rev-row"><span class="l">Material</span><span class="r">${esc(mat.name)}</span></div>
        <div class="sy-rev-row"><span class="l">Price / kg</span><span class="r">${money(mat.price)}</span></div>
        <div class="sy-rev-row"><span class="l">Weight</span><span class="r">${kg(parseFloat(w.weight) || 0)}</span></div>
        <div class="sy-rev-row"><span class="l">Photos</span><span class="r">${w.photos.length}</span></div>
        <div class="sy-rev-row total"><span class="l">Total to pay</span><span class="r">${money(total)}</span></div>
      </div>
      <div style="margin-top:18px;">
        <button class="sy-btn warm" id="sy-save-load">Save load</button>
      </div>
    `;
  }

  function wireWizard() {
    const w = state.wizard;
    if (!w) return;
    const back = $('#sy-wiz-back');
    back && back.addEventListener('click', () => {
      if (w.step === 1) { state.wizard = null; state.tab = 'home'; render(); return; }
      w.step -= 1; render();
    });
    const next = $('#sy-wiz-next');
    next && next.addEventListener('click', () => {
      // validate per step
      if (w.step === 1 && !w.materialId) return toast('Pick a material', 'warn');
      if (w.step === 2) {
        const n = parseFloat(w.weight);
        if (!(n > 0)) return toast('Weight must be greater than 0', 'warn');
      }
      if (w.step === 4 && !w.supplierId) return toast('Select a supplier', 'warn');
      w.step += 1;
      render();
    });

    if (w.step === 1) {
      $$('[data-mat]').forEach(b => b.addEventListener('click', () => {
        w.materialId = b.dataset.mat; render();
      }));
    }
    if (w.step === 2) {
      const wi = $('#sy-weight');
      wi && wi.addEventListener('input', (e) => { w.weight = e.target.value; render(); setTimeout(() => { const f = $('#sy-weight'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }}, 0); });
      setTimeout(() => { const f = $('#sy-weight'); if (f) f.focus(); }, 30);
    }
    if (w.step === 3) {
      const dz = $('#sy-photo-drop');
      dz && dz.addEventListener('click', () => {
        const n = w.photos.length + 1;
        w.photos.push('photo-' + n + '.jpg');
        render();
      });
      $$('[data-rm-photo]').forEach(b => b.addEventListener('click', (e) => {
        e.stopPropagation();
        const i = parseInt(b.dataset.rmPhoto, 10);
        w.photos.splice(i, 1); render();
      }));
    }
    if (w.step === 4) {
      const s = $('#sy-sup-search');
      s && s.addEventListener('input', (e) => {
        w.supplierSearch = e.target.value;
        render();
        setTimeout(() => { const f = $('#sy-sup-search'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }}, 0);
      });
      $$('[data-sup]').forEach(b => b.addEventListener('click', () => {
        w.supplierId = b.dataset.sup; render();
      }));
      const add = $('#sy-add-sup');
      add && add.addEventListener('click', openAddSupplierModal);
    }
    if (w.step === 5) {
      const save = $('#sy-save-load');
      save && save.addEventListener('click', saveLoad);
    }
  }

  function openAddSupplierModal() {
    state.modal = { type: 'new-supplier', name: '', phone: '', idn: '' };
    render();
    setTimeout(() => { const f = $('#sy-ns-name'); if (f) f.focus(); }, 50);
  }

  function renderNewSupplierModal() {
    const m = state.modal;
    const canSave = m.name.trim().length >= 2 && m.phone.trim().length >= 6;
    return `
      <div class="sy-scrim" data-scrim>
        <div class="sy-sheet" role="dialog" aria-modal="true" aria-labelledby="sy-ns-title">
          <h2 id="sy-ns-title">Add supplier</h2>
          <p class="sub">Quick walk-in registration.</p>
          <div class="sy-field">
            <label class="sy-label" for="sy-ns-name">Name</label>
            <input class="sy-input" id="sy-ns-name" type="text" autocomplete="name" value="${esc(m.name)}" />
          </div>
          <div class="sy-field">
            <label class="sy-label" for="sy-ns-phone">Phone</label>
            <input class="sy-input" id="sy-ns-phone" type="tel" autocomplete="tel" value="${esc(m.phone)}" placeholder="0772 123 456" />
          </div>
          <div class="sy-field">
            <label class="sy-label" for="sy-ns-idn">ID number</label>
            <input class="sy-input" id="sy-ns-idn" type="text" value="${esc(m.idn)}" placeholder="63-123456A63" />
          </div>
          <div class="sy-sheet-foot">
            <button class="sy-btn ghost" data-cancel>Cancel</button>
            <button class="sy-btn warm" id="sy-ns-save" ${canSave ? '' : 'disabled'}>Save supplier</button>
          </div>
        </div>
      </div>
    `;
  }

  function wireNewSupplierModal() {
    $('#sy-ns-name').addEventListener('input', (e) => { state.modal.name = e.target.value; rerenderModal(); });
    $('#sy-ns-phone').addEventListener('input', (e) => { state.modal.phone = e.target.value; rerenderModal(); });
    $('#sy-ns-idn').addEventListener('input', (e) => { state.modal.idn = e.target.value; rerenderModal(); });
    $('#sy-ns-save').addEventListener('click', () => {
      const sup = {
        id: nextId('sup'),
        name: state.modal.name.trim(),
        phone: state.modal.phone.trim(),
        idn: state.modal.idn.trim(),
      };
      state.suppliers.push(sup);
      persistSuppliers();
      // auto-select in wizard
      if (state.wizard) state.wizard.supplierId = sup.id;
      state.modal = null;
      render();
      toast('Supplier added', 'success');
    });
  }

  function saveLoad() {
    const w = state.wizard;
    const mat = MATERIALS.find(m => m.id === w.materialId);
    const weight = parseFloat(w.weight);
    if (!mat) return toast('Material missing', 'danger');
    if (!(weight > 0)) return toast('Weight must be greater than 0', 'danger');
    if (!w.supplierId) return toast('Supplier missing', 'danger');

    const total = Number((mat.price * weight).toFixed(2));
    const load = {
      id: nextId('L'),
      supplierId: w.supplierId,
      materialId: mat.id,
      weight: Number(weight.toFixed(2)),
      price: mat.price,
      total,
      photos: w.photos.slice(),
      paid: false,
      createdAt: Date.now(),
    };
    state.loads.push(load);
    persistLoads();
    state.wizard = null;
    state.tab = 'home';
    render();
    toast('Load saved · ' + money(total), 'success');
  }

  // ============================================================
  // FLOW 3 — Pay supplier
  // ============================================================
  function renderPayList() {
    // group unpaid loads by supplier
    const unpaid = state.loads.filter(l => !l.paid);
    const grouped = {};
    unpaid.forEach(l => {
      if (!grouped[l.supplierId]) grouped[l.supplierId] = { total: 0, count: 0, loads: [] };
      grouped[l.supplierId].total += l.total;
      grouped[l.supplierId].count += 1;
      grouped[l.supplierId].loads.push(l);
    });
    const entries = Object.entries(grouped).map(([sid, g]) => ({
      sup: state.suppliers.find(s => s.id === sid),
      ...g,
    })).filter(e => e.sup);

    return `
      <h1 style="font:700 22px/1.2 var(--font-sans); margin:0 0 4px; color:var(--text-strong);">Pay supplier</h1>
      <p style="font:13.5px/1.5 var(--font-sans); color:var(--text-muted); margin:0 0 16px;">Tap a supplier to pay their unpaid loads.</p>
      ${entries.length === 0
        ? `<div class="sy-card sy-empty"><div class="ic">✓</div>All suppliers paid. Nothing waiting.</div>`
        : `<div class="sy-card">${entries.map(e => `
          <button class="sy-sup-item" data-pay-sup="${esc(e.sup.id)}" style="border-bottom:1px solid var(--border-subtle); border-radius:0;">
            <span class="av">${esc(e.sup.name.slice(0,1).toUpperCase())}</span>
            <span style="flex:1;">
              <div class="nm">${esc(e.sup.name)}</div>
              <div class="sb">${e.count} unpaid load${e.count === 1 ? '' : 's'} · ${esc(e.sup.phone)}</div>
            </span>
            <span style="font:700 14px/1 var(--font-mono); color:var(--text-strong);">${money(e.total)}</span>
          </button>
        `).join('')}</div>`}
    `;
  }

  function openPayFlow(supplierId) {
    const sup = state.suppliers.find(s => s.id === supplierId);
    if (!sup) return;
    const unpaid = state.loads.filter(l => !l.paid && l.supplierId === supplierId);
    state.pay = {
      step: 'select', // select | method | ecocash | processing | receipt
      supplierId,
      selectedIds: Object.fromEntries(unpaid.map(l => [l.id, true])), // all selected by default
      method: 'ecocash',
      phone: sup.phone,
    };
    render();
  }

  function renderPayFlow() {
    const p = state.pay;
    const sup = state.suppliers.find(s => s.id === p.supplierId);
    if (!sup) { state.pay = null; return renderPayList(); }
    if (p.step === 'select') return renderPaySelect(p, sup);
    if (p.step === 'method') return renderPayMethod(p, sup);
    if (p.step === 'ecocash') return renderPayEcocash(p, sup);
    if (p.step === 'processing') return renderPayProcessing(p, sup);
    if (p.step === 'receipt') return renderPayReceipt(p, sup);
    return '';
  }

  function renderPaySelect(p, sup) {
    const unpaid = state.loads.filter(l => !l.paid && l.supplierId === sup.id)
      .sort((a,b) => a.createdAt - b.createdAt);
    const total = unpaid.filter(l => p.selectedIds[l.id]).reduce((s,l) => s + l.total, 0);
    return `
      <button class="sy-back" id="sy-pay-back">← Back to suppliers</button>
      <h1 style="font:700 22px/1.2 var(--font-sans); margin:0 0 4px; color:var(--text-strong);">${esc(sup.name)}</h1>
      <p style="font:13.5px/1.5 var(--font-sans); color:var(--text-muted); margin:0 0 16px;">${esc(sup.phone)} · Tick which loads to pay.</p>
      <div class="sy-card">
        ${unpaid.map(l => {
          const mat = MATERIALS.find(m => m.id === l.materialId);
          const checked = !!p.selectedIds[l.id];
          return `
            <label class="sy-pay-row">
              <input type="checkbox" data-pay-load="${esc(l.id)}" ${checked ? 'checked' : ''} />
              <div>
                <div class="nm">${esc(mat ? mat.name : '')} · ${kg(l.weight)}</div>
                <div class="sb">${esc(l.id)} · ${esc(timeStr(l.createdAt))}</div>
              </div>
              <div class="amt">${money(l.total)}</div>
            </label>
          `;
        }).join('')}
      </div>
      <div class="sy-sticky-foot">
        <div class="total"><span>Total to pay</span><span class="v">${money(total)}</span></div>
        <button class="sy-btn warm" id="sy-pay-next" ${total > 0 ? '' : 'disabled'}>Choose payment</button>
      </div>
    `;
  }

  function renderPayMethod(p, sup) {
    const total = currentPayTotal(p);
    return `
      <button class="sy-back" id="sy-pay-back">← Back</button>
      <h1 style="font:700 22px/1.2 var(--font-sans); margin:0 0 4px; color:var(--text-strong);">Payment method</h1>
      <p style="font:13.5px/1.5 var(--font-sans); color:var(--text-muted); margin:0 0 16px;">Paying ${money(total)} to ${esc(sup.name)}.</p>
      <div class="sy-method-list">
        ${PAYMENT_METHODS.map(m => `
          <button class="sy-method ${p.method === m.id ? 'on' : ''}" data-method="${m.id}" aria-pressed="${p.method === m.id}">
            <span class="ic">${esc(m.icon)}</span>
            <span>
              <div>${esc(m.name)}</div>
              <div class="sb">${esc(m.sub)}</div>
            </span>
          </button>
        `).join('')}
      </div>
      <div style="margin-top:18px;">
        <button class="sy-btn warm" id="sy-pay-next">Continue</button>
      </div>
    `;
  }

  function renderPayEcocash(p, sup) {
    const total = currentPayTotal(p);
    const method = PAYMENT_METHODS.find(m => m.id === p.method);
    return `
      <button class="sy-back" id="sy-pay-back">← Back</button>
      <h1 style="font:700 22px/1.2 var(--font-sans); margin:0 0 4px; color:var(--text-strong);">${esc(method.name)} payment</h1>
      <p style="font:13.5px/1.5 var(--font-sans); color:var(--text-muted); margin:0 0 16px;">A push will be sent to the supplier’s phone for ${money(total)}.</p>
      <div class="sy-field">
        <label class="sy-label" for="sy-pay-phone">Recipient phone</label>
        <input class="sy-input" id="sy-pay-phone" type="tel" inputmode="tel" value="${esc(p.phone)}" />
        <div class="sy-help">Pre-filled from ${esc(sup.name)}’s record.</div>
      </div>
      <div class="sy-live-total">
        <div class="lbl">Sending</div>
        <div class="v">${money(total)}</div>
        <div class="sb">via ${esc(method.name)}</div>
      </div>
      <button class="sy-btn warm" id="sy-pay-confirm" ${p.phone.trim().length >= 6 ? '' : 'disabled'}>Confirm payment</button>
    `;
  }

  function renderPayProcessing(p, sup) {
    const total = currentPayTotal(p);
    const method = PAYMENT_METHODS.find(m => m.id === p.method);
    return `
      <div class="sy-spinner-wrap">
        <div class="sy-spinner" aria-hidden="true"></div>
        <div>Sending ${money(total)} via ${esc(method.name)}…</div>
        <div style="font-size:12.5px; opacity:0.8; margin-top:4px;">${esc(sup.name)}</div>
      </div>
    `;
  }

  function renderPayReceipt(p, sup) {
    const r = state.receipt;
    if (!r) return '';
    return `
      <div class="sy-receipt" role="status" aria-live="polite">
        <div class="ic-ok">✓</div>
        <h3>Payment confirmed</h3>
        <p class="sb">${money(r.total)} paid to ${esc(sup.name)}</p>
        <div class="rows">
          <div class="r"><span>Method</span><span class="v">${esc(r.method)}</span></div>
          ${r.phone ? `<div class="r"><span>Phone</span><span class="v">${esc(r.phone)}</span></div>` : ''}
          <div class="r"><span>Loads paid</span><span class="v">${r.loadCount}</span></div>
          <div class="r"><span>Confirmation</span><span class="v">${esc(r.confirmation)}</span></div>
          <div class="r"><span>Time</span><span class="v">${esc(timeStr(r.paidAt))}</span></div>
        </div>
        <div class="conf">${esc(r.confirmation)}</div>
      </div>
      <div style="margin-top:18px; display:flex; gap:10px;">
        <button class="sy-btn ghost" id="sy-pay-done-home">Home</button>
        <button class="sy-btn warm" id="sy-pay-done">More payments</button>
      </div>
    `;
  }

  function currentPayTotal(p) {
    return state.loads
      .filter(l => !l.paid && l.supplierId === p.supplierId && p.selectedIds[l.id])
      .reduce((s,l) => s + l.total, 0);
  }

  function wirePayFlow() {
    const p = state.pay;
    if (!p) return;
    const back = $('#sy-pay-back');
    back && back.addEventListener('click', () => {
      if (p.step === 'select') { state.pay = null; render(); return; }
      if (p.step === 'method') { p.step = 'select'; render(); return; }
      if (p.step === 'ecocash') { p.step = 'method'; render(); return; }
    });

    if (p.step === 'select') {
      $$('[data-pay-load]').forEach(cb => cb.addEventListener('change', (e) => {
        p.selectedIds[cb.dataset.payLoad] = e.target.checked;
        render();
      }));
      $('#sy-pay-next') && $('#sy-pay-next').addEventListener('click', () => {
        const total = currentPayTotal(p);
        if (total <= 0) return toast('Select at least one load', 'warn');
        p.step = 'method'; render();
      });
    }
    if (p.step === 'method') {
      $$('[data-method]').forEach(b => b.addEventListener('click', () => {
        p.method = b.dataset.method; render();
      }));
      $('#sy-pay-next') && $('#sy-pay-next').addEventListener('click', () => {
        if (p.method === 'ecocash' || p.method === 'onemoney') { p.step = 'ecocash'; render(); }
        else {
          // direct cash/bank — skip to processing
          processPayment();
        }
      });
    }
    if (p.step === 'ecocash') {
      const ph = $('#sy-pay-phone');
      ph && ph.addEventListener('input', (e) => { p.phone = e.target.value; render(); setTimeout(() => { const f = $('#sy-pay-phone'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }}, 0); });
      $('#sy-pay-confirm') && $('#sy-pay-confirm').addEventListener('click', processPayment);
    }
    if (p.step === 'receipt') {
      $('#sy-pay-done') && $('#sy-pay-done').addEventListener('click', () => {
        state.pay = null; state.receipt = null; render();
      });
      $('#sy-pay-done-home') && $('#sy-pay-done-home').addEventListener('click', () => {
        state.pay = null; state.receipt = null; state.tab = 'home'; render();
      });
    }
  }

  function processPayment() {
    const p = state.pay;
    p.step = 'processing';
    render();
    setTimeout(() => {
      const method = PAYMENT_METHODS.find(m => m.id === p.method);
      const confirmation = (
        p.method === 'ecocash' ? 'EC-' :
        p.method === 'onemoney' ? 'OM-' :
        p.method === 'bank' ? 'BNK-' :
        'CSH-'
      ) + Math.floor(10000 + Math.random() * 90000);
      const paidAt = Date.now();
      const selectedLoadIds = Object.keys(p.selectedIds).filter(id => p.selectedIds[id]);
      let total = 0, count = 0;
      state.loads.forEach(l => {
        if (selectedLoadIds.includes(l.id) && !l.paid && l.supplierId === p.supplierId) {
          l.paid = true;
          l.paidMethod = p.method;
          l.confirmation = confirmation;
          l.paidAt = paidAt;
          total += l.total;
          count += 1;
        }
      });
      persistLoads();
      state.receipt = {
        total,
        loadCount: count,
        method: method.name,
        phone: (p.method === 'ecocash' || p.method === 'onemoney') ? p.phone : null,
        confirmation,
        paidAt,
      };
      p.step = 'receipt';
      render();
      toast('Paid ' + money(total), 'success');
    }, 1200);
  }

  // ============================================================
  // Modal rendering
  // ============================================================
  function renderModal() {
    if (!state.modal) return '';
    if (state.modal.type === 'open-day') return renderOpenDayModal();
    if (state.modal.type === 'new-supplier') return renderNewSupplierModal();
    return '';
  }

  function rerenderModal() {
    // re-render just modal section. Preserve focus + caret on whichever
    // input the user is typing in.
    const root = document.getElementById('sy-modal-root');
    if (!root) return;
    const active = document.activeElement;
    const activeId = active && active.id;
    const caret = (active && typeof active.selectionStart === 'number') ? active.selectionStart : null;
    root.innerHTML = renderModal();
    wireModal();
    if (activeId) {
      const restored = document.getElementById(activeId);
      if (restored) {
        restored.focus();
        if (caret != null && typeof restored.setSelectionRange === 'function') {
          try { restored.setSelectionRange(caret, caret); } catch (e) {}
        }
      }
    }
  }

  function wireModal() {
    if (!state.modal) return;
    const scrim = $('.sy-scrim');
    if (scrim) {
      scrim.addEventListener('click', (e) => {
        if (e.target === scrim) { state.modal = null; render(); }
      });
      $$('[data-cancel]').forEach(b => b.addEventListener('click', () => { state.modal = null; render(); }));
    }
    if (state.modal.type === 'open-day') wireOpenDayModal();
    if (state.modal.type === 'new-supplier') wireNewSupplierModal();
  }

  // ============================================================
  // Wire — top-level after each render
  // ============================================================
  function wire() {
    // host the modal in a stable div so we can re-render it in isolation
    const existing = document.getElementById('sy-modal-root');
    if (existing) {
      existing.innerHTML = renderModal();
    } else {
      const div = document.createElement('div');
      div.id = 'sy-modal-root';
      div.innerHTML = renderModal();
      document.body.appendChild(div);
    }

    $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
      const t = b.dataset.tab;
      if (t === 'new-load') { startWizard(); return; }
      state.tab = t;
      if (t === 'pay') state.pay = null;
      render();
    }));

    $$('[data-tab-go]').forEach(b => b.addEventListener('click', () => {
      const t = b.dataset.tabGo;
      if (t === 'new-load') { startWizard(); return; }
      state.tab = t;
      render();
    }));

    if (!state.day) {
      const btn = $('#sy-open-day-btn');
      btn && btn.addEventListener('click', openDayModal);
    } else if (state.tab === 'home') {
      const newL = $('#sy-new-load');
      newL && newL.addEventListener('click', startWizard);
      const close = $('#sy-close-day');
      close && close.addEventListener('click', closeDay);
    } else if (state.tab === 'new-load' && state.wizard) {
      wireWizard();
    } else if (state.tab === 'pay') {
      if (state.pay) {
        wirePayFlow();
      } else {
        $$('[data-pay-sup]').forEach(b => b.addEventListener('click', () => openPayFlow(b.dataset.paySup)));
      }
    }

    wireModal();
  }

  // Toast host outside the rerender root
  function ensureToastHost() {
    if (!document.getElementById('sy-toast-host')) {
      const div = document.createElement('div');
      div.id = 'sy-toast-host';
      div.className = 'sy-toast-host';
      document.body.appendChild(div);
    }
  }

  // ---- Boot ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { ensureToastHost(); init(); });
  } else {
    ensureToastHost();
    init();
  }

  // Expose minimal debug
  window.__scrap = { state, MATERIALS, reset() {
    Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
    location.reload();
  }};
})();
