import {
  forwardRef,
  type TdHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type NumericTone = 'neutral' | 'success' | 'danger' | 'warn';

export interface NumericCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** The numeric value to display (right-aligned, tabular figures). */
  children?: ReactNode;
  /** Optional secondary delta line (e.g. "+12 %"). */
  delta?: ReactNode;
  /** Tonal colour applied to the value / delta. @default 'neutral' */
  tone?: NumericTone;
}

// `.num` is defined in components.css (`.table td.num` → right-align +
// tabular-nums); tones map to the `--tone-*` token family.
const TONE_VAR: Record<NumericTone, string | undefined> = {
  neutral: undefined,
  success: 'var(--tone-success)',
  danger: 'var(--tone-danger)',
  warn: 'var(--tone-warn)',
};

/**
 * NumericCell — a right-aligned, tabular-figure table cell with an optional
 * delta line and tonal colour. Renders a `<td>` and composes the `.num` class
 * (right-align + `font-variant-numeric: tabular-nums`) from `.table` in
 * components.css. Tonal colour is applied inline from the `--tone-*` tokens, as
 * there is no dedicated `.num-cell` rule.
 *
 * Accessibility:
 *   - Stays a semantic `<td>` so it inherits the table's row/column context.
 *   - Tonal colour is supplementary — pair it with a sign/arrow in the content
 *     so meaning is not conveyed by colour alone.
 */
export const NumericCell = forwardRef<HTMLTableCellElement, NumericCellProps>(
  function NumericCell({ children, delta, tone = 'neutral', className, style, ...rest }, ref) {
    const toneColor = TONE_VAR[tone];
    return (
      <td
        ref={ref}
        className={cn('num', 'num-cell', className)}
        style={{ color: toneColor, ...style }}
        {...rest}
      >
        {children}
        {delta != null ? (
          <span
            style={{
              display: 'block',
              font: 'var(--type-caption)',
              color: toneColor ?? 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {delta}
          </span>
        ) : null}
      </td>
    );
  },
);
