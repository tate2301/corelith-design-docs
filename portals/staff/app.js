/* Staff portal — functional prototype shared script.
   Persists to localStorage under prefix `corelith:staff:`.
   Seeded on first run; idempotent across reloads. */
(function () {
  'use strict';

  const NS = 'corelith:staff:';
  const KEYS = {
    user: NS + 'user',
    payslips: NS + 'payslips',
    leave: NS + 'leave',          // own leave requests
    teamLeave: NS + 'teamLeave',  // direct-report leave requests
    clock: NS + 'clock',          // time clock events
    directory: NS + 'directory',
    isManager: NS + 'isManager',
    seedVersion: NS + 'seedVersion',
  };
  const SEED_VERSION = '1';

  /* ============================================================ STORAGE */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* quota / private mode */ }
  }

  /* ============================================================ ID + DATES */
  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDay(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtDateShort(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()];
  }
  function fmtMonth(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtMoney(n) {
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    return sign + '$ ' + abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function diffDays(from, to) {
    const a = new Date(from); const b = new Date(to);
    return Math.round((b - a) / 86400000) + 1;
  }
  function fmtTime(d) {
    if (typeof d === 'string') d = new Date(d);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function fmtHM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h + 'h ' + pad(m) + 'm';
  }

  /* ============================================================ PAYROLL
     Zimbabwe PAYE bands — assumption: 2025/2026 monthly USD bands (approximate, illustrative).
       0 – 100       :  0%
       100 – 300     : 20%
       300 – 1000    : 25%
       1000 – 2000   : 30%
       2000 +        : 35%
     NSSA: 4.5% of basic salary (employee portion).
     AIDS levy: 3% of PAYE due.
     Pension: 5% of basic.
     Medical aid (PSMAS family): fixed $35.
     Union dues: $4.
     Source: approximations of ZIMRA monthly tables — comment intentionally; not a payroll system. */
  function computePAYE(taxable) {
    const bands = [
      { upTo: 100,  rate: 0.00 },
      { upTo: 300,  rate: 0.20 },
      { upTo: 1000, rate: 0.25 },
      { upTo: 2000, rate: 0.30 },
      { upTo: Infinity, rate: 0.35 },
    ];
    let prev = 0, tax = 0;
    for (const b of bands) {
      if (taxable <= prev) break;
      const slice = Math.min(taxable, b.upTo) - prev;
      tax += slice * b.rate;
      prev = b.upTo;
    }
    return Math.max(0, +tax.toFixed(2));
  }

  function buildPayslip(monthsAgo, basic, opts) {
    opts = opts || {};
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0); // last day of that month
    const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
    const housing = 250;
    const transport = 90;
    const lunch = 60;
    const overtime = opts.overtime != null ? opts.overtime : (monthsAgo % 3 === 0 ? 120 : 0);
    const allowances = housing + transport + lunch;
    const gross = basic + allowances + overtime;

    const paye = computePAYE(gross);
    const nssa = +(basic * 0.045).toFixed(2);
    const aidsLevy = +(paye * 0.03).toFixed(2);
    const medical = 35;
    const pension = +(basic * 0.05).toFixed(2);
    const union = 4;
    const totalDeductions = +(paye + nssa + aidsLevy + medical + pension + union).toFixed(2);
    const net = +(gross - totalDeductions).toFixed(2);

    return {
      id: 'PS-' + isoDay(periodEnd),
      period: isoDay(periodEnd),
      periodLabel: fmtMonth(isoDay(periodEnd)),
      periodStart: isoDay(periodStart),
      periodEnd: isoDay(periodEnd),
      payDate: isoDay(periodEnd),
      gross: +gross.toFixed(2),
      net: net,
      earnings: {
        basic: basic,
        housing: housing,
        transport: transport,
        lunch: lunch,
        overtime: overtime,
      },
      deductions: {
        paye: paye,
        nssa: nssa,
        aidsLevy: aidsLevy,
        medical: medical,
        pension: pension,
        union: union,
        total: totalDeductions,
      },
      status: 'Paid',
    };
  }

  /* ============================================================ SEED */
  function seed() {
    if (read(KEYS.seedVersion) === SEED_VERSION) return;

    // User
    write(KEYS.user, {
      name: 'Chipo Mutasa',
      initials: 'CM',
      empId: 'EMP-00284',
      role: 'Branch supervisor · grade B4',
      branch: 'Park Centre',
      bank: 'CBZ ****8311',
      email: 'chipo.mutasa@huchu.co.zw',
      manager: 'Tendai Moyo',
    });

    // 12 payslips
    const basic = 2000;
    const payslips = [];
    for (let i = 0; i < 12; i++) {
      payslips.push(buildPayslip(i, basic));
    }
    write(KEYS.payslips, payslips);

    // 3 prior own leave requests (mix of status)
    const today = new Date();
    const y = today.getFullYear();
    const ownLeave = [
      {
        id: uid('LR'),
        type: 'Annual',
        startDate: y + '-03-11',
        endDate: y + '-03-12',
        days: 2,
        reason: 'Family funeral arrangements in Mutare.',
        status: 'Approved',
        submitted: y + '-03-08',
        decidedAt: y + '-03-09',
        approver: 'Tendai Moyo',
      },
      {
        id: uid('LR'),
        type: 'Sick',
        startDate: y + '-04-22',
        endDate: y + '-04-22',
        days: 1,
        reason: 'Migraine, doctor advised one day rest.',
        status: 'Approved',
        submitted: y + '-04-22',
        decidedAt: y + '-04-23',
        approver: 'Tendai Moyo',
      },
      {
        id: uid('LR'),
        type: 'Annual',
        startDate: y + '-07-14',
        endDate: y + '-07-18',
        days: 5,
        reason: 'Trip to Victoria Falls with family.',
        status: 'Pending',
        submitted: isoDay(today),
        decidedAt: null,
        approver: 'Tendai Moyo',
      },
    ];
    write(KEYS.leave, ownLeave);

    // 4 direct reports + their pending leave requests
    const teamLeave = [
      {
        id: uid('TLR'),
        requester: 'Anesu Ncube',
        initials: 'AN',
        role: 'Assistant supervisor',
        type: 'Annual',
        startDate: y + '-06-25',
        endDate: y + '-06-27',
        days: 3,
        reason: 'Sister\'s wedding in Bulawayo. Cover arranged with Faith.',
        status: 'Pending',
        submitted: y + '-06-01',
        decidedAt: null,
      },
      {
        id: uid('TLR'),
        requester: 'Faith Moyo',
        initials: 'FM',
        role: 'Senior cashier',
        type: 'Sick',
        startDate: y + '-06-12',
        endDate: y + '-06-13',
        days: 2,
        reason: 'Flu — doctor\'s note attached.',
        status: 'Pending',
        submitted: y + '-06-11',
        decidedAt: null,
      },
      {
        id: uid('TLR'),
        requester: 'Tatenda Chari',
        initials: 'TC',
        role: 'Cashier',
        type: 'Compassionate',
        startDate: y + '-06-15',
        endDate: y + '-06-17',
        days: 3,
        reason: 'Bereavement — uncle.',
        status: 'Pending',
        submitted: y + '-06-09',
        decidedAt: null,
      },
      {
        id: uid('TLR'),
        requester: 'Bothwell Phiri',
        initials: 'BP',
        role: 'Stock assistant',
        type: 'Annual',
        startDate: y + '-08-04',
        endDate: y + '-08-08',
        days: 5,
        reason: 'Pre-booked annual leave.',
        status: 'Pending',
        submitted: y + '-06-02',
        decidedAt: null,
      },
    ];
    write(KEYS.teamLeave, teamLeave);

    // 7-day seeded clock events (so the time clock has history to show)
    const clockEvents = [];
    for (let i = 6; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // skip Sunday
      if (d.getDay() === 0) continue;
      const inT = new Date(d); inT.setHours(7, 42, 0, 0);
      const outT = new Date(d); outT.setHours(17, 8 + (i % 5), 0, 0);
      clockEvents.push({ id: uid('CE'), type: 'in',  ts: inT.toISOString(),  location: 'Avondale Branch', withinGeofence: true });
      clockEvents.push({ id: uid('CE'), type: 'out', ts: outT.toISOString(), location: 'Avondale Branch', withinGeofence: true });
    }
    write(KEYS.clock, clockEvents);

    // ~20 directory entries
    const directory = [
      { id: 'EMP-00142', name: 'Tendai Moyo',        initials: 'TM', role: 'Operations manager',         dept: 'Operations', branch: 'Park Centre',    phone: '+263 77 414 0298', email: 'tendai.moyo@huchu.co.zw',       office: 'Park Centre, Harare',     manager: 'Brighton Sibanda' },
      { id: 'EMP-00187', name: 'Rumbidzai Chivasa',  initials: 'RC', role: 'HR business partner',        dept: 'HR',         branch: 'Head office',    phone: '+263 77 220 9114', email: 'rumbidzai.chivasa@huchu.co.zw', office: 'Head office, Borrowdale', manager: 'Patience Dube' },
      { id: 'EMP-00065', name: 'Brighton Sibanda',   initials: 'BS', role: 'Regional manager',           dept: 'Operations', branch: 'Bulawayo',       phone: '+263 71 555 8810', email: 'brighton.sibanda@huchu.co.zw',  office: 'Bulawayo branch',         manager: 'Patience Dube' },
      { id: 'EMP-00301', name: 'Faith Moyo',         initials: 'FM', role: 'Senior cashier',             dept: 'Retail',     branch: 'Park Centre',    phone: '+263 78 112 4502', email: 'faith.moyo@huchu.co.zw',        office: 'Park Centre, Harare',     manager: 'Chipo Mutasa' },
      { id: 'EMP-00322', name: 'Anesu Ncube',        initials: 'AN', role: 'Assistant supervisor',       dept: 'Retail',     branch: 'Park Centre',    phone: '+263 77 002 9384', email: 'anesu.ncube@huchu.co.zw',       office: 'Park Centre, Harare',     manager: 'Chipo Mutasa' },
      { id: 'EMP-00091', name: 'Patience Dube',      initials: 'PD', role: 'Finance director',           dept: 'Finance',    branch: 'Head office',    phone: '+263 77 309 1228', email: 'patience.dube@huchu.co.zw',     office: 'Head office, Borrowdale', manager: '—' },
      { id: 'EMP-00256', name: 'Simbarashe Maposa',  initials: 'SM', role: 'IT support engineer',        dept: 'IT',         branch: 'Head office',    phone: '+263 78 919 3201', email: 'simbarashe.maposa@huchu.co.zw', office: 'Head office, Borrowdale', manager: 'Lovemore Banda' },
      { id: 'EMP-00198', name: 'Nyasha Mhlanga',     initials: 'NM', role: 'Warehouse lead',             dept: 'Logistics',  branch: 'Msasa DC',       phone: '+263 77 442 1019', email: 'nyasha.mhlanga@huchu.co.zw',    office: 'Msasa distribution',      manager: 'Brighton Sibanda' },
      { id: 'EMP-00226', name: 'Takudzwa Kativhu',   initials: 'TK', role: 'Branch supervisor',          dept: 'Retail',     branch: 'Mutare',         phone: '+263 71 818 2255', email: 'takudzwa.kativhu@huchu.co.zw',  office: 'Mutare branch',           manager: 'Brighton Sibanda' },
      { id: 'EMP-00410', name: 'Tatenda Chari',      initials: 'TC', role: 'Cashier',                    dept: 'Retail',     branch: 'Park Centre',    phone: '+263 77 555 0119', email: 'tatenda.chari@huchu.co.zw',     office: 'Park Centre, Harare',     manager: 'Chipo Mutasa' },
      { id: 'EMP-00415', name: 'Bothwell Phiri',     initials: 'BP', role: 'Stock assistant',            dept: 'Retail',     branch: 'Park Centre',    phone: '+263 78 200 4480', email: 'bothwell.phiri@huchu.co.zw',    office: 'Park Centre, Harare',     manager: 'Chipo Mutasa' },
      { id: 'EMP-00088', name: 'Lovemore Banda',     initials: 'LB', role: 'Head of IT',                 dept: 'IT',         branch: 'Head office',    phone: '+263 77 333 9920', email: 'lovemore.banda@huchu.co.zw',    office: 'Head office, Borrowdale', manager: 'Patience Dube' },
      { id: 'EMP-00134', name: 'Joyce Mafuta',       initials: 'JM', role: 'Payroll officer',            dept: 'Finance',    branch: 'Head office',    phone: '+263 71 707 8821', email: 'joyce.mafuta@huchu.co.zw',      office: 'Head office, Borrowdale', manager: 'Patience Dube' },
      { id: 'EMP-00276', name: 'Kuda Nyamayaro',     initials: 'KN', role: 'Marketing executive',        dept: 'Marketing',  branch: 'Head office',    phone: '+263 77 414 6603', email: 'kuda.nyamayaro@huchu.co.zw',    office: 'Head office, Borrowdale', manager: 'Patience Dube' },
      { id: 'EMP-00388', name: 'Vimbai Chigwedere',  initials: 'VC', role: 'Customer service lead',      dept: 'Retail',     branch: 'Park Centre',    phone: '+263 78 110 4502', email: 'vimbai.chigwedere@huchu.co.zw', office: 'Park Centre, Harare',     manager: 'Chipo Mutasa' },
      { id: 'EMP-00211', name: 'Garikai Mupfumira',  initials: 'GM', role: 'Driver',                     dept: 'Logistics',  branch: 'Msasa DC',       phone: '+263 77 901 3344', email: 'garikai.mupfumira@huchu.co.zw', office: 'Msasa distribution',      manager: 'Nyasha Mhlanga' },
      { id: 'EMP-00118', name: 'Hilda Sithole',      initials: 'HS', role: 'HR officer',                 dept: 'HR',         branch: 'Head office',    phone: '+263 71 044 8821', email: 'hilda.sithole@huchu.co.zw',     office: 'Head office, Borrowdale', manager: 'Rumbidzai Chivasa' },
      { id: 'EMP-00292', name: 'Ronald Madziva',     initials: 'RM', role: 'Security supervisor',        dept: 'Operations', branch: 'Park Centre',    phone: '+263 77 656 1190', email: 'ronald.madziva@huchu.co.zw',    office: 'Park Centre, Harare',     manager: 'Tendai Moyo' },
      { id: 'EMP-00343', name: 'Memory Tafadzwa',    initials: 'MT', role: 'Procurement officer',        dept: 'Finance',    branch: 'Head office',    phone: '+263 78 504 1100', email: 'memory.tafadzwa@huchu.co.zw',   office: 'Head office, Borrowdale', manager: 'Patience Dube' },
      { id: 'EMP-00159', name: 'Ezra Mukamuri',      initials: 'EM', role: 'Compliance analyst',         dept: 'Finance',    branch: 'Head office',    phone: '+263 77 232 0098', email: 'ezra.mukamuri@huchu.co.zw',     office: 'Head office, Borrowdale', manager: 'Patience Dube' },
    ];
    write(KEYS.directory, directory);

    if (read(KEYS.isManager) == null) write(KEYS.isManager, true); // default ON so manager flow is discoverable

    write(KEYS.seedVersion, SEED_VERSION);
  }

  /* ============================================================ PUBLIC API */
  const Staff = {
    KEYS: KEYS,
    seed: seed,
    user: function () { return read(KEYS.user); },
    payslips: function () { return read(KEYS.payslips, []); },
    payslipById: function (id) { return (read(KEYS.payslips, []) || []).find(p => p.id === id); },

    leave: function () { return read(KEYS.leave, []); },
    addLeave: function (req) {
      const list = read(KEYS.leave, []);
      const days = diffDays(req.startDate, req.endDate);
      const entry = {
        id: uid('LR'),
        type: req.type,
        startDate: req.startDate,
        endDate: req.endDate,
        days: days,
        reason: req.reason || '',
        status: 'Pending',
        submitted: isoDay(new Date()),
        decidedAt: null,
        approver: 'Tendai Moyo',
      };
      list.unshift(entry);
      write(KEYS.leave, list);
      return entry;
    },

    teamLeave: function () { return read(KEYS.teamLeave, []); },
    decideTeamLeave: function (id, decision) {
      const list = read(KEYS.teamLeave, []);
      const it = list.find(x => x.id === id);
      if (!it) return null;
      it.status = decision; // 'Approved' | 'Declined'
      it.decidedAt = isoDay(new Date());
      write(KEYS.teamLeave, list);
      return it;
    },

    clockEvents: function () { return read(KEYS.clock, []); },
    isClockedIn: function () {
      const evs = read(KEYS.clock, []);
      if (!evs.length) return false;
      return evs[evs.length - 1].type === 'in';
    },
    clockIn: function () {
      // mock geolocation: 80% within geofence
      const withinGeofence = Math.random() > 0.2;
      const ev = {
        id: uid('CE'),
        type: 'in',
        ts: new Date().toISOString(),
        location: 'Avondale Branch',
        withinGeofence: withinGeofence,
      };
      const list = read(KEYS.clock, []);
      list.push(ev);
      write(KEYS.clock, list);
      return ev;
    },
    clockOut: function () {
      const ev = {
        id: uid('CE'),
        type: 'out',
        ts: new Date().toISOString(),
        location: 'Avondale Branch',
        withinGeofence: true,
      };
      const list = read(KEYS.clock, []);
      list.push(ev);
      write(KEYS.clock, list);
      return ev;
    },
    todayEvents: function () {
      const today = isoDay(new Date());
      return read(KEYS.clock, []).filter(e => e.ts.slice(0, 10) === today);
    },
    weekSummary: function () {
      // last 7 days totals (paired in/out)
      const out = [];
      const today = new Date();
      const evs = read(KEYS.clock, []);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const day = isoDay(d);
        const dayEvs = evs.filter(e => e.ts.slice(0, 10) === day).sort((a, b) => a.ts.localeCompare(b.ts));
        let mins = 0;
        for (let j = 0; j < dayEvs.length - 1; j += 2) {
          if (dayEvs[j].type === 'in' && dayEvs[j+1] && dayEvs[j+1].type === 'out') {
            mins += (new Date(dayEvs[j+1].ts) - new Date(dayEvs[j].ts)) / 60000;
          }
        }
        out.push({ day: day, minutes: mins });
      }
      return out;
    },
    todayMinutesSoFar: function () {
      const evs = this.todayEvents().sort((a, b) => a.ts.localeCompare(b.ts));
      let mins = 0;
      for (let i = 0; i < evs.length; i++) {
        if (evs[i].type === 'in') {
          const next = evs[i+1];
          const end = next ? new Date(next.ts) : new Date();
          mins += (end - new Date(evs[i].ts)) / 60000;
          if (next) i++; // skip the out we just consumed
        }
      }
      return mins;
    },

    directory: function () { return read(KEYS.directory, []); },
    directoryById: function (id) { return (read(KEYS.directory, []) || []).find(p => p.id === id); },

    isManager: function () {
      const v = read(KEYS.isManager);
      return v == null ? false : !!v;
    },
    setManager: function (v) { write(KEYS.isManager, !!v); },

    // helpers
    fmtDate: fmtDate,
    fmtDateShort: fmtDateShort,
    fmtMonth: fmtMonth,
    fmtMoney: fmtMoney,
    fmtTime: fmtTime,
    fmtHM: fmtHM,
    isoDay: isoDay,
    diffDays: diffDays,
    computePAYE: computePAYE,
  };

  // Eagerly seed before DOMContentLoaded so any inline scripts can read data.
  seed();

  window.Staff = Staff;
})();
