# Contributing to Corelith design docs

Welcome. This repo is the design system, cookbook, and nine portal demos for **Corelith** — the operating platform built on the [tate2301/huchu](https://github.com/tate2301/huchu) codebase. The site is the contract: tokens, primitives, blocks, patterns, shells, and the recipes that compose them.

The ethos in one breath: **an opinionated stack, a real-voice cookbook, and nine portals that prove the system survives contact with shipping software.** If a recipe needs a third-party library to make sense, the recipe is wrong; if a portal needs a bespoke CSS prefix, the system is incomplete.

---

## Local setup

No build step today. The site is hand-written HTML, CSS, and JS.

```bash
git clone git@github.com:tate2301/corelith-design-docs.git
cd corelith-design-docs

# Serve. Any static server works; this is the lowest-friction option:
python3 -m http.server 8000
# then open http://localhost:8000/
```

Node 22 is only required for the CI scripts (`scripts/check-js-parse.sh` and friends). You don't need it to view the site.

---

## How to add a primitive

A **primitive** is the smallest visual unit that has its own behavior — a button, a chip, a tooltip. One concept, one file, exhaustive variants.

1. **Filename:** `system/p-<name>.html` (e.g. `system/p-segmented-control.html`).
2. **Class naming:** prefix with `p-<name>` for any new class. Re-use tokens for everything visual; do not introduce new tokens in a primitive page.
3. **Boilerplate:** copy any existing `p-*.html` head — `tokens.css`, `components.css`, `system.css`, `icons.js`, `system-shell.js`, `huchu-nav.css`, `huchu-nav.js`.
4. **Register in nav:** add a single line to the `Reference` group in `huchu-nav.js`, labelled `Primitive ·  <Name>`.
5. **Include in `primitives.html`** if it belongs on the catalogue page.

---

## How to add a block

A **block** is a small composition of primitives that earns its own name — a page header, a stat card, a filter-chips row. If you can describe it in a single noun phrase that a designer would use ("the empty state"), it's a block.

1. **Filename:** `system/b-<name>.html`.
2. **Class naming:** `b-<name>` prefix. No bespoke colors; every visual lives in tokens.
3. **Litmus test (block vs primitive vs pattern):**
   - Primitive: one concept, one behavior. Button.
   - Block: a small group of primitives with a single purpose. Page header (title + meta + actions).
   - Pattern: a full surface, including state machine and accessibility model. Data table, modal, command palette.
4. **Register in nav:** `Block ·  <Name>` row in `huchu-nav.js`.

---

## How to add a pattern

A **pattern** is the full surface — markup + state + accessibility contract. App shell, data table, auth flow, command palette.

1. **Filename:** `system/x-<name>.html`.
2. **Sections required:** overview, anatomy, state, keyboard model, a11y notes, variants, where it's used.
3. **Class naming:** `x-<name>` for the pattern's own scope; compose primitives and blocks for the rest.
4. **Cookbook tie-in:** every pattern should have at least one cookbook recipe that puts it in real use. If you can't write one, the pattern isn't ready.
5. **Register in nav:** `Pattern ·  <Name>` row.

---

## How to add a cookbook recipe

A **recipe** is a senior eng walking a junior through building one screen end-to-end. Real state machines. Two-sentence "why" rationales. Opinionated. Not a marketing page.

1. **Copy** `cookbook/_template.html` to `cookbook/<theme>-<slug>.html`. The slug starts with the theme: `forms-`, `lists-`, `dashboards-`, `shells-`, `states-`, `auth-`, `approvals-`.
2. **Voice rules** (also in `_template.html` and `system/voice.html`):
   - Sentence case everywhere — headings, buttons, badges.
   - Direct second-person ("you'll see the workflow…").
   - No emoji, no exclamation points, no "please."
   - Name the real noun. "Invoice", "site", "settlement" — never "record" or "entity."
3. **Eight sections, in order:** header, overview, what you'll build, required pieces, step-by-step (4 numbered steps), final composition, variations, accessibility, related recipes.
4. **Theme + sidebar:** register the recipe in `huchu-nav.js` under the matching theme group in the Cookbook section. Use the `<Theme> ·  <Name>` label format that the rest of the file uses.
5. **React API:** import from `@corelithzw/react`. Named exports only. `useState` / `useReducer` for state. No other libraries.

---

## Commit & PR conventions

- **Subject:** `<area>: <change>` — short, present-tense, sentence case. Areas include `cookbook`, `system`, `portals`, `infra`, `nav`, `tokens`.
- **Body:** explain *why*, not what. The diff says what.
- **Agents** (LLM contributors): always use **explicit `git add` paths**, never `git add .` or `-A`. The repo has `package-lock.json` and other ignored-but-present artifacts that should never enter a commit by accident.
- **One PR, one concern.** A token change and a new recipe go in two PRs.
- **CI must be green** before review. Hard fail: JS parse check. Soft fail: HTML structure, broken links — fix them anyway.

---

## RFC process for new shells & patterns

Anything that introduces a new shell (`x-*-shell`), a new top-level pattern (`x-*`), or a new block category needs an RFC before code.

1. Open a GitHub issue titled `RFC: <name>`.
2. Include: problem, proposed shape, alternatives considered, cost of doing nothing.
3. Link any portal demo or cookbook recipe that would consume it.
4. One week comment window. DS lead resolves.

Primitives and recipes do **not** need an RFC. If you can ship the page, ship the page.

---

## Code of conduct

Be kind. Disagree with the code, not the person. Names go on credits; mistakes get fixed, not litigated. If something feels off, raise it — we'd rather have the awkward conversation than the resentful one.

---

Questions: open an issue, or DM the DS lead. The roadmap (`system/roadmap.html`) is the public picture of what's next; reading it before you propose a large change will save you a round trip.
