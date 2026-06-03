# `@huchu/react`

Thin React wrappers over the Huchu design-system CSS. Components render the exact class names already shipped in `components.css`, so the cookbook recipes you see in the docs site translate verbatim into your app.

> **Status:** `v0.1.0-alpha.0` — first public scaffold. APIs may shift before `0.1.0`.

## Install

```bash
pnpm add @huchu/react react react-dom
# or
npm install @huchu/react react react-dom
```

You also need the design-system stylesheet. Either:

1. Import the docs-site `components.css` + `tokens.css` directly (source of truth), or
2. Import the package's minimal fallback styles:

```ts
import '@huchu/react/styles.css';
```

The package's stylesheet only contains positioning fallbacks for the portal-based components (Toast, BottomSheet) and Stack flex glue. All visual look-and-feel lives in `components.css`.

## Quick start

```tsx
import { ToastProvider, Button, useToast } from '@huchu/react';

export function App() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}

function Demo() {
  const { show } = useToast();
  return (
    <Button onClick={() => show({ tone: 'success', title: 'Saved' })}>
      Save changes
    </Button>
  );
}
```

## Canonical sign-in (from the `auth-signin-2fa` recipe)

```tsx
// from the cookbook recipe: cookbook/auth-signin-2fa.html
import { useEffect, useReducer, useState } from 'react';
import {
  AuthShell, Form, Field, Stack,
  Input, InputOtp, Button, Alert,
} from '@huchu/react';

type Stage = 'credentials' | 'otp' | 'success';

export function SignIn() {
  const [stage, setStage] = useState<Stage>('credentials');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthShell>
      <AuthShell.Brand logo={<Logo />} product="Huchu" />
      <AuthShell.Card title="Sign in" subtitle="Welcome back">
        {stage === 'credentials' && (
          <Form onSubmit={(e) => { e.preventDefault(); setStage('otp'); }}>
            <Stack gap="md">
              {error ? <Alert tone="danger">{error}</Alert> : null}
              <Field label="Email" required>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </Field>
              <Button type="submit" fullWidth>Continue</Button>
            </Stack>
          </Form>
        )}

        {stage === 'otp' && (
          <Form onSubmit={(e) => { e.preventDefault(); setStage('success'); }}>
            <Stack gap="md">
              <Field label="6-digit code" description={`We sent a code to ${email}.`}>
                <InputOtp value={code} onChange={setCode} autoFocus />
              </Field>
              <Button type="submit" fullWidth disabled={code.length < 6}>Verify</Button>
            </Stack>
          </Form>
        )}

        {stage === 'success' && (
          <Alert tone="success" title="You're in">Redirecting...</Alert>
        )}
      </AuthShell.Card>
    </AuthShell>
  );
}

function Logo() { return <span aria-hidden>H</span>; }
```

## Exports (v0.1)

| Primitive       | Sub-parts                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `Button`        | variants `primary | secondary | ghost`, tones `default | success | warn | danger`, sizes `sm | md | lg` |
| `Field`         | `Field.Label`, `Field.Description`, `Field.Error`                                                     |
| `Input`         | auto-wires to nearest `Field` via context                                                             |
| `InputOtp`      | imperative `focus()` via ref, paste handler, auto-advance                                             |
| `Alert`         | tones `info | success | warn | danger`                                                                |
| `Stack`         | `direction`, `gap`, `align`, `justify`, `wrap`                                                        |
| `Form`          | `<form>` with `noValidate`, Enter submit toggle                                                       |
| `Toast`         | `ToastProvider`, `useToast()` → `{ show, dismiss }`                                                  |
| `BottomSheet`   | portal + focus trap + Escape + backdrop click                                                         |
| `RowCard`       | `title`, `sub`, `value`, `delta`, `meta`, `leading`, `trailing`                                       |
| `FilterChips`   | `value`, `onChange`, `options[]`, `role: radiogroup | tablist | group`                               |
| `AuthShell`     | `AuthShell.Brand`, `AuthShell.Card`                                                                   |

## What is NOT in v0.1

These cookbook imports are intentionally out-of-scope for the alpha and will land in `0.1.0-alpha.1+`:

- `Checkbox`, `Radio`, `Switch`, `Select`
- `Drawer`, `Modal`, `Popover`, `Tooltip`
- `Tabs`, `Steps`, `Wizard`
- `Table`, `DataTable`
- Dashboard kit (`KpiTile`, `Sparkline`, `LineChart`)
- App shells (`AppShellSidebar`, `MobileBottomTab`)
- `Command` / `CommandPalette`

Recipes that import them currently render in the docs site only; you'll get a TS error if you import them from `@huchu/react` until the next milestone.

## Docs

Full docs, do/don't, and live previews: [huchu docs site](../../../README.md).
