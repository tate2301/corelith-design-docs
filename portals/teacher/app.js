/* ============================================================
   Teacher portal · functional prototype
   Shared seed data, storage helpers, page dispatch.
   Vanilla JS, no deps. Persists to localStorage under
   the prefix corelith:teacher:
   ============================================================ */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // Storage
  // ─────────────────────────────────────────────────────────────
  const PREFIX = 'corelith:teacher:';
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(PREFIX + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
      catch (e) { /* quota */ }
    },
    has(key) {
      return localStorage.getItem(PREFIX + key) !== null;
    },
  };

  // ─────────────────────────────────────────────────────────────
  // Seed data — Zimbabwe Form 1-4 context
  // ─────────────────────────────────────────────────────────────
  const TEACHER = {
    id: 'tch_mhlanga',
    name: 'Mrs. Mhlanga',
    initials: 'PM',
    subjectsTaught: ['Maths', 'Combined Science', 'English', 'Geography'],
    role: 'Class teacher · Form 4A',
  };

  // Zimbabwe Form 1-4 syllabus subjects (commonly examined)
  const ZIM_SUBJECTS = [
    'Maths', 'English', 'Shona', 'Ndebele',
    'Combined Science', 'Biology', 'Chemistry', 'Physics',
    'Geography', 'History', 'Religious Studies',
    'Heritage Studies', 'Agriculture', 'Business Studies',
    'Accounts', 'Computer Science', 'Physical Education',
  ];

  // First names (deterministic seed pool)
  const FIRST = [
    'Tariro','Chipo','Tatenda','Tendai','Kudzai','Rufaro','Tafadzwa','Farai',
    'Tinashe','Tapiwa','Munashe','Anesu','Panashe','Vimbai','Rumbidzai','Nyasha',
    'Chiedza','Tanaka','Tanyaradzwa','Simbarashe','Munyaradzi','Blessing','Privilege','Pride',
    'Mufaro','Tichaona','Tonderai','Tatenda','Charity','Memory','Patience','Precious',
    'Brian','Brandon','Aaron','Andrew','Anesu','Believe','Praise','Tinotenda',
    'Wisdom','Talent','Gift','Hope','Faith','Mercy','Joy','Esther','Ruth','Sarah',
  ];
  const LAST = [
    'Moyo','Ncube','Dube','Sibanda','Nyathi','Mhlanga','Mpofu','Nkomo',
    'Chari','Madziva','Mutasa','Chigumba','Chikomba','Mawere','Mawenza','Mukwena',
    'Muzondo','Madzima','Mandebvu','Marufu','Chinyani','Chitsiga','Magaya','Tagwireyi',
    'Banda','Mlambo','Phiri','Tshuma','Mthethwa','Nare','Khumalo','Bhebhe',
  ];

  // Deterministic PRNG
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function initials(name) {
    return name.split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0,2);
  }

  function seedPupils(classId, count, rngSeed) {
    const rng = mulberry32(rngSeed);
    const seen = new Set();
    const out = [];
    let i = 1;
    while (out.length < count) {
      const name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
      if (seen.has(name)) continue;
      seen.add(name);
      const guardian = `${pick(rng, ['Mr','Mrs','Ms'])} ${name.split(' ')[1]}`;
      out.push({
        id: `${classId}_p${i}`,
        no: i,
        name,
        guardian,
        phone: `+263 7${Math.floor(rng()*9)+1} ${Math.floor(rng()*900+100)} ${Math.floor(rng()*9000+1000)}`,
      });
      i++;
    }
    return out;
  }

  function ensureSeed() {
    if (store.has('seeded')) return;

    const classes = [
      { id: 'f4a', name: 'Form 4A', count: 30, seed: 11 },
      { id: 'f3b', name: 'Form 3B', count: 32, seed: 23 },
      { id: 'f2c', name: 'Form 2C', count: 28, seed: 37 },
    ].map(c => ({ ...c, pupils: seedPupils(c.id, c.count, c.seed) }));

    store.set('classes', classes);
    store.set('teacher', TEACHER);
    store.set('subjects', ZIM_SUBJECTS);

    // Seed prior assessments — ~10 spread across classes
    const priors = [
      { id: 'as_1', classId: 'f4a', subject: 'Maths', name: 'Term 1 Test', max: 100, date: '2026-03-12' },
      { id: 'as_2', classId: 'f4a', subject: 'English', name: 'Comprehension Quiz', max: 100, date: '2026-03-20' },
      { id: 'as_3', classId: 'f4a', subject: 'Combined Science', name: 'Practical 1', max: 100, date: '2026-04-02' },
      { id: 'as_4', classId: 'f3b', subject: 'Maths', name: 'Algebra Test', max: 100, date: '2026-03-15' },
      { id: 'as_5', classId: 'f3b', subject: 'Geography', name: 'Map Reading', max: 100, date: '2026-03-28' },
      { id: 'as_6', classId: 'f3b', subject: 'Combined Science', name: 'Bio Quiz', max: 100, date: '2026-04-10' },
      { id: 'as_7', classId: 'f2c', subject: 'Maths', name: 'Arithmetic Test', max: 100, date: '2026-03-18' },
      { id: 'as_8', classId: 'f2c', subject: 'English', name: 'Composition', max: 100, date: '2026-03-25' },
      { id: 'as_9', classId: 'f2c', subject: 'Geography', name: 'Term 1 Test', max: 100, date: '2026-04-05' },
      { id: 'as_10', classId: 'f4a', subject: 'Maths', name: 'Term 2 Test', max: 100, date: '2026-06-08' },
    ];
    store.set('assessments', priors);

    // Seed prior marks for a couple so the gradebook has history
    const marks = {};
    const rng = mulberry32(99);
    ['as_1','as_2','as_4','as_7','as_8'].forEach(aid => {
      const a = priors.find(x => x.id === aid);
      const cls = classes.find(c => c.id === a.classId);
      marks[aid] = {};
      cls.pupils.forEach(p => {
        marks[aid][p.id] = Math.max(15, Math.min(98, Math.round(58 + rng()*30 - 12)));
      });
    });
    store.set('marks', marks);

    // Seed lessons — next 5 from teacher's timetable
    const today = new Date('2026-06-11');
    const lessons = [
      { id: 'ls_1', classId: 'f4a', subject: 'Maths', topic: 'Quadratic equations — factorising', date: '2026-06-11', time: '08:00', planned: false },
      { id: 'ls_2', classId: 'f3b', subject: 'Combined Science', topic: 'Photosynthesis recap', date: '2026-06-11', time: '10:30', planned: false },
      { id: 'ls_3', classId: 'f4a', subject: 'English', topic: 'Essay structure', date: '2026-06-12', time: '08:00', planned: false },
      { id: 'ls_4', classId: 'f2c', subject: 'Geography', topic: 'River systems of Zimbabwe', date: '2026-06-12', time: '11:00', planned: false },
      { id: 'ls_5', classId: 'f4a', subject: 'Maths', topic: 'Simultaneous equations', date: '2026-06-13', time: '09:00', planned: false },
    ];
    store.set('lessons', lessons);
    store.set('lessonPlans', {}); // by lesson id

    // Seed 5 prior sent messages
    const sent = [
      { id: 'm_1', date: '2026-06-09 14:22', classId: 'f4a', pupilId: 'f4a_p3', guardian: 'Mrs Sibanda', subject: 'Maths homework reminder', body: 'Good afternoon — please remind Tariro to bring her completed exercise book tomorrow. Many thanks.' },
      { id: 'm_2', date: '2026-06-08 09:10', classId: 'f3b', pupilId: 'f3b_p7', guardian: 'Mr Moyo', subject: 'Excellent test result', body: 'Pleased to share that Brian scored 89% in the algebra test. Well done!' },
      { id: 'm_3', date: '2026-06-07 16:45', classId: 'f4a', pupilId: 'f4a_p11', guardian: 'Mrs Ncube', subject: 'Absence noted', body: 'Tanaka was absent today. Please confirm whether she is unwell so we can update the register.' },
      { id: 'm_4', date: '2026-06-05 11:30', classId: 'f2c', pupilId: 'f2c_p5', guardian: 'Mr Dube', subject: 'Parent-teacher meeting', body: 'Reminder: the meeting is on Friday at 14:00. Hope to see you there.' },
      { id: 'm_5', date: '2026-06-03 08:15', classId: 'f3b', pupilId: 'f3b_p18', guardian: 'Mrs Mpofu', subject: 'Science practical materials', body: 'Please send Tendai with a clean exercise book for tomorrow’s practical.' },
    ];
    store.set('messages', sent);

    store.set('seeded', true);
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────
  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') e.className = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (k === 'dataset') {
          for (const d in attrs[k]) e.dataset[d] = attrs[k][d];
        } else if (attrs[k] === true) {
          e.setAttribute(k, '');
        } else if (attrs[k] !== false && attrs[k] != null) {
          e.setAttribute(k, attrs[k]);
        }
      }
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach(x => x != null && e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x));
      else e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c);
    }
    return e;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function todayStr() { return new Date().toISOString().slice(0,10); }
  function classBy(id) { return store.get('classes', []).find(c => c.id === id); }
  function gradeFor(mark) {
    if (mark == null || mark === '') return '';
    const n = Number(mark);
    if (Number.isNaN(n)) return '';
    if (n >= 75) return 'A';
    if (n >= 60) return 'B';
    if (n >= 50) return 'C';
    if (n >= 40) return 'D';
    return 'F';
  }

  function toast(msg) {
    let t = $('.tp-toast');
    if (!t) {
      t = el('div', { class: 'tp-toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('is-show'), 2600);
  }

  // ─────────────────────────────────────────────────────────────
  // Shell — render side nav + top bar around per-page main
  // ─────────────────────────────────────────────────────────────
  function renderShell(active, title, subtitle) {
    const app = $('#tp-app');
    if (!app) return;

    const t = store.get('teacher', TEACHER);
    const navItems = [
      { id: 'home', href: 'app.html', label: 'Home', ic: '⌂' },
      { id: 'attendance', href: 'attendance.html', label: 'Attendance', ic: '✓' },
      { id: 'marks', href: 'marks.html', label: 'Marks entry', ic: '#' },
      { id: 'lesson-plan', href: 'lesson-plan.html', label: 'Lesson plans', ic: '✎' },
      { id: 'messages', href: 'messages.html', label: 'Message parent', ic: '✉' },
    ];

    const side = el('aside', { class: 'tp-side' },
      el('a', { class: 'tp-brand', href: 'app.html' },
        el('span', { class: 'mark' }, 'H'),
        el('span', null,
          el('div', { class: 'nm' }, 'Huchu'),
          el('div', { class: 'sb' }, 'Teacher')
        )
      ),
      el('div', { class: 'tp-who' },
        el('span', { class: 'av' }, t.initials),
        el('div', null,
          el('div', { class: 'nm' }, t.name),
          el('div', { class: 'sb' }, t.role)
        )
      ),
      el('div', { class: 'tp-sh' }, 'Workspace'),
      ...navItems.map(n =>
        el('a', { class: 'tp-nav' + (n.id === active ? ' is-active' : ''), href: n.href, 'aria-current': n.id === active ? 'page' : false },
          el('span', { class: 'ic', 'aria-hidden': 'true' }, n.ic),
          n.label
        )
      ),
      el('div', { class: 'tp-sh' }, 'Catalogue'),
      el('a', { class: 'tp-nav', href: 'demo.html' },
        el('span', { class: 'ic', 'aria-hidden': 'true' }, '◫'),
        'Design demo'
      ),
      el('a', { class: 'tp-nav', href: 'index.html' },
        el('span', { class: 'ic', 'aria-hidden': 'true' }, '↩'),
        'Back to portal hub'
      )
    );

    const bar = el('header', { class: 'tp-bar', role: 'banner' },
      el('div', null,
        el('div', { class: 'crumb' },
          el('a', { href: 'app.html' }, 'Teacher prototype'),
          el('span', { class: 'sep' }, '/'),
          el('span', null, title)
        ),
        el('h1', null, title),
        subtitle ? el('div', { class: 'sub' }, subtitle) : null,
      ),
      el('div', { class: 'spacer' }),
    );

    const main = el('main', { class: 'tp-main', id: 'tp-main', role: 'main' });

    app.innerHTML = '';
    app.appendChild(side);
    app.appendChild(bar);
    app.appendChild(main);

    return main;
  }

  // ─────────────────────────────────────────────────────────────
  // Page: Home
  // ─────────────────────────────────────────────────────────────
  function pageHome() {
    const main = renderShell('home', 'Welcome back, Mrs. Mhlanga', "Today is " + new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));

    const classes = store.get('classes', []);
    const assessments = store.get('assessments', []);
    const lessons = store.get('lessons', []);
    const messages = store.get('messages', []);
    const attendance = store.get('attendance', {});
    const todayAttended = Object.keys(attendance).filter(k => k.endsWith(':' + todayStr())).length;

    main.appendChild(el('div', { class: 'tp-hero' },
      el('h1', null, 'Teacher prototype'),
      el('p', null, "Four working flows — attendance roll-call, marks entry with live stats, lesson plan editor, and parent messaging. Everything saves on this device.")
    ));

    main.appendChild(el('div', { class: 'tp-grid-4' },
      el('div', { class: 'tp-stat brand' },
        el('div', { class: 'lab' }, 'Classes'),
        el('div', { class: 'val' }, classes.length),
        el('div', { class: 'hint' }, classes.map(c => c.name).join(' · '))
      ),
      el('div', { class: 'tp-stat' },
        el('div', { class: 'lab' }, 'Pupils total'),
        el('div', { class: 'val' }, classes.reduce((n,c) => n + c.pupils.length, 0)),
        el('div', { class: 'hint' }, 'across all classes')
      ),
      el('div', { class: 'tp-stat success' },
        el('div', { class: 'lab' }, 'Attendance today'),
        el('div', { class: 'val' }, todayAttended + '/' + classes.length),
        el('div', { class: 'hint' }, todayAttended ? 'classes registered' : 'none registered yet')
      ),
      el('div', { class: 'tp-stat warn' },
        el('div', { class: 'lab' }, 'Sent messages'),
        el('div', { class: 'val' }, messages.length),
        el('div', { class: 'hint' }, 'parents reached')
      ),
    ));

    const flows = [
      { href: 'attendance.html', ic: '✓', t: 'Attendance', d: 'Roll-call screen — tap Present, Absent, or Late for each pupil. Saves to today’s register.' },
      { href: 'marks.html', ic: '#', t: 'Marks entry', d: 'Pick a class, subject and assessment. Enter marks — class average updates live with a distribution chart.' },
      { href: 'lesson-plan.html', ic: '✎', t: 'Lesson plans', d: 'Plan your next 5 lessons. Add topic, objectives, materials and homework.' },
      { href: 'messages.html', ic: '✉', t: 'Message parent', d: 'Pick a pupil and send a note to their guardian. Queued for SMS + app push.' },
    ];

    main.appendChild(el('div', { class: 'tp-card' },
      el('h2', { class: 'tp-h2' }, 'Four flows'),
      el('p', { class: 'tp-sub' }, 'Tap a flow to start.'),
      el('div', { class: 'tp-flow-grid' },
        ...flows.map(f =>
          el('a', { class: 'tp-flow-card', href: f.href },
            el('div', { class: 'ic', 'aria-hidden': 'true' }, f.ic),
            el('h3', null, f.t),
            el('p', null, f.d),
            el('span', { class: 'arrow' }, 'Open →')
          )
        )
      )
    ));

    main.appendChild(el('div', { class: 'tp-card' },
      el('h2', { class: 'tp-h2' }, 'Up next'),
      el('p', { class: 'tp-sub' }, 'Next five lessons from your timetable.'),
      el('div', { class: 'tp-lesson-list' },
        ...lessons.slice(0, 5).map(l => {
          const cls = classBy(l.classId);
          const planned = !!(store.get('lessonPlans', {})[l.id]);
          return el('a', { class: 'tp-lesson-card', href: 'lesson-plan.html#' + l.id, 'data-planned': planned ? '1' : '0' },
            el('div', { class: 'when' },
              el('div', { class: 'd' }, new Date(l.date).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()),
              el('div', { class: 't' }, l.time)
            ),
            el('div', null,
              el('div', { class: 'title' }, l.topic),
              el('div', { class: 'sub' }, (cls ? cls.name : '') + ' · ' + l.subject)
            ),
            el('span', { class: 'pill' }, planned ? 'Planned' : 'Not planned')
          );
        })
      )
    ));
  }

  // ─────────────────────────────────────────────────────────────
  // Page: Attendance
  // ─────────────────────────────────────────────────────────────
  function pageAttendance() {
    const main = renderShell('attendance', 'Attendance', 'Take the roll for any class. States cycle Present → Absent → Late.');

    const classes = store.get('classes', []);

    let selectedClassId = null;
    const params = new URLSearchParams(location.search);
    if (params.get('class')) selectedClassId = params.get('class');

    const date = todayStr();

    function render() {
      main.innerHTML = '';

      // Class picker
      main.appendChild(el('div', { class: 'tp-card' },
        el('h2', { class: 'tp-h2' }, '1. Pick a class'),
        el('p', { class: 'tp-sub' }, 'Today’s date: ' + new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
        el('div', { class: 'tp-pick' },
          ...classes.map(c => {
            const stored = store.get('attendance', {})[c.id + ':' + date];
            const status = stored ? `${stored.summary.present} present · ${stored.summary.absent} absent · ${stored.summary.late} late` : 'Not taken yet';
            return el('button', {
              class: 'tp-pick-btn' + (selectedClassId === c.id ? ' is-active' : ''),
              type: 'button',
              'aria-pressed': selectedClassId === c.id ? 'true' : 'false',
              onclick: () => { selectedClassId = c.id; render(); }
            },
              el('span', { class: 'nm' }, c.name),
              el('span', { class: 'sb' }, c.pupils.length + ' pupils · ' + status)
            );
          })
        )
      ));

      if (!selectedClassId) return;

      const cls = classBy(selectedClassId);
      const key = cls.id + ':' + date;
      const allAttendance = store.get('attendance', {});
      const record = allAttendance[key] || { date, classId: cls.id, marks: {} };

      // Top action bar
      const summary = computeSummary(cls, record.marks);
      const existed = !!allAttendance[key];

      const card = el('div', { class: 'tp-card' },
        el('div', { style: 'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom: 12px;' },
          el('div', null,
            el('h2', { class: 'tp-h2' }, '2. Roll-call · ' + cls.name),
            el('p', { class: 'tp-sub', style: 'margin:0;' }, 'Tap each pupil to cycle Present → Absent → Late.')
          ),
          el('div', { style: 'display:flex; gap:8px; flex-wrap:wrap;' },
            el('button', { type: 'button', class: 'btn', onclick: () => {
              cls.pupils.forEach(p => { record.marks[p.id] = 'present'; });
              const all = store.get('attendance', {}); all[key] = { ...record, summary: computeSummary(cls, record.marks) };
              store.set('attendance', all);
              toast('All pupils marked present');
              render();
            } }, 'Mark all present'),
            el('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: () => {
              const all = store.get('attendance', {});
              all[key] = { ...record, summary: computeSummary(cls, record.marks) };
              store.set('attendance', all);
              toast('Attendance saved — ' + summaryStr(all[key].summary));
              render();
            } }, existed ? 'Update register' : 'Submit register')
          )
        ),
        existed ? el('div', { class: 'tp-banner success' }, 'Register saved earlier today · ' + summaryStr(allAttendance[key].summary) + '. You can keep editing.') :
                  el('div', { class: 'tp-banner info' }, 'Live counts · ' + summaryStr(summary)),
      );

      const list = el('div', { class: 'tp-roll', role: 'list' });

      cls.pupils.forEach(p => {
        const state = record.marks[p.id] || '';
        list.appendChild(el('div', { class: 'tp-roll-row', role: 'listitem' },
          el('span', { class: 'av', 'aria-hidden': 'true' }, initials(p.name)),
          el('div', { class: 'who' },
            el('div', { class: 'nm' }, p.name),
            el('div', { class: 'sb' }, '#' + p.no + ' · Guardian: ' + p.guardian)
          ),
          el('div', { class: 'tp-roll-toggle', role: 'group', 'aria-label': 'Mark attendance for ' + p.name },
            ...['present','absent','late'].map(s =>
              el('button', {
                type: 'button',
                class: state === s ? ('is-' + s) : '',
                'aria-pressed': state === s ? 'true' : 'false',
                onclick: () => {
                  // tap-toggle: cycle present -> absent -> late -> present (if same)
                  // but ALSO support direct-tap; the brief says "Tap-toggle cycling".
                  // We'll do: if button clicked is current state → advance to next state in cycle.
                  // If different → set to that state.
                  const cycle = { '': 'present', present: 'absent', absent: 'late', late: 'present' };
                  if (state === s) record.marks[p.id] = cycle[s];
                  else record.marks[p.id] = s;
                  // persist incrementally
                  const all = store.get('attendance', {});
                  all[key] = { ...record, summary: computeSummary(cls, record.marks) };
                  store.set('attendance', all);
                  render();
                }
              }, s.charAt(0).toUpperCase() + s.slice(1))
            )
          )
        ));
      });

      card.appendChild(list);
      main.appendChild(card);
    }

    function computeSummary(cls, marks) {
      let p = 0, a = 0, l = 0, u = 0;
      cls.pupils.forEach(pp => {
        const s = marks[pp.id];
        if (s === 'present') p++;
        else if (s === 'absent') a++;
        else if (s === 'late') l++;
        else u++;
      });
      return { present: p, absent: a, late: l, unmarked: u };
    }

    function summaryStr(s) {
      const parts = [s.present + ' present', s.absent + ' absent', s.late + ' late'];
      if (s.unmarked) parts.push(s.unmarked + ' not marked');
      return parts.join(', ');
    }

    render();
  }

  // ─────────────────────────────────────────────────────────────
  // Page: Marks entry
  // ─────────────────────────────────────────────────────────────
  function pageMarks() {
    const main = renderShell('marks', 'Marks entry', 'Pick a class, subject and assessment, then enter marks.');

    const classes = store.get('classes', []);
    const subjects = store.get('subjects', ZIM_SUBJECTS);
    const assessments = store.get('assessments', []);

    let state = {
      classId: null,
      subject: null,
      assessmentId: null,
    };

    function render() {
      main.innerHTML = '';

      // Step 1 — Pick a class
      main.appendChild(el('div', { class: 'tp-card' },
        el('h2', { class: 'tp-h2' }, '1. Class'),
        el('div', { class: 'tp-pick' },
          ...classes.map(c => el('button', {
            class: 'tp-pick-btn' + (state.classId === c.id ? ' is-active' : ''),
            type: 'button',
            'aria-pressed': state.classId === c.id ? 'true' : 'false',
            onclick: () => { state.classId = c.id; state.subject = null; state.assessmentId = null; render(); }
          },
            el('span', { class: 'nm' }, c.name),
            el('span', { class: 'sb' }, c.pupils.length + ' pupils')
          ))
        )
      ));

      if (!state.classId) return;

      // Step 2 — Pick a subject
      main.appendChild(el('div', { class: 'tp-card' },
        el('h2', { class: 'tp-h2' }, '2. Subject'),
        el('div', { class: 'tp-pick' },
          ...TEACHER.subjectsTaught.map(s => el('button', {
            class: 'tp-pick-btn' + (state.subject === s ? ' is-active' : ''),
            type: 'button',
            'aria-pressed': state.subject === s ? 'true' : 'false',
            onclick: () => { state.subject = s; state.assessmentId = null; render(); }
          },
            el('span', { class: 'nm' }, s),
            el('span', { class: 'sb' }, 'Form 1-4 syllabus')
          ))
        )
      ));

      if (!state.subject) return;

      // Step 3 — Pick or create an assessment
      const matching = assessments.filter(a => a.classId === state.classId && a.subject === state.subject);
      const card3 = el('div', { class: 'tp-card' },
        el('h2', { class: 'tp-h2' }, '3. Assessment'),
        el('p', { class: 'tp-sub' }, matching.length ? 'Pick an existing assessment or create a new one.' : 'No assessments yet for this class + subject. Create one to get started.'),
      );

      const pick = el('div', { class: 'tp-pick' });
      matching.forEach(a => pick.appendChild(el('button', {
        class: 'tp-pick-btn' + (state.assessmentId === a.id ? ' is-active' : ''),
        type: 'button',
        'aria-pressed': state.assessmentId === a.id ? 'true' : 'false',
        onclick: () => { state.assessmentId = a.id; render(); }
      },
        el('span', { class: 'nm' }, a.name),
        el('span', { class: 'sb' }, 'Max ' + a.max + ' · ' + a.date)
      )));

      // Create new
      const newCard = el('div', { class: 'tp-pick-btn', style: 'cursor:pointer;', tabindex: '0',
        onclick: createAssessment,
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); createAssessment(); } }
      },
        el('span', { class: 'nm' }, '+ New assessment'),
        el('span', { class: 'sb' }, 'e.g. Term 2 Test, Midterm Quiz')
      );
      pick.appendChild(newCard);
      card3.appendChild(pick);
      main.appendChild(card3);

      if (!state.assessmentId) return;

      // Step 4 — Marks table
      const assessment = assessments.find(a => a.id === state.assessmentId);
      const cls = classBy(state.classId);
      const allMarks = store.get('marks', {});
      const marksFor = allMarks[assessment.id] || {};

      const statsCard = el('div', { class: 'tp-card' });
      const tableCard = el('div', { class: 'tp-card' });

      const stats = el('div', { class: 'tp-grid-4' });
      statsCard.appendChild(el('div', { style: 'display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:14px;' },
        el('div', null,
          el('h2', { class: 'tp-h2' }, assessment.name),
          el('p', { class: 'tp-sub', style: 'margin:0;' }, cls.name + ' · ' + assessment.subject + ' · out of ' + assessment.max)
        ),
        el('button', { class: 'btn btn-primary btn-lg', type: 'button',
          onclick: () => {
            const all = store.get('marks', {});
            all[assessment.id] = marksFor;
            store.set('marks', all);
            toast('Marks saved for ' + cls.pupils.filter(p => marksFor[p.id] != null && marksFor[p.id] !== '').length + ' pupils');
            renderStatsAndChart();
          }
        }, 'Save marks')
      ));
      statsCard.appendChild(stats);
      statsCard.appendChild(el('div', { class: 'tp-h2', style: 'font-size:14px; margin: 18px 0 10px;' }, 'Distribution'));
      const chart = el('div', { class: 'tp-dist', role: 'img', 'aria-label': 'Mark distribution chart' });
      statsCard.appendChild(chart);

      function renderStatsAndChart() {
        const nums = cls.pupils.map(p => marksFor[p.id]).filter(v => v != null && v !== '' && !Number.isNaN(Number(v))).map(Number);
        const n = nums.length;
        const sum = nums.reduce((a,b) => a + b, 0);
        const avg = n ? (sum / n) : null;
        const hi = n ? Math.max(...nums) : null;
        const lo = n ? Math.min(...nums) : null;
        stats.innerHTML = '';
        [
          { lab: 'Entered', val: n + ' / ' + cls.pupils.length, t: '' },
          { lab: 'Average', val: avg == null ? '—' : avg.toFixed(1), t: 'brand' },
          { lab: 'Highest', val: hi == null ? '—' : hi, t: 'success' },
          { lab: 'Lowest', val: lo == null ? '—' : lo, t: 'danger' },
        ].forEach(s => stats.appendChild(el('div', { class: 'tp-stat ' + s.t },
          el('div', { class: 'lab' }, s.lab),
          el('div', { class: 'val' }, s.val)
        )));

        const buckets = [0,0,0,0,0];
        nums.forEach(v => {
          const i = Math.min(4, Math.floor(v / 20));
          buckets[i]++;
        });
        const max = Math.max(1, ...buckets);
        chart.innerHTML = '';
        const labels = ['0–20','20–40','40–60','60–80','80–100'];
        buckets.forEach((b, i) => {
          chart.appendChild(el('div', { class: 'tp-dist-bar' },
            el('div', { class: 'bar', style: 'height: ' + (b / max * 100) + '%' },
              el('span', { class: 'ct' }, b)
            ),
            el('div', { class: 'lab' }, labels[i])
          ));
        });
      }
      renderStatsAndChart();

      const table = el('div', { class: 'tp-marks-table', role: 'list' });
      cls.pupils.forEach(p => {
        const val = marksFor[p.id] != null ? String(marksFor[p.id]) : '';
        const inputId = 'mk_' + p.id;
        const row = el('div', { class: 'tp-marks-row', role: 'listitem' },
          el('div', null,
            el('div', { class: 'nm' }, p.name),
            el('label', { class: 'sb', for: inputId }, '#' + p.no + ' · out of ' + assessment.max)
          ),
          el('input', {
            id: inputId,
            class: 'tp-input',
            type: 'number',
            inputmode: 'numeric',
            min: '0',
            max: String(assessment.max),
            value: val,
            'aria-label': 'Mark for ' + p.name,
            placeholder: '—',
            oninput: (e) => {
              const raw = e.target.value;
              if (raw === '') { delete marksFor[p.id]; }
              else {
                let n = Number(raw);
                if (Number.isNaN(n)) return;
                if (n < 0) n = 0;
                if (n > assessment.max) { n = assessment.max; e.target.value = n; }
                marksFor[p.id] = n;
              }
              // live stats
              renderStatsAndChart();
              gradeCell.textContent = gradeFor(marksFor[p.id]);
              gradeCell.className = 'tp-grade ' + (gradeFor(marksFor[p.id]) || '');
            }
          })
        );
        const gradeCell = el('span', { class: 'tp-grade ' + (gradeFor(val) || '') }, gradeFor(val) || '—');
        row.appendChild(gradeCell);
        table.appendChild(row);
      });

      tableCard.appendChild(el('h2', { class: 'tp-h2' }, '4. Enter marks'));
      tableCard.appendChild(el('p', { class: 'tp-sub' }, 'Stats update as you type. Press Tab to advance to the next pupil.'));
      tableCard.appendChild(table);

      main.appendChild(statsCard);
      main.appendChild(tableCard);
    }

    function createAssessment() {
      const name = prompt('Name for new assessment (e.g. "Term 2 Test")');
      if (!name) return;
      const all = store.get('assessments', []);
      const id = 'as_' + Date.now();
      all.push({ id, classId: state.classId, subject: state.subject, name, max: 100, date: todayStr() });
      store.set('assessments', all);
      // refresh local reference
      assessments.length = 0;
      Array.prototype.push.apply(assessments, all);
      state.assessmentId = id;
      render();
    }

    render();
  }

  // ─────────────────────────────────────────────────────────────
  // Page: Lesson plans
  // ─────────────────────────────────────────────────────────────
  function pageLessonPlan() {
    const main = renderShell('lesson-plan', 'Lesson plans', 'Plan your next five lessons. Tap one to edit.');

    const lessons = store.get('lessons', []);
    let selectedId = null;
    if (location.hash && location.hash.length > 1) {
      selectedId = location.hash.slice(1);
    }

    function render() {
      main.innerHTML = '';

      const plans = store.get('lessonPlans', {});

      const listCard = el('div', { class: 'tp-card' });
      listCard.appendChild(el('h2', { class: 'tp-h2' }, 'Next 5 lessons'));
      listCard.appendChild(el('p', { class: 'tp-sub' }, 'From your timetable. Planned lessons show a green pill.'));

      const list = el('div', { class: 'tp-lesson-list' });
      lessons.slice(0, 5).forEach(l => {
        const cls = classBy(l.classId);
        const planned = !!plans[l.id];
        list.appendChild(el('button', {
          class: 'tp-lesson-card',
          type: 'button',
          'data-planned': planned ? '1' : '0',
          'aria-pressed': selectedId === l.id ? 'true' : 'false',
          onclick: () => { selectedId = l.id; history.replaceState(null, '', '#' + l.id); render(); }
        },
          el('div', { class: 'when' },
            el('div', { class: 'd' }, new Date(l.date).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()),
            el('div', { class: 't' }, l.time)
          ),
          el('div', null,
            el('div', { class: 'title' }, l.topic),
            el('div', { class: 'sub' }, (cls ? cls.name : '') + ' · ' + l.subject + ' · ' + l.date)
          ),
          el('span', { class: 'pill' }, planned ? 'Planned' : 'Open')
        ));
      });
      listCard.appendChild(list);
      main.appendChild(listCard);

      if (!selectedId) return;
      const lesson = lessons.find(x => x.id === selectedId);
      if (!lesson) return;
      const cls = classBy(lesson.classId);

      const plan = plans[lesson.id] || { topic: lesson.topic, objectives: [''], materials: [''], homework: '' };

      const editor = el('div', { class: 'tp-card' });
      editor.appendChild(el('h2', { class: 'tp-h2' }, 'Plan: ' + lesson.topic));
      editor.appendChild(el('p', { class: 'tp-sub' }, cls.name + ' · ' + lesson.subject + ' · ' + lesson.date + ' at ' + lesson.time));

      // Topic
      const topicGroup = el('div', { style: 'margin-bottom:16px;' },
        el('label', { class: 'tp-label', for: 'lp_topic' }, 'Topic'),
        el('input', { class: 'tp-input', id: 'lp_topic', type: 'text', value: plan.topic,
          oninput: (e) => { plan.topic = e.target.value; }
        })
      );
      editor.appendChild(topicGroup);

      // Objectives (bullets)
      editor.appendChild(el('label', { class: 'tp-label' }, 'Learning objectives'));
      const objWrap = el('div', { class: 'tp-bullets', style: 'margin-bottom:16px;' });
      function renderObjectives() {
        objWrap.innerHTML = '';
        plan.objectives.forEach((o, i) => {
          objWrap.appendChild(el('div', { class: 'tp-bullet-row' },
            el('input', { class: 'tp-input', type: 'text', value: o, placeholder: 'e.g. Recognise quadratic patterns',
              'aria-label': 'Objective ' + (i+1),
              oninput: (e) => { plan.objectives[i] = e.target.value; }
            }),
            el('button', { class: 'del', type: 'button', 'aria-label': 'Remove objective ' + (i+1),
              onclick: () => { plan.objectives.splice(i,1); if (!plan.objectives.length) plan.objectives.push(''); renderObjectives(); }
            }, '×')
          ));
        });
        objWrap.appendChild(el('button', { class: 'btn btn-sm', type: 'button', onclick: () => { plan.objectives.push(''); renderObjectives(); } }, '+ Add objective'));
      }
      renderObjectives();
      editor.appendChild(objWrap);

      // Materials (bullets)
      editor.appendChild(el('label', { class: 'tp-label' }, 'Materials'));
      const matWrap = el('div', { class: 'tp-bullets', style: 'margin-bottom:16px;' });
      function renderMaterials() {
        matWrap.innerHTML = '';
        plan.materials.forEach((o, i) => {
          matWrap.appendChild(el('div', { class: 'tp-bullet-row' },
            el('input', { class: 'tp-input', type: 'text', value: o, placeholder: 'e.g. Textbook ch.4, graph paper',
              'aria-label': 'Material ' + (i+1),
              oninput: (e) => { plan.materials[i] = e.target.value; }
            }),
            el('button', { class: 'del', type: 'button', 'aria-label': 'Remove material ' + (i+1),
              onclick: () => { plan.materials.splice(i,1); if (!plan.materials.length) plan.materials.push(''); renderMaterials(); }
            }, '×')
          ));
        });
        matWrap.appendChild(el('button', { class: 'btn btn-sm', type: 'button', onclick: () => { plan.materials.push(''); renderMaterials(); } }, '+ Add material'));
      }
      renderMaterials();
      editor.appendChild(matWrap);

      // Homework
      editor.appendChild(el('div', { style: 'margin-bottom:16px;' },
        el('label', { class: 'tp-label', for: 'lp_hw' }, 'Homework set'),
        el('textarea', { class: 'tp-textarea', id: 'lp_hw',
          placeholder: 'e.g. Exercise 4B, questions 1-10. Due Friday.',
          oninput: (e) => { plan.homework = e.target.value; }
        }, plan.homework)
      ));

      // Save
      editor.appendChild(el('div', { style: 'display:flex; gap:10px; flex-wrap:wrap; align-items:center;' },
        el('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: () => {
          // tidy empty bullets
          plan.objectives = plan.objectives.filter(o => o.trim()).length ? plan.objectives.filter(o => o.trim()) : [''];
          plan.materials = plan.materials.filter(o => o.trim()).length ? plan.materials.filter(o => o.trim()) : [''];
          const all = store.get('lessonPlans', {});
          all[lesson.id] = plan;
          store.set('lessonPlans', all);
          toast('Lesson plan saved · pupils will see homework');
          render();
        } }, 'Save plan'),
        plans[lesson.id] ? el('button', { class: 'btn', type: 'button', onclick: () => {
          if (!confirm('Clear this lesson plan?')) return;
          const all = store.get('lessonPlans', {});
          delete all[lesson.id];
          store.set('lessonPlans', all);
          toast('Plan cleared');
          render();
        } }, 'Clear plan') : null,
        plans[lesson.id] ? el('span', { class: 'tp-grade A', style: 'margin-left:auto;' }, 'Saved') : null
      ));

      main.appendChild(editor);
    }

    render();
  }

  // ─────────────────────────────────────────────────────────────
  // Page: Messages
  // ─────────────────────────────────────────────────────────────
  function pageMessages() {
    const main = renderShell('messages', 'Message parent', 'Pick a class, then a pupil, then write a message to their guardian.');

    let state = { classId: null, pupilId: null };

    function render() {
      main.innerHTML = '';

      const classes = store.get('classes', []);

      main.appendChild(el('div', { class: 'tp-card' },
        el('h2', { class: 'tp-h2' }, '1. Class'),
        el('div', { class: 'tp-pick' },
          ...classes.map(c => el('button', {
            class: 'tp-pick-btn' + (state.classId === c.id ? ' is-active' : ''),
            type: 'button',
            'aria-pressed': state.classId === c.id ? 'true' : 'false',
            onclick: () => { state.classId = c.id; state.pupilId = null; render(); }
          },
            el('span', { class: 'nm' }, c.name),
            el('span', { class: 'sb' }, c.pupils.length + ' pupils')
          ))
        )
      ));

      if (state.classId) {
        const cls = classBy(state.classId);
        const pickCard = el('div', { class: 'tp-card' });
        pickCard.appendChild(el('h2', { class: 'tp-h2' }, '2. Pupil'));
        pickCard.appendChild(el('p', { class: 'tp-sub' }, 'Tap a pupil to address their guardian.'));
        const list = el('div', { class: 'tp-pick', style: 'grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));' });
        cls.pupils.forEach(p => list.appendChild(el('button', {
          class: 'tp-pick-btn' + (state.pupilId === p.id ? ' is-active' : ''),
          type: 'button',
          'aria-pressed': state.pupilId === p.id ? 'true' : 'false',
          onclick: () => { state.pupilId = p.id; render(); }
        },
          el('span', { class: 'nm' }, p.name),
          el('span', { class: 'sb' }, p.guardian + ' · ' + p.phone)
        )));
        pickCard.appendChild(list);
        main.appendChild(pickCard);
      }

      if (state.pupilId) {
        const cls = classBy(state.classId);
        const pupil = cls.pupils.find(x => x.id === state.pupilId);
        const subjInput = el('input', { class: 'tp-input', type: 'text', placeholder: 'e.g. Homework reminder', id: 'msg_subj' });
        const bodyInput = el('textarea', { class: 'tp-textarea', placeholder: 'Write your message…', id: 'msg_body' });

        const composer = el('div', { class: 'tp-card' },
          el('h2', { class: 'tp-h2' }, '3. Compose message'),
          el('p', { class: 'tp-sub' }, 'To ' + pupil.guardian + ' (guardian of ' + pupil.name + ') · ' + pupil.phone),
          el('div', { style: 'margin-bottom: 14px;' },
            el('label', { class: 'tp-label', for: 'msg_subj' }, 'Subject'),
            subjInput
          ),
          el('div', { style: 'margin-bottom: 14px;' },
            el('label', { class: 'tp-label', for: 'msg_body' }, 'Message'),
            bodyInput
          ),
          el('div', { style: 'display:flex; gap:10px;' },
            el('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: () => {
              const subject = subjInput.value.trim();
              const body = bodyInput.value.trim();
              if (!subject || !body) { toast('Add a subject and a message body'); return; }
              const all = store.get('messages', []);
              all.unshift({
                id: 'm_' + Date.now(),
                date: new Date().toISOString().slice(0,16).replace('T',' '),
                classId: cls.id,
                pupilId: pupil.id,
                guardian: pupil.guardian,
                subject,
                body,
              });
              store.set('messages', all);
              toast('Message queued · will deliver via SMS + app push');
              state.pupilId = null;
              render();
            } }, 'Send message'),
            el('button', { class: 'btn', type: 'button', onclick: () => { state.pupilId = null; render(); } }, 'Cancel')
          )
        );
        main.appendChild(composer);
      }

      // Sent log
      const sent = store.get('messages', []);
      const log = el('div', { class: 'tp-card' });
      log.appendChild(el('h2', { class: 'tp-h2' }, 'Sent log'));
      log.appendChild(el('p', { class: 'tp-sub' }, sent.length + ' message' + (sent.length === 1 ? '' : 's') + ' sent'));
      const ml = el('div', { class: 'tp-msg-list' });
      sent.forEach(m => {
        const cls = classBy(m.classId);
        const pupil = cls ? cls.pupils.find(p => p.id === m.pupilId) : null;
        ml.appendChild(el('div', { class: 'tp-msg-item' },
          el('div', { class: 'head' },
            el('div', { class: 'who' }, 'To ' + m.guardian + (pupil ? ' · re ' + pupil.name : '')),
            el('div', { class: 'when' }, m.date + (cls ? ' · ' + cls.name : ''))
          ),
          el('div', { class: 'subj' }, m.subject),
          el('div', { class: 'body' }, m.body)
        ));
      });
      log.appendChild(ml);
      main.appendChild(log);
    }

    render();
  }

  // ─────────────────────────────────────────────────────────────
  // Page dispatch
  // ─────────────────────────────────────────────────────────────
  function init() {
    ensureSeed();
    const page = document.body.dataset.page;
    switch (page) {
      case 'home': pageHome(); break;
      case 'attendance': pageAttendance(); break;
      case 'marks': pageMarks(); break;
      case 'lesson-plan': pageLessonPlan(); break;
      case 'messages': pageMessages(); break;
      default: pageHome();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.__teacher = { store, ensureSeed };
})();
