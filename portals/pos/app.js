// Corelith POS — functional prototype
// Vanilla ES module. Persists to localStorage under prefix "corelith:pos:".
// VAT 15% (Zimbabwe), USD with cents.
// DEMO MANAGER PIN: 4321  (clearly a demo-only secret, hardcoded.)

export const POS = (() => {
  // ---------------------------------------------------------------------------
  // Constants & seeds
  // ---------------------------------------------------------------------------
  const KEY = (k) => `corelith:pos:${k}`;
  const VAT_RATE = 0.15;
  const MANAGER_PIN = '4321'; // DEMO ONLY — hardcoded for the prototype
  const SHOP = {
    name: 'Corelith Demo Shop',
    branch: 'Avondale',
    vat: '10001234A',
    address: '12 King George Rd, Avondale, Harare',
  };

  // 40-item seed catalog. Prices in USD cents stored as numbers in dollars.
  const SEED_CATALOG = [
    { sku: 'GR-001', name: 'Mealie meal 10kg',       cat: 'Groceries',   price: 12.50 },
    { sku: 'GR-002', name: 'Mealie meal 5kg',        cat: 'Groceries',   price: 6.80 },
    { sku: 'GR-003', name: 'Sugar 2kg',              cat: 'Groceries',   price: 3.80 },
    { sku: 'GR-004', name: 'Sugar 1kg',              cat: 'Groceries',   price: 2.10 },
    { sku: 'GR-005', name: 'Cooking oil 2L',         cat: 'Groceries',   price: 6.40 },
    { sku: 'GR-006', name: 'Cooking oil 750ml',      cat: 'Groceries',   price: 3.20 },
    { sku: 'GR-007', name: 'Rice 5kg',               cat: 'Groceries',   price: 9.50 },
    { sku: 'GR-008', name: 'Rice 2kg',               cat: 'Groceries',   price: 4.20 },
    { sku: 'GR-009', name: 'Salt 1kg',               cat: 'Groceries',   price: 1.10 },
    { sku: 'GR-010', name: 'Flour 2kg',              cat: 'Groceries',   price: 2.90 },
    { sku: 'GR-011', name: 'Beans 1kg',              cat: 'Groceries',   price: 2.50 },
    { sku: 'GR-012', name: 'Peanut butter 375g',     cat: 'Groceries',   price: 3.40 },
    { sku: 'BK-001', name: 'Pro-bake bread loaf',    cat: 'Bakery',      price: 1.50 },
    { sku: 'BK-002', name: 'Brown bread loaf',       cat: 'Bakery',      price: 1.60 },
    { sku: 'BK-003', name: 'Buns pack of 6',         cat: 'Bakery',      price: 2.00 },
    { sku: 'DA-001', name: 'Milk 2L',                cat: 'Dairy',       price: 2.80 },
    { sku: 'DA-002', name: 'Milk 1L',                cat: 'Dairy',       price: 1.40 },
    { sku: 'DA-003', name: 'Lacto 500ml',            cat: 'Dairy',       price: 1.20 },
    { sku: 'DA-004', name: 'Cheese 250g',            cat: 'Dairy',       price: 3.90 },
    { sku: 'DA-005', name: 'Yogurt 150ml',           cat: 'Dairy',       price: 0.90 },
    { sku: 'DA-006', name: 'Butter 500g',            cat: 'Dairy',       price: 4.20 },
    { sku: 'BV-001', name: 'Mazoe Orange 2L',        cat: 'Beverages',   price: 4.50 },
    { sku: 'BV-002', name: 'Coca-Cola 2L',           cat: 'Beverages',   price: 1.80 },
    { sku: 'BV-003', name: 'Coca-Cola 500ml',        cat: 'Beverages',   price: 0.80 },
    { sku: 'BV-004', name: 'Bottled water 1.5L',     cat: 'Beverages',   price: 0.90 },
    { sku: 'BV-005', name: 'Iced tea 500ml',         cat: 'Beverages',   price: 1.20 },
    { sku: 'BV-006', name: 'Tea bags box of 100',    cat: 'Beverages',   price: 2.20 },
    { sku: 'BV-007', name: 'Instant coffee 200g',    cat: 'Beverages',   price: 5.80 },
    { sku: 'SN-001', name: 'Chips 150g',             cat: 'Snacks',      price: 1.10 },
    { sku: 'SN-002', name: 'Biscuits pack',          cat: 'Snacks',      price: 1.60 },
    { sku: 'SN-003', name: 'Chocolate bar',          cat: 'Snacks',      price: 1.40 },
    { sku: 'SN-004', name: 'Sweets 100g',            cat: 'Snacks',      price: 0.80 },
    { sku: 'HH-001', name: 'Bath soap bar',          cat: 'Household',   price: 0.80 },
    { sku: 'HH-002', name: 'Washing powder 1kg',     cat: 'Household',   price: 4.10 },
    { sku: 'HH-003', name: 'Toilet paper 4-pack',    cat: 'Household',   price: 2.60 },
    { sku: 'HH-004', name: 'Dish soap 750ml',        cat: 'Household',   price: 2.20 },
    { sku: 'HH-005', name: 'Matches box',            cat: 'Household',   price: 0.40 },
    { sku: 'HH-006', name: 'Candles pack of 6',      cat: 'Household',   price: 1.80 },
    { sku: 'AR-001', name: 'Airtime $1 voucher',     cat: 'Airtime',     price: 1.00 },
    { sku: 'AR-002', name: 'Airtime $5 voucher',     cat: 'Airtime',     price: 5.00 },
  ];

  const SEED_SHIFTS = [
    {
      id: 'S-2839',
      cashier: 'Faith Moyo',
      till: 'Till 02',
      openedAt: '2026-06-08T07:30:00Z',
      closedAt: '2026-06-08T19:14:00Z',
      openingFloat: 100.00,
      sales: [
        { method: 'cash',    amount: 842.10 },
        { method: 'card',    amount: 324.80 },
        { method: 'ecocash', amount: 119.00 },
      ],
      refunds: [ { method: 'cash', amount: 12.00 } ],
      counted: 938.10,
      expected: 930.10,
      variance: 8.00,
      receiptsCount: 91,
    },
    {
      id: 'S-2840',
      cashier: 'Faith Moyo',
      till: 'Till 02',
      openedAt: '2026-06-09T07:30:00Z',
      closedAt: '2026-06-09T19:02:00Z',
      openingFloat: 100.00,
      sales: [
        { method: 'cash',    amount: 1042.00 },
        { method: 'card',    amount: 424.80 },
        { method: 'ecocash', amount: 219.00 },
      ],
      refunds: [],
      counted: 1140.10,
      expected: 1142.00,
      variance: -1.90,
      receiptsCount: 118,
    },
  ];

  // ---------------------------------------------------------------------------
  // Storage helpers
  // ---------------------------------------------------------------------------
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(KEY(key));
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('POS load failed', key, e);
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(KEY(key), JSON.stringify(value)); }
    catch (e) { console.warn('POS save failed', key, e); }
  }

  function getCatalog() {
    let c = load('catalog', null);
    if (!c) { c = SEED_CATALOG.slice(); save('catalog', c); }
    return c;
  }

  function getSales() { return load('sales', []); }
  function setSales(v) { save('sales', v); }

  function getShifts() {
    let s = load('shifts', null);
    if (!s) { s = SEED_SHIFTS.slice(); save('shifts', s); }
    return s;
  }
  function setShifts(v) { save('shifts', v); }

  function getCart() { return load('cart', []); }
  function setCart(v) { save('cart', v); }

  function getCurrentShift() {
    let s = load('current_shift', null);
    if (!s) {
      s = {
        id: 'S-2841',
        cashier: 'Faith Moyo',
        till: 'Till 02',
        openedAt: new Date().toISOString(),
        openingFloat: 100.00,
      };
      save('current_shift', s);
    }
    return s;
  }
  function setCurrentShift(v) { save('current_shift', v); }
  function clearCurrentShift() { localStorage.removeItem(KEY('current_shift')); }

  // ---------------------------------------------------------------------------
  // Money helpers
  // ---------------------------------------------------------------------------
  function money(n) {
    const v = Number(n) || 0;
    const neg = v < 0;
    return (neg ? '– $ ' : '$ ') + Math.abs(v).toFixed(2);
  }
  function moneyPlain(n) {
    return '$ ' + (Number(n) || 0).toFixed(2);
  }
  function round2(n) { return Math.round(n * 100) / 100; }

  // ---------------------------------------------------------------------------
  // Cart math
  // ---------------------------------------------------------------------------
  function cartTotals(cart) {
    const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
    const vat = round2(subtotal * VAT_RATE / (1 + VAT_RATE)); // VAT inclusive
    const total = round2(subtotal);
    const net = round2(total - vat);
    return { subtotal: round2(subtotal), net, vat, total };
  }

  function addToCart(sku) {
    const cat = getCatalog();
    const item = cat.find((c) => c.sku === sku);
    if (!item) return;
    const cart = getCart();
    const ex = cart.find((l) => l.sku === sku);
    if (ex) ex.qty += 1;
    else cart.push({ sku: item.sku, name: item.name, price: item.price, qty: 1 });
    setCart(cart);
  }
  function updateQty(sku, qty) {
    const cart = getCart();
    const ex = cart.find((l) => l.sku === sku);
    if (!ex) return;
    ex.qty = Math.max(0, qty);
    setCart(cart.filter((l) => l.qty > 0));
  }
  function removeFromCart(sku) {
    setCart(getCart().filter((l) => l.sku !== sku));
  }
  function clearCart() { setCart([]); }

  // ---------------------------------------------------------------------------
  // Sales
  // ---------------------------------------------------------------------------
  function nextSaleId() {
    const sales = getSales();
    const n = sales.length + 1;
    return 'R-' + String(19280 + n).padStart(5, '0');
  }

  function recordSale({ lines, totals, payment }) {
    const sales = getSales();
    const sale = {
      id: nextSaleId(),
      at: new Date().toISOString(),
      cashier: getCurrentShift().cashier,
      till: getCurrentShift().till,
      shiftId: getCurrentShift().id,
      lines,
      totals,
      payment, // { method, tendered?, change?, cash?, ecocash?, phone? }
      refunded: null, // null | { at, lines, amount, manager }
    };
    sales.unshift(sale);
    setSales(sales);
    return sale;
  }

  function recordRefund(saleId, refundLines, managerName) {
    const sales = getSales();
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return null;
    const amount = round2(refundLines.reduce((s, l) => s + l.price * l.qty, 0));
    sale.refunded = {
      at: new Date().toISOString(),
      lines: refundLines,
      amount,
      manager: managerName || 'Manager',
    };
    setSales(sales);
    return sale;
  }

  // ---------------------------------------------------------------------------
  // Shift math
  // ---------------------------------------------------------------------------
  function shiftSalesBreakdown(shiftId) {
    const sales = getSales().filter((s) => s.shiftId === shiftId);
    const m = { cash: 0, card: 0, ecocash: 0, onemoney: 0, split_cash: 0, split_ecocash: 0 };
    let gross = 0;
    let refunds = 0;
    let cashRefunds = 0;
    sales.forEach((s) => {
      gross += s.totals.total;
      const p = s.payment;
      if (p.method === 'split') {
        m.cash += Number(p.cash) || 0;
        m.ecocash += Number(p.ecocash) || 0;
      } else {
        m[p.method] = (m[p.method] || 0) + s.totals.total;
      }
      if (s.refunded) {
        refunds += s.refunded.amount;
        if (p.method === 'cash' || p.method === 'split') {
          // assume refunds come from cash when paid in cash
          cashRefunds += s.refunded.amount;
        }
      }
    });
    return {
      receipts: sales.length,
      gross: round2(gross),
      refunds: round2(refunds),
      cashRefunds: round2(cashRefunds),
      methods: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, round2(v)])),
    };
  }

  function closeShift(counted) {
    const cur = getCurrentShift();
    const bd = shiftSalesBreakdown(cur.id);
    const expected = round2(cur.openingFloat + bd.methods.cash - bd.cashRefunds);
    const variance = round2(counted - expected);
    const shift = {
      ...cur,
      closedAt: new Date().toISOString(),
      counted: round2(counted),
      expected,
      variance,
      receiptsCount: bd.receipts,
      sales: [
        { method: 'cash',    amount: bd.methods.cash },
        { method: 'card',    amount: bd.methods.card },
        { method: 'ecocash', amount: bd.methods.ecocash },
        { method: 'onemoney',amount: bd.methods.onemoney || 0 },
      ].filter((r) => r.amount > 0),
      refunds: bd.refunds > 0 ? [{ method: 'cash', amount: bd.cashRefunds }] : [],
      gross: bd.gross,
    };
    const all = getShifts();
    all.unshift(shift);
    setShifts(all);

    // Open a new shift
    const next = {
      id: 'S-' + (parseInt(cur.id.slice(2), 10) + 1),
      cashier: cur.cashier,
      till: cur.till,
      openedAt: new Date().toISOString(),
      openingFloat: 100.00,
    };
    setCurrentShift(next);
    return shift;
  }

  // ---------------------------------------------------------------------------
  // PIN
  // ---------------------------------------------------------------------------
  function verifyManagerPin(pin) { return pin === MANAGER_PIN; }

  // ---------------------------------------------------------------------------
  // Modal helper (simple, accessible enough)
  // ---------------------------------------------------------------------------
  function openModal(html) {
    closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'pos-modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML = `<div class="pos-modal-back" data-close></div><div class="pos-modal-card">${html}</div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) closeModal();
    });
    const onKey = (e) => {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKey); }
    };
    document.addEventListener('keydown', onKey);
    const first = wrap.querySelector('input, button, [tabindex="0"]');
    if (first) setTimeout(() => first.focus(), 30);
    return wrap;
  }
  function closeModal() {
    document.querySelectorAll('.pos-modal').forEach((m) => m.remove());
  }

  function toast(msg, tone = 'info') {
    const t = document.createElement('div');
    t.className = `pos-toast tone-${tone}`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 250); }, 2200);
  }

  // ---------------------------------------------------------------------------
  // Receipt rendering
  // ---------------------------------------------------------------------------
  function renderReceipt(sale) {
    const dt = new Date(sale.at);
    const dts = dt.toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const lines = sale.lines.map((l) => {
      const lt = (l.price * l.qty).toFixed(2);
      const nm = l.name.length > 22 ? l.name.slice(0, 22) : l.name;
      return `<div class="r-line"><span class="r-nm">${nm}</span><span class="r-qty">${l.qty} × ${l.price.toFixed(2)}</span><span class="r-amt">${lt}</span></div>`;
    }).join('');
    const p = sale.payment;
    let payRows = '';
    if (p.method === 'cash') {
      payRows = `<div class="r-row"><span>Cash tendered</span><span>${p.tendered.toFixed(2)}</span></div>
                 <div class="r-row"><span>Change</span><span>${p.change.toFixed(2)}</span></div>`;
    } else if (p.method === 'split') {
      payRows = `<div class="r-row"><span>Cash</span><span>${Number(p.cash).toFixed(2)}</span></div>
                 <div class="r-row"><span>EcoCash</span><span>${Number(p.ecocash).toFixed(2)}</span></div>`;
    } else if (p.method === 'ecocash' || p.method === 'onemoney') {
      payRows = `<div class="r-row"><span>${labelMethod(p.method)}</span><span>${sale.totals.total.toFixed(2)}</span></div>
                 <div class="r-row"><span>Phone</span><span>${p.phone || '—'}</span></div>`;
    } else {
      payRows = `<div class="r-row"><span>${labelMethod(p.method)}</span><span>${sale.totals.total.toFixed(2)}</span></div>`;
    }
    return `<div class="r-paper">
      <div class="r-head">
        <div class="r-shop">${SHOP.name}</div>
        <div class="r-sub">${SHOP.branch} · ${SHOP.address}</div>
        <div class="r-sub">VAT # ${SHOP.vat}</div>
      </div>
      <div class="r-meta">
        <div>Receipt ${sale.id}</div>
        <div>${dts}</div>
        <div>${sale.cashier} · ${sale.till}</div>
      </div>
      <div class="r-rule"></div>
      <div class="r-lines">${lines}</div>
      <div class="r-rule"></div>
      <div class="r-row"><span>Subtotal (excl. VAT)</span><span>${sale.totals.net.toFixed(2)}</span></div>
      <div class="r-row"><span>VAT 15%</span><span>${sale.totals.vat.toFixed(2)}</span></div>
      <div class="r-row r-bold"><span>Total</span><span>${sale.totals.total.toFixed(2)}</span></div>
      <div class="r-rule"></div>
      ${payRows}
      ${sale.refunded ? `<div class="r-rule"></div><div class="r-row r-bold" style="color:#c33;"><span>REFUNDED</span><span>${sale.refunded.amount.toFixed(2)}</span></div>` : ''}
      <div class="r-rule"></div>
      <div class="r-thanks">Thank you for shopping with us!</div>
      <div class="r-sub" style="text-align:center;">Goods sold are not returnable without a receipt.</div>
    </div>`;
  }

  function labelMethod(m) {
    return ({ cash: 'Cash', card: 'Card', ecocash: 'EcoCash', onemoney: 'OneMoney', split: 'Split' })[m] || m;
  }

  // ---------------------------------------------------------------------------
  // PIN prompt modal
  // ---------------------------------------------------------------------------
  function promptManagerPin() {
    return new Promise((resolve) => {
      openModal(`
        <div class="pos-modal-head">
          <h2>Manager approval</h2>
          <button class="pos-modal-close" data-close aria-label="Close">×</button>
        </div>
        <div class="pos-modal-body">
          <p class="pos-modal-lede">Enter the manager PIN to authorise this action.</p>
          <input id="mgr-pin" type="password" inputmode="numeric" autocomplete="off"
                 maxlength="6" class="pos-input pos-input-pin" placeholder="••••" />
          <div id="mgr-pin-err" class="pos-err" hidden>Wrong PIN. Try again.</div>
          <div class="pos-helper">Demo PIN: <code>4321</code></div>
        </div>
        <div class="pos-modal-foot">
          <button class="pos-btn pos-btn-quiet" data-close>Cancel</button>
          <button class="pos-btn pos-btn-primary" id="mgr-ok">Approve</button>
        </div>
      `);
      const input = document.getElementById('mgr-pin');
      const err = document.getElementById('mgr-pin-err');
      const ok = document.getElementById('mgr-ok');
      const submit = () => {
        if (verifyManagerPin(input.value)) {
          closeModal();
          resolve(true);
        } else {
          err.hidden = false;
          input.value = '';
          input.focus();
        }
      };
      ok.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      // resolve(false) when modal closes
      const obs = new MutationObserver(() => {
        if (!document.querySelector('.pos-modal')) {
          obs.disconnect();
          resolve(false);
        }
      });
      obs.observe(document.body, { childList: true });
    });
  }

  // ---------------------------------------------------------------------------
  // Payment flow
  // ---------------------------------------------------------------------------
  async function openPaymentPicker(onSuccess) {
    const cart = getCart();
    if (!cart.length) { toast('Add items to the cart first', 'warn'); return; }
    const t = cartTotals(cart);
    openModal(`
      <div class="pos-modal-head">
        <h2>Take payment</h2>
        <button class="pos-modal-close" data-close aria-label="Close">×</button>
      </div>
      <div class="pos-modal-body">
        <div class="pos-pay-total">Total due <strong>${moneyPlain(t.total)}</strong></div>
        <div class="pos-pay-grid">
          <button class="pos-pay-method" data-method="cash"><span class="ic">💵</span><span>Cash</span></button>
          <button class="pos-pay-method" data-method="card"><span class="ic">💳</span><span>Card</span></button>
          <button class="pos-pay-method" data-method="ecocash"><span class="ic">📱</span><span>EcoCash</span></button>
          <button class="pos-pay-method" data-method="onemoney"><span class="ic">📲</span><span>OneMoney</span></button>
          <button class="pos-pay-method pos-pay-wide" data-method="split"><span class="ic">⚖️</span><span>Split (Cash + EcoCash)</span></button>
        </div>
      </div>
    `);
    document.querySelectorAll('.pos-pay-method').forEach((b) => {
      b.addEventListener('click', () => {
        const method = b.dataset.method;
        closeModal();
        startMethodFlow(method, onSuccess);
      });
    });
  }

  function startMethodFlow(method, onSuccess) {
    const cart = getCart();
    const t = cartTotals(cart);
    if (method === 'cash') return flowCash(cart, t, onSuccess);
    if (method === 'card') return flowCard(cart, t, onSuccess);
    if (method === 'ecocash') return flowMobile('ecocash', cart, t, onSuccess);
    if (method === 'onemoney') return flowMobile('onemoney', cart, t, onSuccess);
    if (method === 'split') return flowSplit(cart, t, onSuccess);
  }

  function flowCash(cart, t, onSuccess) {
    openModal(`
      <div class="pos-modal-head">
        <h2>Cash payment</h2>
        <button class="pos-modal-close" data-close aria-label="Close">×</button>
      </div>
      <div class="pos-modal-body">
        <div class="pos-pay-total">Total due <strong>${moneyPlain(t.total)}</strong></div>
        <label class="pos-label">Amount tendered (USD)</label>
        <input id="cash-tend" type="number" min="0" step="0.01" class="pos-input" value="${t.total.toFixed(2)}" />
        <div id="cash-change" class="pos-change">Change: <strong>$ 0.00</strong></div>
        <div id="cash-err" class="pos-err" hidden>Tendered must be at least the total.</div>
      </div>
      <div class="pos-modal-foot">
        <button class="pos-btn pos-btn-quiet" data-close>Cancel</button>
        <button class="pos-btn pos-btn-primary" id="cash-confirm">Confirm payment</button>
      </div>
    `);
    const tend = document.getElementById('cash-tend');
    const ch = document.getElementById('cash-change');
    const err = document.getElementById('cash-err');
    const upd = () => {
      const v = parseFloat(tend.value) || 0;
      const change = round2(v - t.total);
      ch.innerHTML = `Change: <strong>${moneyPlain(Math.max(0, change))}</strong>`;
    };
    tend.addEventListener('input', upd);
    upd();
    document.getElementById('cash-confirm').addEventListener('click', () => {
      const v = parseFloat(tend.value) || 0;
      if (v < t.total - 0.001) { err.hidden = false; return; }
      const sale = recordSale({
        lines: cart.slice(),
        totals: t,
        payment: { method: 'cash', tendered: round2(v), change: round2(v - t.total) },
      });
      clearCart();
      closeModal();
      showSuccess(sale, onSuccess);
    });
  }

  function flowCard(cart, t, onSuccess) {
    openModal(`
      <div class="pos-modal-head">
        <h2>Card payment</h2>
        <button class="pos-modal-close" data-close aria-label="Close">×</button>
      </div>
      <div class="pos-modal-body">
        <div class="pos-pay-total">Total due <strong>${moneyPlain(t.total)}</strong></div>
        <div class="pos-loader"><div class="pos-spinner"></div><div>Insert or tap card on terminal…</div></div>
      </div>
    `);
    setTimeout(() => {
      const sale = recordSale({
        lines: cart.slice(),
        totals: t,
        payment: { method: 'card' },
      });
      clearCart();
      closeModal();
      showSuccess(sale, onSuccess);
    }, 1500);
  }

  function flowMobile(method, cart, t, onSuccess) {
    const lbl = labelMethod(method);
    openModal(`
      <div class="pos-modal-head">
        <h2>${lbl} payment</h2>
        <button class="pos-modal-close" data-close aria-label="Close">×</button>
      </div>
      <div class="pos-modal-body">
        <div class="pos-pay-total">Total due <strong>${moneyPlain(t.total)}</strong></div>
        <label class="pos-label">Customer phone (07x or +263)</label>
        <input id="mob-phone" type="tel" class="pos-input" placeholder="0771234567" />
        <div id="mob-err" class="pos-err" hidden>Enter a valid phone number.</div>
        <div id="mob-status" class="pos-helper" style="margin-top:10px;"></div>
      </div>
      <div class="pos-modal-foot">
        <button class="pos-btn pos-btn-quiet" data-close>Cancel</button>
        <button class="pos-btn pos-btn-primary" id="mob-send">Send USSD prompt</button>
      </div>
    `);
    const phone = document.getElementById('mob-phone');
    const err = document.getElementById('mob-err');
    const status = document.getElementById('mob-status');
    const send = document.getElementById('mob-send');
    send.addEventListener('click', () => {
      const p = phone.value.replace(/\s/g, '');
      if (!/^(\+?263|0)?7\d{8}$/.test(p)) { err.hidden = false; return; }
      err.hidden = true;
      send.disabled = true;
      status.innerHTML = `<span class="pos-spinner pos-spinner-sm"></span> Sending USSD prompt to ${p}…`;
      setTimeout(() => {
        const sale = recordSale({
          lines: cart.slice(),
          totals: t,
          payment: { method, phone: p },
        });
        clearCart();
        closeModal();
        showSuccess(sale, onSuccess);
      }, 1200);
    });
  }

  function flowSplit(cart, t, onSuccess) {
    openModal(`
      <div class="pos-modal-head">
        <h2>Split payment</h2>
        <button class="pos-modal-close" data-close aria-label="Close">×</button>
      </div>
      <div class="pos-modal-body">
        <div class="pos-pay-total">Total due <strong>${moneyPlain(t.total)}</strong></div>
        <label class="pos-label">Cash amount (USD)</label>
        <input id="sp-cash" type="number" min="0" step="0.01" class="pos-input" value="0.00" />
        <label class="pos-label">EcoCash amount (USD)</label>
        <input id="sp-eco" type="number" min="0" step="0.01" class="pos-input" value="${t.total.toFixed(2)}" />
        <div id="sp-sum" class="pos-change">Sum: <strong>$ 0.00</strong></div>
        <div id="sp-err" class="pos-err" hidden>Sum must equal the total.</div>
      </div>
      <div class="pos-modal-foot">
        <button class="pos-btn pos-btn-quiet" data-close>Cancel</button>
        <button class="pos-btn pos-btn-primary" id="sp-ok">Confirm split</button>
      </div>
    `);
    const c = document.getElementById('sp-cash');
    const e = document.getElementById('sp-eco');
    const sum = document.getElementById('sp-sum');
    const err = document.getElementById('sp-err');
    const upd = () => {
      const s = round2((parseFloat(c.value) || 0) + (parseFloat(e.value) || 0));
      sum.innerHTML = `Sum: <strong>${moneyPlain(s)}</strong>`;
    };
    c.addEventListener('input', upd);
    e.addEventListener('input', upd);
    upd();
    document.getElementById('sp-ok').addEventListener('click', () => {
      const cv = round2(parseFloat(c.value) || 0);
      const ev = round2(parseFloat(e.value) || 0);
      if (Math.abs(cv + ev - t.total) > 0.005) { err.hidden = false; return; }
      const sale = recordSale({
        lines: cart.slice(),
        totals: t,
        payment: { method: 'split', cash: cv, ecocash: ev },
      });
      clearCart();
      closeModal();
      showSuccess(sale, onSuccess);
    });
  }

  function showSuccess(sale, onSuccess) {
    openModal(`
      <div class="pos-modal-head">
        <h2>Payment successful</h2>
        <button class="pos-modal-close" data-close aria-label="Close">×</button>
      </div>
      <div class="pos-modal-body pos-receipt-body">
        ${renderReceipt(sale)}
      </div>
      <div class="pos-modal-foot">
        <button class="pos-btn pos-btn-quiet" id="rcpt-print"><span aria-hidden="true">🖨</span> Print</button>
        <div style="flex:1"></div>
        <button class="pos-btn pos-btn-primary" data-close>Done</button>
      </div>
    `);
    document.getElementById('rcpt-print').addEventListener('click', () => {
      const w = window.open('', '_blank', 'width=380,height=720');
      const css = document.querySelector('link[href*="app.css"]')?.href || '';
      w.document.write(`<!doctype html><html><head><title>Receipt ${sale.id}</title>
        <link rel="stylesheet" href="${css}"></head>
        <body class="receipt-print">${renderReceipt(sale)}
        <script>window.onload=()=>setTimeout(()=>window.print(),200);<\/script>
        </body></html>`);
      w.document.close();
    });
    if (onSuccess) {
      const obs = new MutationObserver(() => {
        if (!document.querySelector('.pos-modal')) { obs.disconnect(); onSuccess(sale); }
      });
      obs.observe(document.body, { childList: true });
    }
  }

  // ---------------------------------------------------------------------------
  // UI helpers
  // ---------------------------------------------------------------------------
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
  }

  return {
    SHOP, VAT_RATE, MANAGER_PIN,
    getCatalog, getCart, setCart, addToCart, updateQty, removeFromCart, clearCart,
    cartTotals, money, moneyPlain, round2,
    getSales, recordSale, recordRefund,
    getShifts, setShifts, getCurrentShift, setCurrentShift, closeShift, shiftSalesBreakdown,
    verifyManagerPin, promptManagerPin,
    openPaymentPicker,
    openModal, closeModal, toast,
    renderReceipt, labelMethod,
    el, esc,
  };
})();

// Expose for non-module pages
window.POS = POS;
export default POS;
