import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'quiet'
  | 'danger'
  | 'destructive'
  | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
  /** Visual style. @default 'secondary' */
  variant?: ButtonVariant;
  /** Back-compat alias for `variant`. */
  tone?: ButtonVariant;
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
  /** Back-compat alias for `block`. */
  fullWidth?: boolean;
  /** Render the button styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  quiet: 'btn-quiet',
  danger: 'btn-destructive',
  destructive: 'btn-destructive',
  link: 'btn-link',
};

/**
 * Button — the primary action primitive.
 * Maps to the `.btn` family in components.css.
 *
 * Accessibility: when `iconOnly` is true, callers MUST pass `aria-label`.
 * When `loading` is true, the button is disabled and announces busy state.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    tone,
    size = 'md',
    loading,
    iconOnly,
    startIcon,
    endIcon,
    block,
    fullWidth,
    asChild,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const visual = variant ?? tone ?? 'secondary';
  const classes = cn(
    'btn',
    VARIANT_CLASS[visual],
    size !== 'md' && `btn-${size}`,
    iconOnly && 'btn-icon',
    (block || fullWidth) && 'btn-block',
    loading && 'is-loading',
    className,
  );
  const isDisabled = disabled || loading;
  const content = (
    <>
      {startIcon ? <span className="btn-icon-lead" aria-hidden="true">{startIcon}</span> : null}
      {!iconOnly && children ? <span className="btn-label">{children}</span> : children}
      {endIcon ? <span className="btn-icon-trail" aria-hidden="true">{endIcon}</span> : null}
    </>
  );

  if (asChild) {
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={classes}
        data-slot="button"
        data-disabled={isDisabled ? '' : undefined}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      data-slot="button"
      data-disabled={isDisabled ? '' : undefined}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});
