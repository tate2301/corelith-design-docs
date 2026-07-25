import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type ProgressTone = 'brand' | 'success' | 'warn' | 'danger';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. Omit (or pass `null`) for an indeterminate bar. */
  value?: number | null;
  /** Maximum value. @default 100 */
  max?: number;
  /** Tonal variant. @default 'brand' */
  tone?: ProgressTone;
  /** Visually-hidden label describing what's progressing. */
  label?: string;
  /** Render the progress root onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

const SR_ONLY = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

/**
 * Progress — linear progress bar. Maps to `.progress` in components.css.
 *
 * Determinate when `value` is a number; indeterminate when `value` is `null`
 * or omitted (an animated stripe scans the track).
 *
 * Accessibility:
 *   - `role="progressbar"` with `aria-valuenow/min/max` for determinate state.
 *   - When indeterminate, omits `aria-valuenow` per ARIA spec.
 *   - Pair with a visible label nearby or pass `label` for SR-only text.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, tone = 'brand', label, asChild, className, children, ...rest },
  ref,
) {
  const indeterminate = value === undefined || value === null;
  const clamped = indeterminate ? 0 : Math.max(0, Math.min(max, value));
  const pct = indeterminate ? undefined : (clamped / max) * 100;
  const toneClass = tone !== 'brand' ? tone : undefined;
  const content = (
    <>
      <span
        style={
          indeterminate
            ? {
                width: '40%',
                animation: 'cor-progress-indet 1.4s ease-in-out infinite',
              }
            : { width: `${pct}%` }
        }
      />
      {label ? <span style={SR_ONLY}>{label}</span> : null}
      {indeterminate ? (
        <style>{`@keyframes cor-progress-indet { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
      ) : null}
    </>
  );
  const props = {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': indeterminate ? undefined : clamped,
    'aria-label': label,
    className: cn('progress', toneClass, className),
    'data-slot': 'progress',
    'data-state': indeterminate ? 'indeterminate' : 'determinate',
    ...rest,
  };

  if (asChild) {
    return <Slot ref={ref as React.Ref<HTMLElement>} {...props} slottedChildren={content}>{children as React.ReactElement}</Slot>;
  }

  return (
    <div ref={ref} {...props}>
      {content}
    </div>
  );
});
