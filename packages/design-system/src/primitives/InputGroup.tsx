import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface InputGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'prefix'> {
  /** Addon rendered before the input (text/select/button), attached flush. */
  prefix?: ReactNode;
  /** Addon rendered after the input (text/button), attached flush. */
  suffix?: ReactNode;
  /** The input element (typically an `<Input>` or bare `.input`). */
  children?: ReactNode;
}

/**
 * InputGroup — attaches addons or buttons flush to an Input.
 * The docs (`p-input-group`) compose this from inline flex plus the shared
 * `.input` class; no dedicated `.input-group` rule exists in components.css, so
 * the attached container and the addon chrome are token-driven inline
 * fallbacks. Adjacent radii are squared so the seam reads as one control.
 *
 * Accessibility:
 *   - Renders `role="group"`. Pass `aria-label`/`aria-labelledby` to name it.
 *   - Addons are presentational; the input keeps its own label/aria wiring.
 *     Author the input with the correct radii via its own className if needed.
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { prefix, suffix, className, style, children, ...rest },
  ref,
) {
  const addonStyle: React.CSSProperties = {
    padding: '0 12px',
    background: 'var(--surface-muted)',
    border: '1px solid var(--border-strong)',
    display: 'grid',
    placeItems: 'center',
    font: 'var(--type-body-sm)',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      ref={ref}
      role="group"
      className={cn('input-group', className)}
      // Token-driven inline fallback: no `.input-group` rule in components.css.
      style={{ display: 'flex', alignItems: 'stretch', ...style }}
      {...rest}
    >
      {prefix != null ? (
        <span
          style={{
            ...addonStyle,
            borderRight: 0,
            borderRadius: '8px 0 0 8px',
          }}
        >
          {prefix}
        </span>
      ) : null}
      {children}
      {suffix != null ? (
        <span
          style={{
            ...addonStyle,
            borderLeft: 0,
            borderRadius: '0 8px 8px 0',
          }}
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
});
