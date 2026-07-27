import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type StatusTone = 'success' | 'warn' | 'danger' | 'info' | 'neutral';
export type StatusSize = 'sm' | 'md';

interface StatusBaseProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual tone of the dot + label. @default 'neutral' */
  tone?: StatusTone;
  /** Render the dot as a hollow ring (signals "open" / unread). */
  ring?: boolean;
  /** Dot + label scale. @default 'md' */
  size?: StatusSize;
  /**
   * Class applied to the dot itself. Supplying this switches the dot from the
   * CSS `::before` pseudo-element to a real `<span>` so it can be sized,
   * animated, or recoloured.
   */
  dotClassName?: string;
  /** Render the status styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

/**
 * `hideLabel` renders the dot alone, which leaves the chip with no text for
 * assistive tech — so the type makes `aria-label` mandatory alongside it.
 */
export type StatusProps = StatusBaseProps &
  ({ hideLabel: true; 'aria-label': string } | { hideLabel?: false | undefined });

// Map our tone vocabulary onto the `.status-dot` modifier classes in CSS.
// CSS only provides `attention | progress | ok | idle | ring` — we surface a
// product-friendly vocabulary on top.
const TONE_CLASS: Record<StatusTone, string> = {
  success: 'ok',
  warn: 'attention',
  danger: 'attention',
  info: 'progress',
  neutral: 'idle',
};

/**
 * Status — a colored dot plus an inline label. Claude Code's "Needs input"
 * pattern. Maps to the `.status-dot` family in components.css.
 *
 * Two dot forms:
 *   - **Pseudo-element (default)** — the shipped `.status-dot::before`. Nothing
 *     to target, but zero extra DOM.
 *   - **Element** — used automatically when `dotClassName` or `hideLabel` is
 *     set. Renders `<span class="status-dot-mark">` and adds `status-dot-el` to
 *     the root, which suppresses `::before` so the two never double up.
 *
 * Accessibility: the dot is always decorative. Meaning lives in the label text,
 * so with `hideLabel` the component takes `role="img"` and an `aria-label` is
 * required by the type.
 *
 * @example
 * ```tsx
 * <Status tone="success">Deployed</Status>
 * <Status tone="warn" size="sm" ring>Needs input</Status>
 * <Status tone="danger" hideLabel aria-label="Build failed" />
 * ```
 */
export const Status = forwardRef<HTMLSpanElement, StatusProps>(function Status(
  {
    tone = 'neutral',
    ring,
    size = 'md',
    hideLabel,
    dotClassName,
    asChild,
    className,
    children,
    role,
    ...rest
  }: StatusBaseProps & { hideLabel?: boolean },
  ref,
) {
  // A caller-classable dot needs a real node; otherwise keep the cheap
  // `::before` form so existing markup is unchanged.
  const elementDot = dotClassName !== undefined || hideLabel === true;

  const props = {
    ref: ref as React.Ref<HTMLElement>,
    className: cn(
      'status-dot',
      TONE_CLASS[tone],
      ring && 'ring',
      size === 'sm' && 'status-dot-sm',
      elementDot && 'status-dot-el',
      hideLabel && 'status-dot-bare',
      className,
    ),
    'data-slot': 'status',
    'data-state': ring ? 'open' : undefined,
    role: role ?? (hideLabel ? 'img' : undefined),
    ...rest,
  };

  const dot = elementDot ? (
    <span className={cn('status-dot-mark', dotClassName)} aria-hidden="true" />
  ) : null;

  if (asChild) {
    const child = children as React.ReactElement<{ children?: React.ReactNode }>;
    // Slot merges onto the child, so the dot has to be spliced into the
    // child's own children rather than wrapped around it.
    if (!elementDot && !hideLabel) {
      return <Slot {...props}>{child}</Slot>;
    }
    return (
      <Slot
        {...props}
        slottedChildren={
          <>
            {dot}
            {hideLabel ? null : child.props?.children}
          </>
        }
      >
        {child}
      </Slot>
    );
  }

  return (
    <span {...props}>
      {dot}
      {hideLabel ? null : children}
    </span>
  );
});
