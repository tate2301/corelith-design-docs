import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface MobileActionBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional summary block shown above the actions (e.g. order totals). */
  summary?: ReactNode;
  /** Pin to the bottom of the viewport with `position: fixed`. @default true */
  fixed?: boolean;
  /** Action buttons. */
  children?: ReactNode;
}

/**
 * MobileActionBar — a bottom-pinned action bar for mobile flows (Charge / Pay).
 * The docs (`p-mobile-action-bar`) reference `.action-bar`, but no rule exists
 * in components.css, so the surface, top border, and safe-area padding are
 * token-driven inline fallbacks. Buttons inside reuse the shared `.btn` family.
 *
 * Accessibility:
 *   - Renders a landmark `<div role="toolbar">` so AT can jump to the primary
 *     actions; pass `aria-label` to name it.
 *   - Honours the bottom safe-area inset via `env(safe-area-inset-bottom)`.
 */
export const MobileActionBar = forwardRef<HTMLDivElement, MobileActionBarProps>(
  function MobileActionBar({ summary, fixed = true, className, style, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="toolbar"
        className={cn('action-bar', className)}
        // Token-driven inline fallback: no `.action-bar` rule in components.css.
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '12px 16px calc(18px + env(safe-area-inset-bottom, 0px))',
          ...(fixed
            ? { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }
            : null),
          ...style,
        }}
        {...rest}
      >
        {summary != null ? <div style={{ marginBottom: 8 }}>{summary}</div> : null}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>
      </div>
    );
  },
);
