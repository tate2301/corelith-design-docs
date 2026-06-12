import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

/**
 * Spinner — indeterminate progress indicator.
 *
 * @example
 * ```tsx
 * <Spinner />
 * ```
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, label = 'Loading', ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('spinner', className)}
      role="status"
      aria-label={label}
      {...rest}
    />
  );
});
