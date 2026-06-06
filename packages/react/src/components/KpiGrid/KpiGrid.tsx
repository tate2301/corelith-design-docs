import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './KpiGrid.css';

export interface KpiGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Minimum tile width before wrapping. */
  minWidth?: number;
  children?: ReactNode;
}

export const KpiGrid = forwardRef<HTMLDivElement, KpiGridProps>(function KpiGrid(
  { minWidth, className, style, children, ...rest },
  ref,
) {
  const mergedStyle =
    minWidth != null
      ? { ...style, gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))` }
      : style;
  return (
    <div ref={ref} className={cx('kpi-grid', className)} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
});
