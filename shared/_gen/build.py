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
  body.dash-body { padding: 16px; place-items: start center; }
  .dash-frame { width: 1320px; }
  .tbl-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tbl-scroll table { min-width: 680px; }
  .mob-burger { display: none; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
  .form-grid .full { grid-column: 1 / -1; }
  .fld { display: grid; gap: 6px; }
  .fld label { font: 600 12px/1 var(--font-sans); color: var(--text-strong); }
  .fld input, .fld select, .fld textarea { width: 100%; padding: 9px 11px; border: 1px solid var(--border); border-radius: 8px; font: 14px/1.4 var(--font-sans); background: var(--surface); color: var(--text-strong); }
  .fld .hint { font: 12px/1.4 var(--font-sans); color: var(--text-muted); }
  .pane-pad { padding: 20px 22px; }
  @media (max-width: 820px) {
    body.dash-body { padding: 0; }
    .dash-frame { border-radius: 0; }
    .dash-app { grid-template-columns: 1fr; }
    .dash-side { display: none; }
    .dash-side.open { display: flex; position: fixed; inset: 0 auto 0 0; z-index: 60; width: 84%; max-width: 300px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
    .mob-burger { display: inline-grid; }
    .stat-row { grid-template-columns: 1fr 1fr; }
    .cols-2, .cols-equal, .cols-3, .form-grid { grid-template-columns: 1fr; }
    .step-rail { flex-wrap: wrap; }
    .filter-bar { flex-wrap: wrap; }
    .dash-page, [style*="padding: 0 32px"] { padding-left: 16px !important; padding-right: 16px !important; }
  }
  @media (max-width: 460px) {
    .stat-row { grid-template-columns: 1fr; }
    .dash-topbar { padding-left: 12px; padding-right: 12px; }
    .dash-topbar .search { display: none; }
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
    th = "".join(f'<th{" style=\"text-align:right\"" if r else ""}>{h}</th>' for h, r in headers)
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
