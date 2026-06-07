# Changelog

All notable changes to `@corelithzw/react` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] — 2026-06-07

This release closes the **cookbook-as-fiction** gap. Until now several recipes
in `/cookbook` imported APIs the package didn't actually ship —
`AppShell.Brand`, `NavGroup`, `DropdownMenu`, `Input` with icons, a
collapsible sidebar, the `usePersistedFlag` hook. The package is now backed
by every API the recipes import.

### Added — new exports

- **`AppShell.Brand`** — brand mark + product name at the top-left of the
  sidebar. Renders `<a class="sidebar-brand">` with an optional `mark` slot.
- **`AppShell.Topbar`** — lowercase-b alias for `AppShell.TopBar`. Both names
  point at the same component.
- **`NavGroup`** — labeled `<nav>` group for sidebar nav items. Renders
  `<nav><h6 class="nav-group-label">label</h6>{children}</nav>`.
- **`NavItem`** — new top-level export. Renders a single sidebar nav item
  (`<a class="nav-item">`) with `active`, `to`, `icon`, `badge` props and
  `aria-current="page"` when active. The mobile bottom-rail variant is still
  available as `MobileShell.NavItem`.
- **`DropdownMenu`** — alias for `Menu`. Recipes use the longer name. The
  `Separator` sub-component is also exposed as an alias for `Divider`.
- **`usePersistedFlag(key, default)`** — small hook that mirrors `useState`
  but persists a boolean to `localStorage`. SSR-safe and survives sign-out.

### Added — new props on existing components

- **`Input` → `leadingIcon`, `trailingIcon`, `trailingSlot`** — icons rendered
  inside the input chrome. When any icon is present the input is wrapped in
  `<div class="input-wrap">`; otherwise it stays a bare `<input>` so existing
  call sites are unaffected. `trailingSlot` is an alias accepting non-icon
  content (e.g. `<Kbd>⌘K</Kbd>`).
- **`AppShell` → `collapsed`** — boolean that adds `data-collapsed="true"` to
  the shell root. CSS handles the visual collapse (56px icon-rail, hides nav
  labels, collapses badges to dots).
- **`AppShell.Sidebar` → `collapsible`, `onToggle`** — `collapsible` renders a
  toggle button at the top of the sidebar that calls `onToggle` on click.
- The sidebar now renders an inner `<nav class="sidebar-nav">` element. This
  is additive — existing children render unchanged inside it.

### Added — CSS

New rules in `components.css` (bundled into `dist/styles.css`): `.input-wrap`,
`.input-icon`, `.sidebar-brand`, `.sidebar-brand-mark`, `.nav-group`,
`.nav-group-label`, `.nav-item`, `.nav-item.is-active`, `.nav-item-icon`,
`.nav-item-badge`, `.sidebar-head`, `.sidebar-toggle`, `.sidebar-nav`, and
the `[data-collapsed="true"]` icon-rail variants.

### Changed

- The standalone `NavItem` export now points at the sidebar nav-item rather
  than the mobile bottom-rail variant. **Breaking** for any caller that
  destructured `NavItem` and expected the mobile-rail shape — use
  `MobileShell.NavItem` instead.

### Cookbook reconciliation

Across all 41 recipes carrying the "Intended `@corelithzw/react` exports
used here…" banner, the leading "Intended" qualifier has been dropped. The
package now backs every named export those banners mention — except the
deferred application-level patterns below.

### Deferred — explicitly out of scope for 0.2.0

The following imports still appear in a handful of recipes but are pattern-
sized features beyond what 0.2.0 is meant to ship. Tracking them for a
future release:

- `AlertDialog`, `KanbanBoard` + `useKanban`, `CommentsThread` + `useComments`,
  `NotificationMatrix` + `usePreferences`, `DatePicker`, `useDateRange`.

These remain speculative imports in their respective recipes; we made no
attempt to rewrite those recipes around the existing primitives, since the
recipes were written specifically to drive the design of those patterns.

## [0.1.4] — 2026-06-07

### Added

