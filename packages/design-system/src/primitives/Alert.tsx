import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type AlertTone = 'info' | 'success' | 'warn' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Tonal variant. @default 'info' */
  tone?: AlertTone;
  /** Optional bold title shown above the body. */
  title?: ReactNode;
  /** Leading icon node. Rendered in the icon slot. */
  icon?: ReactNode;
  /** Trailing actions (typically a Button). */
  actions?: ReactNode;
  /** When provided, an X close button is rendered and fires this callback. */
  onDismiss?: () => void;
}

/**
 * Alert — inline, persistent, in-page notice. Maps to `.alert` in components.css.
 *
 * Use for system-level status on a surface (contrast with Toast which is transient).
 *
 * Accessibility:
 *   - Renders with `role="status"` (info/success) or `role="alert"` (warn/danger)
 *     so assistive tech announces danger/warn immediately.
 *   - The dismiss button has `aria-label="Dismiss"`. Override via `dismissLabel` is
 *     not exposed; wrap the component if you need a different label.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'info', title, icon, actions, onDismiss, className, children, ...rest },
  ref,
) {
  const role = tone === 'danger' || tone === 'warn' ? 'alert' : 'status';
  return (
    <div
      ref={ref}
      role={role}
      className={cn('alert', tone, className)}
      style={
        actions || onDismiss
          ? { gridTemplateColumns: `18px 1fr auto`, alignItems: 'center' }
          : undefined
      }
      {...rest}
    >
      {icon !== undefined ? (
        <span className="icon" aria-hidden="true">{icon}</span>
      ) : (
        <span className="icon" aria-hidden="true" />
      )}
      <div>
        {title ? <div className="alert-title">{title}</div> : null}
        {children ? <div className="alert-body">{children}</div> : null}
      </div>
      {actions || onDismiss ? (
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          {actions}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.75,
                padding: 4,
                lineHeight: 0,
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
