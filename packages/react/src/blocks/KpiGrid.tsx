import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type KpiTone = 'neutral' | 'success' | 'warn' | 'danger';

export type KpiItemData = {
  /** Small uppercase label. */
  label: ReactNode;
  /** The headline number. */
  value: ReactNode;
  /** Optional delta line (e.g. "+12.4 %"). */
  delta?: ReactNode;
  /** Optional sparkline node — usually an inline SVG sized 80×24. */
  spark?: ReactNode;
  /** Make the cell tappable. */
  href?: string;
  /** Tonal accent applied to the delta + spark stroke colour (via class). */
  tone?: KpiTone;
};

export interface KpiGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns in the grid. @default 4 */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Inline items API. Mutually exchangeable with children. */
  items?: KpiItemData[];
}

export interface KpiItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>, KpiItemData {}

const TONE_CLASS: Record<KpiTone, string> = {
  neutral: '',
  success: 'tone-success',
  warn: 'tone-warn',
  danger: 'tone-danger',
};

/**
 * KpiGrid.Item — a single executive KPI cell. Use either via props on the
 * parent's `items` array, or as a child of <KpiGrid>.
 */
function KpiGridItem({
  label,
  value,
  delta,
  spark,
  href,
  tone = 'neutral',
  className,
  ...rest
}: KpiItemProps) {
  const inner = (
    <div className="kpi-cell">
      <div className="kpi-cell-h">
        <span className="kpi-cell-lbl">{label}</span>
        {href ? <span className="kpi-cell-chev" aria-hidden="true">›</span> : null}
      </div>
      <div className="kpi-cell-val">{value}</div>
      {(delta != null || spark) ? (
        <div className="kpi-cell-foot">
          {delta != null ? <span className={cn('kpi-cell-delta', TONE_CLASS[tone])}>{delta}</span> : <span />}
          {spark ? <span className="kpi-cell-spark" aria-hidden="true">{spark}</span> : null}
        </div>
      ) : null}
    </div>
  );

  return href ? (
    <a
      href={href}
      className={cn('kpi-item', className)}
      style={{ textDecoration: 'none', color: 'inherit' }}
      {...rest}
    >
      {inner}
    </a>
  ) : (
    <div className={cn('kpi-item', className)} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {inner}
    </div>
  );
}

KpiGridItem.displayName = 'KpiGrid.Item';

type KpiGridComponent = ReturnType<
  typeof forwardRef<HTMLDivElement, KpiGridProps>
> & {
  Item: typeof KpiGridItem;
};

/**
 * KpiGrid — a 4-up (configurable) row of executive KPI cells.
 *
 * Accepts items either via the `items` prop or as `<KpiGrid.Item>` children.
 *
 * @example
 * ```tsx
 * <KpiGrid cols={4}>
 *   <KpiGrid.Item label="Revenue today" value="$ 2,816" delta="+12.4 %" tone="success" />
 *   <KpiGrid.Item label="Receipts" value="147" />
 * </KpiGrid>
 *
 * // or:
 * <KpiGrid items={[{ label: 'Revenue', value: '$ 2,816' }]} />
 * ```
 */
const KpiGridBase = forwardRef<HTMLDivElement, KpiGridProps>(function KpiGrid(
  { cols = 4, items, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('kpi-grid', `kpi-grid-${cols}`, className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 12,
        ...style,
      }}
      {...rest}
    >
      {items?.map((it, i) => <KpiGridItem key={i} {...it} />)}
      {children}
    </div>
  );
});

export const KpiGrid = KpiGridBase as KpiGridComponent;
KpiGrid.Item = KpiGridItem;
