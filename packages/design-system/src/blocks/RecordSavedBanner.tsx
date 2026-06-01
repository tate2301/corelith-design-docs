import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type SavedTone = 'success' | 'info';

export interface RecordSavedBannerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Optional leading icon (a check works well). */
  icon?: ReactNode;
  /** The confirmation label ("Saved · 12 seconds ago"). */
  children: ReactNode;
  /** Visual tone. @default 'success' */
  tone?: SavedTone;
}

// Inline-styled success pill — no shared class (mirrors b-record-saved-banner.html).
const TONE: Record<SavedTone, { bg: string; fg: string }> = {
  success: { bg: 'var(--tone-success-bg)', fg: 'var(--tone-success)' },
  info: { bg: 'var(--tone-info-bg)', fg: 'var(--brand-strong)' },
};

/**
 * RecordSavedBanner — a quiet inline confirmation pill ("Saved · N seconds
 * ago"). Use instead of a toast for inline edits. Time-stamp from the save,
 * not page load; fade out after ~60 s. Maps to `system/b-record-saved-banner.html`.
 *
 * @example
 * ```tsx
 * <RecordSavedBanner icon={<CheckIcon />}>Saved · 12 seconds ago</RecordSavedBanner>
 * ```
 */
export const RecordSavedBanner = forwardRef<HTMLSpanElement, RecordSavedBannerProps>(function RecordSavedBanner(
  { icon, children, tone = 'success', className, style, ...rest },
  ref,
) {
  const c = TONE[tone];
  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn('record-saved-banner', `record-saved-${tone}`, className)}
      style={{
        display: 'inline-flex',
        gap: 8,
        alignItems: 'center',
        padding: '6px 12px',
        background: c.bg,
        color: c.fg,
        borderRadius: 9999,
        font: '500 12.5px/1 var(--font-sans)',
        alignSelf: 'flex-start',
        ...style,
      }}
      {...rest}
    >
      {icon ? <span aria-hidden="true" style={{ display: 'inline-flex' }}>{icon}</span> : null}
      {children}
    </span>
  );
});
