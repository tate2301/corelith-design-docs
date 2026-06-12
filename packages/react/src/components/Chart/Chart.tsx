import { forwardRef, useId, type SVGAttributes } from 'react';
import { cx } from '../../utils/cx';
import './Chart.css';

export interface ChartPoint {
  x: number | string;
  y: number;
}
export interface ChartCategoricalDatum {
  label: string;
  value: number;
  color?: string;
}

function resolveColor(token: string | undefined, fallback: string): string {
  if (!token) return fallback;
  if (token.startsWith('#') || token.startsWith('rgb') || token.startsWith('hsl')) return token;
  // Allow CSS variable token names like 'accent' → var(--accent).
  if (token.startsWith('--')) return `var(${token})`;
  return `var(--${token}, ${fallback})`;
}

export interface ChartBaseProps extends Omit<SVGAttributes<SVGSVGElement>, 'color'> {
  width?: number;
  height?: number;
  color?: string;
  /** Show simple bottom legend (categorical charts). */
  legend?: boolean;
  /** Show x/y axis baselines. */
  axes?: boolean;
}

export interface ChartLineProps extends ChartBaseProps {
  data: ChartPoint[];
}

const LineChart = forwardRef<SVGSVGElement, ChartLineProps>(function ChartLine(
  { data, width = 320, height = 120, color, axes = true, className, ...rest },
  ref,
) {
  const stroke = resolveColor(color, '#3b82f6');
  if (data.length < 2) {
    return <svg ref={ref} className={cx('huchu-chart', className)} width={width} height={height} {...rest} />;
  }
  const ys = data.map((d) => d.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padX = 6;
  const padY = 6;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const span = maxY - minY || 1;
  const pts = data
    .map((d, i) => {
      const px = padX + (i / (data.length - 1)) * w;
      const py = padY + h - ((d.y - minY) / span) * h;
      return `${px},${py}`;
    })
    .join(' ');
  return (
    <svg
      ref={ref}
      className={cx('huchu-chart', className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      {...rest}
    >
      {axes ? (
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="currentColor" strokeOpacity="0.2" />
      ) : null}
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
});

export interface ChartBarProps extends ChartBaseProps {
  data: ChartCategoricalDatum[];
}

const BarChart = forwardRef<SVGSVGElement, ChartBarProps>(function ChartBar(
  { data, width = 320, height = 160, color, axes = true, legend, className, ...rest },
  ref,
) {
  const fill = resolveColor(color, '#3b82f6');
  if (data.length === 0) {
    return <svg ref={ref} className={cx('huchu-chart', className)} width={width} height={height} {...rest} />;
  }
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const padX = 8;
  const padY = 8;
  const w = width - padX * 2;
  const h = height - padY * 2 - (legend ? 20 : 0);
  const slot = w / data.length;
  const barW = Math.max(2, slot * 0.7);
  return (
    <>
      <svg
        ref={ref}
        className={cx('huchu-chart', className)}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        {...rest}
      >
        {axes ? (
          <line x1={padX} y1={padY + h} x2={width - padX} y2={padY + h} stroke="currentColor" strokeOpacity="0.2" />
        ) : null}
        {data.map((d, i) => {
          const bh = (d.value / max) * h;
          const x = padX + i * slot + (slot - barW) / 2;
          const y = padY + h - bh;
          return <rect key={i} x={x} y={y} width={barW} height={bh} fill={d.color ?? fill} rx={2}><title>{`${d.label}: ${d.value}`}</title></rect>;
        })}
      </svg>
      {legend ? (
        <div className="huchu-chart-legend">
          {data.map((d, i) => (
            <span key={i}><i style={{ background: d.color ?? fill }} />{d.label}</span>
          ))}
        </div>
      ) : null}
    </>
  );
});

export interface ChartDonutProps extends ChartBaseProps {
  data: ChartCategoricalDatum[];
  /** Inner-radius ratio (0..1). */
  inner?: number;
}

const DonutChart = forwardRef<SVGSVGElement, ChartDonutProps>(function ChartDonut(
  { data, width = 160, height = 160, color, inner = 0.6, legend, className, ...rest },
  ref,
) {
  const fallback = resolveColor(color, '#3b82f6');
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx0 = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 4;
  const ir = r * inner;
  let acc = 0;
  const palette = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6'];
  return (
    <>
      <svg
        ref={ref}
        className={cx('huchu-chart', className)}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        {...rest}
      >
        {data.map((d, i) => {
          const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
          acc += d.value;
          const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
          const large = end - start > Math.PI ? 1 : 0;
          const x1 = cx0 + Math.cos(start) * r;
          const y1 = cy + Math.sin(start) * r;
          const x2 = cx0 + Math.cos(end) * r;
          const y2 = cy + Math.sin(end) * r;
          const x3 = cx0 + Math.cos(end) * ir;
          const y3 = cy + Math.sin(end) * ir;
          const x4 = cx0 + Math.cos(start) * ir;
          const y4 = cy + Math.sin(start) * ir;
          const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${ir},${ir} 0 ${large} 0 ${x4},${y4} Z`;
          return <path key={i} d={path} fill={d.color ?? palette[i % palette.length] ?? fallback}><title>{`${d.label}: ${d.value}`}</title></path>;
        })}
      </svg>
      {legend ? (
        <div className="huchu-chart-legend">
          {data.map((d, i) => (
            <span key={i}><i style={{ background: d.color ?? palette[i % palette.length] ?? fallback }} />{d.label}</span>
          ))}
        </div>
      ) : null}
    </>
  );
});

export interface ChartSparklineProps extends ChartBaseProps {
  data: number[] | ChartPoint[];
}

const Sparkline = forwardRef<SVGSVGElement, ChartSparklineProps>(function ChartSparkline(
  { data, width = 80, height = 24, color, className, ...rest },
  ref,
) {
  const id = useId();
  const stroke = resolveColor(color, '#3b82f6');
  const pts = (data as (number | ChartPoint)[]).map((d) => (typeof d === 'number' ? d : d.y));
  if (pts.length < 2) {
    return <svg ref={ref} className={cx('huchu-chart', className)} width={width} height={height} {...rest} />;
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const path = pts
    .map((y, i) => {
      const px = (i / (pts.length - 1)) * width;
      const py = height - ((y - min) / span) * height;
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      ref={ref}
      className={cx('huchu-chart', className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${id}-title`}
      {...rest}
    >
      <title id={`${id}-title`}>Sparkline</title>
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
});

/**
 * Chart — namespace of small SVG charts: Line, Bar, Donut, Sparkline.
 *
 * @example
 * ```tsx
 * <Chart />
 * ```
 */
export const Chart = {
  Line: LineChart,
  Bar: BarChart,
  Donut: DonutChart,
  Sparkline,
};
