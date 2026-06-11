/* Student portal prototype — shared state + behavior for timetable,
   assignments, library. Vanilla JS, localStorage persistence.
   Storage prefix: corelith:student: */

(function () {
  'use strict';

  const NS = 'corelith:student:';
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const STUDENT = { id: 'tatenda-2026', name: 'Tatenda Moyo', form: 'Form 4 Faraday', school: "St Faith's Park" };

  /* ---------- Storage helpers ---------- */
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(NS + key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) {}
  }

  /* ---------- Seed data ---------- */

  // Full Mon–Fri timetable. 8 periods/day, 24h times.
  // Periods 1–8 with a fixed slot layout. Includes break/lunch indicators on
  // the lesson when applicable. Subjects use Zimbabwe Form 4 syllabus.
  const PERIOD_SLOTS = [
    { period: 1, start: '08:00', end: '08:40' },
    { period: 2, start: '08:45', end: '09:25' },
    { period: 3, start: '09:30', end: '10:10' },
    { period: 4, start: '10:30', end: '11:10' }, // after 20-min break
    { period: 5, start: '11:15', end: '11:55' },
    { period: 6, start: '12:00', end: '12:40' },
    { period: 7, start: '13:30', end: '14:10' }, // after lunch
    { period: 8, start: '14:15', end: '14:55' }
  ];

  function L(subject, teacher, room, topic, homework, materials) {
    return { subject, teacher, room, topic, homework: homework || '', materials: materials || '' };
  }

  const WEEK = {
    Mon: [
      L('Maths', 'Ms Sibanda', 'A12', 'Quadratic equations — factorisation', 'Ex 12B p.188 Q1–8', 'Calculator, exercise book'),
      L('English', 'Mr Ndlovu', 'B04', '"Nervous Conditions" — chapter 4 discussion', 'Read chapter 5', 'Text, notebook'),
      L('Shona', 'Mrs Mlilo', 'A07', 'Tsumo nemadimikira', 'Nyora tsumo gumi nemirevo yadzo', 'Bhuku reChiShona'),
      L('History', 'Mr Chigumira', 'A04', 'Causes of WWI', 'Source analysis worksheet', 'History textbook'),
      L('Geography', 'Mrs Chivasa', 'C01', 'Plate tectonics', '', 'Atlas, ruler'),
      L('Biology', 'Dr Mawere', 'Lab 3', 'Photosynthesis', 'Diagram of leaf cross-section', 'Lab book, pencils'),
      L('Religious Studies', 'Mrs Chivasa', 'B02', 'Sermon on the Mount', '', 'Bible'),
      L('Combined Science', 'Mr Tafara', 'Lab 1', 'Energy & work', '', 'Calculator')
    ],
    Tue: [
      L('English', 'Mr Ndlovu', 'B04', 'Comprehension practice', '', 'Notebook'),
      L('Maths', 'Ms Sibanda', 'A12', 'Quadratic equations — completing the square', 'Ex 13A Q1–6', 'Calculator'),
      L('Chemistry', 'Mr Tafara', 'Lab 2', 'Acids & bases', 'Lab report due Wed', 'Lab book'),
      L('Shona', 'Mrs Mlilo', 'A07', 'Rondedzero — tsika dzedu', 'Nyora rondedzero ye800 mazwi', 'Notebook'),
      L('Physics', 'Dr Mawere', 'Lab 1', 'Forces & motion', '', 'Calculator, notebook'),
      L('Geography', 'Mrs Chivasa', 'C01', 'Climate zones of Africa', '', 'Atlas'),
      L('History', 'Mr Chigumira', 'A04', 'Trenches & total war', '', 'Textbook'),
      L('English', 'Mr Ndlovu', 'B04', 'Essay writing — argument structure', '', 'Notebook')
    ],
    Wed: [
      L('Biology', 'Dr Mawere', 'Lab 3', 'Respiration — quiz', 'Revise chapters 6–7', 'Lab book'),
      L('Shona', 'Mrs Mlilo', 'A07', 'Ngano dzeChiShona', '', 'Bhuku'),
      L('Maths', 'Ms Sibanda', 'A12', 'Trigonometry — sine & cosine', 'Ex 14A Q1–10', 'Calculator, protractor'),
      L('English', 'Mr Ndlovu', 'B04', 'Poetry analysis', 'Annotate poem handout', 'Notebook'),
      L('Combined Science', 'Mr Tafara', 'Lab 1', 'Electricity — circuits', '', 'Lab book'),
      L('Religious Studies', 'Mrs Chivasa', 'B02', 'Parable of the talents', 'Reflection — 1 page', 'Bible, notebook'),
      L('History', 'Mr Chigumira', 'A04', 'Treaty of Versailles', '', 'Textbook'),
      L('Geography', 'Mrs Chivasa', 'C01', 'Rivers & drainage', '', 'Atlas')
    ],
    Thu: [
      L('History', 'Mr Chigumira', 'A04', 'WWI primary source analysis', 'Source analysis due today', 'Textbook'),
      L('Maths', 'Ms Sibanda', 'A12', 'Trigonometry — tangent ratio', 'Ex 14B Q1–8', 'Calculator'),
      L('English', 'Mr Ndlovu', 'B04', '"Nervous Conditions" — book review prep', 'Plan book review', 'Text'),
      L('Chemistry', 'Mr Tafara', 'Lab 2', 'Reactions & equations', '', 'Lab book'),
      L('Shona', 'Mrs Mlilo', 'A07', 'Upangiri', '', 'Bhuku'),
      L('Biology', 'Dr Mawere', 'Lab 3', 'Human nutrition', '', 'Lab book'),
      L('Religious Studies', 'Mrs Chivasa', 'B02', 'Ethics of work', '', 'Bible'),
      L('Geography', 'Mrs Chivasa', 'C01', 'Population & migration', '', 'Atlas')
    ],
    Fri: [
      L('Maths', 'Ms Sibanda', 'A12', 'Practice paper — revision', '', 'Calculator'),
      L('Shona', 'Mrs Mlilo', 'A07', 'Mubvunzo wechiShona', '', 'Bhuku'),
      L('Biology', 'Dr Mawere', 'Lab 3', 'Genetics — intro', '', 'Lab book'),
      L('English', 'Mr Ndlovu', 'B04', 'Book review — submission', 'Book review due today', 'Text'),
      L('Physics', 'Dr Mawere', 'Lab 1', 'Waves & sound', '', 'Calculator'),
      L('History', 'Mr Chigumira', 'A04', 'Inter-war years', '', 'Textbook'),
      L('Combined Science', 'Mr Tafara', 'Lab 1', 'Catch-up & revision', '', 'Lab book'),
      L('Geography', 'Mrs Chivasa', 'C01', 'Settlement patterns', '', 'Atlas')
    ]
  };

  function buildTimetable() {
    const tt = {};
    DAYS.forEach((day) => {
      tt[day] = WEEK[day].map((l, i) => Object.assign({ id: day + '-' + (i + 1) }, PERIOD_SLOTS[i], l));
    });
    return tt;
  }

  // 12 assignments mixed statuses.
  function seedAssignments() {
    const today = new Date();
    const due = (offsetDays) => {
      const d = new Date(today); d.setDate(d.getDate() + offsetDays); d.setHours(17, 0, 0, 0);
      return d.toISOString();
    };
    return [
      { id: 'a1',  subject: 'Shona',             title: 'Tsika dzedu — rondedzero',          teacher: 'Mrs Mlilo',     dueAt: due(-1), description: 'Nyora rondedzero ine mazwi anosvika 800 pamusoro pe tsika dzedu dzechiShona.', status: 'in-progress', note: '' },
      { id: 'a2',  subject: 'Maths',             title: 'Exercise 12B — Quadratics',         teacher: 'Ms Sibanda',    dueAt: due(0),  description: 'Textbook pp. 188–190. Show all working.', status: 'in-progress', note: '' },
      { id: 'a3',  subject: 'Combined Science',  title: 'Photosynthesis lab report',         teacher: 'Mr Tafara',     dueAt: due(2),  description: 'Use template provided. Graph required.', status: 'not-started', note: '' },
      { id: 'a4',  subject: 'History',           title: 'WWI primary source analysis',       teacher: 'Mr Chigumira',  dueAt: due(3),  description: '2 sources. Cover context, content, conclusion.', status: 'not-started', note: '' },
      { id: 'a5',  subject: 'English',           title: '"Nervous Conditions" book review',  teacher: 'Mr Ndlovu',     dueAt: due(4),  description: '500 words. Cite at least 3 passages.', status: 'not-started', note: '' },
      { id: 'a6',  subject: 'Religious Studies', title: 'Parable of the talents — reflection', teacher: 'Mrs Chivasa', dueAt: due(-3), description: '1 page. Personal application.', status: 'done', note: '' },
      { id: 'a7',  subject: 'Biology',           title: 'Cell respiration worksheet',        teacher: 'Dr Mawere',     dueAt: due(-5), description: 'Complete diagram + 6 short questions.', status: 'done', note: '' },
      { id: 'a8',  subject: 'Chemistry',         title: 'Acids & bases — practical write-up', teacher: 'Mr Tafara',    dueAt: due(-2), description: 'Lab notebook write-up.', status: 'done', note: '' },
      { id: 'a9',  subject: 'Geography',         title: 'Plate tectonics diagram',           teacher: 'Mrs Chivasa',   dueAt: due(-4), description: 'Labelled cross-section.', status: 'done', note: '' },
      { id: 'a10', subject: 'Physics',           title: 'Forces & motion problems',          teacher: 'Dr Mawere',     dueAt: due(-2), description: 'Q1–10 from worksheet.', status: 'done', note: '' },
      { id: 'a11', subject: 'Maths',             title: 'Trigonometry — Ex 14A',             teacher: 'Ms Sibanda',    dueAt: due(5),  description: 'Q1–10 with diagrams.', status: 'not-started', note: '' },
      { id: 'a12', subject: 'Shona',             title: 'Tsumo nemadimikira — list',         teacher: 'Mrs Mlilo',     dueAt: due(6),  description: 'Nyora tsumo gumi nemirevo.', status: 'not-started', note: '' }
    ];
  }

  // 20-book library catalog.
  function seedCatalog() {
    return [
      { id: 'b01', isbn: '978-0-94-722378-5', title: 'Nervous Conditions',           author: 'Tsitsi Dangarembga', subject: 'English literature' },
      { id: 'b02', isbn: '978-0-86-922011-2', title: 'House of Hunger',              author: 'Dambudzo Marechera', subject: 'English literature' },
      { id: 'b03', isbn: '978-0-13-447042-9', title: 'New General Mathematics Book 4', author: 'JB Channon',       subject: 'Mathematics' },
      { id: 'b04', isbn: '978-0-86-922089-1', title: 'Feso',                          author: 'Solomon Mutswairo',  subject: 'ChiShona' },
      { id: 'b05', isbn: '978-0-79-741112-3', title: 'Things Fall Apart',             author: 'Chinua Achebe',      subject: 'English literature' },
      { id: 'b06', isbn: '978-0-44-849146-6', title: 'A Grain of Wheat',              author: 'Ngugi wa Thiong\'o', subject: 'English literature' },
      { id: 'b07', isbn: '978-0-86-922200-0', title: 'Mhuri Yamutemai',               author: 'Patrick Chakaipa',   subject: 'ChiShona' },
      { id: 'b08', isbn: '978-0-86-922255-0', title: 'Tsumo na Madimikira',           author: 'Mordikai Hamutyinei', subject: 'ChiShona' },
      { id: 'b09', isbn: '978-0-86-922301-4', title: 'Harvest of Thorns',             author: 'Shimmer Chinodya',   subject: 'English literature' },
      { id: 'b10', isbn: '978-0-86-922455-4', title: 'Waiting for the Rain',          author: 'Charles Mungoshi',   subject: 'English literature' },
      { id: 'b11', isbn: '978-0-86-922488-2', title: 'Bones',                         author: 'Chenjerai Hove',     subject: 'English literature' },
      { id: 'b12', isbn: '978-0-19-913822-5', title: 'Combined Science for ZIMSEC',   author: 'M. Mhike',           subject: 'Combined Science' },
      { id: 'b13', isbn: '978-0-19-913844-7', title: 'Step Ahead Geography Bk 4',     author: 'T. Mawoyo',          subject: 'Geography' },
      { id: 'b14', isbn: '978-0-19-913910-9', title: 'African History Today',         author: 'N. Bhebe',           subject: 'History' },
      { id: 'b15', isbn: '978-0-19-913977-2', title: 'Biology for O-Level',           author: 'Mary Jones',         subject: 'Biology' },
      { id: 'b16', isbn: '978-0-19-914055-6', title: 'Chemistry Essentials',          author: 'P. Bhebe',           subject: 'Chemistry' },
      { id: 'b17', isbn: '978-0-19-914122-5', title: 'Physics — Principles',          author: 'A. Mhandu',          subject: 'Physics' },
      { id: 'b18', isbn: '978-0-19-914155-3', title: 'Bible Knowledge for O-Level',   author: 'Rev. Ndoro',         subject: 'Religious Studies' },
      { id: 'b19', isbn: '978-0-86-922711-1', title: 'Black Sunlight',                author: 'Dambudzo Marechera', subject: 'English literature' },
      { id: 'b20', isbn: '978-0-86-922755-5', title: 'Pawns',                         author: 'Edmund Chipamaunga', subject: 'History' }
    ];
  }

  // Two initial borrows (one overdue).
  function seedBorrows(catalog) {
    const today = new Date();
    const iso = (offsetDays) => { const d = new Date(today); d.setDate(d.getDate() + offsetDays); d.setHours(17,0,0,0); return d.toISOString(); };
    return [
      { id: 'br1', bookId: 'b01', borrowedAt: iso(-7), dueAt: iso(7),  returnedAt: null },
      { id: 'br2', bookId: 'b03', borrowedAt: iso(-20), dueAt: iso(-6), returnedAt: null }
    ];
  }

  /* ---------- State init (lazy) ---------- */

  function getTimetable() {
    let tt = load('timetable', null);
    if (!tt) { tt = buildTimetable(); save('timetable', tt); }
    return tt;
  }
  function getAssignments() {
    let a = load('assignments', null);
    if (!a) { a = seedAssignments(); save('assignments', a); }
    return a;
  }
  function saveAssignments(a) { save('assignments', a); }
  function getCatalog() {
    let c = load('catalog', null);
    if (!c) { c = seedCatalog(); save('catalog', c); }
    return c;
  }
  function getBorrows() {
    let b = load('borrows', null);
    if (!b) { b = seedBorrows(getCatalog()); save('borrows', b); }
    return b;
  }
  function saveBorrows(b) { save('borrows', b); }

  /* ---------- Utilities ---------- */

  function fmtTime(hhmm) { return hhmm; }
  function fmtPeriod(p) { return p.start + '–' + p.end; }

  function parseHHMM(s) {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  }

  function dayKeyFromDate(d) {
    // 0 = Sun, 1 = Mon ... Map onto our DAYS array. Weekend defaults to Mon.
    const idx = d.getDay() - 1;
    if (idx < 0 || idx > 4) return 'Mon';
    return DAYS[idx];
  }

  function todayKey() { return dayKeyFromDate(new Date()); }
  function tomorrowKey() { const d = new Date(); d.setDate(d.getDate() + 1); return dayKeyFromDate(d); }

  function nowMinutes() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

  function liveNowPeriodId(dayKey) {
    if (dayKey !== todayKey()) return null;
    const tt = getTimetable();
    const now = nowMinutes();
    const periods = tt[dayKey];
    for (const p of periods) {
      if (now >= parseHHMM(p.start) && now < parseHHMM(p.end)) return p.id;
    }
    return null;
  }

  function fmtDueDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.round(diffMs / 86400000);
    const opts = { weekday: 'short', day: '2-digit', month: 'short' };
    const dateStr = d.toLocaleDateString('en-GB', opts);
    if (diffDays < 0) return { label: 'Overdue · ' + dateStr, tone: 'overdue' };
    if (diffDays === 0) return { label: 'Today · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), tone: 'urgent' };
    if (diffDays === 1) return { label: 'Tomorrow · ' + dateStr, tone: 'urgent' };
    if (diffDays <= 6) return { label: 'In ' + diffDays + ' days · ' + dateStr, tone: 'normal' };
    return { label: dateStr, tone: 'normal' };
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function subjectClass(subject) {
    const map = {
      'Maths': 's-maths', 'Mathematics': 's-maths',
      'English': 's-english',
      'Shona': 's-shona', 'ChiShona': 's-shona',
      'History': 's-history',
      'Geography': 's-geo',
      'Biology': 's-bio',
      'Chemistry': 's-chem',
      'Physics': 's-phys',
      'Combined Science': 's-sci',
      'Religious Studies': 's-rs'
    };
    return map[subject] || 's-default';
  }

  /* ---------- FLOW 1 — Timetable ---------- */

  function initTimetable() {
    const tabsEl = document.querySelector('[data-tt-tabs]');
    const listEl = document.querySelector('[data-tt-list]');
    const dayLabelEl = document.querySelector('[data-tt-day-label]');
    if (!tabsEl || !listEl) return;

    const initial = load('lastDay', null) || 'today';
    setActiveTab(initial);

    tabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-tt-tab]');
      if (!btn) return;
      const key = btn.getAttribute('data-tt-tab');
      setActiveTab(key);
    });

    function setActiveTab(key) {
      save('lastDay', key);
      tabsEl.querySelectorAll('button[data-tt-tab]').forEach((b) => {
        const on = b.getAttribute('data-tt-tab') === key;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      render(key);
    }

    function dayKeyFor(key) {
      if (key === 'today') return todayKey();
      if (key === 'tomorrow') return tomorrowKey();
      // "week" — show whole week
      return null;
    }

    function render(key) {
      const tt = getTimetable();
      const liveId = liveNowPeriodId(todayKey());

      if (key === 'week') {
        dayLabelEl.textContent = 'Next week — Monday to Friday';
        listEl.innerHTML = DAYS.map((d) => {
          const items = tt[d].map((p) => periodRow(p, false, d)).join('');
          return '<section class="tt-day"><h3>' + d + '</h3>' + items + '</section>';
        }).join('');
      } else {
        const dKey = dayKeyFor(key);
        const isToday = dKey === todayKey();
        const labelDate = labelForDayKey(key, dKey);
        dayLabelEl.textContent = labelDate;
        listEl.innerHTML = tt[dKey].map((p) => periodRow(p, isToday && p.id === liveId, dKey)).join('');
      }
    }

    function labelForDayKey(key, dKey) {
      const now = new Date();
      let d = new Date(now);
      if (key === 'tomorrow') d.setDate(d.getDate() + 1);
      return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' });
    }

    function periodRow(p, isLive, dayKeyVal) {
      const live = isLive ? ' is-live' : '';
      return (
        '<button class="tt-row ' + subjectClass(p.subject) + live + '" data-period-id="' + p.id + '" data-period-day="' + dayKeyVal + '" aria-label="Period ' + p.period + ', ' + escapeHtml(p.subject) + ', ' + p.start + ' to ' + p.end + '">' +
          '<span class="tt-time">' +
            '<span class="t1">' + p.start + '</span>' +
            '<span class="t2">' + p.end + '</span>' +
          '</span>' +
          '<span class="tt-body">' +
            '<span class="tt-subj">' + escapeHtml(p.subject) + (isLive ? ' <span class="live-dot" aria-label="Live now">Live now</span>' : '') + '</span>' +
            '<span class="tt-meta">' + escapeHtml(p.teacher) + ' · Room ' + escapeHtml(p.room) + '</span>' +
          '</span>' +
          '<span class="tt-arrow" aria-hidden="true">›</span>' +
        '</button>'
      );
    }

    // Drawer for period detail.
    const drawer = document.querySelector('[data-tt-drawer]');
    const drawerBody = document.querySelector('[data-tt-drawer-body]');
    const drawerClose = document.querySelector('[data-tt-drawer-close]');

    listEl.addEventListener('click', (e) => {
      const row = e.target.closest('button[data-period-id]');
      if (!row) return;
      const id = row.getAttribute('data-period-id');
      const dayKeyVal = row.getAttribute('data-period-day');
      const tt = getTimetable();
      const p = tt[dayKeyVal].find((x) => x.id === id);
      if (!p) return;
      openDrawer(p);
    });

    function openDrawer(p) {
      drawerBody.innerHTML =
        '<div class="dr-head"><span class="dr-period">Period ' + p.period + ' · ' + p.start + '–' + p.end + '</span></div>' +
        '<h2 class="dr-title">' + escapeHtml(p.subject) + '</h2>' +
        '<p class="dr-sub">' + escapeHtml(p.teacher) + ' · Room ' + escapeHtml(p.room) + '</p>' +
        '<dl class="dr-list">' +
          '<dt>Topic</dt><dd>' + escapeHtml(p.topic || '—') + '</dd>' +
          '<dt>Homework</dt><dd>' + escapeHtml(p.homework || 'None set') + '</dd>' +
          '<dt>Materials</dt><dd>' + escapeHtml(p.materials || 'Standard kit') + '</dd>' +
        '</dl>';
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      drawerClose && drawerClose.focus();
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawer) drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer(); });

    // 30s tick to refresh "live now".
    setInterval(() => {
      const key = load('lastDay', 'today');
      if (key === 'today') {
        const tt = getTimetable();
        const liveId = liveNowPeriodId(todayKey());
        listEl.querySelectorAll('.tt-row').forEach((row) => {
          const pid = row.getAttribute('data-period-id');
          const isLive = pid === liveId;
          row.classList.toggle('is-live', isLive);
          const subjEl = row.querySelector('.tt-subj');
          if (subjEl) {
            // Strip any existing live tag and re-add if needed.
            const p = tt[todayKey()].find((x) => x.id === pid);
            if (p) {
              subjEl.innerHTML = escapeHtml(p.subject) + (isLive ? ' <span class="live-dot" aria-label="Live now">Live now</span>' : '');
            }
          }
        });
      }
    }, 30000);
  }

  /* ---------- FLOW 2 — Assignments ---------- */

  function initAssignments() {
    const listEl = document.querySelector('[data-as-list]');
    const countEl = document.querySelector('[data-as-counts]');
    if (!listEl) return;

    let openId = null;

    function render() {
      const items = getAssignments();
      const outstanding = items.filter((a) => a.status !== 'done').length;
      const doneThisWeek = items.filter((a) => {
        if (a.status !== 'done') return false;
        const due = new Date(a.dueAt);
        const now = new Date();
        const diff = Math.abs(now - due) / 86400000;
        return diff <= 7;
      }).length;
      if (countEl) {
        countEl.innerHTML =
          '<span class="ct-pill"><b>' + outstanding + '</b> outstanding</span>' +
          '<span class="ct-pill ct-pill--done"><b>' + doneThisWeek + '</b> done this week</span>';
      }

      // Sort: not-done first by dueAt asc, then done.
      const sorted = items.slice().sort((a, b) => {
        const ad = a.status === 'done' ? 1 : 0;
        const bd = b.status === 'done' ? 1 : 0;
        if (ad !== bd) return ad - bd;
        return new Date(a.dueAt) - new Date(b.dueAt);
      });

      listEl.innerHTML = sorted.map(renderCard).join('');
    }

    function renderCard(a) {
      const due = fmtDueDate(a.dueAt);
      const expanded = a.id === openId;
      const statusLabel = a.status === 'done' ? 'Done' : a.status === 'in-progress' ? 'In progress' : 'Not started';
      const statusClass = 'st-' + a.status;
      return (
        '<article class="as-card ' + subjectClass(a.subject) + (expanded ? ' is-open' : '') + '" data-as-id="' + a.id + '">' +
          '<button class="as-head" data-as-toggle="' + a.id + '" aria-expanded="' + (expanded ? 'true' : 'false') + '">' +
            '<span class="as-tag" aria-hidden="true"></span>' +
            '<span class="as-meta-col">' +
              '<span class="as-subj">' + escapeHtml(a.subject) + '</span>' +
              '<span class="as-title">' + escapeHtml(a.title) + '</span>' +
              '<span class="as-due as-due--' + due.tone + '">' + escapeHtml(due.label) + '</span>' +
            '</span>' +
            '<span class="as-status ' + statusClass + '">' + statusLabel + '</span>' +
          '</button>' +
          (expanded ? renderDetail(a) : '') +
        '</article>'
      );
    }

    function renderDetail(a) {
      return (
        '<div class="as-detail">' +
          '<p class="as-desc">' + escapeHtml(a.description) + '</p>' +
          '<p class="as-teacher"><b>Teacher:</b> ' + escapeHtml(a.teacher) + '</p>' +
          '<div class="as-actions">' +
            (a.status !== 'in-progress' ? '<button class="btn-pri" data-as-set="in-progress" data-as-id="' + a.id + '">Mark in progress</button>' : '') +
            (a.status !== 'done' ? '<button class="btn-pri btn-pri--success" data-as-set="done" data-as-id="' + a.id + '">Mark done</button>' : '') +
            (a.status !== 'not-started' ? '<button class="btn-sec" data-as-set="not-started" data-as-id="' + a.id + '">Reset</button>' : '') +
          '</div>' +
          '<label class="as-note-label" for="as-note-' + a.id + '">Add note</label>' +
          '<textarea id="as-note-' + a.id + '" class="as-note" data-as-note="' + a.id + '" rows="2" placeholder="A note for yourself…">' + escapeHtml(a.note || '') + '</textarea>' +
        '</div>'
      );
    }

    listEl.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-as-toggle]');
      const setBtn = e.target.closest('[data-as-set]');
      if (setBtn) {
        const id = setBtn.getAttribute('data-as-id');
        const next = setBtn.getAttribute('data-as-set');
        const items = getAssignments();
        const target = items.find((x) => x.id === id);
        if (target) {
          target.status = next;
          saveAssignments(items);
          render();
        }
        return;
      }
      if (toggle) {
        const id = toggle.getAttribute('data-as-toggle');
        openId = openId === id ? null : id;
        render();
        // Move focus to the detail when opening.
        if (openId) {
          const note = document.querySelector('[data-as-note="' + openId + '"]');
          if (note) note.focus();
        }
      }
    });

    listEl.addEventListener('input', (e) => {
      const ta = e.target.closest('[data-as-note]');
      if (!ta) return;
      const id = ta.getAttribute('data-as-note');
      const items = getAssignments();
      const target = items.find((x) => x.id === id);
      if (target) {
        target.note = ta.value;
        saveAssignments(items);
      }
    });

    render();
  }

  /* ---------- FLOW 3 — Library ---------- */

  function initLibrary() {
    const borrowsEl = document.querySelector('[data-lib-borrows]');
    const scanBtn = document.querySelector('[data-lib-scan]');
    const modal = document.querySelector('[data-lib-modal]');
    const modalClose = document.querySelector('[data-lib-modal-close]');
    const modalScanTarget = document.querySelector('[data-lib-modal-scan]');
    const modalResult = document.querySelector('[data-lib-modal-result]');
    if (!borrowsEl) return;

    function render() {
      const borrows = getBorrows();
      const catalog = getCatalog();
      const now = new Date();
      const active = borrows.filter((b) => !b.returnedAt);
      const returned = borrows.filter((b) => b.returnedAt);

      const renderRow = (b, isReturned) => {
        const book = catalog.find((c) => c.id === b.bookId);
        if (!book) return '';
        const due = new Date(b.dueAt);
        const overdue = !isReturned && due < now;
        const dueLabel = isReturned
          ? 'Returned ' + new Date(b.returnedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          : 'Due ' + due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return (
          '<article class="lb-row' + (overdue ? ' is-overdue' : '') + '">' +
            '<span class="lb-cover" aria-hidden="true">' + escapeHtml(book.title.slice(0, 1)) + '</span>' +
            '<div class="lb-body">' +
              '<div class="lb-title">' + (overdue ? '<span class="lb-dot" aria-label="Overdue"></span>' : '') + escapeHtml(book.title) + '</div>' +
              '<div class="lb-author">' + escapeHtml(book.author) + ' · ' + escapeHtml(book.subject) + '</div>' +
              '<div class="lb-due' + (overdue ? ' is-overdue' : '') + '">' + escapeHtml(dueLabel) + '</div>' +
            '</div>' +
            (isReturned
              ? '<span class="lb-returned">Returned</span>'
              : '<button class="btn-pri btn-pri--small" data-lib-return="' + b.id + '">Return</button>') +
          '</article>'
        );
      };

      borrowsEl.innerHTML =
        '<h3 class="lb-sec">Borrowed · ' + active.length + '</h3>' +
        (active.length ? active.map((b) => renderRow(b, false)).join('') : '<p class="lb-empty">No books borrowed.</p>') +
        (returned.length ? '<h3 class="lb-sec">Recently returned</h3>' + returned.slice(-5).reverse().map((b) => renderRow(b, true)).join('') : '');
    }

    borrowsEl.addEventListener('click', (e) => {
      const ret = e.target.closest('[data-lib-return]');
      if (!ret) return;
      const id = ret.getAttribute('data-lib-return');
      const borrows = getBorrows();
      const target = borrows.find((b) => b.id === id);
      if (target) {
        target.returnedAt = new Date().toISOString();
        saveBorrows(borrows);
        render();
      }
    });

    // Scan modal (mock).
    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      modalResult.textContent = '';
      modalScanTarget && modalScanTarget.focus();
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
    if (scanBtn) scanBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal(); });

    if (modalScanTarget) {
      modalScanTarget.addEventListener('click', () => {
        const catalog = getCatalog();
        const borrows = getBorrows();
        const activeIds = new Set(borrows.filter((b) => !b.returnedAt).map((b) => b.bookId));
        const available = catalog.filter((b) => !activeIds.has(b.id));
        if (!available.length) {
          modalResult.innerHTML = '<p class="lib-scan-result lib-scan-result--empty">No books left to borrow!</p>';
          return;
        }
        const picked = available[Math.floor(Math.random() * available.length)];
        const now = new Date();
        const dueAt = new Date(now); dueAt.setDate(dueAt.getDate() + 14); dueAt.setHours(17, 0, 0, 0);
        const newBorrow = {
          id: 'br' + Date.now(),
          bookId: picked.id,
          borrowedAt: now.toISOString(),
          dueAt: dueAt.toISOString(),
          returnedAt: null
        };
        borrows.push(newBorrow);
        saveBorrows(borrows);
        modalResult.innerHTML =
          '<div class="lib-scan-result">' +
            '<div class="lib-scan-label">Scanned · ISBN ' + escapeHtml(picked.isbn) + '</div>' +
            '<div class="lib-scan-title">' + escapeHtml(picked.title) + '</div>' +
            '<div class="lib-scan-author">' + escapeHtml(picked.author) + '</div>' +
            '<div class="lib-scan-due">Due ' + dueAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + '</div>' +
          '</div>';
        render();
      });
    }

    render();
  }

  /* ---------- Dashboard tiles ---------- */

  function initDashboard() {
    const nextEl = document.querySelector('[data-dash-next]');
    const dueEl = document.querySelector('[data-dash-due]');
    const borrowEl = document.querySelector('[data-dash-borrowed]');
    if (nextEl) {
      const tt = getTimetable();
      const day = todayKey();
      const now = nowMinutes();
      const periods = tt[day];
      let upcoming = periods.find((p) => now < parseHHMM(p.end));
      if (!upcoming) upcoming = periods[periods.length - 1];
      nextEl.innerHTML =
        '<div class="dash-tile-label">' + (now >= parseHHMM(upcoming.start) && now < parseHHMM(upcoming.end) ? 'Now' : 'Next class') + '</div>' +
        '<div class="dash-tile-title">' + escapeHtml(upcoming.subject) + '</div>' +
        '<div class="dash-tile-sub">' + escapeHtml(upcoming.teacher) + ' · Room ' + escapeHtml(upcoming.room) + '</div>' +
        '<div class="dash-tile-meta">' + upcoming.start + '–' + upcoming.end + ' · Period ' + upcoming.period + '</div>';
    }
    if (dueEl) {
      const items = getAssignments();
      const outstanding = items.filter((a) => a.status !== 'done').length;
      const overdue = items.filter((a) => a.status !== 'done' && new Date(a.dueAt) < new Date()).length;
      dueEl.innerHTML =
        '<div class="dash-tile-label">Assignments</div>' +
        '<div class="dash-tile-title">' + outstanding + ' outstanding</div>' +
        '<div class="dash-tile-sub">' + overdue + ' overdue · ' + (items.length - outstanding) + ' done</div>';
    }
    if (borrowEl) {
      const borrows = getBorrows();
      const active = borrows.filter((b) => !b.returnedAt);
      const overdue = active.filter((b) => new Date(b.dueAt) < new Date()).length;
      borrowEl.innerHTML =
        '<div class="dash-tile-label">Library</div>' +
        '<div class="dash-tile-title">' + active.length + ' borrowed</div>' +
        '<div class="dash-tile-sub">' + (overdue ? overdue + ' overdue' : 'All on time') + '</div>';
    }
  }

  /* ---------- Boot ---------- */

  function boot() {
    // Force seed touch so localStorage exists from the first paint.
    getTimetable(); getAssignments(); getCatalog(); getBorrows();

    const screen = (document.body && document.body.getAttribute('data-screen')) || '';
    if (screen === 'timetable') initTimetable();
    if (screen === 'assignments') initAssignments();
    if (screen === 'library') initLibrary();
    if (screen === 'dashboard') initDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose for debugging.
  window.StudentApp = { load, save, getTimetable, getAssignments, getCatalog, getBorrows, STUDENT };
})();
