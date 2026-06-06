#!/usr/bin/env python3
"""One-shot generator: shared-module surface pages + hub Examples sections.

Run from repo root:  python3 shared/_gen/build.py
Writes only inside shared/. The _gen dir is build-only and not shipped.
"""
import os, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHARED = os.path.join(ROOT, "shared")

ACCENTS = {
    "cctv":          ("#7C3AED", "#EDE9FE", "#5B21B6"),
    "hr":            ("#DC2626", "#FEE2E5", "#7F1D1D"),
    "maintenance":   ("#0891B2", "#CFFAFE", "#155E75"),
    "notifications": ("#D97706", "#FEF3C7", "#92400E"),
    "settings":      ("#475569", "#E2E8F0", "#1E293B"),
    "stock":         ("#16A34A", "#DCFCE7", "#166534"),
}
TITLES = {
    "cctv": "CCTV &amp; surveillance", "hr": "HR &amp; payroll",
    "maintenance": "Maintenance &amp; assets", "notifications": "Notifications",
    "settings": "Settings", "stock": "Stock &amp; inventory",
}
ORG = {
    "cctv": ("Mukamba Group", "5 sites · 38 cameras"),
    "hr": ("Mukamba Group", "5 sites · 248 staff"),
    "maintenance": ("Mukamba Group", "5 sites · 412 assets"),
    "notifications": ("Mukamba Group", "5 sites · 248 staff"),
    "settings": ("Mukamba Group", "5 sites · 248 staff"),
    "stock": ("Mukamba Group", "5 sites · 6,140 SKUs"),
}

PAGE_STYLE = """
  html, body { max-width: 100%; overflow-x: clip; }
  body.dash-body { padding: 16px; place-items: start center; min-height: 100vh; }
  .dash-frame { width: 1320px; max-width: 100%; }
  .dash-main { min-width: 0; }
  .dash-page, .dash-page-h, .dash-page > * { min-width: 0; }
  .tbl-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
  .tbl-scroll table { min-width: 680px; }
  .mob-burger { display: none; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
  .form-grid .full { grid-column: 1 / -1; }
  .fld { display: grid; gap: 6px; min-width: 0; }
  .fld label { font: 600 12px/1 var(--font-sans); color: var(--text-strong); }
  .fld input, .fld select, .fld textarea { width: 100%; padding: 9px 11px; border: 1px solid var(--border); border-radius: 8px; font: 14px/1.4 var(--font-sans); background: var(--surface); color: var(--text-strong); box-sizing: border-box; }
  .fld .hint { font: 12px/1.4 var(--font-sans); color: var(--text-muted); }
  .pane-pad { padding: 20px 22px; }
  .dash-card { min-width: 0; max-width: 100%; }
  .dash-card-h { flex-wrap: wrap; }
  .stat-tile { min-width: 0; }
  .stat-tile .v { overflow-wrap: anywhere; }
  @media (max-width: 820px) {
    body.dash-body { padding: 0; }
    .dash-frame { border-radius: 0; box-shadow: none; }
    .dash-frame .chrome .url { display: none; }
    .dash-app { grid-template-columns: 1fr; min-height: 0; }
    .dash-side { display: none; }
    .dash-side.open { display: flex; position: fixed; inset: 0 auto 0 0; z-index: 60; width: 84%; max-width: 300px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
    .mob-burger { display: inline-grid; }
    .stat-row { grid-template-columns: 1fr 1fr; }
    .cols-2, .cols-equal, .cols-3, .form-grid { grid-template-columns: 1fr; }
    .step-rail { flex-wrap: wrap; }
    .filter-bar { flex-wrap: wrap; }
    .dash-page, [style*="padding: 0 32px"] { padding-left: 16px !important; padding-right: 16px !important; }
    [style*="grid-template-columns:repeat(3,1fr)"],
    [style*="grid-template-columns:repeat(2,1fr)"] { grid-template-columns: 1fr !important; }
    .dt-toolbar { flex-wrap: wrap; }
    .dt-toolbar .search-l, .dt-toolbar .search-l input { width: 100% !important; box-sizing: border-box; }
    .dash-page-h { flex-direction: column; }
    .dash-page-h .actions { width: 100%; flex-wrap: wrap; }
  }
  @media (max-width: 460px) {
    .stat-row { grid-template-columns: 1fr; }
    .dash-topbar { padding-left: 12px; padding-right: 12px; }
    .dash-topbar .search { display: none; }
    .dash-frame .chrome .actions { display: none; }
  }
"""

C = {
    "blue": "background:#DEEAFE;color:#1E40AF", "green": "background:#DCFCE7;color:#166534",
    "purple": "background:#EDE0FF;color:#4C1D95", "orange": "background:#FFE5C8;color:#6B3F19",
    "red": "background:#FEE2E5;color:#7F1D1D", "teal": "background:#CFFAFE;color:#155E75",
}

# ---- builders -------------------------------------------------------------

