import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';
import { type Accent } from '../tokens/accents';

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
  /**
   * Accent hue — the full thirteen-hue palette, for categorical labels that
   * aren't status. Takes precedence over `tone`.
   */
  accent?: Accent;
  /** Fill with the accent's solid colour instead of its soft tint. */
  solid?: boolean;
  /** Add a hairline border in the accent. */
  bordered?: boolean;
  /** Lead with a small dot in the accent's solid colour. */
  dot?: boolean;
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
 * Two colour vocabularies, deliberately separate:
 *   - `tone` — the five semantic states. Use it when the badge means
 *     something (success, danger). Colour carries meaning.
 *   - `accent` — the thirteen hues. Use it when the badge names a
 *     *category* (a team, a stage, a label). Colour carries identity, not
 *     severity, so a red "Engineering" tag doesn't imply a problem.
 *
 * Accessibility: badges are decorative by default. If a badge conveys state
 * that is not present in the surrounding text, pair it with an `aria-label`
 * (or `aria-live` for dynamic counters). Never let the hue be the only signal —
 * `accent` is identity, and identity needs its label.
 *
 * @example
 * ```tsx
 * <Badge tone="success">Completed</Badge>
 * <Badge accent="violet" dot>Publishing</Badge>
 * <Badge accent="teal" solid>Enterprise</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', accent, solid, bordered, dot, size = 'md', asChild, className, style, children, ...rest },
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
    className: cn(
      'badge',
      // An accent replaces the tone class outright — layering both would let
      // the tone's background win on the cascade and silently ignore the hue.
      accent ? 'badge-accent' : TONE_CLASS[tone],
      accent && solid && 'badge-solid',
      accent && bordered && 'badge-bordered',
      dot && 'badge-dot',
      className,
    ),
    style: { ...sizeStyle, ...style },
    'data-slot': 'badge',
    'data-accent': accent,
    ...rest,
  };

  if (asChild) {
    return <Slot {...props}>{children as React.ReactElement}</Slot>;
  }

  return <span {...props}>{children}</span>;
});
