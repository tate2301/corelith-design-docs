import { useState, type FormEvent, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';

export type AuthMode = 'signin' | 'signup' | 'reset';

export interface AuthValues {
  name?: string;
  email: string;
  password?: string;
}

export interface AuthCardProps {
  /** Which form to render. */
  mode: AuthMode;
  /** Brand / product name shown in the header. */
  brand?: ReactNode;
  /** Optional logo node above the title. */
  logo?: ReactNode;
  /** Override the heading. Defaults per mode. */
  title?: ReactNode;
  /** Override the sub-heading. Defaults per mode. */
  subtitle?: ReactNode;
  /** Submit handler. Receives the collected fields for the current mode. */
  onSubmit?: (values: AuthValues) => void | Promise<void>;
  /** Loading flag — disables the form and shows a spinner on the button. */
  loading?: boolean;
  /** Error message rendered above the fields. */
  error?: ReactNode;
  /** Social / SSO buttons rendered above the divider. */
  providers?: ReactNode;
  /** Fires when the user clicks the "switch mode" link. */
  onModeChange?: (mode: AuthMode) => void;
  /** Footer slot (e.g. terms copy). */
  footer?: ReactNode;
  /** Extra className on the card. */
  className?: string;
}

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string; switchTo: AuthMode; switchPrompt: string; switchLabel: string }> = {
  signin: {
    title: 'Welcome back',
    subtitle: 'Sign in to your workspace.',
    submit: 'Sign in',
    switchTo: 'signup',
    switchPrompt: 'New here?',
    switchLabel: 'Create an account',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Start managing your books in minutes.',
    submit: 'Create account',
    switchTo: 'signin',
    switchPrompt: 'Already have an account?',
    switchLabel: 'Sign in',
  },
  reset: {
    title: 'Reset password',
    subtitle: "Enter your email and we'll send a reset link.",
    submit: 'Send reset link',
    switchTo: 'signin',
    switchPrompt: 'Remembered it?',
    switchLabel: 'Back to sign in',
  },
};

/**
 * AuthCard — a self-contained authentication form assembly (sign-in / sign-up /
 * reset). Composes `Input` + `Button` primitives and adapts the visible fields,
 * copy, and submit label to the `mode`. Controlled submission via `onSubmit`;
 * the mode-switch link calls `onModeChange`.
 *
 * @example
 * ```tsx
 * const [mode, setMode] = useState<AuthMode>('signin');
 * <AuthCard
 *   mode={mode}
 *   brand="Mukamba Books"
 *   onModeChange={setMode}
 *   onSubmit={async ({ email, password }) => { await signIn(email, password!); }}
 *   providers={<Button block variant="secondary">Continue with Google</Button>}
 * />
 * ```
 */
export function AuthCard({
  mode,
  brand,
  logo,
  title,
  subtitle,
  onSubmit,
  loading,
  error,
  providers,
  onModeChange,
  footer,
  className,
}: AuthCardProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const copy = COPY[mode];

  const showName = mode === 'signup';
  const showPassword = mode === 'signin' || mode === 'signup';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const values: AuthValues = { email };
    if (showName) values.name = name;
    if (showPassword) values.password = password;
    onSubmit?.(values);
  };

  return (
    <div
      className={cn('auth-card', className)}
      style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 28,
        boxShadow: 'var(--shadow-card, 0 1px 2px rgba(42,38,34,0.06))',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 20 }}>
        {logo ? <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{logo}</div> : null}
        {brand ? (
          <div style={{ font: '600 13px/1 var(--font-sans)', color: 'var(--brand-strong)', letterSpacing: '0.04em', marginBottom: 8 }}>
            {brand}
          </div>
        ) : null}
        <h1 style={{ font: 'var(--type-section-title)', color: 'var(--text-strong)', margin: 0 }}>{title ?? copy.title}</h1>
        <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginTop: 6 }}>{subtitle ?? copy.subtitle}</p>
      </header>

      {providers ? (
        <>
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>{providers}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px', color: 'var(--text-subtle)', font: 'var(--type-caption)' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            or
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: 'var(--tone-danger-bg)', color: 'var(--tone-danger)', font: 'var(--type-body-sm)' }}>
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        {showName ? (
          <Input label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required />
        ) : null}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        {showPassword ? (
          <Input
            label="Password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            hint={mode === 'signin' ? undefined : 'At least 8 characters.'}
          />
        ) : null}

        {mode === 'signin' ? (
          <div style={{ textAlign: 'right', marginTop: -4 }}>
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => onModeChange?.('reset')}
            >
              Forgot password?
            </button>
          </div>
        ) : null}

        <Button type="submit" variant="primary" block loading={loading}>
          {copy.submit}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 18, font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
        {copy.switchPrompt}{' '}
        <button type="button" className="btn btn-link btn-sm" onClick={() => onModeChange?.(copy.switchTo)}>
          {copy.switchLabel}
        </button>
      </div>

      {footer ? <div style={{ marginTop: 16, textAlign: 'center', font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{footer}</div> : null}
    </div>
  );
}
