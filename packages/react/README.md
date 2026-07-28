# `@corelithzw/react`

Thin React wrappers over the Corelith design-system CSS. Components render the exact class names already shipped in `components.css`, so any cookbook recipe in the docs site translates verbatim into your app.

> **Status:** `v0.3.2` — published to npm under `@corelithzw/react`. ~50 components, 6 hooks, full TypeScript types, bundled design-system stylesheet.

## Install

`@corelithzw/react` is published to the public npm registry:

```bash
npm install @corelithzw/react react react-dom
# or
pnpm add @corelithzw/react react react-dom
```

Then import the bundled stylesheet once at the root of your app:

```ts
import '@corelithzw/react/styles.css';
```

That single import pulls in the design-system tokens, `components.css` and the per-component portal-positioning fallbacks the package ships. Nothing else is required — no separate `tokens.css` or font import.

## Publishing

CI publishes releases to npm from `.github/workflows/publish-package.yml`. The repository must have an `NPM_TOKEN` secret with publish access to `@corelithzw/react`; the workflow uses that token for `npm publish --access public`.

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
| `Input`           | Auto-wires id, aria-describedby, aria-invalid from nearest `Field`        |
| `InputOtp`        | Per-digit OTP cells, paste-into-all, `autocomplete="one-time-code"`       |
| `Field`           | Label + description + error wrapper with `Field.Label/.Description/.Error` |
| `Form`            | `<form>` with `noValidate`, Enter-submit toggle                           |
| `Checkbox`        | `.check` styled checkbox + optional label, supports `indeterminate`      |
| `Radio` + `RadioGroup` | Context-based radio set with shared `name` and `value`               |
| `Switch`          | Toggle switch with `role="switch"`                                        |
| `Select`          | Styled `<select>` with optional `options[]` shorthand                     |
| `Combobox`        | Searchable, group-able listbox                                            |
| `Badge`           | Semantic tones, plus 13 `accent` hues with `solid`/`bordered`/`dot`       |
| `Avatar`          | Initials, image, sizes; `accent` hue auto-derived from `name`             |
| `IconTile`        | Rounded tinted square behind an icon, emoji or 2–3 letter stub            |
| `RecordChip`      | Linked-record pill (avatar + name); `RecordChipGroup` collapses overflow  |
| `CellPill`        | Tinted pill for a typed cell value — an email, a URL, a select option     |
| `Emoji`           | One glyph as iOS artwork, with a native fallback                          |
| `EmojiText`       | Text with its emoji and `:shortcodes:` swapped for artwork                |
| `EmojiPicker`     | Searchable grid: categories, skin tones, recents, full keyboard nav       |
| `EmojiSelect`     | Trigger + picker in a popover — the page-icon / status control            |
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
| `TextArea`        | Multi-line `<textarea>`; consumes `FieldContext` like `Input`             |
| `Meter`           | Qualitative meter with `low`/`high` thresholds (`role="meter"`)           |
| `Progress`        | Determinate or indeterminate progress bar                                 |
| `SegmentedControl`| Radio-group pill switch with `value`/`onChange`/`options`                 |
| `InlineEdit`      | Click-to-edit; save on Enter/blur, cancel on Esc                          |
| `Calendar`        | Month grid; `value`, `onChange`, `min`, `max`, `disabledDates`            |
| `Table`           | `default` / `compact` reading tables, plus the `grid` scanning density     |

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
| `Conversation`| Message thread: grouping, day dividers, reactions, attachments, typing      |
| `Composer`    | Autogrowing message editor with emoji picker, attachments, Enter-to-send    |
| `SelectionBar`| Floating quick-actions bar for a set of selected grid rows                  |
| `KpiGrid`     | Auto-fit grid wrapper for `StatCard` / `Stat` tiles                         |
| `Stat`        | Alias for `StatCard` (recipes use both names)                               |
| `FileUpload`  | Drag-drop + click + paste-image zone (pairs with `useUpload`)               |
| `Lightbox`    | Portal fullscreen image viewer (pairs with `useGallery`)                    |
| `LocalePicker`| Locale `<select>` driven by `I18nProvider`                                  |

### Patterns

