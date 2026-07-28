# Changelog

All notable changes to `@corelithzw/react` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Colour release. The system had one saturated hue and four semantic tones, which
is right for a settings page and wrong for a record page — used on a real site
the components read as grayscale. This adds the categorical colour layer, the
compact record grid, and conversation surfaces with iOS emoji.

### Added

- **Accent palette** (`styles/accents.css`). Thirteen hues — gray, red, orange,
  amber, yellow, green, teal, cyan, blue, indigo, violet, pink, brown — each
  with six roles: `solid`, `on`, `fg`, `bg`, `bg-hover`, `bd`. `on` is a real
  token, not an assumed white: orange, amber and yellow can't carry white text
  at AA, so their `on` is a dark ink.
- **The accent channel.** `data-accent="violet"` on any element rebinds the six
  unprefixed `--accent-*` variables for it and its subtree, so one attribute
  recolours a whole component. Semantic aliases (`brand`, `info`, `success`,
  `warn`, `danger`, `neutral`) resolve to hues through the same mechanism, so
  the existing tone vocabulary is unchanged.
- **`accentFor(seed)`** — a deterministic FNV-1a hash from any stable string to
  a hue. Avatars, tags and channels get colour from their own name, with nothing
  stored and nothing to assign; the same name yields the same hue on every
  client. Also `accentVar`, `resolveAccent`, `ACCENT_HUES`, `ACCENT_CYCLE`.
- **Chart series tokens** `--chart-1…10`, plus `chartSeriesVar(i)` and
  `CHART_SERIES`.
- `accent` (and `solid`/`bordered`/`dot` where they apply) on `Badge`, `Tag`,
  `Chip`, `Avatar` and `Status`.
- **`IconTile`** — the rounded tinted square behind an icon, emoji or letter
  stub. The system had grown five hand-rolled versions of this shape
  (`.nc-ic`, `.fr-ic`, `.n-av`, `.ft-thumb`, `.dh-mark`); this is the one to
  reach for now.
- **`Table` gains a `grid` density** — the compact scanning layout: 36 px rows,
  vertical column rules, brand-tinted selected rows. Knobs: `gridDensity`,
  `rowHeight`, `borderless`, `zebra`. It layers onto `.dtable` so it inherits
  the dense table's sticky-header and row-action rules rather than restating
  them. `Table.HeaderCell` takes an `icon`.
- **`RecordChip`** / **`RecordChipGroup`** — linked-record cells (avatar + name
  in a pill, hue derived from the name), with overflow collapsing to `+N`.
- **`CellPill`** — an accent-tinted pill for a typed cell value: an email, a
  URL, a select option.
- **`SelectionBar`** — floating quick-actions bar for selected rows. `DataTable`
  renders it from `selectionActions`, passing the selected keys to each handler.
- `DataTable` gains `density`, `gridDensity`, `borderless`, `zebra`,
  `stickyHeader`, `stickyFirstColumn`, `maxHeight`, `selectionActions`,
  `selectionOverflow`, `selectionLabel`, and a per-column `icon`.
- **Emoji data layer** (`utils/emoji.ts`) — ~1,070 curated glyphs across eight
  categories with search keywords, shortcode aliases (`:+1:`, `:tada:`), skin
  tones, and a tokenizer that keeps ZWJ sequences, regional-indicator flags and
  keycaps whole. Exports `EMOJI`, `EMOJI_CATEGORIES`, `SKIN_TONES`,
  `searchEmoji`, `emojiByShortcode`, `applySkinTone`, `tokenizeEmojiText`,
  `isEmojiOnly`, `replaceShortcodes`.
- **`Emoji` / `EmojiText` / `EmojiProvider`** — iOS artwork rather than the
  platform font. Native emoji only look like iOS *on* iOS; Windows renders
  Segoe UI Emoji and most Linux renders Noto. The artwork is Apple's, from
  `emoji-datasource-apple`, addressed by codepoint. That package is **not** a
  dependency — it unpacks to 103 MB — so images load from jsDelivr's copy by
  default and `assetBase` points at your own host. Anything that fails to load
  falls back to the native glyph; `set="native"` opts out of images entirely.
- **`EmojiPicker` / `EmojiSelect`** — searchable grid with category rail, skin
  tones, recents and full keyboard navigation. Arrows walk the visible grid
  while focus stays in the search field, so search → arrow → Enter needs no Tab.
- **`Conversation` / `ConversationRenderer` / `ReactionBar` / `Composer`** —
  message threads with day dividers, unread markers, author grouping,
  accent-derived avatars, emoji bodies (jumbo when a message is emoji-only),
  attachments tinted by file type, and reactions. `Composer` autogrows, sends on
  Enter or Cmd+Enter, expands shortcodes on send, and exposes `focus`/`clear`/
  `insert` through a ref.

### Changed

- **`Avatar`'s initials fallback is now coloured**, tinted by a hash of `name`
  instead of a single gray. This is a deliberate visual change — a list of
  people was previously a column of identical discs. `accent="gray"` restores
  the old look; `tone="clay"` and `tone="ink"` are untouched.
- **`DataTable` defaults to `density="grid"`.** Pass `density="compact"` for the
  previous appearance.
