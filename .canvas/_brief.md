# Shared brief — every artboard

## Files to read FIRST (all in /home/user/corelith-design-docs/.canvas/)
- `_kit.css`      — the approved v1 token + component CSS. Inline it VERBATIM.
- `_faces.html`   — inline SVG face-avatar sprite (ids f1–f8 people, c1–c3 learners).
- `Foundations.dc.html` — the exemplar. Copy its file shape exactly.

## File shape (exact — a deviation breaks the canvas)
```
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
  <style>
  ...ENTIRE CONTENTS OF _kit.css, VERBATIM...
  ...then any CSS this artboard alone needs...
  </style>
</helmet>
<div class="sheet" style="width:WIDTHpx;background:var(--ground)">
  ...ARTBOARD CONTENT...
</div>
</x-dc>
</body>
</html>
```
- Keep the `<script src="./support.js"></script>` line EXACTLY. Do not inline or remove it.
- A static artboard has NO `<script data-dc-script>` block. Omit it entirely.
- If the artboard uses face avatars, paste the entire contents of `_faces.html`
  immediately after the opening `<div class="sheet" ...>` tag.
- Close every non-void element. Double-quote every attribute. No self-closing HTML tags.
- Lay out sibling groups with `display:flex`/`grid` + `gap`. Never margins between siblings.

## Use the kit's classes
`.sheet .sheet-h .grp .grp-l .rowset .colset .cols .panel .panel-h .panel-b .note`
`.btn (.solid .danger .soft .ghost .xs .sm .lg .icon) .bgrp`
`.fld (.foc .bad) .lab .hint  .pill (.ok .warn .crit .acc .hollow) .cnt .kbd`
`.av .av-16/20/24/32/40/64 .av.ent .avw .pres .avg .idn .idn-t .idn-n .idn-s .rchip`
`table.d (th, td, .r, tr.hov, tr.sel, tr.grp-row, tfoot) .lrow .kard .meta .stat .bar`
Add new CSS only for what the kit genuinely lacks, and build it from the kit's tokens.
NEVER introduce a colour that is not a token in `_kit.css`. The one sanctioned
exception is the Corelith logo mark, `#0F62FE` — a mark is allowed its own value.
The face sprite's skin, hair and clothing hex is likewise outside the token set.

## The house rules — these bind absolutely
1. **Every person and every organisation renders an avatar beside the name.** A name is
   never a bare string. People are circles with faces (`<span class="av av-24"><svg><use href="#f1"/></svg></span>`).
   Organisations are rounded squares with initials on a flat module hue
   (`<span class="av av-24 ent" style="background:var(--books)"><span class="mk">GS</span></span>`).
2. No font weight above 600. No pure black. One accent.
3. Icons are inline SVG, solid or 1.4-stroke, one family, 12/14/16/20px. **Never emoji.**
4. Chevrons for "go here", never arrows. Links underlined.
5. Counter badges carry a background (`.cnt`, `.cnt.urgent`).
6. Several buttons in a row become a `.bgrp`, not loose buttons.
7. Money, quantities, document numbers, dates and counts are `.mono`/`.num` — tabular.
8. Sentence case everywhere. No exclamation marks. No "Please".
9. Neutral states get `.pill.hollow`, not a coloured badge.

## Content — real Corelith data only, never lorem

**`_facts.md` is the source of truth for every name, number, date and status tone.
Read it and conform to it exactly. Where an artboard disagrees, the artboard is wrong.**
- Companies: The Gate Shops (ACC-0142), Huchu Mine (ACC-0188), Lux Liquor (ACC-0203).
- People: Tendai Mukamba, Rutendo Chiweshe, Blessing Ncube, Farai Mutasa, Nyasha Dube,
  Simba Marondera, Chipo Zvobgo, Tapiwa Moyo, Kudzai Sibanda, Anesu Chikafu.
- Places: Avondale, Borrowdale, Msasa, Mbare, Mutare depot, Bulawayo, Harare.
- Money: US$ primary, ZWG at the day's rate 33.5500. Receipt #10238 at 14:06:05.
  Journal JNL-88214. VAT 15% inclusive. Tenders: Cash, Card, EcoCash, On account, Swipe.
- Compliance: ZIMRA FDMS fiscalisation, ITF263 tax clearance, VAT7, P2, QPD, NSSA.
- Status words, fixed set: Posted · Signed · Queued · In progress · Trading · Closed off ·
  Matched · Unmatched · Open · Draft · Final · Filed · Prepared · Reconciled ·
  Needs approval · Overdue · Not started.
- Keep figures internally consistent with any other artboard that shows the same record.

## Output
Write the file to `/home/user/corelith-design-docs/.canvas/<Name>.dc.html` using the Write
tool. Then return the structured object. Do not print the file into your reply.
