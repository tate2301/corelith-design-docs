import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
  /** Visual style. @default 'secondary' */
  variant?: ButtonVariant;
  /** Sizing. @default 'md' */
  size?: ButtonSize;
  /** Show a loading state with disabled interaction. */
  loading?: boolean;
  /** Render only an icon. Requires an `aria-label`. */
  iconOnly?: boolean;
  /** Optional leading icon node. */
  startIcon?: ReactNode;
  /** Optional trailing icon node. */
  endIcon?: ReactNode;
  /** Full-width button (e.g. inside narrow toolbars). */
  block?: boolean;
}

/**
 * Button — the primary action primitive.
 * Maps to the `.btn` family in components.css.
 *
 * Accessibility: when `iconOnly` is true, callers MUST pass `aria-label`.
 * When `loading` is true, the button is disabled and announces busy state.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading,
    iconOnly,
    startIcon,
    endIcon,
    block,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const classes = cn(
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    iconOnly && 'btn-icon',
    block && 'btn-block',
    loading && 'is-loading',
    className,
  );

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {startIcon ? <span className="btn-icon-lead" aria-hidden="true">{startIcon}</span> : null}
      {!iconOnly && children ? <span className="btn-label">{children}</span> : children}
      {endIcon ? <span className="btn-icon-trail" aria-hidden="true">{endIcon}</span> : null}
    </button>
  );
});