| Component   | Summary                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| `AppShell`  | Desktop sidebar shell: `AppShell.Sidebar` + `AppShell.Main` + `AppShell.TopBar`   |
| `AuthShell` | Centered-card auth shell: `AuthShell.Brand` + `AuthShell.Card`                    |
| `DataTable` | Compact record grid: sortable headers, selection, quick actions                   |
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

## Colour

The foundation in `tokens.css` is deliberately monochrome — one canvas, one
brand blue, four semantic tones. That reads well on a settings page and badly
on a record page, where the eye needs colour to tell one *kind* of thing from
another. `accents.css` adds that layer: thirteen hues, six roles each.

| Role                         | Use for                                             |
| ---------------------------- | --------------------------------------------------- |
| `--accent-<hue>-solid`       | dots, avatars, chart series, rails                  |
| `--accent-<hue>-on`          | foreground that clears AA **on** `solid`            |
| `--accent-<hue>-fg`          | text and icons, AA on `bg`                          |
| `--accent-<hue>-bg`          | badges, tags, icon tiles, selected rows             |
| `--accent-<hue>-bg-hover`    | the same tint one step down                         |
| `--accent-<hue>-bd`          | a hairline that sits on `bg`                        |

Hues: `gray · red · orange · amber · yellow · green · teal · cyan · blue ·
indigo · violet · pink · brown`. The aliases `brand · info · success · warn ·
danger · neutral` resolve to hues, so the existing tone vocabulary keeps working.

`on` is a real token rather than an assumed white: orange, amber and yellow
cannot carry white text at AA, so their `on` is a dark ink. Anything painting
`--accent-solid` should pair it with `--accent-on`.

### The accent channel

`data-accent="violet"` on any element rebinds the six unprefixed `--accent-*`
variables for that element and everything under it. Components style themselves
against `var(--accent-bg)` and inherit whatever hue they're handed — so one
attribute recolours a whole subtree.

```tsx
<Badge accent="violet" dot>Publishing</Badge>
<IconTile accent="teal"><ChartIcon /></IconTile>
<div data-accent="amber" className="accent-surface">…</div>
```

Accent-aware props ship on `Badge`, `Tag`, `Chip`, `Avatar`, `Status`,
`IconTile`, `RecordChip`, `CellPill`, `KanbanBoard` and the conversation
surfaces.

### Colour from names

`accentFor(seed)` hashes any stable string onto a hue. This is what actually
removes the gray feeling from a live app: avatars, tags, channels and workspaces
get colour derived from their own name, with no assignment stored anywhere. Same
name, same hue, on every client, forever.

```tsx
<Avatar name="Alicia Reed" />              {/* hashed automatically */}
<Tag accent="auto">Engineering</Tag>       {/* hashed from its own text */}
<IconTile accentSeed="Invoices">IN</IconTile>
```

Use `tone` when colour carries **meaning** (success, danger) and `accent` when
it carries **identity** (a team, a stage, a label) — a red "Engineering" tag
shouldn't imply a problem. Either way the hue is never the only signal.

## Tables

`DataTable` defaults to the `grid` density: 36 px rows, vertical column rules,
brand-tinted selected rows. It's a *scanning* grid, where the column boundary
matters as much as the value. Pass `density="compact"` or `density="default"`
for the roomier reading tables, which are unchanged.

Most of what separates a legible grid from a gray one is what goes **in** the
cells — reach for `RecordChip` on a reference column and `CellPill` on a typed
value rather than rendering bare strings.

```tsx
const columns: DataTableColumn<Contact>[] = [
  { key: 'name', header: 'Contact', icon: <UserIcon />, sortable: true,
    render: (r) => <RecordChip name={r.name} href={`/people/${r.id}`} /> },
  { key: 'added', header: 'Date added', icon: <CalendarIcon />, sortable: true },
  { key: 'email', header: 'Email', icon: <AtIcon />,
    render: (r) => <CellPill accent="violet" href={`mailto:${r.email}`}>{r.email}</CellPill> },
];

<DataTable
  columns={columns}
  data={contacts}
  rowKey={(r) => r.id}
  sortable
  selectable
  selectedKeys={selected}
  onSelectionChange={setSelected}
  stickyHeader
  selectionActions={[
    { id: 'add',   label: 'Add to collection',    icon: <PlusIcon />, onSelect: addAll },
    { id: 'new',   label: 'Create new collection', icon: <GridIcon />, onSelect: createCollection },
    { id: 'email', label: 'Send email',            icon: <MailIcon />, onSelect: emailAll },
  ]}
/>
```

