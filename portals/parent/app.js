/* =====================================================================
 * Parent portal — functional prototype
 * Vanilla JS. State persists in localStorage under "corelith:parent:*".
 *
 * Wires up three flows across every parent page:
 *   1. Kid switcher chip in the header (sheet picker).
 *   2. Fees + EcoCash / OneMoney / Bank / Card payment modal.
 *   3. Notices feed with unread state and RSVP.
 *
 * Page hooks in via <body data-parent-page="...">. Each page declares
 * containers with data-parent-slot="..." which we render into.
 * ===================================================================== */
(function () {
  'use strict';

  // -------------------------------------------------------------------
  // Constants & storage
  // -------------------------------------------------------------------
  var NS = 'corelith:parent:';
  var KEY_KID = NS + 'selected-kid';
  var KEY_DATA = NS + 'data-v1';
  var PARENT_PHONE = '+263 77 213 4581';

  function fmtUSD(n) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(Number(n) || 0);
    } catch (e) {
      return '$' + (Number(n) || 0).toFixed(2);
    }
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch (e) { return iso; }
  }

  function shortDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short'
      });
    } catch (e) { return iso; }
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  // -------------------------------------------------------------------
  // Seed data
  // -------------------------------------------------------------------
  function seedData() {
    var kids = [
      {
        id: 'k-tatenda',
        first: 'Tatenda',
        last: 'Moyo',
        initials: 'TM',
        avatarColor: '#166534',
        grade: 'Form 4',
        house: 'Faraday',
        school: 'Trinity College Harare',
        term: 'Term 2 · 2026',
        fees: {
          invoiceId: 'T2-2026-0418',
          dueDate: '2026-05-28',
          items: [
            { id: 'tuition', label: 'Tuition · Form 4', sub: 'Spring term · 13 weeks', amount: 1400 },
            { id: 'boarding', label: 'Boarding levy', sub: 'Full board · Faraday house', amount: 380 },
            { id: 'books', label: 'Books & stationery', sub: 'Form 4 prescribed set', amount: 100 },
            { id: 'transport', label: 'Transport · school bus', sub: 'Glen Lorne route', amount: 160 }
          ],
          paid: 800
        }
      },
      {
        id: 'k-rumbidzai',
        first: 'Rumbidzai',
        last: 'Moyo',
        initials: 'RM',
        avatarColor: '#1D4ED8',
        grade: 'Form 2',
        house: 'Livingstone',
        school: 'St Faith’s Park',
        term: 'Term 2 · 2026',
        fees: {
          invoiceId: 'T2-2026-0611',
          dueDate: '2026-06-15',
          items: [
            { id: 'tuition', label: 'Tuition · Form 2', sub: 'Spring term · 13 weeks', amount: 980 },
            { id: 'boarding', label: 'Boarding levy', sub: 'Weekly boarding · Livingstone', amount: 260 },
            { id: 'books', label: 'Books & stationery', sub: 'Form 2 prescribed set', amount: 80 },
            { id: 'transport', label: 'Transport · school bus', sub: 'Borrowdale route', amount: 140 }
          ],
          paid: 420
        }
      },
      {
        id: 'k-tafadzwa',
        first: 'Tafadzwa',
        last: 'Moyo',
        initials: 'FM',
        avatarColor: '#B45309',
        grade: 'Grade 6',
        house: 'Day scholar',
        school: 'St Faith’s Park Junior',
        term: 'Term 2 · 2026',
        fees: {
          invoiceId: 'T2-2026-0509',
          dueDate: '2026-06-20',
          items: [
            { id: 'tuition', label: 'Tuition · Grade 6', sub: 'Spring term · 13 weeks', amount: 620 },
            { id: 'books', label: 'Books & stationery', sub: 'Grade 6 prescribed set', amount: 60 },
            { id: 'transport', label: 'Transport · school bus', sub: 'Borrowdale route', amount: 120 }
          ],
          paid: 0
        }
      }
    ];

    // Attendance summary per kid (simple stats)
    var attendance = {
      'k-tatenda': { presentPct: 96, present: 58, total: 60, late: 1, absent: 1, term: 'Term 2 · 2026' },
      'k-rumbidzai': { presentPct: 94, present: 56, total: 60, late: 1, absent: 3, term: 'Term 2 · 2026' },
      'k-tafadzwa': { presentPct: 99, present: 59, total: 60, late: 1, absent: 0, term: 'Term 2 · 2026' }
    };

    // Notices feed — ~8 entries spanning two months
    var notices = [
      {
        id: 'n-rsvp-pte',
        date: '2026-06-09',
        tag: 'Whole school',
        title: 'Mid-term parents’ evening · 27 June',
        sender: 'Mrs T. Chari',
        senderInit: 'TC',
        senderRole: 'Form 2 teacher · St Faith’s Park',
        summary: 'Sign up for 15-minute slots with subject teachers. Slots open Friday 16:00.',
        body: 'You are warmly invited to our mid-term parents’ evening on Friday 27 June 2026, from 16:00 to 19:00 in the main assembly hall. Each slot is 15 minutes; please be mindful so every family gets time with the teachers they need. Light refreshments served outside the hall from 17:30. Kindly RSVP by Monday 23 June so we can plan numbers.',
        action: { type: 'rsvp', label: 'RSVP — I will attend' },
        unread: true,
        rsvp: null
      },
      {
        id: 'n-fees-deadline',
        date: '2026-06-05',
        tag: 'Bursar',
        title: 'Tuition fee deadline reminder',
        sender: 'Mr P. Ncube',
        senderInit: 'PN',
        senderRole: 'Bursar’s office',
        summary: 'Term 2 outstanding balances are due by Monday 15 June. Late payments attract a 5% surcharge.',
        body: 'A friendly reminder that Term 2 outstanding balances are due by Monday 15 June. Payments received after this date attract a 5% surcharge. EcoCash, OneMoney, bank transfer and card payments are all accepted in the parent portal. If your family needs an installment plan, please reply to this notice or call the bursar’s office on 0242 700 312.',
        unread: true
      },
      {
        id: 'n-sports-day',
        date: '2026-05-30',
        tag: 'Sports',
        title: 'Inter-house sports day · Saturday 6 June',
        sender: 'Coach K. Mhlanga',
        senderInit: 'KM',
        senderRole: 'Director of sport',
        summary: 'Houses gather at 08:00. Athletics, swimming and tug-of-war. Parents welcome.',
        body: 'Our annual inter-house sports day will take place this Saturday 6 June on the main field. Houses gather at 08:00 for the opening parade. Events run until 14:00 across athletics, swimming and tug-of-war. Parents are warmly welcome. Refreshments will be sold by the PTA in aid of the new library wing.',
        unread: true
      },
      {
        id: 'n-prize-giving',
        date: '2026-05-22',
        tag: 'Whole school',
        title: 'Prize-giving day · 11 July',
        sender: 'Mr R. Sibanda',
        senderInit: 'RS',
        senderRole: 'Headmaster',
        summary: 'End-of-term prize-giving on Saturday 11 July at 10:00. Dress code: full school uniform.',
        body: 'It is our great pleasure to invite parents and guardians to our end-of-term prize-giving on Saturday 11 July at 10:00. The ceremony will be held in the main hall and is expected to conclude by 12:30. Pupils should be in full school uniform. Tea will follow on the south lawn. Please RSVP via the portal so we can confirm seating.',
        action: { type: 'rsvp', label: 'RSVP — confirm seat' },
        unread: false,
        rsvp: null
      },
      {
        id: 'n-bus-route',
        date: '2026-05-14',
        tag: 'Transport',
        title: 'Bus route change · Glen Lorne',
        sender: 'Ms L. Dube',
        senderInit: 'LD',
        senderRole: 'Transport office',
        summary: 'From Monday the Glen Lorne route departs at 06:35 instead of 06:50.',
        body: 'Please note that from Monday next week the Glen Lorne route will depart at 06:35 instead of 06:50. The new pick-up time at Athlone shops is 06:42 and at the Pomona turn-off is 06:48. The afternoon return time is unchanged.',
        unread: false
      },
      {
        id: 'n-pte-meeting',
        date: '2026-05-04',
        tag: 'PTA',
        title: 'Parent–teacher meeting · Form 2 Livingstone',
        sender: 'Mrs T. Chari',
        senderInit: 'TC',
        senderRole: 'Form 2 teacher',
        summary: 'Class-specific meeting on Thursday 8 May at 17:30. Tea served beforehand.',
        body: 'A class-specific parent–teacher meeting for Form 2 Livingstone will be held on Thursday 8 May at 17:30 in classroom L4. Tea will be served from 17:00. We will review Term 1 results, discuss the focus areas for Term 2, and answer your questions. Please RSVP via the portal so we know to expect you.',
        action: { type: 'rsvp', label: 'RSVP — I will attend' },
        unread: false,
        rsvp: null
      },
      {
        id: 'n-term2-resume',
        date: '2026-05-02',
        tag: 'Calendar',
        title: 'Term 2 resumption · timetable update',
        sender: 'Mrs G. Mhlanga',
        senderInit: 'GM',
        senderRole: 'Deputy head',
        summary: 'Term 2 resumes Tuesday 5 May. Period 1 starts at 07:30. New timetable attached.',
        body: 'Welcome back. Term 2 resumes on Tuesday 5 May. Period 1 starts at 07:30 sharp. Please ensure pupils arrive with the full updated booklist and any outstanding holiday assignments. The new timetable has been pushed to the portal and pinned in form rooms.',
        unread: false
      },
      {
        id: 'n-flu-shots',
        date: '2026-04-18',
        tag: 'Health',
        title: 'Optional flu vaccinations · Monday 28 April',
        sender: 'Sister A. Mutasa',
        senderInit: 'AM',
        senderRole: 'School nurse',
        summary: 'Voluntary flu shots offered on campus. Consent forms via the portal.',
        body: 'Our annual voluntary flu vaccination day will run on Monday 28 April between 08:30 and 12:30 in the sick bay. The vaccine is offered free of charge by the city health department. Please sign the consent form in the portal by Friday 25 April if you would like your child to participate.',
        unread: false
      }
    ];

    // Seed payment history — one ledger across all kids
    var payments = [
      {
        id: 'p-20260520',
        date: '2026-05-20',
        kidId: 'k-tatenda',
        method: 'EcoCash',
        ref: 'EC-208451',
        amount: 800,
        memo: 'Term 2 part payment'
      },
      {
        id: 'p-20260510',
        date: '2026-05-10',
        kidId: 'k-rumbidzai',
        method: 'OneMoney',
        ref: 'OM-117822',
        amount: 420,
        memo: 'Term 2 part payment'
      },
      {
        id: 'p-20260402',
        date: '2026-04-02',
        kidId: 'k-tatenda',
        method: 'Bank transfer',
        ref: 'BT-559014',
        amount: 600,
        memo: 'Term 1 carry-over'
      }
    ];

    return { kids: kids, attendance: attendance, notices: notices, payments: payments };
  }

  // -------------------------------------------------------------------
  // Store
  // -------------------------------------------------------------------
  var Store = {
    data: null,

    load: function () {
      var raw = null;
      try { raw = localStorage.getItem(KEY_DATA); } catch (e) {}
      if (raw) {
        try {
          this.data = JSON.parse(raw);
          // Light migration: ensure required collections exist.
          var seed = seedData();
          ['kids', 'attendance', 'notices', 'payments'].forEach(function (k) {
            if (!this.data[k]) this.data[k] = seed[k];
          }, this);
        } catch (e) {
          this.data = seedData();
        }
      } else {
        this.data = seedData();
      }
      this.save();
      return this.data;
    },

    save: function () {
      try { localStorage.setItem(KEY_DATA, JSON.stringify(this.data)); } catch (e) {}
    },

    reset: function () {
      this.data = seedData();
      this.save();
    },

    // Selected kid
    selectedKidId: function () {
      var id = null;
      try { id = localStorage.getItem(KEY_KID); } catch (e) {}
      if (!id || !this.kid(id)) {
        id = this.data.kids[0].id;
        this.setSelectedKidId(id);
      }
      return id;
    },
    setSelectedKidId: function (id) {
      try { localStorage.setItem(KEY_KID, id); } catch (e) {}
    },

    kid: function (id) {
      return this.data.kids.find(function (k) { return k.id === id; });
    },
    selectedKid: function () { return this.kid(this.selectedKidId()); },

    // Fees
    feesTotal: function (kid) {
      return kid.fees.items.reduce(function (a, b) { return a + b.amount; }, 0);
    },
    feesBalance: function (kid) {
      return Math.max(0, this.feesTotal(kid) - (kid.fees.paid || 0));
    },

    applyPayment: function (kidId, amount, method, ref) {
      var kid = this.kid(kidId);
      if (!kid) return null;
      var amt = Math.max(0, Number(amount) || 0);
      kid.fees.paid = (kid.fees.paid || 0) + amt;
      var payment = {
        id: uid('p'),
        date: new Date().toISOString().slice(0, 10),
        kidId: kidId,
        method: method,
        ref: ref,
        amount: amt,
        memo: 'Term 2 payment'
      };
      this.data.payments.unshift(payment);
      this.save();
      return payment;
    },

    // Notices
    markRead: function (id) {
      var n = this.data.notices.find(function (x) { return x.id === id; });
      if (n && n.unread) { n.unread = false; this.save(); }
    },
    setRSVP: function (id, value) {
      var n = this.data.notices.find(function (x) { return x.id === id; });
      if (n) { n.rsvp = value; n.unread = false; this.save(); }
    },
    unreadCount: function () {
      return this.data.notices.filter(function (n) { return n.unread; }).length;
    }
  };

  // -------------------------------------------------------------------
  // Modal & sheet primitives (focus trap, Esc, scrim click)
  // -------------------------------------------------------------------
  var openLayers = [];

  function openLayer(opts) {
    // opts: { className, html, onClose, onMount }
    var scrim = document.createElement('div');
    scrim.className = 'pa-scrim ' + (opts.className || '');
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    scrim.innerHTML = '<div class="pa-layer" tabindex="-1">' + opts.html + '</div>';
    document.body.appendChild(scrim);
    document.body.classList.add('pa-locked');

    var layer = scrim.querySelector('.pa-layer');
    var prevFocus = document.activeElement;

    function closeNow() {
      if (opts.onClose) try { opts.onClose(); } catch (e) {}
      scrim.removeEventListener('keydown', onKey, true);
      scrim.remove();
      var idx = openLayers.indexOf(close);
      if (idx !== -1) openLayers.splice(idx, 1);
      if (!openLayers.length) document.body.classList.remove('pa-locked');
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
    }
    function close() { closeNow(); }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      } else if (e.key === 'Tab') {
        var focusables = layer.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) { e.preventDefault(); layer.focus(); return; }
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    scrim.addEventListener('keydown', onKey, true);

    scrim.addEventListener('click', function (e) {
      if (e.target === scrim) close();
    });

    openLayers.push(close);
    if (opts.onMount) try { opts.onMount(layer, close); } catch (e) {}

    // Focus first focusable
    setTimeout(function () {
      var f = layer.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      (f || layer).focus();
    }, 10);

    return close;
  }

  // -------------------------------------------------------------------
  // Kid picker chip (header) + sheet
  // -------------------------------------------------------------------
  function avatarStyle(kid) {
    return 'background:' + kid.avatarColor + ';color:#fff;';
  }

  function renderKidChip(container) {
    var kid = Store.selectedKid();
    container.innerHTML =
      '<button class="pa-kidchip" type="button" aria-haspopup="dialog" aria-label="Switch child">' +
        '<span class="av" style="' + avatarStyle(kid) + '">' + escapeHTML(kid.initials) + '</span>' +
        '<span class="nm">' + escapeHTML(kid.first) + '</span>' +
        '<span class="ch" aria-hidden="true">▾</span>' +
      '</button>';
    container.querySelector('button').addEventListener('click', openKidSheet);
  }

  function openKidSheet() {
    var current = Store.selectedKidId();
    var html =
      '<div class="pa-sheet">' +
        '<div class="pa-sheet-grip"></div>' +
        '<div class="pa-sheet-head">' +
          '<h2 id="pa-sheet-title">Switch child</h2>' +
          '<button type="button" class="pa-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="pa-sheet-body">' +
          Store.data.kids.map(function (k) {
            var bal = Store.feesBalance(k);
            return '<button type="button" class="pa-kidrow' + (k.id === current ? ' is-active' : '') + '" data-kid="' + k.id + '">' +
              '<span class="av" style="' + avatarStyle(k) + '">' + escapeHTML(k.initials) + '</span>' +
              '<span class="who">' +
                '<span class="nm">' + escapeHTML(k.first + ' ' + k.last) + '</span>' +
                '<span class="sb">' + escapeHTML(k.grade + ' · ' + k.school) + '</span>' +
              '</span>' +
              '<span class="bal">' + (bal > 0 ? fmtUSD(bal) + ' owing' : 'Paid up') + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';

    openLayer({
      className: 'pa-scrim--bottom',
      html: html,
      onMount: function (layer, close) {
        layer.querySelector('.pa-x').addEventListener('click', close);
        layer.querySelectorAll('.pa-kidrow').forEach(function (row) {
          row.addEventListener('click', function () {
            Store.setSelectedKidId(row.getAttribute('data-kid'));
            close();
            App.rerender();
          });
        });
      }
    });
  }

  // -------------------------------------------------------------------
  // Pay-fees flow
  // -------------------------------------------------------------------
  var METHODS = [
    { id: 'ecocash', label: 'EcoCash', sub: 'Mobile money · instant', icon: 'phone', tone: 'momo' },
    { id: 'onemoney', label: 'OneMoney', sub: 'Mobile money · instant', icon: 'phone', tone: 'momo' },
    { id: 'bank', label: 'Bank transfer', sub: 'CABS · Stanbic · StanChart', icon: 'building', tone: 'bank' },
    { id: 'card', label: 'Bank card', sub: 'Visa / Mastercard · 2.9% fee', icon: 'card', tone: 'card' }
  ];

  function openPayFlow() {
    openPickMethod();
  }

  function openPickMethod() {
    var kid = Store.selectedKid();
    var bal = Store.feesBalance(kid);
    var html =
      '<div class="pa-modal">' +
        '<div class="pa-modal-head">' +
          '<div>' +
            '<div class="pa-modal-eyebrow">Pay fees</div>' +
            '<h2>' + escapeHTML(kid.first) + ' · ' + fmtUSD(bal) + '</h2>' +
          '</div>' +
          '<button type="button" class="pa-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="pa-modal-body">' +
          '<p class="pa-modal-lede">Choose how you’d like to pay.</p>' +
          '<div class="pa-method-list">' +
            METHODS.map(function (m) {
              return '<button type="button" class="pa-method" data-method="' + m.id + '">' +
                '<span class="ic-tile pa-tile-' + m.tone + '" data-icon="' + m.icon + '" data-icon-size="18"></span>' +
                '<span class="who"><span class="nm">' + escapeHTML(m.label) + '</span><span class="sb">' + escapeHTML(m.sub) + '</span></span>' +
                '<span class="ch" aria-hidden="true">›</span>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>';

    openLayer({
      className: 'pa-scrim--center',
      html: html,
      onMount: function (layer, close) {
        if (window.Icons && Icons.render) Icons.render(layer);
        layer.querySelector('.pa-x').addEventListener('click', close);
        layer.querySelectorAll('.pa-method').forEach(function (b) {
          b.addEventListener('click', function () {
            var method = METHODS.find(function (m) { return m.id === b.getAttribute('data-method'); });
            close();
            openMethodForm(method);
          });
        });
      }
    });
  }

  function openMethodForm(method) {
    var kid = Store.selectedKid();
    var bal = Store.feesBalance(kid);

    var fields;
    if (method.id === 'ecocash' || method.id === 'onemoney') {
      fields =
        '<label class="pa-field">' +
          '<span class="lbl">Mobile money number</span>' +
          '<input type="tel" name="phone" value="' + escapeHTML(PARENT_PHONE) + '" autocomplete="tel" inputmode="tel" />' +
          '<span class="hint">A push prompt will be sent to this number.</span>' +
        '</label>';
    } else if (method.id === 'bank') {
      fields =
        '<label class="pa-field">' +
          '<span class="lbl">Account to debit</span>' +
          '<select name="bank">' +
            '<option>CABS — ****4471</option>' +
            '<option>Stanbic — ****0921</option>' +
            '<option>Standard Chartered — ****8830</option>' +
          '</select>' +
          '<span class="hint">Transfer is confirmed instantly via the bank API.</span>' +
        '</label>';
    } else {
      fields =
        '<label class="pa-field">' +
          '<span class="lbl">Card on file</span>' +
          '<select name="card">' +
            '<option>Visa … 4421</option>' +
            '<option>Mastercard … 8812</option>' +
          '</select>' +
          '<span class="hint">A 2.9% processing fee applies.</span>' +
        '</label>';
    }

    var html =
      '<div class="pa-modal">' +
        '<div class="pa-modal-head">' +
          '<button type="button" class="pa-back" aria-label="Back">‹</button>' +
          '<div>' +
            '<div class="pa-modal-eyebrow">Pay · ' + escapeHTML(method.label) + '</div>' +
            '<h2>' + escapeHTML(kid.first) + '’s fees</h2>' +
          '</div>' +
          '<button type="button" class="pa-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<form class="pa-modal-body pa-pay-form" novalidate>' +
          fields +
          '<label class="pa-field">' +
            '<span class="lbl">Amount (USD)</span>' +
            '<input type="number" name="amount" step="0.01" min="0.01" max="' + bal + '" value="' + bal.toFixed(2) + '" inputmode="decimal" />' +
            '<span class="hint">Balance ' + fmtUSD(bal) + ' · partial payments accepted.</span>' +
          '</label>' +
          '<div class="pa-form-actions">' +
            '<button type="button" class="pa-btn pa-btn-ghost" data-cancel>Cancel</button>' +
            '<button type="submit" class="pa-btn pa-btn-primary">Pay ' + fmtUSD(bal) + '</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    openLayer({
      className: 'pa-scrim--center',
      html: html,
      onMount: function (layer, close) {
        if (window.Icons && Icons.render) Icons.render(layer);
        layer.querySelector('.pa-x').addEventListener('click', close);
        layer.querySelector('.pa-back').addEventListener('click', function () {
          close(); openPickMethod();
        });
        layer.querySelector('[data-cancel]').addEventListener('click', close);

        var form = layer.querySelector('form');
        var amountInput = form.querySelector('input[name="amount"]');
        var submitBtn = form.querySelector('button[type="submit"]');

        function updateBtn() {
          var v = Number(amountInput.value);
          submitBtn.textContent = 'Pay ' + fmtUSD(isFinite(v) ? v : 0);
          submitBtn.disabled = !(v > 0);
        }
        amountInput.addEventListener('input', updateBtn);
        updateBtn();

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var amount = Number(amountInput.value);
          if (!(amount > 0)) return;
          close();
          openProcessing(method, amount);
        });
      }
    });
  }

  function openProcessing(method, amount) {
    var msg;
    if (method.id === 'ecocash' || method.id === 'onemoney') {
      msg = 'Sending request to your phone…';
    } else if (method.id === 'bank') {
      msg = 'Reaching your bank…';
    } else {
      msg = 'Authorising your card…';
    }
    var html =
      '<div class="pa-modal pa-modal--center">' +
        '<div class="pa-modal-body" style="text-align:center;">' +
          '<div class="pa-spinner" aria-hidden="true"></div>' +
          '<h2 style="margin:14px 0 6px;">' + escapeHTML(msg) + '</h2>' +
          '<p class="pa-modal-lede">Do not close this window.</p>' +
        '</div>' +
      '</div>';

    var close;
    var t = setTimeout(function () {
      var kidId = Store.selectedKidId();
      var ref = (method.id === 'ecocash' ? 'EC' : method.id === 'onemoney' ? 'OM' :
                 method.id === 'bank' ? 'BT' : 'CD') + '-' + Math.floor(100000 + Math.random() * 899999);
      var payment = Store.applyPayment(kidId, amount, method.label, ref);
      if (close) close();
      openReceipt(method, payment);
    }, 1200);

    close = openLayer({
      className: 'pa-scrim--center',
      html: html,
      onClose: function () { clearTimeout(t); }
    });
  }

  function openReceipt(method, payment) {
    var kid = Store.kid(payment.kidId);
    var newBalance = Store.feesBalance(kid);
    var html =
      '<div class="pa-modal">' +
        '<div class="pa-modal-head">' +
          '<div>' +
            '<div class="pa-modal-eyebrow" style="color:var(--tone-success);">Payment successful</div>' +
            '<h2>' + fmtUSD(payment.amount) + ' paid</h2>' +
          '</div>' +
          '<button type="button" class="pa-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="pa-modal-body">' +
          '<div class="pa-receipt">' +
            '<div class="pa-rcpt-row"><span>Confirmation #</span><strong>' + escapeHTML(payment.ref) + '</strong></div>' +
            '<div class="pa-rcpt-row"><span>Date</span><strong>' + escapeHTML(fmtDate(payment.date)) + '</strong></div>' +
            '<div class="pa-rcpt-row"><span>Method</span><strong>' + escapeHTML(method.label) + '</strong></div>' +
            '<div class="pa-rcpt-row"><span>Child</span><strong>' + escapeHTML(kid.first + ' ' + kid.last) + '</strong></div>' +
            '<div class="pa-rcpt-row"><span>Amount</span><strong>' + fmtUSD(payment.amount) + '</strong></div>' +
            '<div class="pa-rcpt-row"><span>New balance</span><strong>' + fmtUSD(newBalance) + '</strong></div>' +
          '</div>' +
          '<div class="pa-form-actions">' +
            '<button type="button" class="pa-btn pa-btn-ghost" data-done>Done</button>' +
            '<a class="pa-btn pa-btn-primary" href="payment-history.html">View history</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    openLayer({
      className: 'pa-scrim--center',
      html: html,
      onMount: function (layer, close) {
        layer.querySelector('.pa-x').addEventListener('click', function () { close(); App.rerender(); });
        layer.querySelector('[data-done]').addEventListener('click', function () { close(); App.rerender(); });
      },
      onClose: function () { App.rerender(); }
    });
  }

  // -------------------------------------------------------------------
  // Notice detail
  // -------------------------------------------------------------------
  function openNotice(noticeId) {
    var n = Store.data.notices.find(function (x) { return x.id === noticeId; });
    if (!n) return;
    Store.markRead(noticeId);

    var actionHTML = '';
    if (n.action && n.action.type === 'rsvp') {
      if (n.rsvp === 'yes') {
        actionHTML = '<div class="pa-rsvp-badge">✓ RSVP confirmed</div>';
      } else {
        actionHTML =
          '<button type="button" class="pa-btn pa-btn-primary pa-rsvp-btn">' +
            escapeHTML(n.action.label) +
          '</button>';
      }
    }

    var html =
      '<div class="pa-modal pa-modal--notice">' +
        '<div class="pa-modal-head">' +
          '<div>' +
            '<div class="pa-modal-eyebrow">' + escapeHTML(n.tag) + ' · ' + escapeHTML(shortDate(n.date)) + '</div>' +
            '<h2>' + escapeHTML(n.title) + '</h2>' +
          '</div>' +
          '<button type="button" class="pa-x" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="pa-modal-body">' +
          '<div class="pa-notice-sender">' +
            '<span class="av">' + escapeHTML(n.senderInit) + '</span>' +
            '<div>' +
              '<div class="nm">' + escapeHTML(n.sender) + '</div>' +
              '<div class="sb">' + escapeHTML(n.senderRole) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="pa-notice-body">' + escapeHTML(n.body).split('\n').map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
          (actionHTML ? '<div class="pa-notice-action">' + actionHTML + '</div>' : '') +
        '</div>' +
      '</div>';

    openLayer({
      className: 'pa-scrim--center',
      html: html,
      onMount: function (layer, close) {
        layer.querySelector('.pa-x').addEventListener('click', function () { close(); App.rerender(); });
        var rsvpBtn = layer.querySelector('.pa-rsvp-btn');
        if (rsvpBtn) {
          rsvpBtn.addEventListener('click', function () {
            rsvpBtn.disabled = true;
            rsvpBtn.textContent = 'Submitting…';
            setTimeout(function () {
              Store.setRSVP(noticeId, 'yes');
              close();
              openNotice(noticeId); // re-open to show confirmation
              App.rerender();
            }, 700);
          });
        }
      },
      onClose: function () { App.rerender(); }
    });
  }

  // -------------------------------------------------------------------
  // Page renderers
  // -------------------------------------------------------------------
  var Pages = {
    dashboard: function () {
      var kid = Store.selectedKid();
      var bal = Store.feesBalance(kid);
      var att = Store.data.attendance[kid.id];
      var unread = Store.unreadCount();

      setText('[data-parent-slot="greet"]', kid.school + ' · ' + kid.term);
      setText('[data-parent-slot="fee-label"]', 'Outstanding fees · ' + kid.first);
      setText('[data-parent-slot="fee-value"]', fmtUSD(bal));
      setText('[data-parent-slot="fee-due"]',
        bal > 0
          ? 'Term invoice due ' + fmtDate(kid.fees.dueDate) + ' · ' + fmtUSD(kid.fees.paid) + ' paid so far.'
          : 'Term invoice settled in full. Thank you.');
      setText('[data-parent-slot="att-line"]',
        att ? att.present + ' of ' + att.total + ' days present · ' + att.presentPct + '%' : '');
      setText('[data-parent-slot="unread-count"]', String(unread));

      var noticeList = document.querySelector('[data-parent-slot="notice-preview"]');
      if (noticeList) {
        var top3 = Store.data.notices.slice(0, 3);
        noticeList.innerHTML = top3.map(function (n) {
          return '<button class="pl-row pa-notice-row" type="button" data-notice="' + n.id + '">' +
            '<div style="grid-column: 1 / 3;">' +
              '<div class="nm">' + escapeHTML(n.title) + (n.unread ? ' <span class="pa-dot" title="Unread"></span>' : '') + '</div>' +
              '<div class="sb">' + escapeHTML(n.summary) + '</div>' +
            '</div>' +
            '<span data-icon="chright" style="color: var(--text-subtle);"></span>' +
          '</button>';
        }).join('');
        if (window.Icons && Icons.render) Icons.render(noticeList);
        noticeList.querySelectorAll('[data-notice]').forEach(function (el) {
          el.addEventListener('click', function () { openNotice(el.getAttribute('data-notice')); });
        });
      }

      var payBtn = document.querySelector('[data-parent-slot="pay-cta"]');
      if (payBtn) {
        payBtn.textContent = bal > 0 ? 'Pay ' + fmtUSD(bal) : 'View invoice';
        if (!payBtn.dataset.bound) {
          payBtn.dataset.bound = '1';
          payBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (Store.feesBalance(Store.selectedKid()) > 0) openPayFlow();
            else window.location.href = 'fees.html';
          });
        }
      }
    },

    fees: function () {
      var kid = Store.selectedKid();
      var bal = Store.feesBalance(kid);
      var total = Store.feesTotal(kid);
      var pct = total > 0 ? Math.round(((kid.fees.paid || 0) / total) * 100) : 0;

      setText('[data-parent-slot="kid-name"]', kid.first + ' ' + kid.last);
      setText('[data-parent-slot="kid-sub"]', kid.grade + ' ' + kid.house + ' · ' + kid.school);
      var av = document.querySelector('[data-parent-slot="kid-av"]');
      if (av) {
        av.textContent = kid.initials;
        av.setAttribute('style', avatarStyle(kid) + 'width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font:600 13px/1 var(--font-sans);');
      }

      setText('[data-parent-slot="bal-value"]', fmtUSD(bal));
      setText('[data-parent-slot="bal-due"]',
        'Invoice ' + kid.fees.invoiceId + ' · due ' + fmtDate(kid.fees.dueDate));
      var bar = document.querySelector('[data-parent-slot="bal-bar"]');
      if (bar) bar.style.width = pct + '%';
      setText('[data-parent-slot="bal-paid"]', 'Paid · ' + fmtUSD(kid.fees.paid || 0));
      setText('[data-parent-slot="bal-total"]', 'Total · ' + fmtUSD(total));

      var payBtn = document.querySelector('[data-parent-slot="pay-cta"]');
      if (payBtn) {
        payBtn.textContent = bal > 0 ? 'Pay ' + fmtUSD(bal) : 'Fully paid';
        payBtn.toggleAttribute('disabled', !(bal > 0));
        if (!payBtn.dataset.bound) {
          payBtn.dataset.bound = '1';
          payBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (Store.feesBalance(Store.selectedKid()) > 0) openPayFlow();
          });
        }
      }

      var list = document.querySelector('[data-parent-slot="fee-items"]');
      if (list) {
        list.innerHTML =
          kid.fees.items.map(function (it) {
            return '<div class="breakdown-row">' +
              '<div><div class="nm">' + escapeHTML(it.label) + '</div><div class="sb">' + escapeHTML(it.sub) + '</div></div>' +
              '<div class="v">' + fmtUSD(it.amount) + '</div>' +
            '</div>';
          }).join('') +
          '<div class="breakdown-row total">' +
            '<div><div class="nm">Invoice total</div><div class="sb">' + escapeHTML(kid.fees.invoiceId) + '</div></div>' +
            '<div class="v">' + fmtUSD(total) + '</div>' +
          '</div>' +
          (kid.fees.paid > 0
            ? '<div class="breakdown-row paid">' +
                '<div><div class="nm">Paid so far</div><div class="sb">Term 2 · across all payments</div></div>' +
                '<div class="v">' + fmtUSD(kid.fees.paid) + '</div>' +
              '</div>'
            : '');
      }
    },

    attendance: function () {
      var kid = Store.selectedKid();
      var att = Store.data.attendance[kid.id];
      setText('[data-parent-slot="kid-name"]', kid.first + ' ' + kid.last);
      setText('[data-parent-slot="kid-sub"]', kid.grade + ' ' + kid.house + ' · ' + kid.school);
      var av = document.querySelector('[data-parent-slot="kid-av"]');
      if (av) {
        av.textContent = kid.initials;
        av.setAttribute('style', avatarStyle(kid) + 'width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font:600 13px/1 var(--font-sans);');
      }
      if (att) {
        setText('[data-parent-slot="att-pct"]', String(att.presentPct));
        setText('[data-parent-slot="att-ds"]',
          att.present + ' of ' + att.total + ' school days attended · ' +
          att.absent + ' absence' + (att.absent === 1 ? '' : 's') + ', ' +
          att.late + ' late.');
      }
    },

    notices: function () {
      var list = document.querySelector('[data-parent-slot="notice-feed"]');
      if (!list) return;
      list.innerHTML = Store.data.notices.map(function (n) {
        var rsvpChip = n.rsvp === 'yes'
          ? '<span class="pa-rsvp-chip">✓ RSVP’d</span>'
          : '';
        return '<button class="pa-notice-card" type="button" data-notice="' + n.id + '">' +
          '<div class="pa-notice-meta">' +
            '<span class="pa-notice-tag">' + escapeHTML(n.tag) + '</span>' +
            '<span class="pa-notice-date">' + escapeHTML(fmtDate(n.date)) + '</span>' +
          '</div>' +
          '<div class="pa-notice-title">' + escapeHTML(n.title) + (n.unread ? ' <span class="pa-dot"></span>' : '') + '</div>' +
          '<div class="pa-notice-summary">' + escapeHTML(n.summary) + '</div>' +
          '<div class="pa-notice-foot">' +
            '<span class="pa-notice-sender-line">' + escapeHTML(n.sender) + '</span>' +
            rsvpChip +
          '</div>' +
        '</button>';
      }).join('');
      list.querySelectorAll('[data-notice]').forEach(function (el) {
        el.addEventListener('click', function () { openNotice(el.getAttribute('data-notice')); });
      });
      setText('[data-parent-slot="unread-count"]', String(Store.unreadCount()));
    },

    history: function () {
      var list = document.querySelector('[data-parent-slot="payment-feed"]');
      if (!list) return;
      var payments = Store.data.payments.slice().sort(function (a, b) {
        return (b.date || '').localeCompare(a.date || '');
      });
      var total = payments.reduce(function (a, p) { return a + p.amount; }, 0);
      setText('[data-parent-slot="paid-ytd"]', fmtUSD(total));
      setText('[data-parent-slot="paid-count"]',
        'Across ' + Store.data.kids.length + ' children · ' + payments.length + ' payment' + (payments.length === 1 ? '' : 's'));

      if (!payments.length) {
        list.innerHTML = '<div class="pa-empty">No payments yet.</div>';
        return;
      }

      list.innerHTML = payments.map(function (p) {
        var kid = Store.kid(p.kidId);
        var tone = /eco|one/i.test(p.method) ? 'momo' :
                   /bank/i.test(p.method) ? 'bank' :
                   /card|visa|master/i.test(p.method) ? 'card' : 'momo';
        var icon = /bank/i.test(p.method) ? 'building' :
                   /card|visa|master/i.test(p.method) ? 'card' : 'phone';
        return '<div class="pay-row">' +
          '<span class="ic-tile pa-tile-' + tone + '" data-icon="' + icon + '" data-icon-size="18"></span>' +
          '<div>' +
            '<div class="nm">' + escapeHTML(p.method) + ' · ' + escapeHTML(kid ? kid.first : 'Unknown') + '</div>' +
            '<div class="sb">' + escapeHTML(fmtDate(p.date)) + ' · ' + escapeHTML(p.memo) + ' · ref ' + escapeHTML(p.ref) + '</div>' +
          '</div>' +
          '<div class="right"><span class="amt">' + fmtUSD(p.amount) + '</span></div>' +
        '</div>';
      }).join('');
      if (window.Icons && Icons.render) Icons.render(list);
    },

    profile: function () {
      var kid = Store.selectedKid();
      var list = document.querySelector('[data-parent-slot="children-list"]');
      if (list) {
        list.innerHTML = Store.data.kids.map(function (k) {
          var bal = Store.feesBalance(k);
          var active = k.id === kid.id;
          return '<button class="child-card pa-child-row' + (active ? ' active' : '') + '" type="button" data-kid="' + k.id + '">' +
            '<span class="av" style="' + avatarStyle(k) + '">' + escapeHTML(k.initials) + '</span>' +
            '<div>' +
              '<div class="nm">' + escapeHTML(k.first + ' ' + k.last) + '</div>' +
              '<div class="sb">' + escapeHTML(k.grade + ' ' + k.house + ' · ' + k.school) + '</div>' +
            '</div>' +
            '<span class="chip">' + (active ? 'Active' : (bal > 0 ? fmtUSD(bal) : 'Switch')) + '</span>' +
          '</button>';
        }).join('');
        list.querySelectorAll('[data-kid]').forEach(function (b) {
          b.addEventListener('click', function () {
            Store.setSelectedKidId(b.getAttribute('data-kid'));
            App.rerender();
          });
        });
      }
    }
  };

  function setText(sel, val) {
    document.querySelectorAll(sel).forEach(function (el) { el.textContent = val; });
  }

  // -------------------------------------------------------------------
  // App entry
  // -------------------------------------------------------------------
  var App = {
    rerender: function () {
      var page = document.body.getAttribute('data-parent-page');
      var fn = Pages[page];
      if (fn) fn();

      // Refresh kid chips on the page.
      document.querySelectorAll('[data-parent-slot="kid-chip"]').forEach(renderKidChip);
    },

    init: function () {
      Store.load();

      // Mount kid chip into the appbar
      document.querySelectorAll('[data-parent-slot="kid-chip"]').forEach(renderKidChip);

      App.rerender();
    }
  };

  // Cross-tab updates
  window.addEventListener('storage', function (e) {
    if (e.key === KEY_DATA || e.key === KEY_KID) {
      Store.load();
      App.rerender();
    }
  });

  // Expose for debugging
  window.ParentApp = { Store: Store, rerender: function () { App.rerender(); }, reset: function () { Store.reset(); App.rerender(); } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
  } else {
    App.init();
  }
})();
