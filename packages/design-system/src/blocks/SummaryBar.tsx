import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type SummaryItem = {
  /** Tiny uppercase label. */
  label: ReactNode;
  /** Small value (number or short text). */
  value: ReactNode;
  /** Optional href — turns the pill into a tap-through. */
  href?: string;
};

export interface SummaryBarProps extends HTMLAttributes<HTMLDivElement> {
  /** The metrics to render, dot-separated. */
  items: SummaryItem[];
}

/**
 * SummaryBar — a compact one-line strip of metrics under a page header.
 * For 8–10 small numbers that belong above the fold but don't deserve
 * full KPI cards.
 *
 * @example
 * ```tsx
 * <SummaryBar items={[
 *   { label: 'Open shifts', value: '3 of 4' },
 *   { label: 'Cash on hand', value: '$ 1,950' },
 *   { label: 'Receipts', value: 147 },
 * ]} />
 * ```
 */
export const SummaryBar = forwardRef<HTMLDivElement, SummaryBarProps>(function SummaryBar(
  { items, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('summary-bar', className)} {...rest}>
      {items.map((it, i) => {
        const content = (
          <span className="summary-bar-cell">
            <span className="summary-bar-lbl">{it.label}</span>
            <span className="summary-bar-val">{it.value}</span>
          </span>
        );
        return (
          <span key={i} className="summary-bar-group">
            {it.href ? (
              <a href={it.href} className="summary-bar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                {content}
              </a>
            ) : (
              content
            )}
            {i < items.length - 1 ? <span className="summary-bar-sep" aria-hidden="true">·</span> : null}
          </span>
        );
      })}
    </div>
  );
});
