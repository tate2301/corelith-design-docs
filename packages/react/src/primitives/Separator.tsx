import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Rule direction. @default 'horizontal' */
  orientation?: SeparatorOrientation;
  /**
   * A purely visual rule that carries no semantic meaning — it is removed from
   * the accessibility tree (`role="none"`). Set `false` when the rule genuinely
   * separates two groups of content, which exposes `role="separator"`.
   * @default true
   */
  decorative?: boolean;
}

/**
 * Separator — a hairline rule between content.
 *
 * Horizontal reuses the shipped `.hr` class; vertical uses `.separator-vertical`
 * from `styles/display.css` and stretches to the height of its flex/grid row.
 *
 * Accessibility:
 *   - Decorative rules (the default) are hidden from assistive tech, matching
 *     how most dividers are used — as visual rhythm, not structure.
 *   - Non-decorative rules expose `role="separator"` plus `aria-orientation`.
 *
 * @example
 * ```tsx
 * <Separator />
 * <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
 *   <span>Draft</span>
 *   <Separator orientation="vertical" />
 *   <span>Edited 2h ago</span>
 * </div>
 * ```
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = true, className, ...rest },
  ref,
) {
  const vertical = orientation === 'vertical';
  return (
    <div
      ref={ref}
      // `.hr` already ships for the horizontal case; only the vertical rule is new.
      className={cn(
        'separator',
        vertical ? 'separator-vertical' : 'hr',
        className,
      )}
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      {...rest}
    />
  );
});
