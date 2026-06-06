# Changelog

All notable changes to `@huchu/react` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-06-06

### Added

- ~24 additional components covering every cookbook recipe import:
  - Primitives: `Checkbox`, `Radio` + `RadioGroup`, `Switch`, `Select`, `Combobox`, `Badge`, `Avatar`, `Spinner`, `Skeleton`, `Tooltip`, `Kbd`, `Popover`, `Drawer`, `Tabs` (+ `.List`/`.Tab`/`.Panel`), `Stepper` (+ `.Step`), `RoleSwitcher`, `Pagination`, `SaveBar`, `Grabber`, `EmptyState` (full + inline), `Menu` (+ `.Item`/`.Label`/`.Divider`), `CommandPalette`.
  - Blocks: `BottomTabs`, `StatHero`, `StatCard`, `DayList`, `PageHeader`.
  - Patterns: `AppShell` (+ `.Sidebar`/`.Main`/`.TopBar`), `DataTable`, `Modal`, `Dialog`.
- Hooks: `useInterval`, `useUrlState`, `useOptimistic`, `useMatchMedia`, `useUpload` (plus the existing `useToast`).
- Vitest smoke tests for every shipped component (55 tests across 4 files).
- `scripts/bundle-css.mjs` post-build step that concatenates `tokens.css` + `components.css` from the docs-site root onto the head of `dist/styles.css`, so `import '@huchu/react/styles.css'` is enough to get the full design system.
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
