/* ============================================================
   STASH — Sidecar enhancements
   demo.html owns rendering and state. This file:
     - Extends the synthetic seed to ~30 days × 3-5/day on first load
     - Recomputes budget.spent from real transactions
     - Mirrors persisted data under the `corelith:stash:` prefix
     - Provides a stable Intl-based currency formatter
   The interactive flows (FAB add-expense, edit-budget, contribute,
   new-goal-with-date, budget-tip) live in demo.html so they can
   share the demo's scope-local state and re-render path.
   ============================================================ */

(function () {
  'use strict';

  const LS_KEY = 'huchu-stash-demo:v1';
  const LS_MIRROR_PREFIX = 'corelith:stash:';
  const STASH_TODAY = new Date(2026, 5, 5); // matches demo's TODAY

  /* ===== Storage helpers ===== */
  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function save(store) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(store));
      Object.keys(store).forEach(k => {
        try { localStorage.setItem(LS_MIRROR_PREFIX + k, JSON.stringify(store[k])); }
        catch (e) {}
      });
    } catch (e) {}
  }

  /* ===== Synthetic seed extension =====
     Demo ships ~31 hand-crafted tx over ~14 days. Spec asks for 30 days,
     3-5 per day. We extend to ~100 total. Only runs once. */
  const MERCHANTS = {
    food:          ['Pick n Pay','OK Mart','Chicken Inn','Steers','Spar','Bakers Inn','Nandos','Innscor','KFC','Cafe Nush'],
    transport:     ['Uber','Vaya','Mukamba Fuel','Total Garage','Bolt','Engen','Puma'],
    bills:         ['TelOne','ZESA prepaid','CABS Mortgage','DStv','Liquid Telecom'],
    entertainment: ['Sam Levy Cinema','Ster-Kinekor','Audible','Steam','Book Cafe'],
    shopping:      ['MetroPeech','Edgars','Truworths','Game Stores','Mr Price'],
    gym:           ['Curves Gym','Pharmacy','Wellness Centre','Dr Mukamba','Health Plus'],
    subs:          ['Netflix','Spotify','Apple Music','iCloud','YouTube Premium'],
    other:         ['ATM withdrawal','Bank fee','Cash · misc','Gift'],
  };
  const ACCT_POOL = ['a1','a2','a3','a4'];
  function rand(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  }
  function extendSeed(transactions) {
    const byDay = {};
    transactions.forEach(t => {
      const k = new Date(t.date).toDateString();
      byDay[k] = (byDay[k] || 0) + 1;
    });
    const extras = [];
    for (let off = 0; off <= 29; off++) {
      const d = new Date(STASH_TODAY); d.setDate(d.getDate() - off);
      const k = d.toDateString();
      const have = byDay[k] || 0;
      const target = 3 + Math.floor(rand(off + 7) * 3); // 3..5
      for (let i = 0; i < Math.max(0, target - have); i++) {
        const r1 = rand(off * 13 + i * 5 + 11);
        const r2 = rand(off * 7 + i * 17 + 23);
        const r3 = rand(off * 31 + i * 41 + 67);
        const cats = ['food','food','transport','food','shopping','entertainment','subs','gym','other'];
        const cat = cats[Math.floor(r1 * cats.length)];
        const merchant = (MERCHANTS[cat] || MERCHANTS.other)[Math.floor(r2 * MERCHANTS[cat].length)];
        const amt = -Math.round((4 + r3 * 56) * 100) / 100;
        const acct = ACCT_POOL[Math.floor(r1 * ACCT_POOL.length)];
        extras.push({
          id: 'tx-seed-' + off + '-' + i,
          date: d.toISOString(),
          merchant, amt, cat, acctId: acct,
          note: '', loc: '',
          hidden: false, smart: false, suggestions: [], seen: true,
        });
      }
    }
    return transactions.concat(extras);
  }

  /* ===== Budget recompute =====
     Real `b.spent` is the sum of this-month, non-hidden, negative
     transactions whose cat matches. Also refresh daysLeft + projOver. */
  function recomputeBudgets(store) {
    if (!store.budgets || !store.transactions) return;
    const monthStart = new Date(STASH_TODAY.getFullYear(), STASH_TODAY.getMonth(), 1);
    const monthEnd   = new Date(STASH_TODAY.getFullYear(), STASH_TODAY.getMonth() + 1, 1);
    const daysInMonth = new Date(STASH_TODAY.getFullYear(), STASH_TODAY.getMonth() + 1, 0).getDate();
    const dayOfMonth = STASH_TODAY.getDate();
    const daysLeft = Math.max(0, daysInMonth - dayOfMonth);
    store.budgets.forEach(b => {
      const spent = store.transactions
        .filter(t => {
          const d = new Date(t.date);
          return d >= monthStart && d < monthEnd && t.amt < 0 && !t.hidden && t.cat === b.cat;
        })
        .reduce((s, t) => s + Math.abs(t.amt), 0);
      b.spent = Math.round(spent * 100) / 100;
      b.daysLeft = daysLeft;
      const pace = dayOfMonth > 0 ? (b.spent / dayOfMonth) * daysInMonth : 0;
      b.projOver = pace > b.limit;
    });
  }

  /* ===== Currency formatter =====
     Used by demo.html via window.StashFmt.usd / .ccy. */
  const RATES = { USD: 1, ZWL: 1 / 35 }; // mock peg
  function fmt(amount, ccy, digits) {
    ccy = ccy || 'USD';
    const d = digits == null ? 2 : digits;
    try {
      const v = Math.abs(amount);
      const sign = amount < 0 ? '-' : '';
      if (ccy === 'ZWL') {
        return sign + 'ZWL ' + new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
      }
      return sign + '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
    } catch (e) {
      return (amount < 0 ? '-' : '') + (ccy === 'ZWL' ? 'ZWL ' : '$') + Math.abs(amount).toFixed(d);
    }
  }

  /* ===== Expose to demo.html ===== */
  window.StashSidecar = {
    LS_KEY,
    LS_MIRROR_PREFIX,
    TODAY: STASH_TODAY,
    load, save,
    extendSeed,
    recomputeBudgets,
    rates: RATES,
    fmt,
    bootstrap() {
      const store = load();
      if (!store || !store.transactions) return false;
      if (!store._stashExtended) {
        store.transactions = extendSeed(store.transactions);
        store._stashExtended = true;
      }
      recomputeBudgets(store);
      save(store);
      return true;
    },
    /* Called by demo.html after every mutation to keep mirror current. */
    syncMirror(store) { save(store); },
  };
})();
