import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface KbdProps extends HTMLAttributes<HTMLElement> {}

/**
 * Kbd — render a keyboard key.
 *
 * @example
 * ```tsx
 * <Kbd />
 * ```
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, children, ...rest },
  ref,
) {
  return (
    <kbd ref={ref} className={cx('kbd', className)} {...rest}>
      {children}
    </kbd>
  );
});
