# @corelith/design-system

React implementation of the Huchu Design System. Next.js / Vite / CRA compatible.

## Install

```bash
npm install @corelith/design-system
# or
pnpm add @corelith/design-system
# or
yarn add @corelith/design-system
```

## Setup

Import the styles once in your app root (Next.js: `app/layout.tsx` or `_app.tsx`):

```tsx
import '@corelith/design-system/styles.css';
```

## Usage

```tsx
import { Button } from '@corelith/design-system/primitives';

export default function Page() {
  return <Button variant="primary">Open till</Button>;
}
```

## Exports

- `@corelith/design-system` — everything
- `@corelith/design-system/primitives` — atomic UI (Button, Input, Select, …)
- `@corelith/design-system/blocks` — compounds (PageHeader, StatCard, …)
- `@corelith/design-system/shells` — whole-page chromes (AppShell, …)
- `@corelith/design-system/patterns` — recurring assemblies (Modal, DataTable, …)
- `@corelith/design-system/styles.css` — bundled CSS (tokens + components)
- `@corelith/design-system/tokens.css` — design tokens only

## Tokens

The design tokens are CSS custom properties prefixed with `--hx-` (Huchu). Override at any scope:

```css
:root[data-theme="dark"] {
  --hx-canvas: #0F1115;
  --hx-text-strong: #FFFFFF;
}
```

## License

MIT — © 2026 Huchu Enterprises
