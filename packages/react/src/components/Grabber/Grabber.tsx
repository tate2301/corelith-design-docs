import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface GrabberProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
}

/**
 * Grabber — drag handle affordance.
 *
 * @example
 * ```tsx
 * <Grabber />
 * ```
 */
export const Grabber = forwardRef<HTMLButtonElement, GrabberProps>(function Grabber(
  { ariaLabel = 'Drag to reorder', className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={cx('p-grabber', className)}
      {...rest}
    >
      <span aria-hidden="true">{children ?? '⋮⋮'}</span>
    </button>
  );
});
