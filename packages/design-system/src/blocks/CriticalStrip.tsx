import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type CriticalTone = 'danger' | 'warn';

export type CriticalIssue = {
  /** Optional leading icon. */
  icon?: ReactNode;
  /** One-line issue title. Truncates. */
  title: ReactNode;
  /** Smaller context line under the title. Truncates. */
  context?: ReactNode;
};

export interface CriticalStripProps extends HTMLAttributes<HTMLDivElement> {
  /** Tone — matches the highest-severity item. @default 'danger' */
  tone?: CriticalTone;
  /** Optional leading summary icon. */
  icon?: ReactNode;
  /** Small uppercase count ("3 needs input"). */
  count?: ReactNode;
  /** Headline next to the count ("Critical · across 2 sites"). */
  headline?: ReactNode;
  /** The issues — keep to four or fewer. */
  issues?: CriticalIssue[];
  /** Right-aligned action (Open queue). */
  action?: ReactNode;
}

// No dedicated CSS class — tonal strip built from tokens (mirrors b-critical-strip.html).
const TONE: Record<CriticalTone, { bg: string; bd: string; fg: string; divider: string }> = {
  danger: { bg: 'var(--tone-danger-bg)', bd: 'var(--tone-danger-bd)', fg: 'var(--tone-danger)', divider: 'rgba(184,58,42,0.18)' },
  warn: { bg: 'var(--tone-warn-bg)', bd: 'var(--tone-warn-bd)', fg: 'var(--tone-warn)', divider: 'rgba(180,120,20,0.18)' },
};

/**
 * CriticalStrip — a high-priority alert strip across the top of a page.
 * One danger item turns the whole strip red. Cap at four issues, then link
 * to a queue. Maps to `system/b-critical-strip.html`.
 *
 * @example
 * ```tsx
 * <CriticalStrip
 *   count="3 needs input"
 *   headline="Critical · across 2 sites"
 *   issues={[
 *     { title: 'Cash variance over tolerance', context: 'Park Centre · Till 02' },
 *     { title: 'Stock-out forecast at 16:00', context: 'Long-life milk · 8 units' },
 *   ]}
 *   action={<Button variant="secondary" size="sm">Open queue</Button>}
 * />
 * ```
 */
export const CriticalStrip = forwardRef<HTMLDivElement, CriticalStripProps>(function CriticalStrip(
  { tone = 'danger', icon, count, headline, issues, action, className, style, ...rest },
  ref,
) {
  const c = TONE[tone];
  return (
    <div
      ref={ref}
      role="alert"
      className={cn('critical-strip', `critical-strip-${tone}`, className)}
      style={{
        background: c.bg,
        border: `1px solid ${c.bd}`,
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        ...style,
      }}
      {...rest}
    >
      {(count != null || headline != null) ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon ? (
            <span
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.6)',
                color: c.fg,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {icon}
            </span>
          ) : null}
          <div>
            {count != null ? (
              <div style={{ font: '600 12px/1 var(--font-sans)', color: c.fg, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {count}
              </div>
            ) : null}
            {headline != null ? (
              <div style={{ font: '500 14px/1.3 var(--font-sans)', color: c.fg, marginTop: 3 }}>{headline}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {issues && issues.length > 0 ? (
        <div style={{ height: 36, width: 1, background: c.divider }} aria-hidden="true" />
      ) : null}

      {issues?.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
          {it.icon ? <span aria-hidden="true" style={{ color: c.fg }}>{it.icon}</span> : null}
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                font: '500 13px/1.3 var(--font-sans)',
                color: c.fg,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {it.title}
            </div>
            {it.context != null ? (
              <div
                style={{
                  font: '11px/1.2 var(--font-sans)',
                  color: c.fg,
                  opacity: 0.7,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {it.context}
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {action ? <div style={{ flex: 'none' }}>{action}</div> : null}
    </div>
  );
});
