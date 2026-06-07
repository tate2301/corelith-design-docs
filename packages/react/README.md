# `@corelithzw/react`

Thin React wrappers over the Corelith design-system CSS. Components render the exact class names already shipped in `components.css`, so any cookbook recipe in the docs site translates verbatim into your app.

> **Status:** `v0.1.3` — published to public npm as `@corelithzw/react`. ~50 components, 6 hooks, full TypeScript types, bundled design-system stylesheet.

## Install

```bash
npm install @corelithzw/react react react-dom
```

No `.npmrc`, no PAT, no setup. Works in any repo, any CI, any Docker container. Full owner / troubleshooting notes live in **[INSTALL.md](./INSTALL.md)**.

Then import the bundled stylesheet once at the root of your app:

```ts
import '@corelithzw/react/styles.css';
```

That single import pulls in the design-system tokens, `components.css` and the per-component portal-positioning fallbacks the package ships. Nothing else is required — no separate `tokens.css` or font import.

## 30-second example

```tsx
import {
  AuthShell, Form, Field, Stack,
  Input, Button, Alert,
} from '@corelithzw/react';
import '@corelithzw/react/styles.css';

export function SignIn() {
  return (
    <AuthShell>
      <AuthShell.Brand product="Corelith" />
      <AuthShell.Card title="Sign in" subtitle="Welcome back">
        <Form onSubmit={(e) => e.preventDefault()}>
          <Stack gap="md">
            <Alert tone="info">Use your work email.</Alert>
            <Field label="Email" required>
              <Input type="email" autoFocus />
            </Field>
            <Field label="Password" required>
              <Input type="password" />
            </Field>
            <Button type="submit" fullWidth>Continue</Button>
          </Stack>
        </Form>
      </AuthShell.Card>
    </AuthShell>
  );
}
```

## Components

### Primitives

| Component         | Summary                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `Button`          | Variants (primary/secondary/ghost), tones, sizes, loading, icons          |
| `Input`           | Auto-wires id, aria-describedby, aria-invalid from nearest `Field`. `leadingIcon` / `trailingIcon` / `trailingSlot` for icon-chrome inputs. |
| `InputOtp`        | Per-digit OTP cells, paste-into-all, `autocomplete="one-time-code"`       |
| `Field`           | Label + description + error wrapper with `Field.Label/.Description/.Error` |
| `Form`            | `<form>` with `noValidate`, Enter-submit toggle                           |
| `Checkbox`        | `.check` styled checkbox + optional label, supports `indeterminate`      |
| `Radio` + `RadioGroup` | Context-based radio set with shared `name` and `value`               |
| `Switch`          | Toggle switch with `role="switch"`                                        |
| `Select`          | Styled `<select>` with optional `options[]` shorthand                     |
| `Combobox`        | Searchable, group-able listbox                                            |
| `Badge`           | Tones (neutral/info/success/warn/danger/clay/outline)                     |
| `Avatar`          | Initials, image, sizes (sm/md/lg), tones (default/clay/ink)               |
| `Spinner`         | `role="status"`, configurable `label`                                     |
| `Skeleton`        | Width/height props, optional `lines` for stacked placeholders             |
| `Tooltip`         | Hover/focus content; wraps a single child                                 |
| `Kbd`             | Keyboard chip                                                             |
| `Popover`         | Outside-click + Escape dismissable; optional arrow                        |
| `Drawer`          | Portal side panel; collapses to bottom-sheet on phone                     |
| `Tabs`            | `Tabs.List` + `Tabs.Tab` + `Tabs.Panel` with full ARIA wiring             |
| `Stepper`         | Pill-style progress; `Stepper.Step` or `total`/`current` shorthand        |
| `RoleSwitcher`    | Pill-shaped segmented toggle, generic over any string enum                |
| `Pagination`      | Page nav + optional page-size picker                                      |
| `SaveBar`         | Sticky save bar that slides in when `dirty`                               |
| `Grabber`         | Drag handle for reorderable rows                                          |
| `EmptyState`      | `full` (column) and `inline` (banner) variants                            |
| `Menu`            | `Menu.Item` + `Menu.Label` + `Menu.Divider` (also `Menu.Separator`)       |
| `DropdownMenu`    | Alias for `Menu` (recipes use both names)                                 |
| `NavGroup`        | Labeled `<nav>` group for sidebar nav items (`label` prop renders an `<h6>`) |
| `NavItem`         | Sidebar nav item: `active`, `to`, `icon`, `badge`; sets `aria-current="page"` |
| `CommandPalette`  | ⌘K modal with search, groups, keyboard navigation                         |
| `TextArea`        | Multi-line `<textarea>`; consumes `FieldContext` like `Input`             |
| `Meter`           | Qualitative meter with `low`/`high` thresholds (`role="meter"`)           |
| `Progress`        | Determinate or indeterminate progress bar                                 |
| `SegmentedControl`| Radio-group pill switch with `value`/`onChange`/`options`                 |
| `InlineEdit`      | Click-to-edit; save on Enter/blur, cancel on Esc                          |
| `Calendar`        | Month grid; `value`, `onChange`, `min`, `max`, `disabledDates`            |

