import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerTone = 'brand' | 'muted' | 'inverse';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner. @default 'md' */
  size?: SpinnerSize;
  /** Stroke tone. @default 'brand' */
  tone?: SpinnerTone;
  /** Visually-hidden label announced to screen readers. @default 'Loading' */
  label?: string;
}

const SIZE_PX: Record<SpinnerSize, number> = { sm: 12, md: 16, lg: 24 };

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
 * Spinner — indeterminate loading affordance. Maps to `.spinner` in components.css.
 *
 * Accessibility:
 *   - Wrapper carries `role="status"` so AT announces busy state.
 *   - `label` is rendered visually-hidden so the announcement has a string.
 *   - Use `aria-live="polite"` on a containing region when the spinner
 *     appears/disappears asynchronously.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', tone = 'brand', label = 'Loading', className, style, ...rest },
  ref,
) {
  const px = SIZE_PX[size];
  const borderColor =
    tone === 'muted'
      ? 'var(--text-subtle)'
      : tone === 'inverse'
        ? '#fff'
        : 'var(--brand)';
  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(className)}
      style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      {...rest}
    >
      <span
        className="spinner"
        aria-hidden="true"
        style={{
          width: px,
          height: px,
          borderTopColor: borderColor,
        }}
      />
      <span style={SR_ONLY}>{label}</span>
    </span>
  );
});