- **Visible loading state on `Button`.** The `loading` prop already wired
  `is-loading` + `aria-busy="true"` + `disabled`, but nothing showed it on
  screen. New `.btn.is-loading` rule in `components.css` (which the package
  bundles into `dist/styles.css`) hides the label and renders a centered
  16px ring spinner using `currentColor`-derived ink so each variant
  (primary / secondary / ghost) draws the spinner in the right tone. Sizes
  `sm` / `md` / `lg` get matching spinner sizes. Honours
  `prefers-reduced-motion`.
- Docs: `system/p-button.html` now shows three new States specimens
  (primary / secondary / ghost loading) next to Disabled, and the Parts
  table documents the `loading` prop + class contract.

## [0.1.3] — 2026-06-07

### Changed

- **Renamed package** from `@tate2301/corelith` to `@corelithzw/react`. The
  CDN IIFE bundle still exposes `window.Corelith` — the brand name of the
  design system is unchanged, only the npm scope moved.
- **Dropped GitHub Packages publishing.** The package now ships to public
  npm only (`registry.npmjs.org`). No `.npmrc`, no PAT required to install.
- Publish workflow simplified to a single-registry pipeline that fails
  loudly if `NPM_TOKEN` is missing rather than silently skipping.

### Migration

```diff
- import { Button } from '@tate2301/corelith';
+ import { Button } from '@corelithzw/react';
- import '@tate2301/corelith/styles.css';
+ import '@corelithzw/react/styles.css';
```

Drop any `@tate2301:registry=https://npm.pkg.github.com` line from your
`.npmrc` — it is no longer needed.

## [0.1.2] — 2026-06-06

### Changed

- **Renamed package** from `@huchu/react` to `@tate2301/corelith`. The CDN IIFE
  bundle now exposes `window.Corelith` (previously `window.HuchuReact`).
- Published to **GitHub Packages** (`https://npm.pkg.github.com`) instead of
  the public npm registry. See README for one-time `.npmrc` setup.
- Updated `repository`, `bugs`, `homepage` to point at
  `tate2301/corelith-design-docs`.

### Migration

```diff
- import { Button } from '@huchu/react';
+ import { Button } from '@tate2301/corelith';

- import '@huchu/react/styles.css';
+ import '@tate2301/corelith/styles.css';
```

Add to your `~/.npmrc` (or repo-level `.npmrc`):

```
@tate2301:registry=https://npm.pkg.github.com
```

## [0.1.1] — 2026-06-06

### Added

- Components closing the gap with the cookbook recipes:
  - `Card` (with `Card.Header`, `Card.Title`, `Card.Body`, `Card.Footer`).
  - `Calendar` — month grid with `value`, `onChange`, `min`, `max`, `disabledDates`.
  - `Chart` namespace: `Chart.Line`, `Chart.Bar`, `Chart.Donut`, `Chart.Sparkline` — inline-SVG renderers driven by `{x,y}` or `{label,value}` data.
  - `Checklist` + `Checklist.Item` for first-run onboarding flows.
  - `Meter` — qualitative linear meter (`low` / `high` switch tone automatically).
  - `Progress` — determinate or indeterminate progress bar with `role="progressbar"`.
  - `SegmentedControl` — radio-group styled pill switch.
  - `MobileShell` (with `MobileShell.Body`, `MobileShell.BottomTabs`, `MobileShell.Header`, `MobileShell.Tab`, `MobileShell.NavItem`); standalone `Tab` and `NavItem` exports for recipes that destructure them.
  - `InlineEdit` — click-to-edit text with Enter-save, Esc-cancel, blur-save semantics.
  - `TextArea` matching the `Input` API (Field-context aware).
  - `DataToolbar` (with `Search`, `Filters`, `Actions` sub-slots).
  - `I18nProvider` + `useT()` + `useI18n()` with `{name}` interpolation.
  - `LocalePicker` wrapping a `<select>` over `I18nProvider`'s `locales`.
  - `Lightbox` + `useGallery()` — portal-rendered fullscreen viewer with prev/next/Esc and arrow-key navigation.
  - `FileUpload` — drag-drop, click-to-browse and paste-image zone (pairs with `useUpload`).
  - `KpiGrid` — auto-fit grid wrapper for `StatCard`/`Stat` tiles.
  - `Stat` exported as an alias for `StatCard` (recipes use both names).
- Hook: `useMediaQuery` exported as an alias for `useMatchMedia`.
- Smoke tests for every new component in `src/test/extras.test.tsx`.