- **`Chart` series colours come from `--chart-1…10`** instead of hard-coded
  Tailwind hex (`#10b981`, `#f59e0b`, `#8b5cf6`), which matched nothing else in
  the system. Retokening the palette now retints charts.
- **`KanbanBoard` colour-codes its columns** by position in the accent rotation,
  tinting the header strip and giving each card a leading rail. `colorful={false}`
  restores the monochrome board.
- `ConversationRenderer` copies known message fields explicitly instead of
  spreading the whole object, so extra fields you carry on a message (a day
  label, a channel id, a raw payload) reach your callbacks without leaking to
  the DOM.

### Fixed

- `Composer` clears synchronously when `onSend` is synchronous. Awaiting
  unconditionally deferred the clear by a microtask, showing a frame of the
  just-sent text still in the box.
- `bundle-css.mjs` split source paths on `/` only, so on Windows the generated
  banner carried the whole absolute path instead of the file name.

## [0.4.0] - 2026-07-27

Convergence release. Driven by migrating `tate2301/huchu`'s `components/ui/*`
onto the design system: everything below is either a component that repo needed
and the package did not have, or a defect that migration exposed.

### Fixed

- **Components emitted class names with no CSS.** `Field`, `Menu`, `Drawer`,
  `Item`, `ButtonGroup`, `PageSection`, `ScrollContainer`, `AttachmentCenter`,
  `MobileList` and `MobileActionBar` all rendered `p-`prefixed classes that no
  stylesheet defined, so their appearance came entirely from inline styles and
  `className` could not override it. They now emit the styled class name, with
  the old name kept alongside as a targeting hook.
- **`Tabs` shipped completely unstyled** — none of `utabs`, `utab`, `stabs`,
  `stab`, `ptabs`, `ptab`, `vtabs`, `vtab` had a single rule.
- **`Stepper`'s markup and stylesheet disagreed on both halves** — the JSX
  emitted `.p-stepper-step` with `active`/`done` while the CSS styled `.p-step`
  with `done`/`current`/`pending`, so every shipped rule was dead.
- **`Pagination` rendered unstyled standalone** — it emitted `nav.pg > .pn` but
  the CSS only matched `.p-pagination .pg-nav .pn`.
- **`patterns/Dialog` could not compile** — it destructured and called
  `onClose`, which is not on `ModalProps` (the prop is `onOpenChange`), and
  passed a `ref` to `Modal`, which is not a `forwardRef`.
- `.modal-scrim` was `position: absolute`, covering the nearest positioned
  ancestor rather than the viewport; every consumer overrode it inline.
- 19 type errors across the package, mostly custom `title` / `onToggle` /
  `onChange` props colliding with the `HTMLAttributes` they extended.
- `Table`'s compound statics (`Table.Head` and friends) were attached through a
  `Record<string, unknown>` cast that erased them from the type.
- `blocks/LocalePicker` passed an `options` array to `Select`, which takes
  `<option>` children.

### Added

- `Sidebar` — a full collapsible app sidebar: `SidebarProvider`, `useSidebar`,
  and 15 parts including `SidebarMenuButton` with `isActive`, `asChild` and
  collapse-time tooltips. The package previously had no navigation shell beyond
  `AppShell`'s grid frame.
- `NavRail`, `NavRailGroup`, `NavRailItem` (aliased `NavGroup` / `NavItem`).
  The rail CSS existed but was scoped to `.settings-rail`; it now also matches
  `.nav-rail`, and gained icon, count, trailing and disabled slots.
- `Separator`, `Collapsible`, `SectionTabs` / `SectionTab`, `ClientDate`,
  `Label`, `FloatingActionButton` — all new primitives.
- `WorkflowStep`, `ScrollSnapItem`, `PullToRefreshHint`.
- `MobileList` gained 11 slot components alongside the existing `MobileListRow`.
- `useToasts()` exposes the toast store so a custom host can render the stack.
- CSS for surfaces that shipped none: modal size scale, drawer edge and size
  variants, toast viewport and action, menu checkbox/radio indicators and
  submenu caret, table scroll rail and sticky header, `bulk-edit-bar`, and an
  element-agnostic `.num`.

### Changed

- `SegmentedControl` is now generic over its value type and gained `size`,
  `variant`, `fullWidth`, and a per-option `count` badge.
- `Stepper` gained `variant: 'numbered' | 'bars'`, `showCounter`, a visually
  hidden step list, and **`currentIndex`** — a 0-based alternative to the
  1-based `current`, so the off-by-one cannot be got wrong.
- `Tabs` gained `activationMode`; `Tooltip` gained `align`, `sideOffset`, a
  `TooltipProvider`, and `asChild` on the trigger; `Status` gained `hideLabel`,
  `dotClassName` and `size`; `Item` and `ButtonGroup` gained `variant`/`size`
  and `orientation` respectively, each with sibling parts.
- `ScrollContainer`, `AttachmentCenter`, `PageSection` and `ExportMenu` widened
  to cover what the migrating call sites needed.
- Dev types moved to `@types/react@19` to match the primary consumer. The
  runtime peer range still accepts React 18.

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
