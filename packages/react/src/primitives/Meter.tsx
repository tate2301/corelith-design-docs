"use client";

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface MeterProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  label?: string;
}

export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 100,
    low = 30,
    high = 70,
    optimum,
    label = 'Meter',
    className,
    style,
    ...props
  },
  ref,
) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  let toneColor = 'var(--brand, #0B5DF0)';
  if (value < low) {
    toneColor = 'var(--tone-warn, #f59e0b)';
  } else if (value > high) {
    toneColor = 'var(--tone-success, #10b981)';
  }

  return (
    <div
      ref={ref}
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      className={cn('p-meter', className)}
      style={{
        width: '100%',
        height: 8,
        backgroundColor: 'var(--surface-muted, #e5e7eb)',
        borderRadius: 9999,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      <div
        className="p-meter-bar"
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: toneColor,
          borderRadius: 9999,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
});
