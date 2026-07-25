import { forwardRef, type HTMLAttributes, type CSSProperties } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape of the placeholder. @default 'rect' */
  variant?: SkeletonVariant;
  /** Width — number → px, string → as-is. @default '100%' */
  width?: number | string;
  /** Height — number → px, string → as-is. */
  height?: number | string;
  /** Override border-radius (defaults derived from variant). */
  radius?: number | string;
  /** Render the skeleton styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

/**
 * Skeleton — a shimmering placeholder shaped like the content it stands in for.
 * Maps to `.skeleton` in components.css.
 *
 * Accessibility:
 *   - `aria-hidden="true"` — skeletons are decorative; the real loading state
 *     should be announced by the surrounding region (use `aria-busy="true"` on
 *     a parent, or a live region with "Loading…" elsewhere).
 *   - Respects `prefers-reduced-motion` via the CSS animation rules in
 *     components.css (no JS animation here).
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'rect', width = '100%', height, radius, asChild, className, style, children, ...rest },
  ref,
) {
  const computedRadius =
    radius !== undefined
      ? typeof radius === 'number'
        ? `${radius}px`
        : radius
      : variant === 'circle'
        ? '9999px'
        : variant === 'text'
          ? '4px'
          : undefined;
  const computedHeight =
    height !== undefined
      ? typeof height === 'number'
        ? `${height}px`
        : height
      : variant === 'text'
        ? '0.9em'
        : variant === 'circle'
          ? typeof width === 'number'
            ? `${width}px`
            : width
          : undefined;
  const computedWidth = typeof width === 'number' ? `${width}px` : width;
  const composed: CSSProperties = {
    width: computedWidth,
    height: computedHeight,
    borderRadius: computedRadius,
    ...style,
  };
  const props = {
    'aria-hidden': true,
    className: cn('skeleton', className),
    style: composed,
    'data-slot': 'skeleton',
    ...rest,
  };

  if (asChild) {
    return <Slot ref={ref as React.Ref<HTMLElement>} {...props}>{children as React.ReactElement}</Slot>;
  }

  return <div ref={ref} {...props} />;
});