`selectionActions` renders a floating `SelectionBar` over the foot of the table
once rows are checked; each handler receives the selected keys. Multi-value
reference cells collapse with `RecordChipGroup max={2}`.

Density knobs: `gridDensity="dense" | "relaxed"`, `rowHeight={32}`, `borderless`,
`zebra`, `maxHeight`, `stickyFirstColumn`.

## Emoji

Native emoji only look like iOS **on** iOS — Windows renders Segoe UI Emoji and
most Linux renders Noto. So `Emoji` ships the artwork: Apple's set, from
`emoji-datasource-apple`, addressed by codepoint.

That package is **not** a dependency — it unpacks to 103 MB, which has no
business inside a design system. The images are loaded from jsDelivr's copy by
default. For production, self-host:

```bash
npm i emoji-datasource-apple
cp -r node_modules/emoji-datasource-apple/img/apple/64 public/emoji
```

```tsx
<EmojiProvider assetBase="/emoji">{app}</EmojiProvider>
```

Anything that fails to load — offline, blocked by CSP, a self-hosted set missing
a glyph — falls back to the native character, so an emoji is never simply
absent. `<EmojiProvider set="native">` opts out of images entirely.

```tsx
<Emoji emoji="👍" />                          {/* iOS artwork */}
<Emoji shortcode="tada" size={20} />
<EmojiText>Shipped it :tada: nice work 👏</EmojiText>
<EmojiSelect value={icon} onChange={setIcon} ghost size="lg" />
```

`EmojiText` leaves text runs as text — only the emoji become elements, so the
copy stays selectable and searchable. A message that is *only* emoji renders
large, the way every chat client does it.

The bundled set is ~1,070 curated glyphs across eight categories with search
keywords and shortcode aliases (`:+1:`, `:tada:`, `:white_check_mark:`). It is
not the full Unicode set — for that, concatenate your own entries onto `EMOJI`
and pass them as `<EmojiPicker emoji={…} />`. Skin tones are supported on the
glyphs that accept them, including ZWJ sequences.

Data-layer exports: `EMOJI`, `EMOJI_CATEGORIES`, `SKIN_TONES`, `searchEmoji`,
`emojiByShortcode`, `applySkinTone`, `tokenizeEmojiText`, `isEmojiOnly`,
`replaceShortcodes`.

## Conversations

```tsx
<ConversationRenderer
  messages={messages}
  dayLabel={(m) => m.day}
  header={<ConversationHeader title="Chris <> Modal" subtitle="4 participants" />}
  footer={<Composer onSend={send} onAttach={pickFiles} />}
  onReactionToggle={toggleReaction}
  typing={typingNames}
/>
```

The renderer handles day dividers, unread markers, author grouping,
accent-derived avatars, emoji bodies, attachments and reactions. Consecutive
messages from one author collapse into a single block with the timestamp moving
into the gutter on hover, so a five-message burst reads as one turn.

Extra fields on your message objects are fine — they're available to your
`dayLabel`/`shouldGroup` callbacks and never reach the DOM.

`variant="bubbles"` switches to sender-aligned bubbles for DM and support
surfaces. `Composer` sends on Enter (`sendOn="modifier"` for Cmd+Enter),
expands `:shortcodes:` on send, and exposes a `ComposerHandle` ref with
`focus`, `clear` and `insert`.

## TypeScript

Types are bundled — there's nothing extra to install. Every component exports a named props interface (e.g. `ButtonProps`, `DataTableProps<Row>`). Most components forward refs to the underlying DOM element.

## Docs

Full docs, do/don't, and live previews: [huchu docs site](../../../README.md). Every recipe in `/cookbook/*.html` imports from this package — those recipes are the canonical examples for every component above.
