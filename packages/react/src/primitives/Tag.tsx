import { forwardRef, type HTMLAttributes, type CSSProperties } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';
import { accentFor, type Accent } from '../tokens/accents';

export type TagTone = 'neutral' | 'info' | 'success' | 'warn' | 'danger' | 'brand';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual tone. @default 'neutral' */
  tone?: TagTone;
  /**
   * Accent hue. Pass `'auto'` to derive one from the tag's text — the Notion
   * multi-select behaviour, where every distinct label gets its own stable
   * colour without anyone assigning one.
   */
  accent?: Accent | 'auto';
  /** Add a hairline border in the accent. */
  bordered?: boolean;
  /** Lead with a small dot in the accent's solid colour. */
  dot?: boolean;
  /** When true, renders a close (×) button on the right. */
  closable?: boolean;
  /** Fires when the user clicks the close button. */
  onClose?: () => void;
  /** Accessible label for the close button. @default 'Remove tag' */
  closeLabel?: string;
  /** Render the tag styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

/**
 * Tag — small dismissible label for user-applied metadata (filters, categories).
 * Maps to `.tag` in components.css. Contrast with Badge (system-applied).
 *
 * Tones beyond neutral inline a token-driven background/color (the CSS only ships
 * the neutral surface; tonal variants in the docs use inline tokens).
 *
 * Accessibility:
 *   - The close button has an `aria-label` (default "Remove tag") and stops
 *     click-propagation so containing rows can stay clickable.
 */
const TONE_STYLE: Record<Exclude<TagTone, 'neutral'>, CSSProperties> = {
  info: { background: 'var(--tone-info-bg)', color: 'var(--tone-info)' },
  success: { background: 'var(--tone-success-bg)', color: 'var(--tone-success)' },
  warn: { background: 'var(--tone-warn-bg)', color: 'var(--tone-warn)' },
  danger: { background: 'var(--tone-danger-bg)', color: 'var(--tone-danger)' },
  brand: { background: 'var(--brand-soft)', color: 'var(--brand-strong)' },
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    tone = 'neutral',
    accent,
    bordered,
    dot,
    closable,
    onClose,
    closeLabel = 'Remove tag',
    asChild,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  // The accent channel paints through CSS, so the inline tone style has to
  // stand down when a hue is in play or it would win on specificity.
  const hue =
    accent === 'auto'
      ? accentFor(typeof children === 'string' ? children : undefined)
      : accent;
  const toneStyle = hue || tone === 'neutral' ? undefined : TONE_STYLE[tone];

  const classes = cn(
    'tag',
    hue && 'tag-accent',
    hue && bordered && 'tag-bordered',
    dot && 'tag-dot',
    className,
  );

  if (asChild) {
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={classes}
        style={{ ...toneStyle, ...style }}
        data-slot="tag"
        data-accent={hue}
        {...rest}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <span
      ref={ref}
      className={classes}
      style={{ ...toneStyle, ...style }}
      data-accent={hue}
      {...rest}
    >
      {children}
      {closable ? (
        <button
          type="button"
          className="x"
          aria-label={closeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          style={{ background: 'transparent', border: 'none' }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
});