### Blocks

| Component     | Summary                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| `BottomTabs`  | Mobile bottom-tab nav with active state + optional badge                    |
| `StatHero`    | Brand-tinted lead stat + secondary tiles row                                |
| `StatCard`    | Single stat tile with label/value/delta                                     |
| `DayList`     | Two-column day/value list with optional up/down tone                        |
| `PageHeader`  | Topbar with optional back button, title, right-side actions slot            |
| `RowCard`     | Tap-target row card for mobile lists                                        |
| `FilterChips` | Horizontal scrolling chip row with selection                                |
| `BottomSheet` | Portal sheet with focus trap + Escape + backdrop dismiss                    |
| `Card`        | `Card.Header` / `Card.Title` / `Card.Body` / `Card.Footer` wrapper          |
| `Checklist`   | First-run onboarding list with `Checklist.Item` (done/title/subtitle)       |
| `DataToolbar` | `DataToolbar.Search` + `.Filters` + `.Actions` slot wrapper                 |
| `Chart`       | Inline-SVG `Chart.Line` / `Chart.Bar` / `Chart.Donut` / `Chart.Sparkline`   |
| `KpiGrid`     | Auto-fit grid wrapper for `StatCard` / `Stat` tiles                         |
| `Stat`        | Alias for `StatCard` (recipes use both names)                               |
| `FileUpload`  | Drag-drop + click + paste-image zone (pairs with `useUpload`)               |
| `Lightbox`    | Portal fullscreen image viewer (pairs with `useGallery`)                    |
| `LocalePicker`| Locale `<select>` driven by `I18nProvider`                                  |

### Patterns

| Component   | Summary                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| `AppShell`  | Desktop sidebar shell: `AppShell.Sidebar` + `AppShell.Main` + `AppShell.TopBar` (alias `Topbar`) + `AppShell.Brand`. `collapsed` prop drives an icon-rail. `AppShell.Sidebar` accepts `collapsible` + `onToggle`. |
| `AuthShell` | Centered-card auth shell: `AuthShell.Brand` + `AuthShell.Card`                    |
| `DataTable` | `<table class="dtable">` with sortable headers + row selection                    |
| `Modal`     | Centered dialog with focus trap + Escape; bottom-sheet on phone                   |
| `Dialog`    | Opinionated `Modal` with built-in confirm/cancel buttons                          |
| `Toast`     | `ToastProvider` + `useToast()` → `{ show, dismiss }`                              |
| `Alert`     | Inline banner with tones                                                          |
| `Stack`     | `direction`, `gap`, `align`, `justify`, `wrap` flex helper                        |
| `MobileShell` | `MobileShell.Body` + `.BottomTabs` mobile-first wrapper                         |
| `I18nProvider` | Tiny i18n context with `{var}` interpolation (`useT()` returns the `t` fn)     |

## Hooks

| Hook              | Summary                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `useToast()`      | Returns `{ show(input), dismiss(id) }`. Must be inside `<ToastProvider>`.                          |
| `useInterval()`   | `setInterval` with always-latest callback, cleanup, and a `paused` option.                         |
| `useUrlState()`   | Syncs state to `?key=` query param via `history.replaceState`; SSR-safe.                           |
| `useOptimistic()` | Base / derived / queue mutation pattern. Returns `{ base, derived, mutate, queue }`.               |
| `useMatchMedia()` | SSR-safe `matchMedia` subscriber.                                                                  |
| `useMediaQuery()` | Alias for `useMatchMedia()` matching the cookbook naming.                                          |
| `useUpload()`     | `XMLHttpRequest`-backed file upload with progress fraction and `cancel()`.                         |
| `useGallery()`    | Tiny `Lightbox` controller: `{ open, index, show, close, next, prev, setIndex }`.                  |
| `useT()`          | Returns the `t(key, vars?)` translator from `<I18nProvider>`.                                      |
| `usePersistedFlag()` | `useState`-shaped boolean persisted to `localStorage`. Survives reload + sign-out; SSR-safe.    |

## TypeScript

Types are bundled — there's nothing extra to install. Every component exports a named props interface (e.g. `ButtonProps`, `DataTableProps<Row>`). Most components forward refs to the underlying DOM element.

## Docs

Full docs, do/don't, and live previews: [huchu docs site](../../../README.md). Every recipe in `/cookbook/*.html` imports from this package — those recipes are the canonical examples for every component above.
