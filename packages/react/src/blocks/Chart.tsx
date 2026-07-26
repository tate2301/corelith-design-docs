"use client";

import { forwardRef, type SVGProps, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartLineProps extends SVGProps<SVGSVGElement> {
  data?: ChartDataPoint[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
}

export const ChartLine = forwardRef<SVGSVGElement, ChartLineProps>(function ChartLine(
  { data = [], width = 300, height = 150, stroke = 'var(--brand, #0B5DF0)', strokeWidth = 2, className, ...props },
  ref,
) {
  if (data.length === 0) return <svg ref={ref} width={width} height={height} className={cn('b-chart', className)} {...props} />;

  const minY = Math.min(...data.map((d) => d.y));
  const maxY = Math.max(...data.map((d) => d.y));
  const rangeY = maxY - minY || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * (width - 20) + 10;
      const y = height - 10 - ((d.y - minY) / rangeY) * (height - 20);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('b-chart', 'b-chart-line', className)}
      {...props}
    >
      <polyline fill="none" stroke={stroke} strokeWidth={strokeWidth} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export interface ChartBarProps extends SVGProps<SVGSVGElement> {
  data?: ChartDataPoint[];
  width?: number;
  height?: number;
  fill?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const ChartBar = forwardRef<SVGSVGElement, ChartBarProps>(function ChartBar(
  { data = [], width = 300, height = 150, fill = 'var(--brand, #0B5DF0)', orientation = 'vertical', className, ...props },
  ref,
) {
  if (data.length === 0) return <svg ref={ref} width={width} height={height} className={cn('b-chart', className)} {...props} />;

  const maxY = Math.max(...data.map((d) => d.y)) || 1;
  const barCount = data.length;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('b-chart', 'b-chart-bar', className)}
      {...props}
    >
      {data.map((d, i) => {
        if (orientation === 'horizontal') {
          const barHeight = (height - 20) / barCount - 4;
          const barWidth = (d.y / maxY) * (width - 40);
          const y = 10 + i * ((height - 20) / barCount);
          return (
            <rect key={i} x={10} y={y} width={barWidth} height={barHeight} fill={d.color || fill} rx={4} />
          );
        } else {
          const barWidth = (width - 20) / barCount - 6;
          const barHeight = (d.y / maxY) * (height - 30);
          const x = 10 + i * ((width - 20) / barCount);
          const y = height - 20 - barHeight;
          return (
            <rect key={i} x={x} y={y} width={barWidth} height={barHeight} fill={d.color || fill} rx={4} />
          );
        }
      })}
    </svg>
  );
});

export interface ChartDonutProps extends SVGProps<SVGSVGElement> {
  data?: { value: number; label?: string; color?: string }[];
  size?: number;
  thickness?: number;
}

export const ChartDonut = forwardRef<SVGSVGElement, ChartDonutProps>(function ChartDonut(
  { data = [], size = 120, thickness = 16, className, ...props },
  ref,
) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  const defaultColors = ['#0B5DF0', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('b-chart', 'b-chart-donut', className)}
      {...props}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {data.map((d, i) => {
          const strokeDasharray = `${(d.value / total) * circumference} ${circumference}`;
          const strokeDashoffset = -accumulated * circumference;
          accumulated += d.value / total;
          const color = d.color || defaultColors[i % defaultColors.length];

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </g>
    </svg>
  );
});

export interface ChartPieProps extends SVGProps<SVGSVGElement> {
  data?: { value: number; label?: string; color?: string }[];
  size?: number;
}

export const ChartPie = forwardRef<SVGSVGElement, ChartPieProps>(function ChartPie(
  { data = [], size = 120, className, ...props },
  ref,
) {
  return <ChartDonut ref={ref} data={data} size={size} thickness={size / 2} className={className} {...props} />;
});

export interface ChartAreaProps extends ChartLineProps {}

export const ChartArea = forwardRef<SVGSVGElement, ChartAreaProps>(function ChartArea(
  { data = [], width = 300, height = 150, stroke = 'var(--brand, #0B5DF0)', className, ...props },
  ref,
) {
  if (data.length === 0) return <svg ref={ref} width={width} height={height} className={cn('b-chart', className)} {...props} />;

  const minY = Math.min(...data.map((d) => d.y));
  const maxY = Math.max(...data.map((d) => d.y));
  const rangeY = maxY - minY || 1;

  const pointsArr = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (width - 20) + 10;
    const y = height - 20 - ((d.y - minY) / rangeY) * (height - 30);
    return { x, y };
  });

  const polylinePoints = pointsArr.map((p) => `${p.x},${p.y}`).join(' ');
  const polygonPoints = `10,${height - 20} ${polylinePoints} ${width - 10},${height - 20}`;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('b-chart', 'b-chart-area', className)}
      {...props}
    >
      <polygon fill={stroke} fillOpacity={0.15} points={polygonPoints} />
      <polyline fill="none" stroke={stroke} strokeWidth={2} points={polylinePoints} />
    </svg>
  );
});

export interface ChartSparklineProps extends SVGProps<SVGSVGElement> {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const ChartSparkline = forwardRef<SVGSVGElement, ChartSparklineProps>(function ChartSparkline(
  { data = [], width = 100, height = 30, color = 'var(--brand, #0B5DF0)', className, ...props },
  ref,
) {
  if (data.length === 0) return <svg ref={ref} width={width} height={height} className={cn('b-chart-sparkline', className)} {...props} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1 || 1)) * (width - 4) + 2;
      const y = height - 2 - ((val - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('b-chart-sparkline', className)}
      {...props}
    >
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export interface ChartProgressRingProps extends SVGProps<SVGSVGElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ChartProgressRing = forwardRef<SVGSVGElement, ChartProgressRingProps>(function ChartProgressRing(
  { value, max = 100, size = 48, strokeWidth = 4, color = 'var(--brand, #0B5DF0)', className, ...props },
  ref,
) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('b-chart-progress-ring', className)}
      {...props}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-muted, #e5e7eb)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
    </svg>
  );
});

export interface ChartLegendProps extends HTMLAttributes<HTMLDivElement> {
  items: { label: string; color: string }[];
}

export const ChartLegend = forwardRef<HTMLDivElement, ChartLegendProps>(function ChartLegend(
  { items = [], className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('b-chart-legend', className)}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 12, font: 'var(--type-body-sm)', ...style }}
      {...props}
    >
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
          <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
});

export const ChartAxis = forwardRef<SVGGElement, SVGProps<SVGGElement>>(function ChartAxis(props, ref) {
  return <g ref={ref} className="b-chart-axis" {...props} />;
});

export const ChartGrid = forwardRef<SVGGElement, SVGProps<SVGGElement>>(function ChartGrid(props, ref) {
  return <g ref={ref} className="b-chart-grid" {...props} />;
});

export const ChartSeries = forwardRef<SVGGElement, SVGProps<SVGGElement>>(function ChartSeries(props, ref) {
  return <g ref={ref} className="b-chart-series" {...props} />;
});

export const Chart = {
  Line: ChartLine,
  Bar: ChartBar,
  Donut: ChartDonut,
  Pie: ChartPie,
  Area: ChartArea,
  Sparkline: ChartSparkline,
  ProgressRing: ChartProgressRing,
  Legend: ChartLegend,
  Axis: ChartAxis,
  Grid: ChartGrid,
  Series: ChartSeries,
};
