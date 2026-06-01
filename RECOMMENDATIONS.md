# Huchu Design System — Audit Synthesis & Recommendations

Three parallel reviewer agents audited the site against IBM Carbon, Shopify Polaris, Material 3, Atlassian, GitHub Primer, Tailwind UI, Radix, shadcn/ui, and Salesforce Lightning.

This document consolidates the three audits into one prioritized action plan.

Source audits: `tmp/audit-ia.md` · `tmp/audit-components.md` · `tmp/audit-foundations.md`

---

## What's already best-in-class

- **Editorial voice and principles.** `voice.html` and `principles.html` are stronger than Polaris/Carbon equivalents.
- **Five-layer taxonomy** (Foundations → Components → Blocks → Patterns → Shells → Pages) is more coherent than most public systems. The explicit *Blocks* tier is something Atlassian lacks.
- **Specimen vocabulary.** `.ds-specimen` + `.ds-specimen-bar` + `.ds-variant-grid` reads cleaner than Carbon's component pages.
- **Portals + Verticals as first-class IA** — no benchmarked system has this, and for a multi-vertical platform it's the right call.
- **Sitemap page exists.** Most enterprise DS sites lack this.
- **Typography page, Spacing page, Elevation principle ("border separates, shadow floats")** are crisp.

---

## The five highest-impact gaps

| # | Gap | Industry standard | Effort |
|---|---|---|---|
| 1 | **No accessibility section on any component page.** No keyboard tables, no ARIA contract, no contrast measurements. The "WCAG AA" pill in colors.html is asserted without evidence. | Polaris, Carbon, Material 3, Primer, Atlassian, Radix — all ship a11y per component | Medium (mechanical per-page edit) |
| 2 | **No working search.** The `⌘K` hint is shown but unwired. With ~100 pages this is critical. | Carbon, Polaris, Material 3, Primer all ship working search | Medium (Lunr/Minisearch + JSON index) |
| 3 | **Two diverging global navs.** `index.html`'s slim-nav, `system-shell.js`'s topbar, and `hx-nav.js`'s drawer each declare overlapping-but-not-identical link sets. | Polaris, Carbon, Primer all render from one config | Low (extract to shared `huchu-nav.js`) |
| 4 | **Motion docs lie.** `motion.html` documents `--dur-slower`, `--dur-page`, `--ease-spring`, `--ease-snap` that **don't exist in `tokens.css`**. | n/a — this is a real bug | Low (add tokens or remove from docs) |
| 5 | **No per-specimen code reveal or copy button.** Code lives in one big block at the bottom; you can't grab snippet under an example. | Tailwind UI, shadcn/ui, Polaris, Primer all attach `</>` toggle + Copy under every example | Medium (`.ds-specimen` enhancement + ~30 LOC JS) |

---

## P0 — do before the next release

These are blockers for credible v1.0 positioning.

1. **Add `accessibility.html` foundation page.** Keyboard, focus management, screen-reader patterns, contrast ratios per token pair, reduced-motion, target sizes. Drop the unfounded "WCAG AA" pill until measured.
2. **Add an Accessibility section to every interactive component.** Required ARIA, keyboard table (`Key · Action`), focus management, SR expectations. Start with: `p-button`, `p-input`, `p-select`, `p-checkbox`, `p-switch`, `p-tabs`, `p-combobox`, `p-dropdown-menu`, `p-popover`, `p-toast`, `p-alert-dialog`, `x-modal`, `x-command-palette`, `p-pagination`. Add `.ds-kbd-table` style next to `.ds-props` in `system.css`.
3. **Fix the motion docs bug.** Either add `--dur-slower`, `--dur-page`, `--ease-spring`, `--ease-snap` to `tokens.css`, or remove them from `motion.html`. Right now docs and code don't match.
4. **Wire ⌘K to real client-side search.** Build a static JSON index (title, category, url, keywords) and render in a popover. Lunr or Minisearch handles 100 pages in <50 ms.
5. **Unify the global nav.** Extract the link config to a shared `huchu-nav.js` consumed by `index.html`, `system-shell.js`, and `hx-nav.js`. Today Accounting is in one, `pages.html` is in another, the Guides link is mislabeled to `install.html`.
6. **Reconcile the count drift.** "48 primitives" on home vs "35 components" on the index vs 36 in `system-shell.js`. Generate from a manifest, or fix by hand and add a check.
7. **Decide the sidebar question.** Industry-standard is *persistent* sidebar at ≥1024px (Carbon, Polaris, Material 3, Primer, Atlassian, Lightning). You explicitly asked for *toggle-only*. Two viable resolutions: **(a)** revert to persistent on desktop and keep the drawer pattern only ≤1023 — matches industry norm and improves component discoverability; **(b)** keep toggle-only but add a much more prominent in-content nav (left rail of sibling pages inside each section). Pick one and commit. ⚠️ **Calling this out: this audit recommends (a); I'm flagging because it contradicts a previous instruction.**

## P1 — within the next sprint

