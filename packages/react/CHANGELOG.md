# Changelog

All notable changes to `@corelithzw/react` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.2] - 2026-07-26

### Added

- Exported the new primitives, blocks, shells, and patterns barrels from the package root.
- Added direct `./tokens.css` and `./components.css` package exports alongside `./styles.css`.
- Added shadcn/Radix migration token aliases including `--background`, `--foreground`, `--primary`, `--destructive`, `--ring`, and `--radius`.
- Added Radix-style `asChild` support and `data-slot`/state hooks across key primitives and action surfaces.

### Changed

- Updated complex pattern controls to compose Corelith primitives instead of reimplementing button/chip behavior.
- Marked hookful, portal, context, and browser-bound modules with `"use client"` for Next.js compatibility.
- Switched package publishing from GitHub Packages to the public npm registry.
- Renamed the npm package target from `@tate2301/corelith` to `@corelithzw/react`.

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
- `scripts/bundle-css.mjs` post-build step that concatenates `tokens.css` + `components.css` from the docs-site root onto the head of `dist/styles.css`, so `import '@tate2301/corelith/styles.css'` is enough to get the full design system.
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
