import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type StatusVariant = 'loading' | 'error' | 'blocked' | 'success' | 'empty';

export interface StatusStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Which state to render. Drives the default icon tile and border. @default 'loading' */
  variant?: StatusVariant;
  /** Icon node, rendered in a tonal tile (ignored when `variant="loading"`, which shows a spinner). */
  icon?: ReactNode;
  /** Headline — say what specifically happened. */
  title: ReactNode;
  /** One-sentence explanation under the title. */
  body?: ReactNode;
  /** Single action button. */
  action?: ReactNode;
}

const TILE_TONE: Record<Exclude<StatusVariant, 'loading'>, { bg: string; fg: string; border: string }> = {
  error: { bg: 'var(--tone-danger-bg)', fg: 'var(--tone-danger)', border: 'var(--tone-danger-bd)' },
  blocked: { bg: 'var(--surface-muted)', fg: 'var(--text-muted)', border: 'var(--border)' },
  success: { bg: 'var(--tone-success-bg)', fg: 'var(--tone-success)', border: 'var(--border)' },
  empty: { bg: 'var(--surface-muted)', fg: 'var(--text-muted)', border: 'var(--border)' },
};

function Spinner() {
  // Inline SVG spinner — uses the design-system `cor-spin` keyframe (components.css).
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ animation: 'cor-spin 0.8s linear infinite', margin: '0 auto 14px' }}
    >
      <circle cx="12" cy="12" r="9" stroke="var(--border)" strokeWidth="2" fill="none" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="var(--brand)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * StatusState — a whole-page state: loading, error, blocked, success, or
 * empty. (Use EmptyState for the no-data state *inside* a card.) Always give
 * the operator a next action. Maps to `system/b-status-state.html`.
 *
 * @example
 * ```tsx
 * <StatusState
 *   variant="error"
 *   icon={<AlertIcon />}
 *   title="Couldn't post payroll · NSSA reference rejected"
 *   body="3 employees have no NSSA number on file. Fix them and try again."
 *   action={<Button variant="secondary">Open employees</Button>}
 * />
 * ```
 */
export const StatusState = forwardRef<HTMLDivElement, StatusStateProps>(function StatusState(
  { variant = 'loading', icon, title, body, action, className, style, ...rest },
  ref,
) {
  const tile = variant === 'loading' ? undefined : TILE_TONE[variant];
  return (
    <div
      ref={ref}
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('status-state', `status-state-${variant}`, className)}
      style={{
        textAlign: 'center',
        padding: '56px 24px',
        background: 'var(--surface)',
        border: `1px solid ${tile?.border ?? 'var(--border)'}`,
        borderRadius: 12,
        ...style,
      }}
      {...rest}
    >
      {variant === 'loading' ? (
        <Spinner />
      ) : icon ? (
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: tile!.bg,
            color: tile!.fg,
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 14px',
          }}
        >
          {icon}
        </div>
      ) : null}
      <div style={{ font: '600 16px/1.3 var(--font-sans)', color: 'var(--text-strong)', marginBottom: 4 }}>{title}</div>
      {body != null ? (
        <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginBottom: action ? 16 : 0 }}>{body}</div>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
});
