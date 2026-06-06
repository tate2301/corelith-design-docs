# `@huchu/react`

Thin React wrappers over the Huchu design-system CSS. Components render the exact class names already shipped in `components.css`, so any cookbook recipe in the docs site translates verbatim into your app.

> **Status:** `v0.1.0` — first install-ready release. ~36 components, 5 hooks, full TypeScript types, bundled design-system stylesheet.

## Install

```bash
npm install @huchu/react react react-dom
# or
pnpm add @huchu/react react react-dom
```

Then import the bundled stylesheet once at the root of your app:

```ts
import '@huchu/react/styles.css';
```

That single import pulls in the design-system tokens, `components.css` and the per-component portal-positioning fallbacks the package ships. Nothing else is required — no separate `tokens.css` or font import.

## 30-second example

```tsx
import {
  AuthShell, Form, Field, Stack,
  Input, Button, Alert,
} from '@huchu/react';
import '@huchu/react/styles.css';

export function SignIn() {
  return (
    <AuthShell>
      <AuthShell.Brand product="Huchu" />
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
| `Input`           | Auto-wires id, aria-describedby, aria-invalid from nearest `Field`        |
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
| `Menu`            | `Menu.Item` + `Menu.Label` + `Menu.Divider`                               |
| `CommandPalette`  | ⌘K modal with search, groups, keyboard navigation                         |

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

### Patterns

| Component   | Summary                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| `AppShell`  | Desktop sidebar shell: `AppShell.Sidebar` + `AppShell.Main` + `AppShell.TopBar`   |
| `AuthShell` | Centered-card auth shell: `AuthShell.Brand` + `AuthShell.Card`                    |
| `DataTable` | `<table class="dtable">` with sortable headers + row selection                    |
| `Modal`     | Centered dialog with focus trap + Escape; bottom-sheet on phone                   |
| `Dialog`    | Opinionated `Modal` with built-in confirm/cancel buttons                          |
| `Toast`     | `ToastProvider` + `useToast()` → `{ show, dismiss }`                              |
| `Alert`     | Inline banner with tones                                                          |
| `Stack`     | `direction`, `gap`, `align`, `justify`, `wrap` flex helper                        |

## Hooks

| Hook              | Summary                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `useToast()`      | Returns `{ show(input), dismiss(id) }`. Must be inside `<ToastProvider>`.                          |
| `useInterval()`   | `setInterval` with always-latest callback, cleanup, and a `paused` option.                         |
| `useUrlState()`   | Syncs state to `?key=` query param via `history.replaceState`; SSR-safe.                           |
| `useOptimistic()` | Base / derived / queue mutation pattern. Returns `{ base, derived, mutate, queue }`.               |
| `useMatchMedia()` | SSR-safe `matchMedia` subscriber.                                                                  |
| `useUpload()`     | `XMLHttpRequest`-backed file upload with progress fraction and `cancel()`.                         |

## TypeScript

Types are bundled — there's nothing extra to install. Every component exports a named props interface (e.g. `ButtonProps`, `DataTableProps<Row>`). Most components forward refs to the underlying DOM element.

## Docs

Full docs, do/don't, and live previews: [huchu docs site](../../../README.md). Every recipe in `/cookbook/*.html` imports from this package — those recipes are the canonical examples for every component above.
