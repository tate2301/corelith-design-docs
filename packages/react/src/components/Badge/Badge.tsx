import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type BadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'clay'
  | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

/**
 * Badge — small status pill.
 *
 * @example
 * ```tsx
 * <Badge />
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', icon, className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('badge', `badge-${tone}`, className)} {...rest}>
      {icon ? <span className="badge-icon" aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
});