8. **Status/maturity badges on every component.** Replace the decorative "Stable" pill with `Stable | Beta | Experimental | Deprecated` + a "Since v_X.Y_" line. Your own `install.html` promises this ("Beta after two kits"); honor it. Style four `.ds-status` variants in `system.css`.
9. **Per-specimen code reveal + Copy button.** Augment `.ds-specimen` with an optional `<details class="ds-specimen-code">` slot and a Copy chip. Authoring API: `<div class="ds-specimen" data-code="…">`. Single highest-leverage change for engineer adoption.
10. **Add "Used by" / "Used in" cross-references.** Drive from `/system/_usage.json` generated by grepping component class names across blocks/patterns. Render as a `.ds-callout.used-by` block. Closes the loop on impact analysis.
11. **Add a per-component changelog snippet.** `<section id="changes">` populated from `/system/_changes.json`. Carbon and Polaris do this; it materially changes adoption.
12. **Get-Started landing page.** Replace "Browse the system" as the primary CTA. Three blocks: *who's it for / how to use a component / where to find things*. Material 3's `develop/get-started` is the model.
13. **Surface release notes on the home page.** A small "What's new in v0.5" card. The sidebar already supports `tag: 'New'` — use it.
14. **Lift the orphaned `guide-*.html` files into a proper Guides hub.** They exist (`guide-block-vs-pattern`, `guide-compose-page`, `guide-compose-pattern`, `guide-mobile-adaptation`, `guide-new-feature`) but aren't in the sidebar; the top-nav "Guides" link points to `install.html`.
15. **Token namespace.** Rename `--brand-*`, `--surface`, `--text-*` etc. to `--hx-brand-*`, `--hx-surface`, `--hx-text-*` before v1.0. Carbon (`$cds-`), Polaris (`--p-`), Material (`md.sys.`) all do this. Free now, painful at v1.0 when host apps have their own `--surface`.
16. **Touch-target rationale.** `--h-control-md` of 36 px is below WCAG 2.5.5, Apple 44 px, Material 48 dp. Either lift to 44 px or document why a dense ERP context overrides the floor. Right now it's silent.

## P2 — strategic, next quarter

17. **Build dark theme.** At minimum a dark token set via `[data-theme="dark"]` or `prefers-color-scheme: dark`. Material's tonal-palette approach is one route; Carbon's G90/G100 is simpler.
18. **Add a true three-layer token system.** Primitive → semantic → component. Today semantic and component collide in one flat namespace. Add `--hx-card-bg`, `--hx-button-radius` etc. so brand reskinning doesn't touch semantic aliases.
19. **Sticky right-rail TOC** on every component/block/pattern page. The h2 anchors are already there; `.ds-toc` exists; it just isn't injected by `system-shell.js`. ~20 lines of JS.
20. **Related / See-also section** on every component page. Even a hand-curated `data-related="p-button-group,p-segmented-control"` attribute rendered by `system-shell.js`.
21. **Visual Do/Don't with paired specimens.** `.ds-rules .rule.do/.dont` already has the red/green borders. Extend the schema to allow a live specimen above each rule.
22. **Per-component mobile responsive note.** The `.ds-preview[data-viewport="mobile"]` infrastructure already exists in `system.css` (line ~710) and is unused. Wire it up per component instead of centralizing in `guide-mobile-adaptation.html`.
23. **`contribute.html` + RFC template.** A one-pager covering "how to propose a new component, where to file, expected review cycle." Polaris's Contribute hub is the gold standard.
24. **Normalize token naming.** Pick one of: T-shirt sizes (`--space-sm/md/lg`) or numeric scale (`--space-4/8/16`). Today colors are Tailwind-style (`--brand-500`), spacing is numbered with no px hint (`--space-7`), radii are T-shirts (`--radius-xs/sm/md/lg/xl/2xl`), durations are named (`--dur-fast/base/slow`). Four conventions in one file.
25. **Per-token contrast annotations** in `colors.html` (e.g., "`--text-body` on `--surface` = 14.2:1 AAA"). Removes the unfounded WCAG AA pill.
26. **Framework toggle (HTML / React).** Even a "React port coming soon" tab signals intent and creates the slot for real ports later.
27. **Visual Do/Don't with paired imagery** and **link Anatomy values to token pages** (mechanical, high payoff).
28. **Decision log / RFC archive** linked from the changelog. Why is the brand `#0B5DF0`? Why 14 px body? Carbon's "Whitepaper" pattern is the model.
29. **Internationalization / RTL note** on text-/numeric-heavy components (`p-input`, `p-table`, `b-pricing-card`, `b-stat-card`, `x-data-table`).
30. **Drop the duplicate `hx-nav.js` mobile drawer** once a unified nav source exists; today two drawers diverging is a maintenance trap.

---

## Bottom line

Huchu has stronger editorial taste than most public systems at v0.5 — the voice, principles, spacing, elevation, and iconography pages punch above weight. The gap is **structural, not aesthetic**: accessibility documentation, working search, token layering/namespacing, real status taxonomy, governance/contribution surface, and a single nav source of truth.

None of P0/P1 require a redesign — they're missing pages, renames, and small wiring jobs. P0 alone closes the credibility gap to a v1.0 launch.

The sidebar question (recommendation #7) is the one explicit tension between this audit and a prior product instruction; it deserves an explicit user decision before any further nav work.
