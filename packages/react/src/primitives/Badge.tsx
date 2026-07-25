import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type BadgeTone =
  | 'brand'
  | 'success'
  | 'warn'
  | 'danger'
  | 'neutral'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual tone. @default 'neutral' */
  tone?: BadgeTone;
  /** Sizing. Currently only `md` has a CSS variant; `sm` reserves space for a
   *  compact form and applies a subtle inline trim. @default 'md' */
  size?: BadgeSize;
  /** Render the badge styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

// Map our tone vocabulary onto the underlying CSS classes. `brand` is the
// system's clay tone; `outline` swaps the fill for a stroked surface.
const TONE_CLASS: Record<BadgeTone, string> = {
  brand: 'badge-clay',
  success: 'badge-success',
  warn: 'badge-warn',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
  info: 'badge-info',
  outline: 'badge-outline',
};

/**
 * Badge — small inline tag for status or metadata.
 * Maps to the `.badge` family in components.css.
 *
 * Accessibility: badges are decorative by default. If a badge conveys state
 * that is not present in the surrounding text, pair it with an `aria-label`
 * (or `aria-live` for dynamic counters).
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', size = 'md', asChild, className, style, children, ...rest },
  ref,
) {
  // The CSS only defines one badge size (22 px). For `sm` we tighten height
  // and padding inline so callers get a visibly smaller pill without our
  // having to redefine a class in components.css.
  const sizeStyle: React.CSSProperties | undefined =
    size === 'sm'
      ? { height: 18, padding: '0 6px', fontSize: 10 }
      : undefined;

  const props = {
    ref: ref as React.Ref<HTMLElement>,
    className: cn('badge', TONE_CLASS[tone], className),
    style: { ...sizeStyle, ...style },
    'data-slot': 'badge',
    ...rest,
  };

  if (asChild) {
    return <Slot {...props}>{children as React.ReactElement}</Slot>;
  }

  return <span {...props}>{children}</span>;
});
