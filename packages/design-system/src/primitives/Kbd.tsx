import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface KbdProps extends HTMLAttributes<HTMLElement> {}

/**
 * Kbd — inline keyboard hint. Maps to `.kbd` in components.css.
 *
 * Renders as a semantic <kbd> element. Use inside menus, tooltips, command
 * palettes — `<Kbd>⌘K</Kbd>`.
 *
 * Accessibility: native <kbd> conveys "keyboard input" to assistive tech; no
 * additional ARIA needed.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, children, ...rest },
  ref,
) {
  return (
    <kbd ref={ref} className={cn('kbd', className)} {...rest}>
      {children}
    </kbd>
  );
});
