"use client";

import {
  forwardRef,
  type TdHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type NumericTone = 'neutral' | 'success' | 'danger' | 'warn';
export type NumericAlign = 'left' | 'right';

export interface NumericCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** The numeric value to display (tabular figures). */
  children?: ReactNode;
  /** Optional secondary delta line (e.g. "+12 %"). */
  delta?: ReactNode;
  /** Tonal colour applied to the value / delta. @default 'neutral' */
  tone?: NumericTone;
  /** Horizontal alignment of the figure. @default 'right' */
  align?: NumericAlign;
}

// Tones map to the `--tone-*` token family; there is no class for them.
const TONE_VAR: Record<NumericTone, string | undefined> = {
  neutral: undefined,
  success: 'var(--tone-success)',
  danger: 'var(--tone-danger)',
  warn: 'var(--tone-warn)',
};

/**
 * NumericCell — a tabular-figure table cell with an optional delta line and
 * tonal colour. Renders a `<td>` (that is its contract) and composes `.num` +
 * `.num-cell` from tables.css: mono figures, `tabular-nums`, and an
 * `.align-left` / `.align-right` modifier that out-specifies the right-align
 * default of `.table td.num` / `.dtable td.num`.
 *
 * Accessibility:
 *   - Stays a semantic `<td>` so it inherits the table's row/column context.
 *   - Tonal colour is supplementary — pair it with a sign/arrow in the content
 *     so meaning is not conveyed by colour alone.
 *
 * @example
 * ```tsx
 * <Table.Row>
 *   <Table.Cell>Mukamba Group</Table.Cell>
 *   <NumericCell tone="success" delta="+12 %">US$48,200</NumericCell>
 *   <NumericCell align="left">SUP-01</NumericCell>
 * </Table.Row>
 * ```
 */
export const NumericCell = forwardRef<HTMLTableCellElement, NumericCellProps>(
  function NumericCell(
    { children, delta, tone = 'neutral', align = 'right', className, style, ...rest },
    ref,
  ) {
    const toneColor = TONE_VAR[tone];
    return (
      <td
        ref={ref}
        className={cn('num', 'num-cell', align === 'left' ? 'align-left' : 'align-right', className)}
        style={{ color: toneColor, ...style }}
        {...rest}
      >
        {children}
        {delta != null ? (
          <span className="num-delta" style={toneColor ? { color: toneColor } : undefined}>
            {delta}
          </span>
        ) : null}
      </td>
    );
  },
);
