# Corelith Design System

A design system for **Corelith**, the operating platform built on the **Huchu** codebase ([tate2301/huchu](https://github.com/tate2301/huchu)). Inspired by the warm-paper interface, voice, and rhythm of the **Claude Code** desktop app.

---

## Source material

- **Codebase:** `github.com/tate2301/huchu` (Next.js 16 + Tailwind v4, shadcn-derived primitives, Lucide icons)
- **UI sans:** [Atkinson Hyperlegible Next](https://fonts.google.com/specimen/Atkinson+Hyperlegible+Next) — a high-legibility face from the Braille Institute. Loaded via Google Fonts.
- **Brand fonts (legacy):** `SS Huchu` (Regular 400, Medium 500, Bold 700) — copied from `public/*.woff2` into `fonts/`. Retained for parity with the live codebase; the design system uses Atkinson Hyperlegible.
- **Display serif:** Source Serif 4 — substituted for Anthropic Serif / Tiempos. Flag this swap if you obtain the real licensed file.
- **Visual reference:** Claude Code app (screenshots in `uploads/`)

---

## At a glance

| | |
|---|---|
| **Brand voice** | Confident · direct · quietly human. The voice of an experienced operator, not a salesperson. |
| **Aesthetic** | Warm paper canvas (`#FAF7F0`) with one clay accent (`#CC785C`) reserved for the brand mark. No gradients. No emoji. |
| **Type** | Source Serif 4 for greetings + display moments. Atkinson Hyperlegible Next for everything else. |
| **Spacing** | 4 px base, 8 px rhythm. 24 px content gutter. Generous air over chrome. |
| **Status** | Canonical labels only: Needs input · Running · Completed · Idle · Not started. |
| **Density** | Generous. 36 px controls minimum. The product is dense; the chrome shouldn't be. |

---

## Content fundamentals

Corelith speaks the way an experienced operator does.

- **Casing:** Sentence case everywhere — headings, buttons, badges. No Title Case. No ALL CAPS except for the rare eyebrow.
- **Voice:** Direct second-person. "You'll see the workflow…" not "The user will see the workflow…"
- **Verbs:** Strong, present-tense. "Log out", "Approve entry", "Cancel plan".
- **Nouns:** The real one. "Invoice", "site", "settlement", "session" — never "record", "item", "entity".
- **Numbers:** Use a real number when you have one. Use mono for IDs, timestamps, and money.
- **Emoji:** None.
- **Exclamation points:** None.
- **"Please":** Almost never. The user is here on purpose.
- **Apology:** Only when the system has actually failed. Even then: one sentence.

Six writing principles (see `preview/brand.html`):

1. Name the real noun.
2. Lead with the next action.
3. Trust the operator.
4. One sentence is plenty.
5. Quiet is correct.
6. Use the canonical labels.

---

## Visual foundations

### Color

- **Canvas** `#FAF7F0` — warm cream. Everything sits on this.
- **Surface** `#FFFEFB` — cards, inputs, the sidebar's interior.
- **Muted** `#F2EFE7` — hover, grouped areas.
- **Border** `#E5E0D2` — the hairline. Does the work of a shadow.
- **Ink** `#2A2622` — primary button background, near-black text.
- **Clay** `#CC785C` — the asterisk, the "Needs input" dot, and almost nothing else.
- **Tones** — info (blue), success (green), warn (amber), danger (red) — low saturation, paper-friendly.

### Backgrounds

- No gradients. No images behind text.
- Patterns are reserved for explicit decorative tiles (e.g. brand pattern art).
- Cards are bordered, not shadowed. Shadows belong to popovers and modals.

### Borders and dividers

- Default: `1 px solid var(--border)`.
- Between rows inside a card: `var(--border-subtle)` (a half-step lighter).
- Inside settings: rows separated by a hairline; sections separated by 40 px of air.

### Radii

- Controls: `8 px` (`--button-radius`).
- Cards & inputs: `10–12 px`.
- Pills: `9999 px`.

### Shadows / elevation

- Rest: none. Borders separate.
- Popover: `0 12px 32px -8px rgba(42,38,34,0.18), 0 2px 6px rgba(42,38,34,0.06)`.
- Modal: `0 24px 64px -12px rgba(42,38,34,0.24), 0 4px 12px rgba(42,38,34,0.08)`.

### Animation

- Fast: 140 ms.
- Default: 200 ms.
- Ease: `cubic-bezier(0.22, 1, 0.36, 1)` — out, mostly. Bounces are noise.
- Hover transitions: background, border, color. Never transform.
- No celebratory motion. No looping animations.

### Hover, press, focus

- Hover: background swaps from `--surface` to `--surface-muted`. Borders may darken to `--border-strong`.
- Press: background swaps to `--surface-sunken`. No scale.
- Focus-visible: `2 px` outline in the focus ring color, `2 px` offset.

### Imagery

- Real screenshots over illustrations.
- When a product mockup is needed, render it in the warm-paper palette. Never on pure white.

### Iconography

- **Library:** Lucide React (matches the codebase).
- **Stroke:** `1.6 px` consistently.
- **Sizes:** 14 px inline, 16 px default, 18 px on labels, 24 px in feature tiles.
- **Emoji:** Never. Use SVG.

---

## Layout rules

- **Sidebar:** fixed 264 px. Lives on canvas (not surface) so it disappears into the page.
- **Content:** centered to 900 px for forms, 1300 px for table-heavy pages.
- **Settings:** 240 px rail + content column with 48 px gutter between them.
- **One primary action per screen.** Use ink. Other actions are secondary or ghost.
- **One table per active view.** Multi-table context → vertical tabs in the rail.

---

## File index

```
README.md                 ← this file
SKILL.md                  ← agent-readable instructions
index.html                ← human-readable manifest of the system

tokens.css                ← all CSS variables (color, type, space, radii, motion)
components.css            ← the component layer (buttons, cards, sidebar, etc.)
icons.js                  ← inline-SVG icon helper (Lucide-style strokes)

fonts/
  regular.4b554656.woff2  ← SS Huchu Regular (legacy)
  medium.501e532c.woff2   ← SS Huchu Medium  (legacy)
  bold.37baf660.woff2     ← SS Huchu Bold    (legacy)

preview/
  typography.html         ← Source Serif greeting + Atkinson Hyperlegible scale
  colors.html             ← Warm paper, clay accent, tones
  spacing.html            ← 8-point rhythm, radii, elevation
  components.html         ← Buttons, badges, status dots, chips, inputs
  brand.html              ← Logo, voice principles, do/don't pairs

kits/
  app-shell.html          ← Welcome page + chat-home (the home screen)
  settings.html           ← Account, billing, extensions, nav centre
  tables-and-lists.html   ← Stat cards, sortable table, lists, empty state
```

---

## Caveats

- **Type system** uses Atkinson Hyperlegible + Atkinson Hyperlegible Mono only (Braille Institute, free/open). Display sizes use the same family with heavier weight.
- **Iconography** is hand-rolled Lucide-style strokes in `icons.js`. For production, install `lucide-react` and use its icons directly — the strokes will match.
- **No marketing kit yet.** The previous obsidian/dev-tools direction was retired in favor of the Claude Code aesthetic; a marketing site built on the same warm-paper system is a natural next step.
- **No email or deck templates yet.** Both can be derived from the same tokens — flag if you want them next.

---

## To use this in another project

Copy `tokens.css`, `components.css`, `icons.js`, and the `fonts/` folder. Link them in any HTML file:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components.css">
<script src="icons.js" defer></script>
```

Then write your markup with the classes documented in `preview/components.html`.

---

**Share:** set the file type to **Design System** in the Share menu so others in your org can view this resource.