## [0.1.0] — 2026-06-06

### Added

- ~24 additional components covering every cookbook recipe import:
  - Primitives: `Checkbox`, `Radio` + `RadioGroup`, `Switch`, `Select`, `Combobox`, `Badge`, `Avatar`, `Spinner`, `Skeleton`, `Tooltip`, `Kbd`, `Popover`, `Drawer`, `Tabs` (+ `.List`/`.Tab`/`.Panel`), `Stepper` (+ `.Step`), `RoleSwitcher`, `Pagination`, `SaveBar`, `Grabber`, `EmptyState` (full + inline), `Menu` (+ `.Item`/`.Label`/`.Divider`), `CommandPalette`.
  - Blocks: `BottomTabs`, `StatHero`, `StatCard`, `DayList`, `PageHeader`.
  - Patterns: `AppShell` (+ `.Sidebar`/`.Main`/`.TopBar`), `DataTable`, `Modal`, `Dialog`.
- Hooks: `useInterval`, `useUrlState`, `useOptimistic`, `useMatchMedia`, `useUpload` (plus the existing `useToast`).
- Vitest smoke tests for every shipped component (55 tests across 4 files).
- `scripts/bundle-css.mjs` post-build step that concatenates `tokens.css` + `components.css` from the docs-site root onto the head of `dist/styles.css`, so `import '@corelithzw/react/styles.css'` is enough to get the full design system.
- `vite.config.cdn.ts` IIFE bundle (`dist/cdn.global.js`) used by the Sandpack bridge to mount real components inside cookbook live previews.
- `package.json` polish: `0.1.0` (drop `-alpha.0`), `engines.node >= 20`, `repository`/`bugs`/`homepage`, `prepublishOnly` runs build + tests.

### Changed

- README rewritten with quick-install, 30-second example, full component table and hooks table.
- The package's `dist/styles.css` is now the canonical visual stylesheet (was a 0.55 KB fallback in alpha.0).

## [0.1.0-alpha.0] — 2026-06-03

### Added

- Initial monorepo scaffold under `packages/react`.
- TypeScript + Vite library build (`vite build` → ESM + CJS + `.d.ts`).
- 10 primitives matching the cookbook recipes' most-used imports:
  - `Button` (variants `primary | secondary | ghost`; tones `default | success | warn | danger`; sizes `sm | md | lg`; `loading`, `icon`, `iconRight`, `fullWidth`)
  - `Field` (with `Field.Label`, `Field.Description`, `Field.Error`; auto-generates IDs via `useId`, wires `aria-describedby` to `Input` via context)
  - `Input` (consumes `FieldContext` automatically)
  - `InputOtp` (6 cells, auto-advance, paste handler, `useImperativeHandle` exposes `focus()`)
  - `Alert` (tones, `role="alert"` for warn/danger, `role="status"` otherwise)
  - `Stack` (flex; `direction`, `gap`, `align`, `justify`, `wrap`, polymorphic via `as`)
  - `Form` (`<form noValidate>`, opt-out Enter submit)
  - `Toast` + `ToastProvider` + `useToast()` (reducer-driven queue, portal-rendered, `{ show, dismiss }`)
  - `BottomSheet` (portal, focus trap, Escape close, backdrop click; mobile slide-up / desktop centre)
  - `RowCard` (`title`, `sub`, `value`, `delta`, `deltaTone`, `meta`, `leading`, `trailing`; auto button/link when interactive)
  - `FilterChips` (`role: radiogroup | tablist | group`, count badge)
- `AuthShell` namespace composition (`AuthShell.Brand`, `AuthShell.Card`) referenced by the canonical `auth-signin-2fa` recipe.
- `forwardRef` on every primitive.
- README with quick-start and the canonical sign-in composition copied from the cookbook recipe.

### Notes

- All components produce the existing design-system class names (`.btn`, `.input`, `.field`, `.alert.success`, `.b-row-card`, `.b-filter-chips`, `.x-bottom-sheet`, …) so styles cascade from the docs-site `components.css`. The `dist/styles.css` ships only minimal positioning fallbacks for the portal-based components and `Stack` flex glue.
- Components are intentionally headless on state — consumers own form state, queue size, etc.
