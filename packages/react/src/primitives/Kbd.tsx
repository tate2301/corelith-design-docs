import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Render the keyboard-hint styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

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
  { asChild, className, children, ...rest },
  ref,
) {
  if (asChild) {
    return (
      <Slot ref={ref} className={cn('kbd', className)} data-slot="kbd" {...rest}>
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <kbd ref={ref} className={cn('kbd', className)} data-slot="kbd" {...rest}>
      {children}
    </kbd>
  );
});