def page(mod, slug, browser_path, crumbs, sidebar_html, topbar_title, body_html):
    accent, soft, strong = ACCENTS[mod]
    title = TITLES[mod]
    org_n, org_s = ORG[mod]
    crumb_html = ""
    for i, (label, href) in enumerate(crumbs):
        sep = '<span class="sep">/</span>' if i else ""
        if href:
            crumb_html += f'{sep}<a href="{href}">{label}</a>'
        else:
            crumb_html += f'{sep}<span class="current">{label}</span>'
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" /><title>{topbar_title} · {title} · Huchu</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="../../tokens.css" />
<link rel="stylesheet" href="../../components.css" />
<link rel="stylesheet" href="../../shared.css" />
<link rel="stylesheet" href="../../dash.css" />
<script src="../../icons.js" defer></script>
<link rel="stylesheet" href="../../huchu-nav.css" />
<script src="../../huchu-nav.js" defer></script>
<style>
  .dash-side nav a.active {{ background: {soft}; color: {strong}; }}
  .dash-side nav a.active svg {{ color: {accent}; }}
  .dash-side nav a.active .cnt {{ background: {accent}; color: #fff; }}
  .dash-side .org-switcher .mark {{ background: {accent}; }}
  .dash-side .footer .avatar {{ background: {soft}; color: {strong}; }}
  .dash-topbar .ic-btn.me {{ background: {accent}; color: #fff; }}
  .step-rail {{ display: flex; gap: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 8px; }}
  .step-rail .st {{ flex: 1; padding: 12px 14px; border-radius: 8px; display: flex; align-items: center; gap: 10px; }}
  .step-rail .st .n {{ width: 22px; height: 22px; border-radius: 50%; background: var(--surface-muted); color: var(--text-muted); display: grid; place-items: center; font: 600 12px/1 var(--font-mono); }}
  .step-rail .st .nm {{ font: 500 13px/1.3 var(--font-sans); color: var(--text-muted); }}
  .step-rail .st .sb {{ font: 11px/1.2 var(--font-mono); color: var(--text-subtle); margin-top: 2px; }}
  .step-rail .st.done .n {{ background: #DCFCE7; color: #166534; }}
  .step-rail .st.done .nm {{ color: var(--text-strong); }}
  .step-rail .st.active {{ background: {soft}; }}
  .step-rail .st.active .n {{ background: {accent}; color: #fff; }}
  .step-rail .st.active .nm {{ color: {strong}; font-weight: 600; }}
  .mob-burger {{ width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); place-items: center; cursor: pointer; }}
{PAGE_STYLE}</style>
</head>
<body class="dash-body hx-no-nav">
<div class="dash-frame">
  <div class="chrome">
    <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
    <span class="url">https://app.huchu.com / {browser_path}</span>
    <span class="actions"><a href="index.html">← {title}</a> <a href="../../index.html">← Design system</a></span>
  </div>
  <div class="dash-app">
    <aside class="dash-side" id="side">
      <div class="org-switcher">
        <span class="mark" data-icon="corelith" data-icon-size="16"></span>
        <div style="flex: 1; min-width: 0;"><div class="name">{org_n}</div><div class="sub">{org_s}</div></div>
        <span class="chev" data-icon="chevron" data-icon-size="14"></span>
      </div>
      <a class="new-action" href="#"><span data-icon="plus" data-icon-size="14"></span> Quick action<span class="kbd">⌘N</span></a>
{sidebar_html}
      <div class="sh">Shared</div>
      <nav>
        <a href="../settings/index.html"><span data-icon="settings"></span> Settings</a>
        <a href="../notifications/index.html"><span data-icon="bell"></span> Notifications</a>
      </nav>
      <div class="footer">
        <span class="avatar">TC</span>
        <div><div class="nm">Tendai Chigumba</div><div class="sb">Operations</div></div>
        <span class="arrow" data-icon="chup" data-icon-size="14"></span>
      </div>
    </aside>
    <main class="dash-main">
      <header class="dash-topbar">
        <button class="mob-burger" aria-label="Menu" onclick="document.getElementById('side').classList.toggle('open')"><span data-icon="menu" data-icon-size="18"></span></button>
        <div class="crumbs">{crumb_html}</div>
        <div class="spacer"></div>
        <div class="search"><span data-icon="search"></span><input placeholder="Search…" /><span class="kbd-hint">⌘K</span></div>
        <button class="ic-btn"><span data-icon="bell" data-icon-size="16"></span></button>
        <button class="ic-btn me"><span data-icon="user" data-icon-size="16"></span></button>
      </header>
{body_html}
    </main>
  </div>
</div>
</body>
</html>
"""


def sidebar(mod, group_label, items):
    rows = ""
    for label, href, ic, badge, active in items:
        cls = ' class="active"' if active else ""
        cnt = f'<span class="cnt">{badge}</span>' if badge else ""
        rows += f'        <a href="{href}"{cls}><span data-icon="{ic}"></span> {label}{cnt}</a>\n'
    return f'      <div class="sh">{group_label}<span data-icon="chevron"></span></div>\n      <nav>\n{rows}      </nav>'


def header(title, lede, pills, actions=""):
    pill_html = "".join(f'<span class="p{(" "+c) if c else ""}">{t}</span>' for c, t in pills)
    act = f'<div class="actions">{actions}</div>' if actions else ""
    return f"""      <div class="dash-page">
        <div class="dash-page-h">
          <div class="meta">
            <h1>{title}</h1>
            <p class="lede">{lede}</p>
            <div class="h-pills">{pill_html}</div>
          </div>
          {act}
        </div>
      </div>"""


def stats(tiles):
    out = '<div class="dash-page" style="padding-top:0;"><div class="stat-row">'
    for lbl, v, u, delta, dcls in tiles:
        ds = f'<div class="delta {dcls}">{delta}</div>' if delta else ""
        out += f'<div class="stat-tile"><div class="lbl">{lbl}</div><div class="v">{v}<span class="u">{u}</span></div>{ds}</div>'
    return out + "</div></div>"


def card(title, sub, body, header_right=""):
    hr = f'<div class="filter-bar">{header_right}</div>' if header_right else ""
    return f'<div class="dash-card"><div class="dash-card-h"><div><h2>{title}</h2><div class="sub">{sub}</div></div>{hr}</div>{body}</div>'


def table(headers, rows):
    th = "".join('<th' + (' style="text-align:right"' if r else '') + '>' + h + '</th>' for h, r in headers)
    trs = ""
    for cells in rows:
        tds = ""
        for c, (h, right) in zip(cells, headers):
            style = ' style="text-align:right" class="num"' if right else ""
            tds += f'<td{style}>{c}</td>'
        trs += f'<tr>{tds}</tr>'
    return f'<div class="tbl-scroll"><table class="dt"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'


def av(initials, name, sub, color="blue"):
    return f'<span class="avatar" style="{C[color]}">{initials}</span><span class="nm">{name}</span><div class="sb">{sub}</div>'


def badge(text, tone="neutral"):
    return f'<span class="badge {tone}"><span class="dot"></span> {text}</span>' if tone in ("ok","warn","danger","brand") else f'<span class="badge {tone}">{text}</span>'


def toolbar(ph, pills, count):
    p = "".join(f'<span class="filter-pill"><span data-icon="filter"></span> {x}</span>' for x in pills)
    return f'<div class="dt-toolbar"><div class="search-l"><span data-icon="search"></span><input placeholder="{ph}" /></div>{p}<div class="spacer"></div><span class="count">{count}</span></div>'


def filters(active, *rest):
    return f'<span class="f active">{active}</span>' + "".join(f'<span class="f">{r}</span>' for r in rest)


def sec(inner):
    return f'<div style="padding: 0 32px 24px;">{inner}</div>'


def write(mod, slug, contents):
    path = os.path.join(SHARED, mod, slug + ".html")
    with open(path, "w") as f:
        f.write(contents)
    return path


# =============================================================================
# Index-page (hub) generator with linked surface cards + Examples section
# =============================================================================

HUB_AREA_ICON = {
    "cctv":          ("cctv", "camera"),
    "hr":            ("hr", "user"),
    "maintenance":   ("maint", "settings"),
    "notifications": ("shared", "bell"),
    "settings":      ("shared", "settings"),
    "stock":         ("warehouse", "warehouse"),
}
HUB_TITLES = {
    "cctv":          "CCTV & surveillance",
    "hr":            "HR & payroll",
    "maintenance":   "Maintenance & assets",
    "notifications": "Notifications",
    "settings":      "Settings",
    "stock":         "Stock & inventory",
}
HUB_LEDES = {
    "cctv":          "Camera management, live wall, event review, recording playback, retention policy.",
    "hr":            "Employee records, payroll runs, payslip delivery, attendance, compliance.",
    "maintenance":   "Asset register, work orders, breakdowns, preventive schedules, technicians, parts.",
    "notifications": "Inbox, broadcast composer, channels (in-app / email / SMS / WhatsApp), templates, delivery log.",
    "settings":      "Workspace, members & roles, billing, integrations, security, branches, audit, API keys.",
    "stock":         "Items master, stock levels, receiving, transfers, stock-take, suppliers.",
}


def attr_escape(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def example_card(title, html_src, react_src):
    h = attr_escape(html_src)
    r = attr_escape(react_src)
    return (f'      <div class="px-example" data-title="{attr_escape(title)}" '
            f'data-html="{h}" data-react="{r}"></div>')


def hub_page(mod, surfaces, examples_html):
    """surfaces: list of (num, slug, name, desc)."""
    cls, icon = HUB_AREA_ICON[mod]
    title = HUB_TITLES[mod]
    lede = HUB_LEDES[mod]
    cards = ""
    for num, slug, nm, ds in surfaces:
        cards += (
            f'        <a class="surface-card" href="{slug}.html">\n'
            f'          <span class="num">{num}</span>\n'
            f'          <span class="nm">{nm}</span>\n'
            f'          <span class="ds">{ds}</span>\n'
            f'          <span class="arrow">Open <span data-icon="arrow" data-icon-size="12"></span></span>\n'
            f'        </a>\n'
        )
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" /><title>{title} · Shared · Huchu DS</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="../../tokens.css" />
<link rel="stylesheet" href="../../components.css" />
<link rel="stylesheet" href="../../shared.css" />
<link rel="stylesheet" href="../shared-examples.css" />
<script src="../../icons.js" defer></script>
<script src="../shared-examples.js" defer></script>
<link rel="stylesheet" href="../../huchu-nav.css" />
<script src="../../huchu-nav.js" defer></script>
<style>
  body {{ background: var(--canvas); }}
  .hub-wrap, .hub-hero, .hub-section {{ overflow-x: clip; }}
</style>
</head>
<body>

<header class="hx-topbar">
  <a class="brand" href="../../index.html"><span class="mark" data-icon="corelith" data-icon-size="22"></span> Huchu <span class="badge">DS · 0.5</span></a>
  <nav>
    <a href="../../index.html">Overview</a>
    <a href="../../system/foundations.html">Foundations</a>
    <a href="../../system/primitives.html">Components</a>
    <a href="../../system/shells.html">Shells</a>
    <a href="../../index.html#shared" class="current">Shared</a>
  </nav>
  <div class="spacer"></div>
  <a class="cta" href="../../index.html#shared">All shared modules</a>
</header>

<div class="hub-wrap">
  <section class="hub-hero">
    <div class="breadcrumb"><a href="../../index.html">Home</a><span class="sep">/</span><span>Shared modules</span><span class="sep">/</span><span>{title}</span></div>
    <div class="area-icon {cls}" data-icon="{icon}" data-icon-size="28"></div>
    <h1>{title}</h1>
    <p class="lede">{lede}</p>
    <div class="meta-pills">
      <span class="meta-pill brand">Shared module</span>
      <span class="meta-pill">{len(surfaces)} surfaces</span>
      <span class="meta-pill tone-success">Production</span>
      <span class="meta-pill">/shared/{mod}</span>
    </div>
  </section>

  <section class="hub-section">
    <span class="label">Surfaces</span>
    <h2>What this module ships</h2>
    <p class="sub">Every card opens a designed surface — desktop chrome, real data, Zimbabwe context.</p>
    <div class="surface-grid">
{cards}    </div>
  </section>

  <section class="hub-section">
    <span class="label">Examples</span>
    <h2>Code alongside the design</h2>
    <p class="sub">Preview the live HTML; flip to React to see the equivalent <code>@corelith/design-system</code> snippet.</p>
    <div class="px-examples">
{examples_html}
    </div>
  </section>

  <div class="hub-cta">
    <div>
      <h3>{title} runs inside every vertical</h3>
      <p>Shared modules use the same dashboard shell every vertical does — sidebar nav, breadcrumb topbar, content column. Permissions are scoped per workspace.</p>
    </div>
    <a class="btn-link-light" href="../../system/shells.html">Browse shells <span data-icon="arrow" data-icon-size="14"></span></a>
  </div>
</div>

<footer class="hx-footer">
  <div class="hx-footer-inner">
    <span>© 2026 Huchu · {title} module v0.5</span>
    <div class="links"><a href="../../index.html">Overview</a><a href="../../system/shells.html">Shells</a><a href="../../index.html#shared">Shared</a></div>
  </div>
</footer>

</body></html>
"""


def write_index(mod, contents):
    path = os.path.join(SHARED, mod, "index.html")
    with open(path, "w") as f:
        f.write(contents)
    return path



# =============================================================================
# Per-module surface page builders
# =============================================================================

def cctv_sidebar(active):
    items = [
        ("Live wall",         "live-wall.html",         "play",     "12", active=="live-wall"),
        ("Cameras",           "camera-detail.html",     "camera",   "38", active=="camera-detail"),
        ("Event log",         "event-log.html",         "list",     "47", active=="event-log"),
        ("Recordings",        "recordings.html",        "folder",   "",   active=="recordings"),
        ("Retention",         "retention-settings.html","clock",    "",   active=="retention-settings"),
    ]
    rows = ""
    for label, href, ic, cnt, isa in items:
        cls = ' class="active"' if isa else ""
        c = f'<span class="cnt">{cnt}</span>' if cnt else ""
        rows += f'        <a href="{href}"{cls}><span data-icon="{ic}"></span> {label}{c}</a>\n'
    return f'      <div class="sh">CCTV &amp; surveillance<span data-icon="chevron"></span></div>\n      <nav>\n{rows}      </nav>'


def hr_sidebar(active):
    items = [
        ("Employee directory", "employee-directory.html","user",    "248", active=="employee-directory"),
        ("Payroll run",        "payroll-run.html",       "coin",    "Jun", active=="payroll-run"),
        ("Payslips",           "payslips.html",          "receipt", "",    active=="payslips"),
        ("Attendance",         "attendance.html",        "clock",   "",    active=="attendance"),
        ("Leave",              "leave.html",             "calendar","12",  active=="leave"),
        ("Disciplinary",       "disciplinary.html",      "shield",  "",    active=="disciplinary"),
        ("Compliance reports", "compliance-reports.html","flag",    "",    active=="compliance-reports"),
    ]
    rows = ""
    for label, href, ic, cnt, isa in items:
        cls = ' class="active"' if isa else ""
        c = f'<span class="cnt">{cnt}</span>' if cnt else ""
        rows += f'        <a href="{href}"{cls}><span data-icon="{ic}"></span> {label}{c}</a>\n'
    return f'      <div class="sh">HR &amp; payroll<span data-icon="chevron"></span></div>\n      <nav>\n{rows}      </nav>'


def maint_sidebar(active):
    items = [
        ("Work orders",       "work-orders.html",      "list",     "24",  active=="work-orders"),
        ("Assets register",   "assets-register.html",  "box",      "412", active=="assets-register"),
        ("PM schedule",       "pm-schedule.html",      "calendar", "",    active=="pm-schedule"),
        ("Technicians",       "technician-roster.html","user",     "8",   active=="technician-roster"),
        ("Parts inventory",   "parts-inventory.html",  "warehouse","",    active=="parts-inventory"),
    ]
    rows = ""
    for label, href, ic, cnt, isa in items:
        cls = ' class="active"' if isa else ""
        c = f'<span class="cnt">{cnt}</span>' if cnt else ""
        rows += f'        <a href="{href}"{cls}><span data-icon="{ic}"></span> {label}{c}</a>\n'
    return f'      <div class="sh">Maintenance &amp; assets<span data-icon="chevron"></span></div>\n      <nav>\n{rows}      </nav>'


def notif_sidebar(active):
    items = [
        ("Inbox",              "inbox.html",              "inbox",     "14", active=="inbox"),
        ("Broadcast composer", "broadcast-composer.html", "edit",      "",   active=="broadcast-composer"),
        ("Channels",           "channels.html",           "plug",      "4",  active=="channels"),
        ("Templates",          "templates.html",          "folder",    "",   active=="templates"),
        ("Delivery log",       "delivery-log.html",       "list",      "",   active=="delivery-log"),
    ]
    rows = ""
    for label, href, ic, cnt, isa in items:
        cls = ' class="active"' if isa else ""
        c = f'<span class="cnt">{cnt}</span>' if cnt else ""
        rows += f'        <a href="{href}"{cls}><span data-icon="{ic}"></span> {label}{c}</a>\n'
    return f'      <div class="sh">Notifications<span data-icon="chevron"></span></div>\n      <nav>\n{rows}      </nav>'


def settings_sidebar(active):
    items = [
        ("Workspace",       "workspace.html",     "building", "",  active=="workspace"),
        ("Members & roles", "members-roles.html", "user",     "24",active=="members-roles"),
        ("Billing",         "billing.html",       "card",     "",  active=="billing"),
        ("Integrations",    "integrations.html",  "plug",     "7", active=="integrations"),
        ("Security",        "security.html",      "lock",     "",  active=="security"),
        ("Branches",        "branches.html",      "pin",      "5", active=="branches"),
        ("Audit log",       "audit.html",         "list",     "",  active=="audit"),
        ("API keys",        "api-keys.html",      "code",     "3", active=="api-keys"),
        ("Danger zone",     "danger-zone.html",   "shield",   "",  active=="danger-zone"),
    ]
    rows = ""
    for label, href, ic, cnt, isa in items:
        cls = ' class="active"' if isa else ""
        c = f'<span class="cnt">{cnt}</span>' if cnt else ""
        rows += f'        <a href="{href}"{cls}><span data-icon="{ic}"></span> {label}{c}</a>\n'
    return f'      <div class="sh">Settings<span data-icon="chevron"></span></div>\n      <nav>\n{rows}      </nav>'


def stock_sidebar(active):
    items = [
        ("Items",         "items.html",        "box",       "1,240", active=="items"),
        ("Stock levels",  "stock-levels.html", "chart",     "",      active=="stock-levels"),
        ("Receiving",     "receiving.html",    "download",  "6",     active=="receiving"),
        ("Transfers",     "transfers.html",    "truck",     "3",     active=="transfers"),
        ("Stock take",    "stock-take.html",   "list",      "",      active=="stock-take"),
        ("Suppliers",     "suppliers.html",    "building",  "48",    active=="suppliers"),
    ]
    rows = ""
    for label, href, ic, cnt, isa in items:
        cls = ' class="active"' if isa else ""
        c = f'<span class="cnt">{cnt}</span>' if cnt else ""
        rows += f'        <a href="{href}"{cls}><span data-icon="{ic}"></span> {label}{c}</a>\n'
    return f'      <div class="sh">Stock &amp; inventory<span data-icon="chevron"></span></div>\n      <nav>\n{rows}      </nav>'



# =============================================================================
# Examples — 3-5 per module. Preview = inline HTML (components.css classes);
# Code = React from @corelith/design-system.
# =============================================================================

CCTV_EXAMPLES = [
    (
        "Camera tile · live wall",
        '''<div style="width:240px;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--ink);color:#fff;">
  <div style="height:135px;background:linear-gradient(135deg,#1F2937,#0F172A);position:relative;display:grid;place-items:center;">
    <span data-icon="camera" data-icon-size="28" style="color:rgba(255,255,255,.25);"></span>
    <span style="position:absolute;top:8px;left:8px;display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:9999px;background:rgba(220,38,38,.9);font:600 10px/1 var(--font-sans);">
      <span style="width:6px;height:6px;border-radius:50%;background:#fff;"></span> LIVE
    </span>
    <span style="position:absolute;top:8px;right:8px;font:500 10px/1 var(--font-mono);color:rgba(255,255,255,.7);">14:32:08</span>
    <span style="position:absolute;bottom:8px;right:8px;padding:2px 7px;border-radius:5px;background:rgba(0,0,0,.55);font:500 10px/1 var(--font-mono);color:#fff;">1080p · 30fps</span>
  </div>
  <div style="padding:10px 12px;">
    <div style="font:600 13px/1.2 var(--font-sans);color:#fff;">Park Centre · Front till</div>
    <div style="font:11px/1.3 var(--font-mono);color:rgba(255,255,255,.5);margin-top:2px;">CAM-014 · Online · 12d uptime</div>
  </div>
</div>''',
        '''import { CameraTile } from '@corelith/design-system';

function LiveWallTile({ camera }) {
  return (
    <CameraTile
      streamUrl={camera.hlsUrl}
      label={camera.label}
      meta={`${camera.id} · ${camera.status} · ${camera.uptime}`}
      live
      resolution="1080p"
      fps={30}
    />
  );
}''',
    ),
    (
        "Event row · motion detected",
        '''<div style="max-width:520px;display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="width:36px;height:36px;border-radius:8px;background:var(--tone-warn-bg);color:var(--tone-warn);display:grid;place-items:center;flex:none;"><span data-icon="zap" data-icon-size="18"></span></span>
  <div style="flex:1;min-width:0;">
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Motion · after-hours · Stockroom B</div>
    <div style="font:12px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">CAM-022 · Bulawayo · 02:14:33 · 4s clip</div>
  </div>
  <span class="badge badge-warn">Review</span>
  <a href="#" style="font:500 12.5px/1 var(--font-sans);color:var(--brand-strong);text-decoration:none;">Open</a>
</div>''',
        '''import { EventRow, Badge } from '@corelith/design-system';

function MotionEvent({ event, onOpen }) {
  return (
    <EventRow
      icon="motion"
      tone="warn"
      title={`Motion · after-hours · ${event.zone}`}
      meta={`${event.cameraId} · ${event.site} · ${event.time} · ${event.clipLen}`}
      action={<Badge tone="warn">Review</Badge>}
      onOpen={() => onOpen(event.id)}
    />
  );
}''',
    ),
    (
        "Retention slider · per site",
        '''<div style="max-width:480px;padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div>
      <div style="font:600 14px/1.2 var(--font-sans);color:var(--text-strong);">Park Centre · 12 cameras</div>
      <div style="font:12px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">~ 1.4 TB / day · NVR-01</div>
    </div>
    <span style="font:600 20px/1 var(--font-mono);color:var(--brand-strong);">30d</span>
  </div>
  <div style="position:relative;height:6px;background:var(--surface-muted);border-radius:9999px;margin-top:14px;">
    <div style="position:absolute;inset:0 50% 0 0;background:var(--brand);border-radius:9999px;"></div>
    <span style="position:absolute;left:calc(50% - 8px);top:-5px;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--brand);"></span>
  </div>
  <div style="display:flex;justify-content:space-between;font:11px/1 var(--font-mono);color:var(--text-subtle);margin-top:8px;">
    <span>7d</span><span>14d</span><span>30d</span><span>60d</span><span>90d</span>
  </div>
</div>''',
        '''import { RetentionSlider } from '@corelith/design-system';

function SiteRetention({ site, onChange }) {
  return (
    <RetentionSlider
      siteName={site.name}
      cameraCount={site.cameras}
      throughput={`${site.tbPerDay} TB / day · ${site.nvr}`}
      value={site.retentionDays}
      stops={[7, 14, 30, 60, 90]}
      onChange={(days) => onChange(site.id, days)}
    />
  );
}''',
    ),
    (
        "Camera status pill",
        '''<div style="display:inline-flex;gap:8px;">
  <span class="badge badge-success"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> Online</span>
  <span class="badge badge-warn"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> Degraded</span>
  <span class="badge badge-danger"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> Offline 2h</span>
  <span class="badge badge-neutral">PTZ</span>
</div>''',
        '''import { Badge, Status } from '@corelith/design-system';

function CameraStatusGroup({ camera }) {
  return (
    <>
      <Status tone={camera.health}>{camera.health === 'success' ? 'Online' : camera.health === 'warn' ? 'Degraded' : `Offline ${camera.downFor}`}</Status>
      {camera.ptz && <Badge tone="neutral">PTZ</Badge>}
    </>
  );
}''',
    ),
]

HR_EXAMPLES = [
    (
        "Employee row · directory",
        '''<div style="max-width:540px;display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="width:36px;height:36px;border-radius:50%;background:#FEE2E5;color:#7F1D1D;display:grid;place-items:center;font:600 13px/1 var(--font-sans);flex:none;">FM</span>
  <div style="flex:1;min-width:0;">
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Faith Moyo</div>
    <div style="font:12px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">EMP-0042 · Park Centre · Cashier</div>
  </div>
  <span class="badge badge-success">Active</span>
  <span style="font:500 13px/1 var(--font-mono);color:var(--text-strong);">$ 480/mo</span>
</div>''',
        '''import { EmployeeRow, Badge } from '@corelith/design-system';

function StaffListItem({ employee }) {
  return (
    <EmployeeRow
      avatarInitials={employee.initials}
      name={employee.name}
      meta={`${employee.id} · ${employee.site} · ${employee.role}`}
      status={<Badge tone="success">{employee.contractStatus}</Badge>}
      salary={employee.grossMonthly}
    />
  );
}''',
    ),
    (
        "Payroll line · with PAYE / NSSA",
        '''<div style="max-width:560px;display:grid;grid-template-columns:1fr 90px 90px 90px;gap:10px;align-items:center;padding:11px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <div>
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Tafadzwa Mhike</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">CMM-D2 · Avondale · Floor sup.</div>
  </div>
  <span style="font:500 13px/1 var(--font-mono);color:var(--text-strong);text-align:right;">$ 880.00</span>
  <span style="font:500 13px/1 var(--font-mono);color:var(--tone-danger);text-align:right;">-$ 168.50</span>
  <span style="font:600 13px/1 var(--font-mono);color:var(--tone-success);text-align:right;">$ 703.47</span>
</div>''',
        '''import { PayrollLine, NumericCell } from '@corelith/design-system';

function PayrollRow({ line }) {
  return (
    <PayrollLine
      employee={line.employee}
      grade={line.necGrade}
      gross={<NumericCell value={line.gross} currency="USD" />}
      deductions={<NumericCell value={line.deductions} tone="danger" sign="negative" currency="USD" />}
      net={<NumericCell value={line.net} tone="success" weight="bold" currency="USD" />}
    />
  );
}''',
    ),
    (
        "Leave request card",
        '''<div style="max-width:380px;padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="display:flex;align-items:center;gap:10px;">
    <span style="width:32px;height:32px;border-radius:50%;background:#FFE5C8;color:#6B3F19;display:grid;place-items:center;font:600 12px/1 var(--font-sans);">AC</span>
    <div style="flex:1;">
      <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Alex Chiwanza</div>
      <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">EMP-0048 · Park Centre</div>
    </div>
    <span class="badge badge-warn">Pending</span>
  </div>
  <div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font:var(--type-body-sm);">
    <div><div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Type</div><div style="color:var(--text-strong);font-weight:500;margin-top:3px;">Annual</div></div>
    <div><div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Days</div><div style="color:var(--text-strong);font-weight:500;margin-top:3px;">4 (18-21 Jun)</div></div>
    <div><div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Balance after</div><div style="color:var(--text-strong);font-weight:500;margin-top:3px;">7 / 22</div></div>
    <div><div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Cover</div><div style="color:var(--text-strong);font-weight:500;margin-top:3px;">Faith M.</div></div>
  </div>
  <div style="display:flex;gap:8px;margin-top:14px;">
    <button class="btn btn-quiet" style="flex:1;">Deny</button>
    <button class="btn btn-primary" style="flex:1;">Approve</button>
  </div>
</div>''',
        '''import { LeaveRequestCard, Button } from '@corelith/design-system';

function PendingLeave({ request, onApprove, onDeny }) {
  return (
    <LeaveRequestCard
      employee={request.employee}
      type={request.leaveType}
      days={request.dayCount}
      window={`${request.startDate} – ${request.endDate}`}
      balanceAfter={request.balanceAfter}
      cover={request.coverEmployee}
      status="pending"
      actions={
        <>
          <Button variant="quiet" onClick={() => onDeny(request.id)}>Deny</Button>
          <Button variant="primary" onClick={() => onApprove(request.id)}>Approve</Button>
        </>
      }
    />
  );
}''',
    ),
    (
        "Compliance pill row · ZIMRA / NSSA / NEC",
        '''<div style="display:flex;gap:8px;flex-wrap:wrap;">
  <span class="badge badge-success">PAYE · filed 03 Jun</span>
  <span class="badge badge-success">NSSA · filed 03 Jun</span>
  <span class="badge badge-warn">NEC · due 10 Jul</span>
  <span class="badge badge-neutral">IT3 · year-end</span>
</div>''',
        '''import { Badge } from '@corelith/design-system';

function ComplianceStatus({ filings }) {
  return filings.map((f) => (
    <Badge key={f.id} tone={f.status}>{`${f.code} · ${f.label}`}</Badge>
  ));
}''',
    ),
]



MAINT_EXAMPLES = [
    (
        "Work order card · open",
        '''<div style="max-width:440px;padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="display:flex;align-items:center;gap:8px;">
    <span style="font:500 11px/1 var(--font-mono);color:var(--text-subtle);letter-spacing:.06em;">WO-2026-0184</span>
    <span class="badge badge-warn">In progress</span>
    <span class="badge badge-danger">High</span>
    <span style="margin-left:auto;font:500 11px/1 var(--font-mono);color:var(--text-muted);">2h 14m</span>
  </div>
  <div style="font:600 14.5px/1.3 var(--font-sans);color:var(--text-strong);margin-top:10px;">Cold-room compressor · cycling</div>
  <div style="font:13px/1.5 var(--font-sans);color:var(--text-muted);margin-top:4px;">Park Centre cold-room A is cycling every 4 minutes. Suspect low refrigerant. Tech onsite at 13:40.</div>
  <div style="display:flex;align-items:center;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border-subtle);">
    <span style="width:26px;height:26px;border-radius:50%;background:#DEEAFE;color:#1E40AF;display:grid;place-items:center;font:600 11px/1 var(--font-sans);">JM</span>
    <span style="font:500 12.5px/1 var(--font-sans);color:var(--text-strong);">Joseph Madziva</span>
    <span style="font:11px/1 var(--font-mono);color:var(--text-muted);">· Refrigeration</span>
    <span style="margin-left:auto;font:500 12.5px/1 var(--font-sans);color:var(--brand-strong);cursor:pointer;">Open →</span>
  </div>
</div>''',
        '''import { WorkOrderCard, Badge, Avatar } from '@corelith/design-system';

function ActiveWorkOrder({ wo }) {
  return (
    <WorkOrderCard
      id={wo.id}
      status={<Badge tone="warn">{wo.status}</Badge>}
      priority={<Badge tone="danger">{wo.priority}</Badge>}
      age={wo.openFor}
      title={wo.title}
      description={wo.description}
      assignee={<Avatar name={wo.tech.name} initials={wo.tech.initials} sub={wo.tech.discipline} />}
      href={`/maintenance/work-orders/${wo.id}`}
    />
  );
}''',
    ),
    (
        "Asset row · with health",
        '''<div style="max-width:560px;display:grid;grid-template-columns:36px 1fr auto auto;gap:14px;align-items:center;padding:11px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="width:36px;height:36px;border-radius:8px;background:var(--surface-muted);color:var(--text-muted);display:grid;place-items:center;"><span data-icon="box" data-icon-size="18"></span></span>
  <div>
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Generator · Cummins 60kVA</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">AST-0112 · Avondale · 4.2y old</div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;">
    <span style="font:600 12px/1 var(--font-sans);color:var(--tone-success);">98%</span>
    <div style="width:80px;height:4px;background:var(--surface-muted);border-radius:9999px;overflow:hidden;"><div style="width:98%;height:100%;background:var(--tone-success);"></div></div>
  </div>
  <span class="badge badge-success">Healthy</span>
</div>''',
        '''import { AssetRow, Progress, Badge } from '@corelith/design-system';

function FleetAsset({ asset }) {
  return (
    <AssetRow
      icon={asset.icon}
      name={asset.name}
      meta={`${asset.id} · ${asset.site} · ${asset.ageYears}y old`}
      health={<Progress value={asset.healthPct} tone={asset.healthTone} compact />}
      status={<Badge tone="success">{asset.statusLabel}</Badge>}
    />
  );
}''',
    ),
    (
        "Technician chip · availability",
        '''<div style="display:flex;gap:8px;flex-wrap:wrap;">
  <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:9999px;background:var(--tone-success-bg);color:var(--tone-success);font:500 12px/1 var(--font-sans);">
    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> Joseph M. · Free
  </span>
  <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:9999px;background:var(--tone-warn-bg);color:var(--tone-warn);font:500 12px/1 var(--font-sans);">
    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> Tendai N. · On WO-0184
  </span>
  <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:9999px;background:var(--surface-muted);color:var(--text-muted);font:500 12px/1 var(--font-sans);">
    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> Patience S. · Off
  </span>
</div>''',
        '''import { TechnicianChip } from '@corelith/design-system';

function RosterChips({ technicians }) {
  return technicians.map((t) => (
    <TechnicianChip
      key={t.id}
      name={t.shortName}
      availability={t.availability}
      currentJob={t.currentWoId}
    />
  ));
}''',
    ),
    (
        "PM schedule cell",
        '''<div style="max-width:380px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <div style="display:flex;align-items:baseline;gap:8px;">
    <span style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Generator service · 250hr</span>
    <span style="font:500 11px/1 var(--font-mono);color:var(--text-muted);margin-left:auto;">AST-0112</span>
  </div>
  <div style="font:12px/1.3 var(--font-mono);color:var(--text-muted);margin-top:4px;">Next: Fri 21 Jun · 232 / 250 hrs</div>
  <div style="position:relative;height:6px;background:var(--surface-muted);border-radius:9999px;margin-top:10px;">
    <div style="position:absolute;inset:0 7% 0 0;background:var(--tone-warn);border-radius:9999px;"></div>
  </div>
</div>''',
        '''import { PmTaskCell, Progress } from '@corelith/design-system';

function NextService({ task }) {
  return (
    <PmTaskCell
      name={task.name}
      assetId={task.assetId}
      due={`Next: ${task.nextDue} · ${task.usedHours} / ${task.intervalHours} hrs`}
      progress={<Progress value={task.pct} tone="warn" compact />}
    />
  );
}''',
    ),
]

NOTIF_EXAMPLES = [
    (
        "Notification row · unread",
        '''<div style="max-width:520px;display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--brand-soft);border:1px solid var(--brand-100);border-radius:10px;">
  <span style="width:8px;height:8px;border-radius:50%;background:var(--brand);margin-top:6px;flex:none;"></span>
  <span style="width:32px;height:32px;border-radius:8px;background:var(--surface);color:var(--brand-strong);display:grid;place-items:center;flex:none;"><span data-icon="coin" data-icon-size="16"></span></span>
  <div style="flex:1;min-width:0;">
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Payroll approved · June 2026</div>
    <div style="font:12.5px/1.4 var(--font-sans);color:var(--text-muted);margin-top:3px;">242 payslips emailed. $ 138,311.82 EFT batch ready for Stanbic upload.</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-subtle);margin-top:4px;">HR Manager · 4m ago</div>
  </div>
  <button style="background:transparent;border:0;color:var(--text-subtle);cursor:pointer;padding:4px;"><span data-icon="x" data-icon-size="14"></span></button>
</div>''',
        '''import { NotificationRow } from '@corelith/design-system';

function InboxItem({ notification, onDismiss }) {
  return (
    <NotificationRow
      unread={notification.unread}
      icon={notification.icon}
      title={notification.title}
      body={notification.body}
      meta={`${notification.actor} · ${notification.age}`}
      onDismiss={() => onDismiss(notification.id)}
    />
  );
}''',
    ),
    (
        "Channel toggle row",
        '''<div style="max-width:480px;display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="width:34px;height:34px;border-radius:8px;background:#DCFCE7;color:#166534;display:grid;place-items:center;"><span data-icon="phone" data-icon-size="16"></span></span>
  <div style="flex:1;">
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">WhatsApp · Econet Cloud</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">+263 77 123 4567 · verified</div>
  </div>
  <span class="badge badge-success">Live</span>
  <label style="position:relative;display:inline-block;width:36px;height:20px;flex:none;">
    <input type="checkbox" checked style="opacity:0;width:0;height:0;" />
    <span style="position:absolute;inset:0;background:var(--brand);border-radius:9999px;cursor:pointer;"></span>
    <span style="position:absolute;top:2px;left:18px;width:16px;height:16px;background:#fff;border-radius:50%;"></span>
  </label>
</div>''',
        '''import { ChannelRow, Switch, Badge } from '@corelith/design-system';

function NotificationChannel({ channel, onToggle }) {
  return (
    <ChannelRow
      icon={channel.icon}
      name={channel.name}
      address={channel.address}
      status={<Badge tone="success">{channel.status}</Badge>}
      control={<Switch checked={channel.enabled} onChange={() => onToggle(channel.id)} />}
    />
  );
}''',
    ),
    (
        "Template card · payslip email",
        '''<div style="max-width:380px;padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="display:flex;align-items:center;gap:8px;">
    <span style="width:30px;height:30px;border-radius:8px;background:#FEF3C7;color:#92400E;display:grid;place-items:center;"><span data-icon="mail" data-icon-size="14"></span></span>
    <div style="flex:1;"><div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Payslip · monthly</div><div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">Email · v4</div></div>
    <span class="badge badge-success">Active</span>
  </div>
  <div style="font:12.5px/1.5 var(--font-sans);color:var(--text-muted);margin-top:12px;padding:10px 12px;background:var(--surface-muted);border-radius:8px;border-left:3px solid var(--brand);">"Dear {{employee.first_name}}, your payslip for {{period}} is attached. Net pay: {{net}}."</div>
  <div style="display:flex;gap:8px;margin-top:12px;font:11px/1.3 var(--font-mono);color:var(--text-subtle);">
    <span>242 sends · last 03 Jun</span>
  </div>
</div>''',
        '''import { TemplateCard, Badge } from '@corelith/design-system';

function MessageTemplate({ template }) {
  return (
    <TemplateCard
      icon="mail"
      name={template.name}
      channel={template.channel}
      version={template.version}
      status={<Badge tone="success">Active</Badge>}
      preview={template.body}
      meta={`${template.sendCount} sends · last ${template.lastSent}`}
    />
  );
}''',
    ),
    (
        "Delivery log row",
        '''<div style="max-width:600px;display:grid;grid-template-columns:auto 1fr auto auto;gap:12px;align-items:center;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font:13px/1 var(--font-sans);">
  <span class="badge badge-success">Sent</span>
  <div>
    <div style="font:600 13px/1.3 var(--font-sans);color:var(--text-strong);">SMS · Low stock alert</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">+263 77 123 4567 · Tafadzwa M.</div>
  </div>
  <span style="font:500 11.5px/1 var(--font-mono);color:var(--text-muted);">EcoCash</span>
  <span style="font:500 11.5px/1 var(--font-mono);color:var(--text-subtle);">14:32:08</span>
</div>''',
        '''import { DeliveryLogRow, Badge } from '@corelith/design-system';

function LogEntry({ delivery }) {
  return (
    <DeliveryLogRow
      status={<Badge tone={delivery.statusTone}>{delivery.status}</Badge>}
      title={`${delivery.channel} · ${delivery.subject}`}
      recipient={`${delivery.address} · ${delivery.recipientName}`}
      provider={delivery.provider}
      timestamp={delivery.sentAt}
    />
  );
}''',
    ),
]

SETTINGS_EXAMPLES = [
    (
        "Member row · role badge",
        '''<div style="max-width:560px;display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="width:34px;height:34px;border-radius:50%;background:#EDE0FF;color:#4C1D95;display:grid;place-items:center;font:600 12px/1 var(--font-sans);flex:none;">PS</span>
  <div style="flex:1;min-width:0;">
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Patience Sibanda</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">patience@mukamba.co.zw · 2FA on</div>
  </div>
  <span class="badge badge-info">Operations</span>
  <span class="badge badge-neutral">Manager</span>
  <span style="font:500 11px/1 var(--font-mono);color:var(--text-subtle);">14d ago</span>
</div>''',
        '''import { MemberRow, Badge } from '@corelith/design-system';

function MembershipRow({ member }) {
  return (
    <MemberRow
      avatarInitials={member.initials}
      avatarTone={member.avatarTone}
      name={member.name}
      meta={`${member.email} · ${member.mfaEnabled ? '2FA on' : '2FA off'}`}
      department={<Badge tone="info">{member.department}</Badge>}
      role={<Badge tone="neutral">{member.role}</Badge>}
      lastSeen={member.lastSeenRel}
    />
  );
}''',
    ),
    (
        "Integration card · Stanbic EFT",
        '''<div style="max-width:380px;padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="display:flex;align-items:center;gap:10px;">
    <span style="width:36px;height:36px;border-radius:8px;background:#DEEAFE;color:#1E40AF;display:grid;place-items:center;"><span data-icon="card" data-icon-size="18"></span></span>
    <div style="flex:1;"><div style="font:600 14px/1.3 var(--font-sans);color:var(--text-strong);">Stanbic Bank EFT</div><div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">CSV · batch upload</div></div>
    <span class="badge badge-success">Connected</span>
  </div>
  <div style="font:13px/1.5 var(--font-sans);color:var(--text-muted);margin-top:12px;">Generates Stanbic-format CSV from payroll runs. Last batch: $138,311.82 · 03 Jun.</div>
  <div style="display:flex;gap:8px;margin-top:14px;">
    <button class="btn btn-quiet" style="font-size:12.5px;padding:6px 10px;">Configure</button>
    <button class="btn btn-quiet" style="font-size:12.5px;padding:6px 10px;">Test run</button>
  </div>
</div>''',
        '''import { IntegrationCard, Badge, Button } from '@corelith/design-system';

function PaymentsIntegration({ integration, onConfigure, onTest }) {
  return (
    <IntegrationCard
      icon={integration.icon}
      name={integration.name}
      kind={integration.kind}
      status={<Badge tone="success">Connected</Badge>}
      description={integration.description}
      actions={
        <>
          <Button variant="quiet" onClick={onConfigure}>Configure</Button>
          <Button variant="quiet" onClick={onTest}>Test run</Button>
        </>
      }
    />
  );
}''',
    ),
    (
        "API key row · scoped",
        '''<div style="max-width:600px;display:grid;grid-template-columns:auto 1fr auto auto;gap:14px;align-items:center;padding:11px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="width:30px;height:30px;border-radius:8px;background:var(--surface-muted);color:var(--text-strong);display:grid;place-items:center;"><span data-icon="code" data-icon-size="14"></span></span>
  <div>
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">prod_pos_terminal</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">huchu_sk_····7c4f · sales:write, items:read</div>
  </div>
  <span style="font:500 11px/1 var(--font-mono);color:var(--text-muted);">Last used 2m ago</span>
  <button style="background:var(--surface-muted);border:0;color:var(--text-strong);padding:5px 10px;border-radius:6px;font:500 12px/1 var(--font-sans);cursor:pointer;">Revoke</button>
</div>''',
        '''import { ApiKeyRow, Button } from '@corelith/design-system';

function KeyListItem({ key, onRevoke }) {
  return (
    <ApiKeyRow
      icon="code"
      name={key.name}
      masked={key.maskedSecret}
      scopes={key.scopes}
      lastUsed={key.lastUsedRel}
      action={<Button variant="secondary" tone="danger" onClick={() => onRevoke(key.id)}>Revoke</Button>}
    />
  );
}''',
    ),
    (
        "Branch tile · per site",
        '''<div style="max-width:320px;padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="display:flex;align-items:center;gap:10px;">
    <span style="width:34px;height:34px;border-radius:8px;background:var(--brand-soft);color:var(--brand-strong);display:grid;place-items:center;"><span data-icon="pin" data-icon-size="16"></span></span>
    <div><div style="font:600 14px/1.3 var(--font-sans);color:var(--text-strong);">Park Centre</div><div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">Harare · UTC+2</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;font:var(--type-body-sm);">
    <div><div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Staff</div><div style="font:600 16px/1 var(--font-sans);color:var(--text-strong);margin-top:4px;">62</div></div>
    <div><div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Tills</div><div style="font:600 16px/1 var(--font-sans);color:var(--text-strong);margin-top:4px;">4</div></div>
  </div>
</div>''',
        '''import { BranchTile } from '@corelith/design-system';

function SiteCard({ branch }) {
  return (
    <BranchTile
      icon="pin"
      name={branch.name}
      city={branch.city}
      timezone={branch.tz}
      stats={[
        { label: 'Staff', value: branch.headcount },
        { label: 'Tills', value: branch.posCount },
      ]}
    />
  );
}''',
    ),
]

STOCK_EXAMPLES = [
    (
        "Item row · stock level bar",
        '''<div style="max-width:560px;display:grid;grid-template-columns:36px 1fr 120px auto;gap:14px;align-items:center;padding:11px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="width:36px;height:36px;border-radius:8px;background:var(--surface-muted);color:var(--text-muted);display:grid;place-items:center;"><span data-icon="box" data-icon-size="16"></span></span>
  <div>
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Mealie meal · 10kg · Roller</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">SKU-MM-10R · Aisle 3 · Bin B12</div>
  </div>
  <div>
    <div style="display:flex;justify-content:space-between;font:11px/1 var(--font-mono);color:var(--text-muted);"><span>14</span><span>par 40</span></div>
    <div style="height:5px;background:var(--surface-muted);border-radius:9999px;margin-top:6px;"><div style="width:35%;height:100%;background:var(--tone-warn);border-radius:9999px;"></div></div>
  </div>
  <span class="badge badge-warn">Low</span>
</div>''',
        '''import { ItemRow, Progress, Badge } from '@corelith/design-system';

function StockItem({ item }) {
  return (
    <ItemRow
      icon="box"
      name={item.name}
      location={`${item.sku} · ${item.aisle} · ${item.bin}`}
      level={<Progress value={item.onHand} max={item.parLevel} tone="warn" showValues />}
      status={<Badge tone={item.statusTone}>{item.statusLabel}</Badge>}
    />
  );
}''',
    ),
    (
        "Transfer row · in-transit",
        '''<div style="max-width:580px;display:grid;grid-template-columns:auto 1fr auto auto;gap:14px;align-items:center;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
  <span style="font:500 11px/1 var(--font-mono);color:var(--text-subtle);letter-spacing:.06em;">TRF-2026-018</span>
  <div>
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Park Centre → Mutare · 18 SKUs</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">Driver: Brian C. · ZIM-2418 · ETA 16:40</div>
  </div>
  <span class="badge badge-info">In transit</span>
  <span style="font:500 13px/1 var(--font-mono);color:var(--text-strong);">$ 4,820</span>
</div>''',
        '''import { TransferRow, Badge } from '@corelith/design-system';

function InTransitRow({ transfer }) {
  return (
    <TransferRow
      id={transfer.id}
      route={`${transfer.from} → ${transfer.to} · ${transfer.skuCount} SKUs`}
      driver={`Driver: ${transfer.driver} · ${transfer.vehicle} · ETA ${transfer.eta}`}
      status={<Badge tone="info">In transit</Badge>}
      value={transfer.totalValue}
    />
  );
}''',
    ),
    (
        "Supplier card · with rating",
        '''<div style="max-width:380px;padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
  <div style="display:flex;align-items:center;gap:10px;">
    <span style="width:36px;height:36px;border-radius:8px;background:#FFE5C8;color:#6B3F19;display:grid;place-items:center;font:600 13px/1 var(--font-sans);">NM</span>
    <div style="flex:1;"><div style="font:600 14px/1.3 var(--font-sans);color:var(--text-strong);">National Foods Ltd</div><div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">Harare · NET-30</div></div>
    <span style="font:600 13px/1 var(--font-mono);color:var(--tone-success);">A</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px;font:var(--type-body-sm);">
    <div><div style="color:var(--text-muted);font-size:11px;">YTD spend</div><div style="font:600 13px/1 var(--font-mono);color:var(--text-strong);margin-top:4px;">$ 84.2k</div></div>
    <div><div style="color:var(--text-muted);font-size:11px;">On-time</div><div style="font:600 13px/1 var(--font-mono);color:var(--text-strong);margin-top:4px;">96%</div></div>
    <div><div style="color:var(--text-muted);font-size:11px;">SKUs</div><div style="font:600 13px/1 var(--font-mono);color:var(--text-strong);margin-top:4px;">42</div></div>
  </div>
</div>''',
        '''import { SupplierCard } from '@corelith/design-system';

function VendorTile({ supplier }) {
  return (
    <SupplierCard
      logoInitials={supplier.initials}
      name={supplier.name}
      meta={`${supplier.city} · ${supplier.terms}`}
      rating={supplier.creditRating}
      stats={[
        { label: 'YTD spend', value: supplier.ytdSpend },
        { label: 'On-time',   value: `${supplier.onTimePct}%` },
        { label: 'SKUs',      value: supplier.skuCount },
      ]}
    />
  );
}''',
    ),
    (
        "Receiving line · qty discrepancy",
        '''<div style="max-width:580px;display:grid;grid-template-columns:1fr 60px 60px 60px auto;gap:12px;align-items:center;padding:11px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font:var(--type-body-sm);">
  <div>
    <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Cooking oil · 2L · Pure Drop</div>
    <div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">SKU-CO-02P</div>
  </div>
  <span style="font:500 13px/1 var(--font-mono);color:var(--text-muted);text-align:center;">PO 120</span>
  <span style="font:500 13px/1 var(--font-mono);color:var(--tone-danger);text-align:center;">Got 116</span>
  <span style="font:500 13px/1 var(--font-mono);color:var(--tone-danger);text-align:center;">-4</span>
  <span class="badge badge-warn">Variance</span>
</div>''',
        '''import { ReceivingLine, NumericCell, Badge } from '@corelith/design-system';

function GoodsReceiptLine({ line }) {
  const variance = line.received - line.ordered;
  return (
    <ReceivingLine
      item={line.item}
      ordered={<NumericCell value={line.ordered} />}
      received={<NumericCell value={line.received} tone={variance ? 'danger' : 'default'} />}
      variance={<NumericCell value={variance} tone={variance ? 'danger' : 'default'} sign />}
      status={variance ? <Badge tone="warn">Variance</Badge> : <Badge tone="success">OK</Badge>}
    />
  );
}''',
    ),
]

EXAMPLES = {
    "cctv": CCTV_EXAMPLES,
    "hr": HR_EXAMPLES,
    "maintenance": MAINT_EXAMPLES,
    "notifications": NOTIF_EXAMPLES,
    "settings": SETTINGS_EXAMPLES,
    "stock": STOCK_EXAMPLES,
}


def build_examples_html(mod):
    return "\n".join(example_card(t, h, r) for (t, h, r) in EXAMPLES[mod])



# =============================================================================
# Surface page body builders. Each returns the inner <main> body HTML
# (everything below the dash-topbar). Pages use header + stats + cards + tables.
# =============================================================================

def list_body(title, lede, pills, actions, stat_tiles, primary_card_title, primary_card_sub, primary_card_table, secondary_html=""):
    parts = []
    parts.append(header(title, lede, pills, actions))
    if stat_tiles:
        parts.append(stats(stat_tiles))
    parts.append(sec(card(primary_card_title, primary_card_sub, primary_card_table)))
    if secondary_html:
        parts.append(sec(secondary_html))
    return "\n".join(parts)


# ── CCTV surfaces ────────────────────────────────────────────────────────────

def cctv_live_wall_body():
    grid = ""
    cams = [
        ("CAM-014","Park Centre · Front till","Online","ok","#1F2937","#0F172A"),
        ("CAM-015","Park Centre · Aisle 2","Online","ok","#0F172A","#1F2937"),
        ("CAM-016","Park Centre · Stockroom","Online","ok","#1F2937","#0F172A"),
        ("CAM-022","Bulawayo · Front till","Online","ok","#0F172A","#1F2937"),
        ("CAM-023","Bulawayo · Stockroom B","Motion","warn","#1F2937","#0F172A"),
        ("CAM-031","Avondale · Cold-room","Online","ok","#0F172A","#1F2937"),
        ("CAM-032","Avondale · Bay door","Offline","danger","#0F172A","#1F2937"),
        ("CAM-040","Mutare · Front till","Online","ok","#1F2937","#0F172A"),
        ("CAM-041","Mutare · Aisle 1","Online","ok","#0F172A","#1F2937"),
    ]
    for cid, name, status, tone, g1, g2 in cams:
        tone_color = {"ok":"#22C55E","warn":"#F59E0B","danger":"#EF4444"}[tone]
        live_pill = "" if status == "Offline" else f'<span style="position:absolute;top:8px;left:8px;display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:9999px;background:rgba(220,38,38,.9);font:600 10px/1 var(--font-sans);color:#fff;"><span style="width:6px;height:6px;border-radius:50%;background:#fff;"></span> LIVE</span>'
        grid += f'''
        <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--ink);color:#fff;">
          <div style="aspect-ratio:16/9;background:linear-gradient(135deg,{g1},{g2});position:relative;display:grid;place-items:center;">
            <span data-icon="camera" data-icon-size="28" style="color:rgba(255,255,255,.25);"></span>
            {live_pill}
            <span style="position:absolute;top:8px;right:8px;font:500 10px/1 var(--font-mono);color:rgba(255,255,255,.7);">14:32:08</span>
            <span style="position:absolute;bottom:8px;right:8px;padding:2px 7px;border-radius:5px;background:rgba(0,0,0,.55);font:500 10px/1 var(--font-mono);color:#fff;">1080p</span>
            <span style="position:absolute;bottom:8px;left:8px;display:inline-flex;align-items:center;gap:5px;padding:2px 7px;border-radius:9999px;background:rgba(0,0,0,.55);font:500 10px/1 var(--font-mono);color:{tone_color};"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> {status}</span>
          </div>
          <div style="padding:10px 12px;"><div style="font:600 13px/1.2 var(--font-sans);color:#fff;">{name}</div><div style="font:11px/1.3 var(--font-mono);color:rgba(255,255,255,.5);margin-top:2px;">{cid} · NVR-01</div></div>
        </div>'''
    grid_block = f'<div class="dash-card"><div class="dash-card-h"><div><h2>Live wall · 9 of 38 cameras</h2><div class="sub">Showing all sites · click to fullscreen / start PTZ control</div></div><div class="filter-bar"><span class="f active">All sites</span><span class="f">Park Centre</span><span class="f">Bulawayo</span><span class="f">Avondale</span><span class="f">Mutare</span></div></div><div style="padding:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">{grid}</div></div>'
    body = header(
        "Live wall",
        "All cameras across 5 sites · multi-stream with PTZ controls. Click a tile to take exclusive control.",
        [("b","Operations"),("","9 / 38 visible"),("s","NVR-01 healthy")],
        '<button class="btn btn-quiet"><span data-icon="grid" data-icon-size="14"></span> 3 × 3</button> <button class="btn btn-secondary"><span data-icon="filter" data-icon-size="14"></span> Filter</button> <button class="btn btn-primary"><span data-icon="play" data-icon-size="14"></span> Record clip</button>',
    )
    body += stats([
        ("Online", "36", "<span class='u'>/ 38</span>", "+ 2 reconnected", "up"),
        ("Motion events · 24h", "47", "", "12 after-hours", ""),
        ("Storage · NVR-01", "68%", "", "12d retention", ""),
        ("Bandwidth", "184", "<span class='u'>Mbps</span>", "82% of 224", ""),
    ])
    body += sec(grid_block)
    return body


def cctv_camera_detail_body():
    cam = "CAM-014"
    body = header(
        f"{cam} · Park Centre · Front till",
        "Axis P3265-LV · 1080p · 30fps · PTZ disabled · firmware 11.4.62 · 12d uptime. Linked to till POS-01.",
        [("b","Online"),("","NVR-01"),("s","Healthy")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export 24h</button> <button class="btn btn-secondary"><span data-icon="settings" data-icon-size="14"></span> Configure</button> <button class="btn btn-primary"><span data-icon="play" data-icon-size="14"></span> Live</button>',
    )
    body += stats([
        ("Uptime · 30d", "99.4%", "", "+ 0.2% vs LM", "up"),
        ("Motion · 24h", "18", "", "3 after-hours", ""),
        ("Storage used", "14.2", "<span class='u'>GB</span>", "Retention 30d", ""),
        ("Firmware", "11.4.62", "", "Latest", ""),
    ])
    body += sec('<div class="dash-card"><div class="dash-card-h"><div><h2>Last 24 hours · motion timeline</h2><div class="sub">Bars = motion-triggered clips · click to scrub playback</div></div></div><div style="padding:24px 22px;"><div style="display:grid;grid-template-columns:repeat(24,1fr);gap:3px;height:80px;align-items:end;">' + "".join(f'<div style="height:{(i*7+13)%80+10}px;background:var(--brand-soft);border-radius:3px;"></div>' for i in range(24)) + '</div><div style="display:flex;justify-content:space-between;margin-top:8px;font:11px/1 var(--font-mono);color:var(--text-subtle);"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div></div></div>')
    rows = [
        ('<span class="nm">02:14:33</span><div class="sb">Motion · after-hours · CAM-022 zone</div>', '<span class="badge warn"><span class="dot"></span> 6s</span>', '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">08:02:17</span><div class="sb">Motion · staff arrival</div>', '<span class="badge ok">2s</span>', '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">14:32:08</span><div class="sb">Motion · checkout activity</div>', '<span class="badge ok">3s</span>', '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
    ]
    body += sec(card("Recent clips", "Auto-archived to NVR-01", table([("Time",False),("Length",False),("",False)], rows)))
    return body


def cctv_event_log_body():
    rows = [
        ('<span class="badge warn"><span class="dot"></span> Motion · after-hours</span>',
         '<span class="nm">Bulawayo · Stockroom B</span><div class="sb">CAM-023 · 02:14:33 · 6s clip</div>',
         "Faith Moyo",
         '<span class="badge neutral">Pending</span>'),
        ('<span class="badge danger"><span class="dot"></span> Camera offline</span>',
         '<span class="nm">Avondale · Bay door</span><div class="sb">CAM-032 · Last seen 11:42 · 2h gap</div>',
         "Tendai N.",
         '<span class="badge warn"><span class="dot"></span> Active</span>'),
        ('<span class="badge brand"><span class="dot"></span> PTZ override</span>',
         '<span class="nm">Park Centre · Front till</span><div class="sb">CAM-014 · Brian C. took control</div>',
         "Brian C.",
         '<span class="badge ok">Resolved</span>'),
        ('<span class="badge warn"><span class="dot"></span> Tamper detected</span>',
         '<span class="nm">Mutare · Aisle 1</span><div class="sb">CAM-041 · Lens obstruction 14:12</div>',
         "Patience S.",
         '<span class="badge neutral">Pending</span>'),
        ('<span class="badge ok">Loitering · alert</span>',
         '<span class="nm">Park Centre · Bay door</span><div class="sb">CAM-018 · 12 min · cleared 13:48</div>',
         "Faith Moyo",
         '<span class="badge ok">Cleared</span>'),
        ('<span class="badge warn"><span class="dot"></span> Motion · after-hours</span>',
         '<span class="nm">Bulawayo · Stockroom A</span><div class="sb">CAM-021 · 23:47:02 · 4s clip</div>',
         "Auto",
         '<span class="badge ok">False positive</span>'),
    ]
    body = header(
        "Event log",
        "47 surveillance events in the last 24h across 5 sites. Filter by type, site, or status.",
        [("b","24h"),("","12 after-hours"),("","3 active")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="filter" data-icon-size="14"></span> Filter</button>',
    )
    body += stats([
        ("All events · 24h", "47", "", "+ 8 vs yesterday", ""),
        ("After-hours", "12", "", "Stockrooms", ""),
        ("Active alerts", "3", "", "1 critical", ""),
        ("Cleared today", "31", "", "94% on auto-rule", ""),
    ])
    body += sec(card("Events", "Sorted newest first · click to open clip", toolbar("Search type, camera, site", ["Type","Site","Status"], "Showing 1–6 of 47") + table([("Event",False),("Where",False),("Owner",False),("Status",False)], rows), filters("All", "Motion","Offline","Tamper","PTZ","Loitering")))
    return body


def cctv_recordings_body():
    rows = [
        ('<span class="nm">REC-2026-06-02-01</span><div class="sb">CAM-014 · Park Centre · 00:00–06:00</div>',
         '<span class="badge neutral">6h</span>', "4.8 GB", "30d", '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Play</button>'),
        ('<span class="nm">REC-2026-06-02-02</span><div class="sb">CAM-014 · Park Centre · 06:00–12:00</div>',
         '<span class="badge neutral">6h</span>', "5.1 GB", "30d", '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Play</button>'),
        ('<span class="nm">REC-2026-06-01-04</span><div class="sb">CAM-023 · Bulawayo · 18:00–24:00 · motion</div>',
         '<span class="badge warn">Flagged</span>', "0.8 GB", "90d", '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Play</button>'),
        ('<span class="nm">REC-2026-06-01-05</span><div class="sb">CAM-031 · Avondale · 12:00–18:00</div>',
         '<span class="badge neutral">6h</span>', "4.7 GB", "30d", '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Play</button>'),
        ('<span class="nm">REC-2026-05-31-12</span><div class="sb">CAM-040 · Mutare · incident clip</div>',
         '<span class="badge danger">Evidence</span>', "0.2 GB", "Hold", '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Play</button>'),
    ]
    body = header(
        "Recordings",
        "Search and playback across NVR-01. Scrub by camera, by date, or by tagged event.",
        [("b","Storage"),("","68% of 12 TB"),("s","Daily archive 03:00")],
        '<button class="btn btn-quiet"><span data-icon="calendar" data-icon-size="14"></span> Date range</button> <button class="btn btn-secondary"><span data-icon="filter" data-icon-size="14"></span> Filter</button> <button class="btn btn-primary"><span data-icon="download" data-icon-size="14"></span> Export</button>',
    )
    body += stats([
        ("Recordings on hand","8,412","","across 38 cams",""),
        ("Storage used","8.16","<span class='u'>TB</span>","of 12 TB",""),
        ("Flagged / evidence","42","","Held indefinitely",""),
        ("Oldest unarchived","12d","","Mutare · CAM-040",""),
    ])
    body += sec(card("Recent recordings","Newest first · click Play to scrub", toolbar("Search recording id, camera, site", ["Camera","Date","Tag"], "Showing 1–5 of 8,412") + table([("Recording",False),("Length",False),("Size",False),("Retention",False),("",False)], rows)))
    return body


def cctv_retention_body():
    body = header(
        "Retention policy",
        "How long each site keeps footage. Flagged clips and evidence holds override the policy.",
        [("b","Default 30d"),("","Evidence: indefinite"),("s","Auto-purge 03:00 nightly")],
        '<button class="btn btn-quiet">Reset</button> <button class="btn btn-primary"><span data-icon="check" data-icon-size="14"></span> Save</button>',
    )
    sliders = ""
    for site, cams_n, tb, days in [("Park Centre",12,1.4,30),("Bulawayo",8,0.9,30),("Avondale",6,0.7,60),("Mutare",7,0.8,30),("Head office",5,0.5,14)]:
        pct = (days / 90) * 100
        sliders += f'''
        <div style="padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div><div style="font:600 14px/1.2 var(--font-sans);color:var(--text-strong);">{site} · {cams_n} cameras</div><div style="font:11px/1.3 var(--font-mono);color:var(--text-muted);margin-top:2px;">~ {tb} TB / day · NVR-01</div></div>
            <span style="font:600 20px/1 var(--font-mono);color:var(--brand-strong);">{days}d</span>
          </div>
          <div style="position:relative;height:6px;background:var(--surface-muted);border-radius:9999px;margin-top:14px;">
            <div style="position:absolute;inset:0 {100-pct:.0f}% 0 0;background:var(--brand);border-radius:9999px;"></div>
            <span style="position:absolute;left:calc({pct:.0f}% - 8px);top:-5px;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--brand);"></span>
          </div>
          <div style="display:flex;justify-content:space-between;font:11px/1 var(--font-mono);color:var(--text-subtle);margin-top:8px;"><span>7d</span><span>14d</span><span>30d</span><span>60d</span><span>90d</span></div>
        </div>'''
    body += sec(f'<div class="dash-card"><div class="dash-card-h"><div><h2>Per-site retention</h2><div class="sub">Drag to set retention · evidence holds always bypass</div></div></div><div style="padding:18px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">{sliders}</div></div>')
    body += sec(card("Evidence holds","Indefinitely retained · unaffected by purge", table([("Hold ID",False),("Reason",False),("Owner",False),("Created",False)], [
        ('<span class="nm">EH-2026-018</span>','<span class="nm">Mutare break-in · ZRP case 4422/26</span>','Faith Moyo','17 May'),
        ('<span class="nm">EH-2026-015</span>','<span class="nm">Bulawayo stockroom shrinkage investigation</span>','Tendai N.','03 May'),
        ('<span class="nm">EH-2026-012</span>','<span class="nm">Park Centre slip & fall · pending claim</span>','Patience S.','12 Apr'),
    ])))
    return body



# ── HR surfaces ──────────────────────────────────────────────────────────────

def hr_employee_directory_body():
    rows = []
    EMPS = [
        ("FM","Faith Moyo","red","EMP-0042","Park Centre","Cashier","CMM-C3","Permanent","$ 480.00","2y 4m"),
        ("AC","Alex Chiwanza","orange","EMP-0048","Park Centre","Cashier","CMM-C3","Permanent","$ 480.00","1y 2m"),
        ("SN","Sarah Ndongo","green","EMP-0051","Park Centre","Senior cashier","CMM-C5","Permanent","$ 620.00","3y 8m"),
        ("TM","Tafadzwa Mhike","red","EMP-0084","Avondale","Floor supervisor","CMM-D2","Permanent","$ 880.00","5y 2m"),
        ("PS","Patience Sibanda","purple","EMP-0092","Avondale","Stockroom","CMM-B4","Contract","$ 420.00","8m"),
        ("BC","Brian Chivasa","red","EMP-0118","Bulawayo","Cashier","CMM-C2","Probation","$ 380.00","2m"),
        ("RM","Rumbidzai Manyika","orange","EMP-0162","Mutare","Branch manager","CMM-E1","Permanent","$ 1,820.00","6y 1m"),
        ("JK","Joseph Kanyengo","blue","EMP-0205","Head office","Accountant","CMM-E3","Permanent","$ 2,240.00","4y 7m"),
    ]
    for ini, name, col, eid, site, role, grade, status, salary, tenure in EMPS:
        status_badge = {"Permanent":"ok","Contract":"neutral","Probation":"warn"}[status]
        rows.append((av(ini,name,f"{eid} · {site} · {role}",col), f'<span class="badge neutral">{grade}</span>', f'<span class="badge {status_badge}">{status}</span>', salary, tenure))
    body = header(
        "Employee directory",
        "248 employees across 5 sites · contract status, NEC grade, base salary, tenure. Click a row to open the full profile.",
        [("b","248 total"),("","242 active"),("","6 on leave")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="filter" data-icon-size="14"></span> Filter</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New hire</button>',
    )
    body += stats([
        ("Headcount","248","","+ 4 this month","up"),
        ("Permanent","218","","88%",""),
        ("On contract / probation","26","","",""),
        ("Avg tenure","3.4","<span class='u'>yrs</span>","",""),
    ])
    body += sec(card(
        "Staff list",
        "Filtered to active · sorted by site → role",
        toolbar("Search name, EMP id, NEC grade", ["Site","Role","Status"], "Showing 1–8 of 248")
        + table([("Employee",False),("NEC grade",False),("Status",False),("Base salary",True),("Tenure",False)], rows),
        filters("All sites","Park Centre","Bulawayo","Avondale","Mutare","Head office"),
    ))
    return body


def hr_payroll_run_body():
    # Re-use the verticals/hr/payroll.html style — KPIs + step-rail + pre-list table.
    body = header(
        "Payroll run · June 2026",
        "242 of 248 employees included. PAYE, NSSA, AIDS levy and NEC contributions calculated against May 2026 ZIMRA tax tables. Awaiting your approval to post and email payslips.",
        [("b","Run #2026-06"),("","Cut-off Fri 26 Jun"),("s","Variance checks passed")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export pre-list</button> <button class="btn btn-secondary"><span data-icon="eye" data-icon-size="14"></span> Preview payslip</button> <button class="btn btn-primary"><span data-icon="check" data-icon-size="14"></span> Approve &amp; post</button>',
    )
    body += '<div class="dash-page" style="padding-top:0;"><div class="step-rail">' + \
        '<div class="st done"><span class="n" data-icon="check" data-icon-size="12"></span><div><div class="nm">Inputs</div><div class="sb">248 / 248 sourced</div></div></div>' + \
        '<div class="st done"><span class="n" data-icon="check" data-icon-size="12"></span><div><div class="nm">Earnings</div><div class="sb">Hours + NEC grades</div></div></div>' + \
        '<div class="st done"><span class="n" data-icon="check" data-icon-size="12"></span><div><div class="nm">Deductions</div><div class="sb">PAYE · NSSA · AIDS · NEC</div></div></div>' + \
        '<div class="st active"><span class="n">4</span><div><div class="nm">Preview &amp; approve</div><div class="sb">Awaiting HR Manager</div></div></div>' + \
        '<div class="st"><span class="n">5</span><div><div class="nm">Post to ledger</div><div class="sb">→ Accounting</div></div></div>' + \
        '<div class="st"><span class="n">6</span><div><div class="nm">Email payslips</div><div class="sb">PDF + portal</div></div></div>' + \
        '</div></div>'
    body += stats([
        ("Gross earnings","$ 184","<span class='u'>,620.00</span>","+1.4% vs May","up"),
        ("Total deductions","$ 46","<span class='u'>,308.18</span>","25.1% of gross",""),
        ("Net to pay","$ 138","<span class='u'>,311.82</span>","Stanbic batch · 242 EFT",""),
        ("Statutory payable","$ 38","<span class='u'>,612.40</span>","Due 10 Jul",""),
    ])
    rows = [
        ('<span class="avatar" style="background:#FEE2E5;color:#7F1D1D;">FM</span><span class="nm">Faith Moyo</span><div class="sb">EMP-0042 · Park Centre · Cashier</div>',
         '<span class="badge neutral">CMM-C3</span>','$ 480.00','$ 28.50','$ 21.60','$ 0.86','$ 4.80','$ 424.24'),
        ('<span class="avatar" style="background:#FFE5C8;color:#6B3F19;">AC</span><span class="nm">Alex Chiwanza</span><div class="sb">EMP-0048 · Park Centre · Cashier</div>',
         '<span class="badge neutral">CMM-C3</span>','$ 480.00','$ 28.50','$ 21.60','$ 0.86','$ 4.80','$ 424.24'),
        ('<span class="avatar" style="background:#DCFCE7;color:#166534;">SN</span><span class="nm">Sarah Ndongo</span><div class="sb">EMP-0051 · Park Centre · Senior cashier</div>',
         '<span class="badge neutral">CMM-C5</span>','$ 620.00','$ 56.40','$ 27.90','$ 1.69','$ 6.20','$ 527.81'),
        ('<span class="avatar" style="background:#FEE2E5;color:#7F1D1D;">TM</span><span class="nm">Tafadzwa Mhike</span><div class="sb">EMP-0084 · Avondale · Floor supervisor</div>',
         '<span class="badge neutral">CMM-D2</span>','$ 880.00','$ 124.40','$ 39.60','$ 3.73','$ 8.80','$ 703.47'),
        ('<span class="avatar" style="background:#EDE0FF;color:#4C1D95;">PS</span><span class="nm">Patience Sibanda</span><div class="sb">EMP-0092 · Avondale · Stockroom</div>',
         '<span class="badge neutral">CMM-B4</span>','$ 420.00','$ 16.50','$ 18.90','$ 0.50','$ 4.20','$ 379.90'),
        ('<span class="avatar" style="background:#FFE5C8;color:#6B3F19;">RM</span><span class="nm">Rumbidzai Manyika</span><div class="sb">EMP-0162 · Mutare · Branch manager</div>',
         '<span class="badge neutral">CMM-E1</span>','$ 1,820.00','$ 388.60','$ 81.90','$ 11.66','$ 18.20','$ 1,319.64'),
    ]
    body += sec(card(
        "Pre-list · earnings &amp; deductions",
        "242 lines · sorted by site · click a line to drill into payslip",
        toolbar("Search employee, NEC grade, NSSA #", ["NEC grade","Variance > 10%","Missing data"], "Showing 1–6 of 242")
        + table([("Employee",False),("Grade",False),("Gross",True),("PAYE",True),("NSSA",True),("AIDS",True),("NEC",True),("Net",True)], rows),
        filters("All sites","Park Centre","Avondale","Bulawayo","Mutare"),
    ))
    return body


def hr_payslips_body():
    rows = []
    for ini, name, col, eid, site, period, net in [
        ("FM","Faith Moyo","red","EMP-0042","Park Centre","Jun 2026","$ 424.24"),
        ("AC","Alex Chiwanza","orange","EMP-0048","Park Centre","Jun 2026","$ 424.24"),
        ("SN","Sarah Ndongo","green","EMP-0051","Park Centre","Jun 2026","$ 527.81"),
        ("TM","Tafadzwa Mhike","red","EMP-0084","Avondale","Jun 2026","$ 703.47"),
        ("RM","Rumbidzai Manyika","orange","EMP-0162","Mutare","Jun 2026","$ 1,319.64"),
        ("JK","Joseph Kanyengo","blue","EMP-0205","Head office","Jun 2026","$ 1,576.26"),
    ]:
        rows.append((av(ini,name,f"{eid} · {site}",col), period, net,
                     '<span class="badge ok">Delivered</span>', '03 Jun · 14:22',
                     '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'))
    body = header(
        "Payslip delivery",
        "242 payslips emailed for June 2026. Self-service portal viewable for every active employee.",
        [("b","Jun 2026 run"),("s","242 delivered"),("","0 bounced")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Bulk ZIP</button> <button class="btn btn-secondary"><span data-icon="mail" data-icon-size="14"></span> Resend failed</button> <button class="btn btn-primary"><span data-icon="upload" data-icon-size="14"></span> Generate run</button>',
    )
    body += stats([
        ("Generated this month","242","","",""),
        ("Delivered","242","","100%","up"),
        ("Bounced / failed","0","","Stanbic & Gmail healthy",""),
        ("Portal opens","186","","77%",""),
    ])
    body += sec(card("Payslips · June 2026 run","Latest generated · sorted by send time",
        toolbar("Search employee, EMP id", ["Status","Site","Period"], "Showing 1–6 of 242")
        + table([("Employee",False),("Period",False),("Net",True),("Status",False),("Sent",False),("",False)], rows),
        filters("All","Delivered","Opened","Bounced","Queued")))
    return body


def hr_attendance_body():
    rows = []
    for ini, name, col, eid, site, status, clockin, hours, late in [
        ("FM","Faith Moyo","red","EMP-0042","Park Centre","Present","07:58","8h 02m","On time"),
        ("AC","Alex Chiwanza","orange","EMP-0048","Park Centre","Present","08:04","7h 58m","4m late"),
        ("SN","Sarah Ndongo","green","EMP-0051","Park Centre","Present","07:55","8h 06m","On time"),
        ("TM","Tafadzwa Mhike","red","EMP-0084","Avondale","Present","08:12","7h 48m","12m late"),
        ("PS","Patience Sibanda","purple","EMP-0092","Avondale","Absent","—","—","No call"),
        ("BC","Brian Chivasa","red","EMP-0118","Bulawayo","Sick leave","—","—","Doctor's note"),
        ("RM","Rumbidzai Manyika","orange","EMP-0162","Mutare","Present","07:50","8h 11m","On time"),
    ]:
        tone = {"Present":"ok","Absent":"danger","Sick leave":"warn"}[status]
        rows.append((av(ini,name,f"{eid} · {site}",col),
                     f'<span class="badge {tone}">{status}</span>', clockin, hours, late))
    body = header(
        "Attendance · today",
        "Tuesday 02 June 2026 · 242 of 248 expected in. Late, absent, and sick records auto-emailed to line managers.",
        [("b","Today"),("","242 expected"),("s","94.2% on time")],
        '<button class="btn btn-quiet"><span data-icon="calendar" data-icon-size="14"></span> Date</button> <button class="btn btn-secondary"><span data-icon="download" data-icon-size="14"></span> Export</button>',
    )
    body += stats([
        ("Present","228","","94.2%","up"),
        ("Late","8","","Avg 7m",""),
        ("Absent","4","","No call",""),
        ("Sick / leave","8","","Auth approved",""),
    ])
    body += sec(card("Today · attendance log","Sorted by site → clock-in time",
        toolbar("Search employee, EMP id", ["Site","Status","Late"], "Showing 1–7 of 248")
        + table([("Employee",False),("Status",False),("Clock-in",False),("Hours",False),("Note",False)], rows),
        filters("All sites","Park Centre","Avondale","Bulawayo","Mutare")))
    return body


def hr_leave_body():
    rows = [
        (av("AC","Alex Chiwanza","EMP-0048 · Park Centre","orange"),
         "Annual", "4 days · 18-21 Jun", "7 / 22", "Faith M.",
         '<span class="badge warn"><span class="dot"></span> Pending</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Approve</button>'),
        (av("PS","Patience Sibanda","EMP-0092 · Avondale","purple"),
         "Sick", "2 days · 02-03 Jun", "8 / 10", "Auto",
         '<span class="badge ok">Approved</span>', '<span class="sb">—</span>'),
        (av("BC","Brian Chivasa","EMP-0118 · Bulawayo","red"),
         "Annual", "10 days · 24 Jun-3 Jul", "—", "—",
         '<span class="badge danger"><span class="dot"></span> Insufficient balance</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Review</button>'),
        (av("TM","Tafadzwa Mhike","EMP-0084 · Avondale","red"),
         "Compassionate", "3 days · 14-16 Jun", "—", "Sarah N.",
         '<span class="badge ok">Approved</span>', '<span class="sb">—</span>'),
        (av("RM","Rumbidzai Manyika","EMP-0162 · Mutare","orange"),
         "Annual", "5 days · 8-12 Jul", "12 / 25", "Joseph K.",
         '<span class="badge warn"><span class="dot"></span> Pending</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Approve</button>'),
    ]
    body = header(
        "Leave",
        "12 active leave requests · 5 pending approval. Balances tracked per leave type — annual, sick, compassionate, study.",
        [("b","12 active"),("","5 pending"),("","218 balance days remaining")],
        '<button class="btn btn-quiet"><span data-icon="calendar" data-icon-size="14"></span> Calendar</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Record leave</button>',
    )
    body += stats([
        ("Pending approval","5","","2 over balance",""),
        ("On leave today","8","","",""),
        ("Annual balance avg","11.4","<span class='u'>days</span>","of 22",""),
        ("Sick days · YTD","42","","18 staff used",""),
    ])
    body += sec(card("Leave requests","Newest first · approve / deny inline",
        toolbar("Search employee", ["Type","Status","Site"], "Showing 1–5 of 12")
        + table([("Employee",False),("Type",False),("Window",False),("Balance after",False),("Cover",False),("Status",False),("",False)], rows),
        filters("All","Pending","Approved","Denied")))
    return body


def hr_disciplinary_body():
    rows = [
        ('<span class="nm">DC-2026-018</span><div class="sb">Verbal warning · attendance pattern</div>',
         av("BC","Brian Chivasa","EMP-0118 · Bulawayo","red"),
         "12 May 2026", "Sarah Ndongo",
         '<span class="badge warn">Open · 30d</span>', '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">DC-2026-015</span><div class="sb">Written warning · till variance</div>',
         av("AC","Alex Chiwanza","EMP-0048 · Park Centre","orange"),
         "28 Apr 2026", "Faith Moyo",
         '<span class="badge neutral">Closed · sign-off</span>', '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">DC-2026-012</span><div class="sb">Final warning · stockroom procedure</div>',
         av("PS","Patience Sibanda","EMP-0092 · Avondale","purple"),
         "14 Mar 2026", "Tafadzwa M.",
         '<span class="badge danger">Final · 90d</span>', '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
    ]
    body = header(
        "Disciplinary",
        "Track verbal, written, and final warnings under the NEC code of conduct. Hearings, sign-offs, and document storage.",
        [("b","3 open"),("","2 hearings scheduled"),("","NEC code v3.2")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New case</button>',
    )
    body += stats([
        ("Open cases","3","","",""),
        ("Hearings · this week","2","","",""),
        ("Closed YTD","18","","","up"),
        ("Avg time to close","21","<span class='u'>days</span>","",""),
    ])
    body += sec(card("Disciplinary cases","Sorted by most recent",
        toolbar("Search case id, employee", ["Stage","Status","Site"], "Showing 1–3 of 18")
        + table([("Case",False),("Employee",False),("Opened",False),("Issued by",False),("Status",False),("",False)], rows),
        filters("All","Open","Final","Closed")))
    return body


def hr_compliance_body():
    rows = [
        ('<span class="nm">PAYE return</span><div class="sb">May 2026 · Form ITF-12B</div>',
         "ZIMRA", "$ 14,820.16", "03 Jun · filed", '<span class="badge ok">Filed</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
        ('<span class="nm">NSSA contributions</span><div class="sb">May 2026 · P4 schedule</div>',
         "NSSA", "$ 8,612.40", "03 Jun · paid", '<span class="badge ok">Paid</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
        ('<span class="nm">NEC Commercial CBA</span><div class="sb">May 2026 · sector deductions</div>',
         "NEC Commerce", "$ 1,840.00", "Due 10 Jul", '<span class="badge warn">Pending</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
        ('<span class="nm">AIDS levy</span><div class="sb">May 2026 · 3% of PAYE</div>',
         "ZIMRA", "$ 444.60", "03 Jun · filed", '<span class="badge ok">Filed</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
        ('<span class="nm">IT3 year-end return</span><div class="sb">FY 2025-26 · Form ITF-263</div>',
         "ZIMRA", "—", "Due 31 Aug", '<span class="badge neutral">Draft</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
    ]
    body = header(
        "Compliance reports",
        "PAYE, NSSA, NEC and AIDS-levy returns auto-drafted from each payroll run. Year-end IT3 in draft.",
        [("b","FY 2025-26"),("","All May filings done"),("s","Next: NEC 10 Jul")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Bulk ZIP</button> <button class="btn btn-secondary"><span data-icon="calendar" data-icon-size="14"></span> Calendar</button> <button class="btn btn-primary"><span data-icon="upload" data-icon-size="14"></span> File now</button>',
    )
    body += stats([
        ("Filed YTD","42","","of 48 due",""),
        ("Pending","6","","next: NEC 10 Jul",""),
        ("Statutory paid · YTD","$ 184","<span class='u'>k</span>","",""),
        ("Penalties · YTD","$ 0","","Clean record","up"),
    ])
    body += sec(card("Recent filings","Auto-drafted from payroll · attached to ledger",
        toolbar("Search filing, period", ["Authority","Status","Period"], "Showing 1–5 of 42")
        + table([("Filing",False),("Authority",False),("Amount",True),("Due / filed",False),("Status",False),("",False)], rows),
        filters("All","ZIMRA","NSSA","NEC")))
    return body



# ── Maintenance surfaces ─────────────────────────────────────────────────────

def maint_work_orders_body():
    rows = [
        ('<span class="nm">WO-2026-0184</span><div class="sb">Cold-room compressor cycling</div>',
         '<span class="badge danger">High</span>','<span class="badge warn">In progress</span>',
         av("JM","Joseph Madziva","Refrigeration","blue"),
         "Park Centre · Cold room A","02 Jun · 13:40","2h 14m",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">WO-2026-0183</span><div class="sb">Generator service · 250hr</div>',
         '<span class="badge neutral">Medium</span>','<span class="badge ok">Scheduled</span>',
         av("TN","Tendai Ndoro","Electrical","green"),
         "Avondale · Yard","04 Jun · 08:00","—",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">WO-2026-0182</span><div class="sb">Till PC fan noise</div>',
         '<span class="badge warn">Low</span>','<span class="badge brand">Open</span>',
         '<span class="sb">Unassigned</span>',
         "Bulawayo · POS-02","02 Jun · 09:14","—",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Assign</button>'),
        ('<span class="nm">WO-2026-0181</span><div class="sb">CCTV CAM-032 offline</div>',
         '<span class="badge danger">High</span>','<span class="badge warn">In progress</span>',
         av("PS","Patience S.","IT support","purple"),
         "Avondale · Bay door","02 Jun · 12:02","48m",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">WO-2026-0180</span><div class="sb">Leaking tap · staff bath</div>',
         '<span class="badge neutral">Low</span>','<span class="badge ok">Done</span>',
         av("BC","Brian C.","Plumbing","red"),
         "Park Centre · Staff WC","01 Jun · 16:20","1h 12m",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
    ]
    body = header(
        "Work orders",
        "24 active work orders across 5 sites. 4 high-priority, 1 unassigned. SLA breach risk: 1.",
        [("b","24 active"),("","4 high priority"),("","SLA risk: 1")],
        '<button class="btn btn-quiet"><span data-icon="filter" data-icon-size="14"></span> Filter</button> <button class="btn btn-secondary"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New WO</button>',
    )
    body += stats([
        ("Open WOs","24","","4 high",""),
        ("In progress","11","","Avg 3h 22m",""),
        ("Completed · today","8","","",""),
        ("SLA breach risk","1","","WO-0184 cold-room",""),
    ])
    body += sec(card("Active work orders","Sorted by priority → opened time",
        toolbar("Search WO, asset id, tech", ["Priority","Status","Site"], "Showing 1–5 of 24")
        + table([("WO",False),("Priority",False),("Status",False),("Assigned",False),("Asset / location",False),("Opened",False),("Age",False),("",False)], rows),
        filters("All","Open","In progress","Done")))
    return body


def maint_assets_register_body():
    rows = [
        ('<span style="width:32px;height:32px;border-radius:8px;background:var(--surface-muted);display:inline-grid;place-items:center;"><span data-icon="box" data-icon-size="16"></span></span>',
         '<span class="nm">Generator · Cummins 60kVA</span><div class="sb">AST-0112 · S/N C60-22-1184 · 4.2y old</div>',
         "Avondale · Yard",'<span class="badge ok">Healthy</span>',"Next: 21 Jun · 250hr","$ 18,200"),
        ('<span style="width:32px;height:32px;border-radius:8px;background:var(--surface-muted);display:inline-grid;place-items:center;"><span data-icon="box" data-icon-size="16"></span></span>',
         '<span class="nm">Cold-room compressor</span><div class="sb">AST-0118 · Carrier 5HP · 6.8y old</div>',
         "Park Centre · Cold A",'<span class="badge warn">Issue</span>',"WO-0184 in progress","$ 6,400"),
        ('<span style="width:32px;height:32px;border-radius:8px;background:var(--surface-muted);display:inline-grid;place-items:center;"><span data-icon="pc" data-icon-size="16"></span></span>',
         '<span class="nm">POS terminal</span><div class="sb">AST-0244 · HP RP2 · 2.1y old</div>',
         "Bulawayo · POS-02",'<span class="badge warn">Minor</span>',"WO-0182 open","$ 1,200"),
        ('<span style="width:32px;height:32px;border-radius:8px;background:var(--surface-muted);display:inline-grid;place-items:center;"><span data-icon="truck" data-icon-size="16"></span></span>',
         '<span class="nm">Delivery vehicle</span><div class="sb">AST-0301 · Toyota Hilux 2022 · ZIM-2418</div>',
         "Park Centre · Yard",'<span class="badge ok">Healthy</span>',"Next: 4,200km service","$ 28,500"),
        ('<span style="width:32px;height:32px;border-radius:8px;background:var(--surface-muted);display:inline-grid;place-items:center;"><span data-icon="camera" data-icon-size="16"></span></span>',
         '<span class="nm">CCTV camera · Axis</span><div class="sb">CAM-032 · P3265-LV · 1.8y old</div>',
         "Avondale · Bay door",'<span class="badge danger">Offline</span>',"WO-0181 in progress","$ 480"),
    ]
    body = header(
        "Assets register",
        "412 assets across 5 sites · $1.24M book value. Includes generators, cold-rooms, POS gear, vehicles, CCTV.",
        [("b","412 assets"),("","$ 1.24M book"),("","3 issues open")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="qr" data-icon-size="14"></span> QR scan</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Register asset</button>',
    )
    body += stats([
        ("Total assets","412","","",""),
        ("Healthy","402","","97.6%","up"),
        ("Issues","10","","3 high",""),
        ("Avg age","3.8","<span class='u'>yrs</span>","",""),
    ])
    body += sec(card("Asset list","Filtered to all · sorted by site",
        toolbar("Search asset, serial, location", ["Category","Site","Status"], "Showing 1–5 of 412")
        + table([("",False),("Asset",False),("Location",False),("Status",False),("Next service",False),("Book value",True)], rows),
        filters("All","Generators","Cold-room","POS","Vehicles","CCTV")))
    return body


def maint_pm_schedule_body():
    rows = [
        ('<span class="nm">Generator service · 250hr</span><div class="sb">AST-0112 · Cummins 60kVA</div>',
         "Avondale · Yard","21 Jun 2026","232 / 250 hrs",'<span class="badge warn">Soon</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Schedule</button>'),
        ('<span class="nm">Cold-room defrost</span><div class="sb">AST-0118 · weekly</div>',
         "Park Centre","04 Jun 2026","6 / 7 days",'<span class="badge ok">On track</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Schedule</button>'),
        ('<span class="nm">Vehicle service · 5,000km</span><div class="sb">AST-0301 · Hilux</div>',
         "Park Centre","18 Jun 2026","800 km left",'<span class="badge ok">On track</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Schedule</button>'),
        ('<span class="nm">CCTV NVR backup verify</span><div class="sb">NVR-01 · monthly</div>',
         "Head office","30 Jun 2026","28 / 30 days",'<span class="badge warn">Soon</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Schedule</button>'),
        ('<span class="nm">Fire extinguisher inspection</span><div class="sb">All sites · annual</div>',
         "5 sites","30 Sep 2026","119 days left",'<span class="badge neutral">Scheduled</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Schedule</button>'),
    ]
    body = header(
        "PM schedule",
        "Time- and usage-based preventive maintenance. WOs auto-generated 7 days before due, assigned by skill.",
        [("b","42 tasks active"),("","6 due in 7d"),("s","Auto-WO 7d-out")],
        '<button class="btn btn-quiet"><span data-icon="calendar" data-icon-size="14"></span> Calendar</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New task</button>',
    )
    body += stats([
        ("PM tasks active","42","","",""),
        ("Due in 7 days","6","","2 high",""),
        ("Auto-WOs · this week","8","","",""),
        ("PM compliance · YTD","94%","","+2% vs LY","up"),
    ])
    body += sec(card("Upcoming PM tasks","Sorted by due date · auto-WO generated 7d out",
        toolbar("Search task, asset", ["Site","Trigger","Status"], "Showing 1–5 of 42")
        + table([("Task",False),("Site",False),("Due",False),("Usage / cadence",False),("Status",False),("",False)], rows),
        filters("All","Time-based","Usage-based","Auto-WO ready")))
    return body


def maint_technician_roster_body():
    rows = [
        (av("JM","Joseph Madziva","Refrigeration · 8y exp · A-grade","blue"),
         '<span class="badge ok"><span class="dot"></span> On WO-0184</span>',
         "Park Centre","42h / 45h", "$ 18.50/h","WO-0184"),
        (av("TN","Tendai Ndoro","Electrical · 5y exp · B-grade","green"),
         '<span class="badge neutral">Free</span>',
         "Avondale","38h / 45h","$ 16.00/h","—"),
        (av("PS","Patience S.","IT support · 3y exp","purple"),
         '<span class="badge warn"><span class="dot"></span> On WO-0181</span>',
         "Avondale","41h / 45h","$ 14.00/h","WO-0181"),
        (av("BC","Brian C.","Plumbing · 6y exp","red"),
         '<span class="badge neutral">Free</span>',
         "Park Centre","36h / 45h","$ 13.50/h","—"),
        (av("RM","Rumbidzai M.","Vehicle mechanic · 9y exp · A-grade","orange"),
         '<span class="badge ok"><span class="dot"></span> Off-shift</span>',
         "Bulawayo","45h / 45h","$ 20.00/h","—"),
    ]
    body = header(
        "Technician roster",
        "8 in-house technicians across 5 sites. Shift coverage, skills, billable hours.",
        [("b","8 techs"),("","6 on shift"),("","2 free")],
        '<button class="btn btn-quiet"><span data-icon="calendar" data-icon-size="14"></span> Shifts</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Add tech</button>',
    )
    body += stats([
        ("Technicians","8","","6 on shift",""),
        ("Free now","2","","",""),
        ("Hours · this week","248","","of 360",""),
        ("Avg WO close","3h 22m","","-12m vs LM","up"),
    ])
    body += sec(card("Roster · today","Sorted by availability",
        toolbar("Search name, skill", ["Discipline","Status","Site"], "Showing 1–5 of 8")
        + table([("Technician",False),("Status",False),("Base site",False),("Weekly hrs",False),("Rate",True),("Current WO",False)], rows),
        filters("All","Free","On WO","Off-shift")))
    return body


def maint_parts_inventory_body():
    rows = [
        ('<span class="nm">Compressor oil · 5L</span><div class="sb">PART-RF-0014</div>',
         "Park Centre · Workshop","8","12",'<span class="badge ok">OK</span>',"$ 28.50"),
        ('<span class="nm">PVC pipe · 25mm × 3m</span><div class="sb">PART-PL-0142</div>',
         "Park Centre · Workshop","2","8",'<span class="badge warn">Low</span>',"$ 4.20"),
        ('<span class="nm">Drive belt · A52</span><div class="sb">PART-RF-0042</div>',
         "Avondale · Stock","0","4",'<span class="badge danger">Out</span>',"$ 12.00"),
        ('<span class="nm">CCTV BNC cable · 30m</span><div class="sb">PART-CC-0018</div>',
         "Head office","6","6",'<span class="badge ok">OK</span>',"$ 18.40"),
        ('<span class="nm">Spark plug · NGK</span><div class="sb">PART-VH-0084</div>',
         "Mutare","12","8",'<span class="badge ok">OK</span>',"$ 3.20"),
    ]
    body = header(
        "Parts inventory",
        "Workshop stock for maintenance. Auto-reorder triggers when below par. 1 part out, 1 low.",
        [("b","412 SKUs"),("","1 out"),("","6 low")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="upload" data-icon-size="14"></span> Stock take</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New SKU</button>',
    )
    body += stats([
        ("SKUs","412","","",""),
        ("Out of stock","1","","Drive belt",""),
        ("Low stock","6","","Auto-PO drafted",""),
        ("Stock value","$ 18.4","<span class='u'>k</span>","",""),
    ])
    body += sec(card("Parts on hand","Sorted by status (out → low → ok)",
        toolbar("Search part, SKU", ["Site","Status","Category"], "Showing 1–5 of 412")
        + table([("Part",False),("Location",False),("On hand",True),("Par",True),("Status",False),("Unit cost",True)], rows),
        filters("All","Out","Low","OK")))
    return body



# ── Notifications surfaces ───────────────────────────────────────────────────

def notif_inbox_body():
    rows = []
    NOTIFS = [
        ("coin","Payroll approved · June 2026","242 payslips emailed. $138,311.82 EFT batch ready for Stanbic upload.","HR Manager","4m ago","unread","brand"),
        ("zap","Cold-room compressor cycling · Park Centre","WO-0184 assigned to Joseph M. ETA 30 min. Variance: 4-min cycle.","Maintenance · auto","18m ago","unread","warn"),
        ("box","Low stock · Mealie meal 10kg · Park Centre","Below par (14 / 40). Auto-PO drafted for National Foods.","Stock · auto","42m ago","unread","warn"),
        ("camera","Motion event · after-hours · Bulawayo Stockroom B","CAM-023 · 02:14:33 · 6s clip available.","CCTV · auto","2h ago","unread","danger"),
        ("user","New hire signed · Alex Chiwanza","EMP-0048 · Park Centre · CMM-C3 · starts 02 Jun.","HR · Faith Moyo","1d ago","","ok"),
        ("receipt","Stanbic EFT batch posted","242 lines · $138,311.82 · ref BAT-2026-06-01.","Accounting · auto","1d ago","","brand"),
        ("flag","NEC Commerce CBA · +2.5% · effective 01 Jul","Pre-loaded into next payroll run. Review by HR Manager.","HR · auto","2d ago","","neutral"),
    ]
    rows_html = ""
    for ic, title, body_t, actor, age, state, tone in NOTIFS:
        bg = "var(--brand-soft)" if state == "unread" else "var(--surface)"
        bd = "var(--brand-100)" if state == "unread" else "var(--border)"
        dot = '<span style="width:8px;height:8px;border-radius:50%;background:var(--brand);margin-top:6px;flex:none;"></span>' if state == "unread" else '<span style="width:8px;flex:none;"></span>'
        tone_bg = {"brand":"var(--brand-soft)","warn":"var(--tone-warn-bg)","danger":"var(--tone-danger-bg)","ok":"var(--tone-success-bg)","neutral":"var(--surface-muted)"}[tone]
        tone_fg = {"brand":"var(--brand-strong)","warn":"var(--tone-warn)","danger":"var(--tone-danger)","ok":"var(--tone-success)","neutral":"var(--text-muted)"}[tone]
        rows_html += f'''
        <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 18px;background:{bg};border:1px solid {bd};border-radius:10px;">
          {dot}
          <span style="width:34px;height:34px;border-radius:8px;background:{tone_bg};color:{tone_fg};display:grid;place-items:center;flex:none;"><span data-icon="{ic}" data-icon-size="16"></span></span>
          <div style="flex:1;min-width:0;">
            <div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">{title}</div>
            <div style="font:12.5px/1.45 var(--font-sans);color:var(--text-muted);margin-top:3px;">{body_t}</div>
            <div style="font:11px/1.3 var(--font-mono);color:var(--text-subtle);margin-top:4px;">{actor} · {age}</div>
          </div>
          <button style="background:transparent;border:0;color:var(--text-subtle);cursor:pointer;padding:4px;"><span data-icon="x" data-icon-size="14"></span></button>
        </div>'''
    body = header(
        "Inbox",
        "14 unread across all categories. Filter by source, severity, or owner.",
        [("b","14 unread"),("","102 total · 7d"),("","Auto-archive 30d")],
        '<button class="btn btn-quiet"><span data-icon="check" data-icon-size="14"></span> Mark all read</button> <button class="btn btn-secondary"><span data-icon="filter" data-icon-size="14"></span> Filter</button> <button class="btn btn-primary"><span data-icon="edit" data-icon-size="14"></span> Compose</button>',
    )
    body += stats([
        ("Unread","14","","4 critical",""),
        ("Total · 7d","102","","",""),
        ("Avg ack time","6m","","-2m vs LW","up"),
        ("Channels active","4","","In-app · email · SMS · WhatsApp",""),
    ])
    body += sec(f'<div class="dash-card"><div class="dash-card-h"><div><h2>All notifications</h2><div class="sub">Newest first · unread highlighted</div></div><div class="filter-bar"><span class="f active">All</span><span class="f">HR</span><span class="f">CCTV</span><span class="f">Stock</span><span class="f">Maintenance</span></div></div><div style="padding:16px 18px;display:grid;gap:8px;">{rows_html}</div></div>')
    return body


def notif_broadcast_body():
    body = header(
        "Broadcast composer",
        "Send a one-off message to a group · in-app, email, SMS or WhatsApp. Schedule for later or send now.",
        [("b","Composer"),("","248 staff in audience"),("s","All 4 channels live")],
        '<button class="btn btn-quiet">Discard</button> <button class="btn btn-secondary"><span data-icon="calendar" data-icon-size="14"></span> Schedule</button> <button class="btn btn-primary"><span data-icon="check" data-icon-size="14"></span> Send now</button>',
    )
    body += sec(f'''<div class="dash-card"><div class="dash-card-h"><div><h2>Compose broadcast</h2><div class="sub">Auto-saved every 30 seconds</div></div></div><div class="pane-pad"><div class="form-grid">
      <div class="fld"><label>Subject</label><input placeholder="Subject line / push title" value="Holiday hours · Independence Day" /></div>
      <div class="fld"><label>Channel</label><select><option>Email + In-app</option><option>WhatsApp only</option><option>All channels (4)</option></select></div>
      <div class="fld full"><label>Audience</label><div style="display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:var(--surface-muted);border-radius:8px;">
        <span class="badge badge-info">All staff (248)</span>
        <span class="badge badge-neutral">Park Centre (62)</span>
        <span class="badge badge-neutral">Bulawayo (44)</span>
        <span class="badge badge-neutral">Avondale (38)</span>
        <span class="badge badge-neutral">Mutare (42)</span>
        <span class="badge badge-neutral">Head office (62)</span>
        <button class="btn btn-quiet" style="padding:2px 8px;height:22px;font-size:11px;">+ Filter</button>
      </div></div>
      <div class="fld full"><label>Message</label><textarea rows="6">Dear team,

Park Centre, Avondale, Bulawayo and Mutare branches will open 09:00–13:00 on Wednesday 18 June (Heroes' Day) and Thursday 19 June (Defence Forces Day). Head office closed both days.

Stocktake schedule unchanged.

– Mukamba Group HR</textarea></div>
      <div class="fld"><label>Template</label><select><option>None (custom)</option><option>Policy reminder</option><option>Operational alert</option></select></div>
      <div class="fld"><label>Tracking</label><select><option>Read receipts + open rate</option><option>Read receipts only</option><option>None</option></select></div>
    </div></div></div>''')
    body += sec(card("Recent broadcasts","Last 14 days",
        table([("Subject",False),("Channel",False),("Audience",True),("Sent",False),("Open rate",True),("",False)], [
            ('<span class="nm">May payslip available</span>','Email + In-app','242','03 Jun · 14:22','82%','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Re-send</button>'),
            ('<span class="nm">Stocktake schedule · Q2</span>','In-app','248','28 May · 09:00','76%','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Re-send</button>'),
            ('<span class="nm">NEC CBA increase · 2.5%</span>','Email','248','22 May · 11:30','94%','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Re-send</button>'),
        ])))
    return body


def notif_channels_body():
    chans = [
        ("plug","SMTP · Google Workspace","Email · payroll, HR, group comms","verified","ok","mukamba.co.zw · MX healthy","12,840"),
        ("phone","WhatsApp Business · Econet Cloud","WhatsApp · in-store + ops alerts","verified","ok","+263 77 123 4567","8,402"),
        ("plug","Twilio Programmable SMS","SMS · low-stock + critical alerts","verified","ok","Acct AC83·· · ZA gateway","2,184"),
        ("bell","In-app push","Web push · all signed-in users","verified","ok","248 / 248 subscribed","18,940"),
    ]
    rows_html = ""
    for ic, name, desc, verified, tone, addr, sends in chans:
        rows_html += f'''
        <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
          <span style="width:38px;height:38px;border-radius:9px;background:var(--surface-muted);color:var(--text-strong);display:grid;place-items:center;"><span data-icon="{ic}" data-icon-size="18"></span></span>
          <div style="flex:1;"><div style="font:600 14px/1.3 var(--font-sans);color:var(--text-strong);">{name}</div><div style="font:12px/1.3 var(--font-sans);color:var(--text-muted);margin-top:2px;">{desc}</div><div style="font:11px/1.3 var(--font-mono);color:var(--text-subtle);margin-top:3px;">{addr}</div></div>
          <span class="badge badge-success">Live</span>
          <span style="font:500 12px/1 var(--font-mono);color:var(--text-muted);">{sends} sent · 30d</span>
          <label style="position:relative;display:inline-block;width:36px;height:20px;flex:none;"><input type="checkbox" checked style="opacity:0;width:0;height:0;" /><span style="position:absolute;inset:0;background:var(--brand);border-radius:9999px;cursor:pointer;"></span><span style="position:absolute;top:2px;left:18px;width:16px;height:16px;background:#fff;border-radius:50%;"></span></label>
        </div>'''
    body = header(
        "Channels",
        "4 channels live across email, WhatsApp, SMS and in-app push. Per-channel send quotas and verification.",
        [("b","4 live"),("","42,366 sent · 30d"),("s","All verified")],
        '<button class="btn btn-quiet"><span data-icon="settings" data-icon-size="14"></span> Quotas</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Add channel</button>',
    )
    body += stats([
        ("Channels","4","","All verified",""),
        ("Sent · 30d","42,366","","+12% vs LM","up"),
        ("Delivery rate","99.4%","","",""),
        ("Cost · 30d","$ 184","","WhatsApp + SMS",""),
    ])
    body += sec(f'<div class="dash-card"><div class="dash-card-h"><div><h2>Configured channels</h2><div class="sub">Toggle to pause without removing config</div></div></div><div style="padding:16px;display:grid;gap:8px;">{rows_html}</div></div>')
    return body


def notif_templates_body():
    rows = [
        ('<span class="nm">Payslip · monthly</span><div class="sb">Email · v4</div>',
         "Email","HR · auto",'<span class="badge ok">Active</span>',"242 sends · 03 Jun",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
        ('<span class="nm">Low-stock alert</span><div class="sb">SMS + In-app · v2</div>',
         "SMS + In-app","Stock · auto",'<span class="badge ok">Active</span>',"184 sends · 30d",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
        ('<span class="nm">Leave decision</span><div class="sb">WhatsApp + Email · v3</div>',
         "WhatsApp + Email","HR · approval",'<span class="badge ok">Active</span>',"42 sends · 30d",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
        ('<span class="nm">CCTV motion alert</span><div class="sb">In-app · v1</div>',
         "In-app","CCTV · auto",'<span class="badge ok">Active</span>',"412 sends · 30d",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
        ('<span class="nm">Welcome · new hire</span><div class="sb">Email · v2</div>',
         "Email","HR · onboarding",'<span class="badge neutral">Draft</span>',"0 sends",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
    ]
    body = header(
        "Templates",
        "Reusable message templates with merge fields. Versioned and per-channel.",
        [("b","18 templates"),("","12 active"),("","Versioned")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export JSON</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New template</button>',
    )
    body += stats([
        ("Templates","18","","12 active",""),
        ("Versions · 30d","6","","2 rollbacks",""),
        ("Sends · this month","2,840","","",""),
        ("Avg open rate","78%","","+4% vs LM","up"),
    ])
    body += sec(card("Templates","Most-used first",
        toolbar("Search template, channel", ["Channel","Status","Owner"], "Showing 1–5 of 18")
        + table([("Template",False),("Channel",False),("Owner",False),("Status",False),("Last used",False),("",False)], rows),
        filters("All","Email","SMS","WhatsApp","In-app")))
    return body


def notif_delivery_log_body():
    rows = [
        ('<span class="badge ok">Sent</span>','<span class="nm">Email · May payslip</span><div class="sb">faith.moyo@mukamba.co.zw</div>',"Gmail","03 Jun · 14:22:08","250ms",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Trace</button>'),
        ('<span class="badge ok">Opened</span>','<span class="nm">Email · May payslip</span><div class="sb">tafadzwa@mukamba.co.zw</div>',"Gmail","03 Jun · 14:42:11","320ms",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Trace</button>'),
        ('<span class="badge warn">Queued</span>','<span class="nm">SMS · low stock</span><div class="sb">+263 77 234 0918</div>',"Twilio","02 Jun · 16:12:00","—",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Trace</button>'),
        ('<span class="badge danger">Bounced</span>','<span class="nm">Email · welcome</span><div class="sb">brian.c@old-domain.co.zw</div>',"Gmail","02 Jun · 09:14","412ms",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Trace</button>'),
        ('<span class="badge ok">Sent</span>','<span class="nm">WhatsApp · leave approved</span><div class="sb">+263 77 444 8201</div>',"Econet Cloud","02 Jun · 11:30","180ms",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Trace</button>'),
        ('<span class="badge ok">Sent</span>','<span class="nm">In-app · WO-0184 assigned</span><div class="sb">josephm@mukamba</div>',"Push","02 Jun · 13:40","42ms",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Trace</button>'),
    ]
    body = header(
        "Delivery log",
        "Per-message audit · every send across every channel. Trace through provider events.",
        [("b","42,366 sent · 30d"),("","99.4% delivered"),("","248 bounced")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="filter" data-icon-size="14"></span> Filter</button>',
    )
    body += stats([
        ("Sent · 24h","1,402","","",""),
        ("Delivered","1,388","","99%","up"),
        ("Bounced","8","","0.6%",""),
        ("Avg latency","218ms","","Email median",""),
    ])
    body += sec(card("Delivery log","Newest first · click Trace for provider response",
        toolbar("Search recipient, message id", ["Channel","Status","Period"], "Showing 1–6 of 42,366")
        + table([("Status",False),("Message · recipient",False),("Provider",False),("Sent at",False),("Latency",False),("",False)], rows),
        filters("All","Sent","Opened","Bounced","Queued")))
    return body



# ── Settings surfaces ────────────────────────────────────────────────────────

def settings_workspace_body():
    body = header(
        "Workspace",
        "The shared identity for your Huchu workspace. Name, time zone, branding and default site.",
        [("b","Mukamba Group"),("","Africa/Harare"),("s","Production tenant")],
        '<button class="btn btn-quiet">Discard</button> <button class="btn btn-primary"><span data-icon="check" data-icon-size="14"></span> Save</button>',
    )
    body += sec(f'''<div class="dash-card"><div class="dash-card-h"><div><h2>Workspace identity</h2><div class="sub">Used in payslips, emails, the customer portal</div></div></div><div class="pane-pad"><div class="form-grid">
      <div class="fld"><label>Workspace name</label><input value="Mukamba Group" /><span class="hint">Shown across all dashboards and emails</span></div>
      <div class="fld"><label>Slug</label><input value="mukamba" /><span class="hint">mukamba.huchu.app</span></div>
      <div class="fld"><label>Time zone</label><select><option>Africa/Harare (UTC+2)</option><option>Africa/Johannesburg (UTC+2)</option></select></div>
      <div class="fld"><label>Default site</label><select><option>Park Centre · Harare</option><option>Avondale</option><option>Bulawayo</option><option>Mutare</option><option>Head office</option></select></div>
      <div class="fld full"><label>Logo</label><div style="display:flex;align-items:center;gap:14px;"><span style="width:56px;height:56px;border-radius:12px;background:var(--brand);color:#fff;display:grid;place-items:center;font:600 18px var(--font-sans);">M</span><button class="btn btn-secondary" style="font-size:12.5px;">Upload PNG / SVG</button><span class="sb">Recommended 256×256, &lt; 200 KB</span></div></div>
      <div class="fld"><label>Primary color</label><div style="display:flex;align-items:center;gap:10px;"><span style="width:32px;height:32px;border-radius:8px;background:var(--brand);"></span><input value="#16A34A" /></div></div>
      <div class="fld"><label>Currency display</label><select><option>USD (default · primary)</option><option>USD + ZWG (dual)</option><option>ZWG only</option></select></div>
    </div></div></div>''')
    body += sec(card("Defaults", "Applied to new records unless overridden", table([("Setting",False),("Value",False),("",False)], [
        ('<span class="nm">Date format</span>','DD MMM YYYY · 02 Jun 2026','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
        ('<span class="nm">Number separator</span>','Comma thousands · dot decimals','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
        ('<span class="nm">Week starts</span>','Monday','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
        ('<span class="nm">Fiscal year start</span>','01 January','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'),
    ])))
    return body


def settings_members_roles_body():
    rows = []
    MEMBERS = [
        ("RM","Rumbidzai Mukamba","orange","rumbidzai@mukamba.co.zw","Owner","Owner","2m ago"),
        ("JK","Joseph Kanyengo","blue","joseph@mukamba.co.zw","Accounting","Accountant","8m ago"),
        ("PS","Patience Sibanda","purple","patience@mukamba.co.zw","Operations","Manager","14d ago"),
        ("FM","Faith Moyo","red","faith@mukamba.co.zw","HR","HR Manager","32m ago"),
        ("TM","Tafadzwa Mhike","red","tafadzwa@mukamba.co.zw","Operations","Floor sup.","1h ago"),
        ("AC","Alex Chiwanza","orange","alex@mukamba.co.zw","Operations","Cashier","4h ago"),
    ]
    for ini, name, col, email, dept, role, last in MEMBERS:
        rows.append((av(ini,name,f"{email} · 2FA on",col),
                     f'<span class="badge badge-info">{dept}</span>',
                     f'<span class="badge badge-neutral">{role}</span>',
                     last,
                     '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Manage</button>'))
    body = header(
        "Members & roles",
        "24 active members across 5 departments. Roles bundle permissions; departments scope visibility.",
        [("b","24 active"),("","6 admins"),("s","100% 2FA")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary">Roles</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Invite</button>',
    )
    body += stats([
        ("Active members","24","","",""),
        ("Admins","6","","2 owners",""),
        ("Pending invites","2","","",""),
        ("2FA coverage","100%","","Enforced","up"),
    ])
    body += sec(card("Members","Filter to active · sorted by last seen",
        toolbar("Search name, email", ["Department","Role","Status"], "Showing 1–6 of 24")
        + table([("Member",False),("Department",False),("Role",False),("Last seen",False),("",False)], rows),
        filters("All","Active","Pending","Disabled")))
    return body


def settings_billing_body():
    body = header(
        "Billing & plan",
        "Mukamba Group is on the Production plan · 24 admin seats, 248 staff seats. Annual billing, USD.",
        [("b","Production"),("","Annual · USD"),("s","Card · ····7c4f")],
        '<button class="btn btn-quiet">Cancel plan</button> <button class="btn btn-secondary"><span data-icon="download" data-icon-size="14"></span> Invoices</button> <button class="btn btn-primary"><span data-icon="card" data-icon-size="14"></span> Change card</button>',
    )
    body += stats([
        ("Plan","Production","","Annual",""),
        ("Admin seats","24","<span class='u'>/ 30</span>","",""),
        ("Staff seats","248","<span class='u'>/ 300</span>","",""),
        ("Next bill","$ 8,640","","01 Jan 2027",""),
    ])
    body += sec(card("Invoices","Last 12 months",
        table([("Number",False),("Period",False),("Amount",True),("Status",False),("Issued",False),("",False)], [
            ('<span class="nm">INV-2026-001</span>','FY 2026 annual subscription','$ 8,640.00','<span class="badge ok">Paid</span>','01 Jan 2026','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
            ('<span class="nm">INV-2025-001</span>','FY 2025 annual subscription','$ 7,200.00','<span class="badge ok">Paid</span>','01 Jan 2025','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
            ('<span class="nm">INV-2025-add-01</span>','Mid-year seat top-up (+18 staff)','$ 540.00','<span class="badge ok">Paid</span>','12 Jul 2025','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">PDF</button>'),
        ])))
    body += sec(card("Payment method","Primary card · auto-renew",
        '<div class="pane-pad" style="display:flex;align-items:center;gap:18px;"><span style="width:54px;height:34px;border-radius:6px;background:var(--ink);color:#fff;display:grid;place-items:center;font:700 12px var(--font-mono);">VISA</span><div><div class="nm">Visa ····7c4f</div><div class="sb">Stanbic Zimbabwe · expires 02/28 · Rumbidzai Mukamba</div></div><span class="badge badge-success" style="margin-left:auto;">Default</span></div>'))
    return body


def settings_integrations_body():
    rows = [
        ('<span style="width:32px;height:32px;border-radius:8px;background:#DEEAFE;color:#1E40AF;display:inline-grid;place-items:center;"><span data-icon="card" data-icon-size="16"></span></span>',
         '<span class="nm">Stanbic Bank EFT</span><div class="sb">Payments · CSV batch upload</div>',
         '<span class="badge ok">Connected</span>','Last batch · 03 Jun',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Configure</button>'),
        ('<span style="width:32px;height:32px;border-radius:8px;background:#DCFCE7;color:#166534;display:inline-grid;place-items:center;"><span data-icon="phone" data-icon-size="16"></span></span>',
         '<span class="nm">EcoCash · Econet</span><div class="sb">Payments · mobile money</div>',
         '<span class="badge ok">Connected</span>','12k tx · 30d',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Configure</button>'),
        ('<span style="width:32px;height:32px;border-radius:8px;background:#FFE5C8;color:#6B3F19;display:inline-grid;place-items:center;"><span data-icon="receipt" data-icon-size="16"></span></span>',
         '<span class="nm">ZIMRA Fiscalisation</span><div class="sb">Tax · fiscal device API v3</div>',
         '<span class="badge ok">Connected</span>','42k receipts · 30d',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Configure</button>'),
        ('<span style="width:32px;height:32px;border-radius:8px;background:#EDE0FF;color:#4C1D95;display:inline-grid;place-items:center;"><span data-icon="mail" data-icon-size="16"></span></span>',
         '<span class="nm">Google Workspace SSO</span><div class="sb">Identity · SAML 2.0</div>',
         '<span class="badge ok">Connected</span>','24 / 24 members',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Configure</button>'),
        ('<span style="width:32px;height:32px;border-radius:8px;background:#FEE2E5;color:#7F1D1D;display:inline-grid;place-items:center;"><span data-icon="chart" data-icon-size="16"></span></span>',
         '<span class="nm">Quick Books Online</span><div class="sb">Accounting export</div>',
         '<span class="badge warn">Token expiring</span>','Renew by 12 Jun',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Re-auth</button>'),
        ('<span style="width:32px;height:32px;border-radius:8px;background:#CFFAFE;color:#155E75;display:inline-grid;place-items:center;"><span data-icon="plug" data-icon-size="16"></span></span>',
         '<span class="nm">Twilio · SMS gateway</span><div class="sb">Notifications · SMS provider</div>',
         '<span class="badge ok">Connected</span>','2,184 sends · 30d',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Configure</button>'),
        ('<span style="width:32px;height:32px;border-radius:8px;background:var(--surface-muted);color:var(--text-muted);display:inline-grid;place-items:center;"><span data-icon="plug" data-icon-size="16"></span></span>',
         '<span class="nm">Microsoft 365 SSO</span><div class="sb">Identity · OIDC</div>',
         '<span class="badge neutral">Not connected</span>','—',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Connect</button>'),
    ]
    body = header(
        "Integrations",
        "7 integrations connected · 1 needs attention. Marketplace has 24 more providers.",
        [("b","7 connected"),("","1 needs re-auth"),("s","Marketplace open")],
        '<button class="btn btn-quiet">Browse marketplace</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Add</button>',
    )
    body += stats([
        ("Connected","7","","",""),
        ("Needs attention","1","","QuickBooks token",""),
        ("Calls · 30d","68,420","","",""),
        ("Avg latency","248ms","","",""),
    ])
    body += sec(card("Connected integrations","Sorted by category",
        table([("",False),("Integration",False),("Status",False),("Last activity",False),("",False)], rows)))
    return body


def settings_security_body():
    body = header(
        "Security",
        "Password policy, MFA enforcement, SSO, session limits. Default policy is strict for production tenants.",
        [("b","Strict"),("s","100% 2FA"),("","Sessions: 12h")],
        '<button class="btn btn-quiet">Reset to defaults</button> <button class="btn btn-primary"><span data-icon="check" data-icon-size="14"></span> Save</button>',
    )
    body += stats([
        ("2FA enforced","Yes","","All 24 members","up"),
        ("SSO active","Google","","SAML",""),
        ("Active sessions","18","","",""),
        ("Failed logins · 24h","3","","All resolved",""),
    ])
    body += sec(f'''<div class="dash-card"><div class="dash-card-h"><div><h2>Password & MFA policy</h2><div class="sub">Applies to non-SSO members</div></div></div><div class="pane-pad"><div class="form-grid">
      <div class="fld"><label>Minimum length</label><input value="12" /></div>
      <div class="fld"><label>Complexity</label><select><option>Upper + lower + digit + symbol</option><option>Upper + lower + digit</option></select></div>
      <div class="fld"><label>Rotation</label><select><option>Never (favour MFA)</option><option>Every 90 days</option></select></div>
      <div class="fld"><label>2FA</label><select><option>Required for all</option><option>Required for admins</option><option>Optional</option></select></div>
      <div class="fld"><label>SSO</label><select><option>Google Workspace · enforced</option><option>Microsoft 365</option><option>SAML 2.0 (custom)</option></select></div>
      <div class="fld"><label>Session length</label><select><option>12 hours</option><option>8 hours</option><option>24 hours</option></select></div>
    </div></div></div>''')
    body += sec(card("Active sessions","Sign-out other devices remotely",
        table([("Device · location",False),("IP",False),("Last seen",False),("",False)], [
            ('<span class="nm">MacBook Pro · Safari · Harare</span>','41.220.x.x','Now','<span class="sb">This device</span>'),
            ('<span class="nm">iPhone · iOS · Harare</span>','41.220.x.x','12m ago','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Sign out</button>'),
            ('<span class="nm">Windows · Chrome · Bulawayo</span>','41.221.x.x','2h ago','<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Sign out</button>'),
        ])))
    return body


def settings_branches_body():
    rows = [
        ('<span class="nm">Park Centre</span><div class="sb">23 Park Lane, Harare · UTC+2</div>',
         "Retail flagship", "62", "4", '<span class="badge ok">Active</span>'),
        ('<span class="nm">Avondale</span><div class="sb">Avondale Shopping Centre · UTC+2</div>',
         "Retail · cold-chain", "38", "3", '<span class="badge ok">Active</span>'),
        ('<span class="nm">Bulawayo</span><div class="sb">Fife St · UTC+2</div>',
         "Retail", "44", "3", '<span class="badge ok">Active</span>'),
        ('<span class="nm">Mutare</span><div class="sb">Aerodrome Rd · UTC+2</div>',
         "Retail", "42", "2", '<span class="badge ok">Active</span>'),
        ('<span class="nm">Head office</span><div class="sb">Borrowdale Office Park · UTC+2</div>',
         "Admin · Accounts", "62", "0", '<span class="badge ok">Active</span>'),
    ]
    body = header(
        "Branches",
        "5 branches grouped under Mukamba Group · roles can be scoped per branch.",
        [("b","5 active"),("","248 staff"),("","12 POS tills")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Add branch</button>',
    )
    body += stats([
        ("Branches","5","","All active",""),
        ("Staff","248","","Across 5 sites",""),
        ("Till count","12","","",""),
        ("New this year","0","","",""),
    ])
    body += sec(card("Branches","Sorted by branch type", table(
        [("Branch",False),("Type",False),("Staff",True),("Tills",True),("Status",False)], rows)))
    return body


def settings_audit_body():
    rows = [
        ('<span class="nm">payroll.run.approve</span><div class="sb">Run 2026-06 approved &amp; posted</div>',
         av("FM","Faith Moyo","HR Manager","red"),"02 Jun · 14:22","41.220.x.x",
         '<span class="badge ok">Success</span>'),
        ('<span class="nm">member.role.update</span><div class="sb">Patience Sibanda · Cashier → Manager</div>',
         av("RM","Rumbidzai M.","Owner","orange"),"02 Jun · 11:14","41.220.x.x",
         '<span class="badge ok">Success</span>'),
        ('<span class="nm">api_key.revoke</span><div class="sb">staging_pos_terminal revoked</div>',
         av("JK","Joseph K.","Accountant","blue"),"02 Jun · 09:48","41.220.x.x",
         '<span class="badge ok">Success</span>'),
        ('<span class="nm">auth.failed</span><div class="sb">3 failed attempts · cashier@old-domain</div>',
         '<span class="sb">Anonymous</span>',"02 Jun · 02:14","178.x.x.x",
         '<span class="badge warn">Blocked</span>'),
        ('<span class="nm">stock.transfer.create</span><div class="sb">TRF-2026-018 · Park → Mutare</div>',
         av("TM","Tafadzwa M.","Floor sup.","red"),"01 Jun · 16:20","41.220.x.x",
         '<span class="badge ok">Success</span>'),
        ('<span class="nm">cctv.evidence_hold.create</span><div class="sb">EH-2026-018 · Mutare break-in</div>',
         av("FM","Faith Moyo","HR Manager","red"),"01 Jun · 09:14","41.220.x.x",
         '<span class="badge ok">Success</span>'),
    ]
    body = header(
        "Audit log",
        "Filterable cross-module action log. Every state change, every admin action. Retained for 7 years.",
        [("b","68,420 events · 30d"),("","Retention 7y"),("s","Tamper-evident")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="filter" data-icon-size="14"></span> Filter</button>',
    )
    body += stats([
        ("Events · 24h","2,412","","",""),
        ("Admin actions","42","","",""),
        ("Failed / blocked","8","","All resolved",""),
        ("Retention","7","<span class='u'>years</span>","Required",""),
    ])
    body += sec(card("Recent actions","Newest first · tamper-evident",
        toolbar("Search action, actor, resource", ["Action","Actor","Period"], "Showing 1–6 of 68,420")
        + table([("Action",False),("Actor",False),("When",False),("IP",False),("Result",False)], rows),
        filters("All","Admin","Auth","Data","Failed")))
    return body


def settings_api_keys_body():
    rows = [
        ('<span class="nm">prod_pos_terminal</span><div class="sb">huchu_sk_····7c4f · sales:write, items:read</div>',
         "Rumbidzai M.","18 Jan 2026","2m ago",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;color:var(--tone-danger);">Revoke</button>'),
        ('<span class="nm">prod_inventory_sync</span><div class="sb">huchu_sk_····a812 · items:*, stock:*</div>',
         "Joseph K.","04 Mar 2026","14m ago",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;color:var(--tone-danger);">Revoke</button>'),
        ('<span class="nm">prod_zimra_fiscal</span><div class="sb">huchu_sk_····d401 · receipts:write</div>',
         "Joseph K.","12 May 2026","1m ago",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;color:var(--tone-danger);">Revoke</button>'),
    ]
    body = header(
        "API keys",
        "3 active keys · each scoped to specific resources. Rotate quarterly; revoke on offboarding.",
        [("b","3 active"),("","Last rotated 12 May"),("s","Scoped")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Audit</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New key</button>',
    )
    body += stats([
        ("Active keys","3","","All scoped",""),
        ("Calls · 24h","48,420","","",""),
        ("Last rotation","21d","<span class='u'>ago</span>","",""),
        ("Revoked · 90d","2","","On offboarding",""),
    ])
    body += sec(card("Keys","All keys shown · secrets masked",
        table([("Name · scope",False),("Created by",False),("Created",False),("Last used",False),("",False)], rows)))
    return body


def settings_danger_body():
    body = header(
        "Danger zone",
        "Permanent and disruptive actions. Each one writes to audit log and requires re-authentication.",
        [("","Audit-logged"),("","Re-auth required")],
        '',
    )
    body += sec(f'''<div class="dash-card" style="border-color:var(--tone-danger-bd,#FCA5A5);">
      <div class="dash-card-h" style="border-bottom-color:var(--tone-danger-bd,#FCA5A5);"><div><h2 style="color:var(--tone-danger);">Danger zone</h2><div class="sub">All actions on this page are permanent and audit-logged</div></div></div>
      <div class="pane-pad" style="display:grid;gap:12px;">
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--tone-danger-bg);border:1px solid var(--tone-danger-bd,#FCA5A5);border-radius:10px;">
          <div style="flex:1;"><div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Transfer workspace ownership</div><div style="font:12.5px/1.45 var(--font-sans);color:var(--text-muted);margin-top:3px;">Pass full Owner role to another admin. Your account becomes Manager.</div></div>
          <button class="btn btn-secondary" style="font-size:12.5px;">Transfer</button>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--tone-danger-bg);border:1px solid var(--tone-danger-bd,#FCA5A5);border-radius:10px;">
          <div style="flex:1;"><div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Wipe sample data</div><div style="font:12.5px/1.45 var(--font-sans);color:var(--text-muted);margin-top:3px;">Removes demo/test records introduced during onboarding. Cannot be undone.</div></div>
          <button class="btn btn-secondary" style="font-size:12.5px;">Wipe</button>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--tone-danger-bg);border:1px solid var(--tone-danger-bd,#FCA5A5);border-radius:10px;">
          <div style="flex:1;"><div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Export full workspace</div><div style="font:12.5px/1.45 var(--font-sans);color:var(--text-muted);margin-top:3px;">JSON dump of every record. Generated within 24h.</div></div>
          <button class="btn btn-secondary" style="font-size:12.5px;">Export</button>
        </div>
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--tone-danger-bg);border:1px solid var(--tone-danger-bd,#FCA5A5);border-radius:10px;">
          <div style="flex:1;"><div style="font:600 13.5px/1.3 var(--font-sans);color:var(--text-strong);">Delete workspace</div><div style="font:12.5px/1.45 var(--font-sans);color:var(--text-muted);margin-top:3px;">Permanently destroy this workspace, all members, all data. 30-day grace period.</div></div>
          <button class="btn btn-secondary" style="font-size:12.5px;color:var(--tone-danger);">Delete…</button>
        </div>
      </div>
    </div>''')
    return body


# ── Stock surfaces ───────────────────────────────────────────────────────────

def stock_items_body():
    rows = []
    ITEMS = [
        ("Mealie meal · 10kg · Roller","SKU-MM-10R","Park Centre · A3-B12","420","12.40","ok"),
        ("Cooking oil · 2L · Pure Drop","SKU-CO-02P","Park Centre · A4-B02","186","4.20","ok"),
        ("Sugar · 2kg · Tongaat","SKU-SG-02T","Avondale · A2-B08","42","3.80","warn"),
        ("Bread flour · 50kg · Bakers","SKU-BF-50B","Park Centre · A5-B01","8","42.00","warn"),
        ("Margarine · 500g · Stork","SKU-MG-05S","Bulawayo · A1-B14","0","2.40","danger"),
        ("Tea bags · 100s · Tanganda","SKU-TB-100","Mutare · A6-B22","248","1.80","ok"),
        ("Powdered milk · 400g","SKU-PM-04N","Park Centre · A3-B18","62","6.40","ok"),
        ("Salt · 1kg · Saltrock","SKU-SL-01S","Avondale · A2-B11","112","0.80","ok"),
    ]
    for name, sku, loc, oh, price, tone in ITEMS:
        tone_badge = {"ok":"ok","warn":"warn","danger":"danger"}[tone]
        tone_label = {"ok":"OK","warn":"Low","danger":"Out"}[tone]
        rows.append((
            '<span style="width:32px;height:32px;border-radius:6px;background:var(--surface-muted);display:inline-grid;place-items:center;"><span data-icon="box" data-icon-size="14"></span></span>',
            f'<span class="nm">{name}</span><div class="sb">{sku} · {loc}</div>',
            oh, f"$ {price}",
            f'<span class="badge {tone_badge}">{tone_label}</span>',
            '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Edit</button>'
        ))
    body = header(
        "Items master",
        "1,240 SKUs across 5 sites. Item master is shared; on-hand is per site.",
        [("b","1,240 SKUs"),("","6 low"),("","1 out")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="upload" data-icon-size="14"></span> Import CSV</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New SKU</button>',
    )
    body += stats([
        ("Total SKUs","1,240","","",""),
        ("Active","1,218","","98.2%",""),
        ("Low / out","7","","Auto-PO drafted",""),
        ("YTD margin · avg","18.4%","","+1.2% vs LY","up"),
    ])
    body += sec(card("Items","All SKUs · sorted by category",
        toolbar("Search SKU, name, supplier", ["Category","Site","Status"], "Showing 1–8 of 1,240")
        + table([("",False),("Item",False),("On hand",True),("Unit price",True),("Status",False),("",False)], rows),
        filters("All","Groceries","Beverages","Dry","Cold-chain")))
    return body


def stock_levels_body():
    rows = []
    LEVELS = [
        ("Mealie meal · 10kg · Roller","SKU-MM-10R", 420, 200, 600, "ok"),
        ("Cooking oil · 2L · Pure Drop","SKU-CO-02P", 186, 120, 300, "ok"),
        ("Sugar · 2kg · Tongaat","SKU-SG-02T", 42, 100, 240, "warn"),
        ("Bread flour · 50kg · Bakers","SKU-BF-50B", 8, 24, 72, "warn"),
        ("Margarine · 500g · Stork","SKU-MG-05S", 0, 60, 180, "danger"),
        ("Tea bags · 100s · Tanganda","SKU-TB-100", 248, 100, 320, "ok"),
    ]
    for name, sku, oh, par, max_q, tone in LEVELS:
        pct = (oh / max_q) * 100 if max_q else 0
        bar_color = {"ok":"var(--tone-success)","warn":"var(--tone-warn)","danger":"var(--tone-danger)"}[tone]
        rows.append((
            f'<span class="nm">{name}</span><div class="sb">{sku}</div>',
            f'<div><div style="display:flex;justify-content:space-between;font:11px/1 var(--font-mono);color:var(--text-muted);"><span>{oh}</span><span>par {par}</span></div><div style="height:5px;background:var(--surface-muted);border-radius:9999px;margin-top:6px;"><div style="width:{min(pct,100):.0f}%;height:100%;background:{bar_color};border-radius:9999px;"></div></div></div>',
            str(par), str(max_q),
            f'<span class="badge {tone}">{ {"ok":"OK","warn":"Low","danger":"Out"}[tone] }</span>',
        ))
    body = header(
        "Stock levels",
        "Live on-hand against par and max for every SKU. Drives the auto-reorder engine.",
        [("b","1,240 SKUs tracked"),("","7 below par"),("s","Auto-PO active")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="settings" data-icon-size="14"></span> Par levels</button>',
    )
    body += stats([
        ("Below par","7","","Auto-PO drafted",""),
        ("Out of stock","1","","Margarine 500g",""),
        ("Overstocked","12","","> 90% capacity",""),
        ("Avg fill rate","92%","","+3% vs LM","up"),
    ])
    body += sec(card("Levels · per SKU","Across all sites · click a row for site breakdown",
        toolbar("Search SKU, name", ["Site","Status","Category"], "Showing 1–6 of 1,240")
        + table([("Item",False),("Level",False),("Par",True),("Max",True),("Status",False)], rows),
        filters("All","Below par","Out","OK","Overstocked")))
    return body


def stock_receiving_body():
    rows = [
        ('<span class="nm">GRN-2026-0182</span><div class="sb">PO-2026-0421 · National Foods</div>',
         "Park Centre","2 Jun · 11:14","18 SKUs",'<span class="badge warn">2 variances</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">GRN-2026-0181</span><div class="sb">PO-2026-0418 · Olivine Industries</div>',
         "Avondale","2 Jun · 09:42","6 SKUs",'<span class="badge ok">No variance</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">GRN-2026-0180</span><div class="sb">PO-2026-0414 · Cairns Foods</div>',
         "Bulawayo","1 Jun · 16:20","24 SKUs",'<span class="badge warn">1 variance</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">GRN-2026-0179</span><div class="sb">PO-2026-0412 · Tongaat Hulett</div>',
         "Mutare","1 Jun · 14:08","12 SKUs",'<span class="badge ok">No variance</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="nm">GRN-2026-0178</span><div class="sb">PO-2026-0408 · Tanganda Tea</div>',
         "Park Centre","31 May · 10:14","4 SKUs",'<span class="badge ok">No variance</span>',
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
    ]
    body = header(
        "Receiving",
        "6 deliveries received in the last 24h. Variances flagged for stockroom sign-off.",
        [("b","6 today"),("","3 variances · 24h"),("s","Avg time-to-put-away 42m")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-secondary"><span data-icon="qr" data-icon-size="14"></span> Scan PO</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New GRN</button>',
    )
    body += stats([
        ("GRN · 7d","32","","",""),
        ("Variances · 7d","8","","25%",""),
        ("Avg put-away","42m","","-8m vs LM","up"),
        ("$ received · 7d","$ 84.2","<span class='u'>k</span>","",""),
    ])
    rows_var = [
        ('<span class="nm">Cooking oil · 2L · Pure Drop</span><div class="sb">SKU-CO-02P · PO-2026-0421</div>',
         '120','116','<span style="color:var(--tone-danger);">-4</span>','<span class="badge warn">Variance</span>'),
        ('<span class="nm">Sugar · 2kg · Tongaat</span><div class="sb">SKU-SG-02T · PO-2026-0421</div>',
         '60','58','<span style="color:var(--tone-danger);">-2</span>','<span class="badge warn">Variance</span>'),
    ]
    body += sec(card("Recent GRNs","Goods received notes · click to open detail",
        toolbar("Search GRN, PO, supplier", ["Site","Status","Period"], "Showing 1–5 of 32")
        + table([("GRN",False),("Site",False),("Received",False),("Lines",False),("Status",False),("",False)], rows),
        filters("All","Today","Variance","Clean")))
    body += sec(card("Open variances · GRN-2026-0182",
        "Park Centre · National Foods · 2 Jun · awaiting stockroom sign-off",
        table([("Item",False),("Ordered",True),("Received",True),("Variance",True),("",False)], rows_var)))
    return body


def stock_transfers_body():
    rows = [
        ('<span class="nm">TRF-2026-018</span><div class="sb">Park Centre → Mutare</div>',
         "18 SKUs","Brian C. · ZIM-2418","ETA 16:40",'<span class="badge brand">In transit</span>',"$ 4,820"),
        ('<span class="nm">TRF-2026-017</span><div class="sb">Avondale → Bulawayo</div>',
         "6 SKUs","Tendai N. · ZIM-1812","ETA 14:00",'<span class="badge brand">In transit</span>',"$ 1,240"),
        ('<span class="nm">TRF-2026-016</span><div class="sb">Bulawayo → Mutare</div>',
         "12 SKUs","Brian C. · ZIM-2418","Delivered 12:14",'<span class="badge ok">Received</span>',"$ 2,840"),
        ('<span class="nm">TRF-2026-015</span><div class="sb">Park Centre → Avondale</div>',
         "8 SKUs","—","—",'<span class="badge neutral">Draft</span>',"$ 1,820"),
    ]
    body = header(
        "Transfers",
        "3 transfers in transit between sites. Inter-branch movements with goods-in-transit tracking.",
        [("b","3 in transit"),("","1 draft"),("s","$ 6,060 in transit")],
        '<button class="btn btn-quiet"><span data-icon="filter" data-icon-size="14"></span> Filter</button> <button class="btn btn-secondary"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> New transfer</button>',
    )
    body += stats([
        ("In transit","3","","$ 6,060",""),
        ("Received · 7d","14","","",""),
        ("Avg transit","2h 18m","","Park ↔ Avondale",""),
        ("Variance rate","1.4%","","-0.6% vs LM","up"),
    ])
    body += sec(card("Transfers","Sorted by status (in-transit first)",
        toolbar("Search transfer, driver", ["From","To","Status"], "Showing 1–4 of 14")
        + table([("Transfer",False),("Items",False),("Driver / vehicle",False),("Window",False),("Status",False),("Value",True)], rows),
        filters("All","Draft","In transit","Received")))
    return body


def stock_take_body():
    rows = [
        ('<span class="nm">Aisle 3 · Dry goods</span><div class="sb">240 SKUs · counted by Faith M.</div>',
         '240 / 240',"+ 18","-12","<span class='badge ok'>Complete</span>"),
        ('<span class="nm">Aisle 4 · Oils &amp; sauces</span><div class="sb">118 SKUs · counted by Alex C.</div>',
         '118 / 118',"+ 4","-2","<span class='badge ok'>Complete</span>"),
        ('<span class="nm">Aisle 5 · Bakery raw</span><div class="sb">62 SKUs · in progress (Sarah N.)</div>',
         '34 / 62',"—","—","<span class='badge warn'>In progress</span>"),
        ('<span class="nm">Cold-room A</span><div class="sb">42 SKUs · scheduled</div>',
         '0 / 42',"—","—","<span class='badge neutral'>Scheduled</span>"),
        ('<span class="nm">Aisle 6 · Beverages</span><div class="sb">182 SKUs · scheduled</div>',
         '0 / 182',"—","—","<span class='badge neutral'>Scheduled</span>"),
    ]
    body = header(
        "Stock take · Park Centre · 02 June",
        "Sectioned weekly count · in-progress sections lock items for sale. Variances post to ledger.",
        [("b","Park Centre"),("","02 Jun cycle"),("s","2 sections done")],
        '<button class="btn btn-quiet">Pause</button> <button class="btn btn-secondary"><span data-icon="download" data-icon-size="14"></span> Export sheet</button> <button class="btn btn-primary"><span data-icon="check" data-icon-size="14"></span> Finalise &amp; post</button>',
    )
    body += stats([
        ("Sections","5","","2 complete",""),
        ("SKUs in scope","644","","392 counted",""),
        ("Net variance · $","+ $ 184","","Over-stock net","up"),
        ("Time elapsed","4h 12m","","Started 09:00",""),
    ])
    body += sec(card("Sections","Click a section to drill in to line-by-line variance",
        table([("Section",False),("Counted",False),("Over",False),("Short",False),("Status",False)], rows)))
    return body


def stock_suppliers_body():
    rows = [
        ('<span class="avatar" style="background:#FFE5C8;color:#6B3F19;">NM</span><span class="nm">National Foods Ltd</span><div class="sb">Harare · NET-30 · contact: Vimbai M.</div>',
         '<span class="badge ok">A</span>',"42","96%","$ 84.2k",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="avatar" style="background:#DCFCE7;color:#166534;">CF</span><span class="nm">Cairns Foods</span><div class="sb">Mutare · NET-30 · contact: Tariro N.</div>',
         '<span class="badge ok">A</span>',"38","94%","$ 62.4k",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="avatar" style="background:#DEEAFE;color:#1E40AF;">OI</span><span class="nm">Olivine Industries</span><div class="sb">Harare · NET-45 · contact: Munyaradzi C.</div>',
         '<span class="badge ok">A</span>',"24","92%","$ 48.0k",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="avatar" style="background:#EDE0FF;color:#4C1D95;">TH</span><span class="nm">Tongaat Hulett</span><div class="sb">Triangle · NET-30 · contact: Anesu S.</div>',
         '<span class="badge neutral">B+</span>',"12","88%","$ 28.4k",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
        ('<span class="avatar" style="background:#CFFAFE;color:#155E75;">TT</span><span class="nm">Tanganda Tea</span><div class="sb">Mutare · NET-30 · contact: Tendai M.</div>',
         '<span class="badge neutral">B+</span>',"8","90%","$ 14.2k",
         '<button class="btn btn-quiet" style="padding:0 8px;height:26px;font-size:12px;">Open</button>'),
    ]
    body = header(
        "Suppliers",
        "48 active suppliers · ranked on on-time delivery, fill rate, credit terms.",
        [("b","48 active"),("","12 A-rated"),("s","$ 412k YTD spend")],
        '<button class="btn btn-quiet"><span data-icon="download" data-icon-size="14"></span> Export</button> <button class="btn btn-primary"><span data-icon="plus" data-icon-size="14"></span> Add supplier</button>',
    )
    body += stats([
        ("Suppliers","48","","12 A-rated",""),
        ("Avg on-time","91%","","+2% vs LY","up"),
        ("YTD spend","$ 412","<span class='u'>k</span>","",""),
        ("Open POs","18","","$ 28.4k value",""),
    ])
    body += sec(card("Top suppliers","Sorted by YTD spend",
        toolbar("Search supplier, contact", ["Rating","City","Category"], "Showing 1–5 of 48")
        + table([("Supplier",False),("Rating",False),("SKUs",True),("On-time",True),("YTD spend",True),("",False)], rows)))
    return body



# =============================================================================
# Main — manifest of every surface and emission loop
# =============================================================================

MANIFEST = {
    "cctv": [
        ("01", "live-wall",          "Live wall",           "Multi-camera grid with site filters and PTZ.",            cctv_sidebar,  cctv_live_wall_body,       "Live wall"),
        ("02", "camera-detail",      "Camera detail",       "Single-camera health, 24h timeline, clip list.",          cctv_sidebar,  cctv_camera_detail_body,   "CAM-014 detail"),
        ("03", "event-log",          "Event log",           "Motion, tamper, offline, loitering · cross-site.",        cctv_sidebar,  cctv_event_log_body,       "Event log"),
        ("04", "recordings",         "Recordings",          "Search and playback against NVR-01.",                     cctv_sidebar,  cctv_recordings_body,      "Recordings"),
        ("05", "retention-settings", "Retention",           "Per-site retention sliders; evidence holds.",             cctv_sidebar,  cctv_retention_body,       "Retention settings"),
    ],
    "hr": [
        ("01", "employee-directory",  "Employee directory",  "248 staff · contract, NEC grade, salary.",       hr_sidebar, hr_employee_directory_body, "Employee directory"),
        ("02", "payroll-run",         "Payroll run",         "PAYE / NSSA / NEC / AIDS · approve & post.",     hr_sidebar, hr_payroll_run_body,        "Payroll run"),
        ("03", "payslips",            "Payslips",            "Generate, email, portal access, audit.",         hr_sidebar, hr_payslips_body,           "Payslips"),
        ("04", "attendance",          "Attendance",          "Clock-in, lateness, absence.",                   hr_sidebar, hr_attendance_body,         "Attendance"),
        ("05", "leave",               "Leave",               "Requests, balances, approvals.",                 hr_sidebar, hr_leave_body,              "Leave"),
        ("06", "disciplinary",        "Disciplinary",        "Warnings, hearings, sign-offs.",                 hr_sidebar, hr_disciplinary_body,       "Disciplinary"),
        ("07", "compliance-reports",  "Compliance reports",  "ZIMRA / NSSA / NEC returns, IT3.",               hr_sidebar, hr_compliance_body,         "Compliance reports"),
    ],
    "maintenance": [
        ("01", "work-orders",       "Work orders",        "Dispatch, parts, labour, sign-off.",         maint_sidebar, maint_work_orders_body,       "Work orders"),
        ("02", "assets-register",   "Assets register",    "Every asset — model, location, age.",        maint_sidebar, maint_assets_register_body,   "Assets register"),
        ("03", "pm-schedule",       "PM schedule",        "Time- or usage-based auto-WO generation.",   maint_sidebar, maint_pm_schedule_body,       "PM schedule"),
        ("04", "technician-roster", "Technician roster",  "Shifts, skills, availability.",              maint_sidebar, maint_technician_roster_body, "Technician roster"),
        ("05", "parts-inventory",   "Parts inventory",    "Workshop SKUs · auto-reorder.",              maint_sidebar, maint_parts_inventory_body,   "Parts inventory"),
    ],
    "notifications": [
        ("01", "inbox",              "Inbox",              "Cross-source notification feed.",            notif_sidebar, notif_inbox_body,         "Inbox"),
        ("02", "broadcast-composer", "Broadcast composer", "One-off message · audience + channels.",     notif_sidebar, notif_broadcast_body,     "Broadcast composer"),
        ("03", "channels",           "Channels",           "Email · WhatsApp · SMS · In-app.",           notif_sidebar, notif_channels_body,      "Channels"),
        ("04", "templates",          "Templates",          "Reusable messages with merge fields.",       notif_sidebar, notif_templates_body,     "Templates"),
        ("05", "delivery-log",       "Delivery log",       "Per-message audit · provider trace.",        notif_sidebar, notif_delivery_log_body,  "Delivery log"),
    ],
    "settings": [
        ("01", "workspace",       "Workspace",       "Name, time zone, branding.",                 settings_sidebar, settings_workspace_body,    "Workspace"),
        ("02", "members-roles",   "Members & roles", "Invite, role, deactivate, audit.",           settings_sidebar, settings_members_roles_body,"Members & roles"),
        ("03", "billing",         "Billing & plan",  "Plan, seats, invoices, card.",               settings_sidebar, settings_billing_body,      "Billing & plan"),
        ("04", "integrations",    "Integrations",    "Stanbic · EcoCash · ZIMRA · Google · etc.",  settings_sidebar, settings_integrations_body, "Integrations"),
        ("05", "security",        "Security",        "MFA, SSO, sessions, password policy.",       settings_sidebar, settings_security_body,     "Security"),
        ("06", "branches",        "Branches",        "5 sites · scope roles by branch.",           settings_sidebar, settings_branches_body,     "Branches"),
        ("07", "audit",           "Audit log",       "Cross-module action log · 7y retention.",    settings_sidebar, settings_audit_body,        "Audit log"),
        ("08", "api-keys",        "API keys",        "Scoped keys, last-used, revoke.",            settings_sidebar, settings_api_keys_body,     "API keys"),
        ("09", "danger-zone",     "Danger zone",     "Permanent and disruptive actions.",          settings_sidebar, settings_danger_body,       "Danger zone"),
    ],
    "stock": [
        ("01", "items",        "Items master",  "SKU library · price, supplier, category.",  stock_sidebar, stock_items_body,     "Items master"),
        ("02", "stock-levels", "Stock levels",  "On-hand vs par vs max per SKU.",            stock_sidebar, stock_levels_body,    "Stock levels"),
        ("03", "receiving",    "Receiving",     "GRNs · variances · put-away.",              stock_sidebar, stock_receiving_body, "Receiving"),
        ("04", "transfers",    "Transfers",     "Inter-branch movements · in-transit.",      stock_sidebar, stock_transfers_body, "Transfers"),
        ("05", "stock-take",   "Stock take",    "Sectioned counts · live variance.",         stock_sidebar, stock_take_body,      "Stock take"),
        ("06", "suppliers",    "Suppliers",     "Vendor list · ratings · spend.",            stock_sidebar, stock_suppliers_body, "Suppliers"),
    ],
}


def main():
    counts = {}
    for mod, surfs in MANIFEST.items():
        # 1) Surface pages
        for num, slug, name, desc, sidebar_fn, body_fn, topbar_title in surfs:
            sb = sidebar_fn(slug)
            body_html = body_fn()
            crumbs = [
                ("Home", "../../index.html"),
                ("Shared", "../../index.html#shared"),
                (HUB_TITLES[mod], "index.html"),
                (name, None),
            ]
            browser_path = f"{mod}/{slug}"
            html_doc = page(mod, slug, browser_path, crumbs, sb, topbar_title, body_html)
            write(mod, slug, html_doc)

        # 2) Hub index page
        surfaces_list = [(n, slug, name, desc) for (n, slug, name, desc, _, _, _) in surfs]
        examples_html = build_examples_html(mod)
        hub_html = hub_page(mod, surfaces_list, examples_html)
        write_index(mod, hub_html)

        counts[mod] = len(surfs)
    return counts


if __name__ == "__main__":
    counts = main()
    total = sum(counts.values())
    print(f"Built {total} surface pages + {len(counts)} hub indexes")
    for m, c in counts.items():
        print(f"  {m}: {c} surfaces")
