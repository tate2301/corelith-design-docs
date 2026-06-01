import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type StatusTone = 'success' | 'warn' | 'danger' | 'info' | 'neutral';

export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual tone of the dot + label. @default 'neutral' */
  tone?: StatusTone;
  /** Render the dot as a hollow ring (signals "open" / unread). */
  ring?: boolean;
}

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
 * Accessibility: the dot itself is decorative (CSS `::before`); the meaning
 * lives in the label text. For dot-only usage pass an `aria-label`.
 */
export const Status = forwardRef<HTMLSpanElement, StatusProps>(function Status(
  { tone = 'neutral', ring, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn('status-dot', TONE_CLASS[tone], ring && 'ring', className)}
      {...rest}
    >
      {children}
    </span>
  );
});
