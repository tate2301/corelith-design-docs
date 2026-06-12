import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './Meter.css';

export type MeterTone = 'default' | 'success' | 'warn' | 'danger';

export interface MeterProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  tone?: MeterTone;
  label?: ReactNode;
}

function pickTone(value: number, low?: number, high?: number): MeterTone {
  if (high != null && value >= high) return 'success';
  if (low != null && value <= low) return 'danger';
  return 'default';
}

/**
 * Meter — bounded numeric gauge (role="meter").
 *
 * @example
 * ```tsx
 * <Meter />
 * ```
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  { value, min = 0, max = 100, low, high, optimum, tone, label, className, ...rest },
  ref,
) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min || 1))) * 100;
  const resolvedTone = tone ?? pickTone(value, low, high);
  return (
    <div
      ref={ref}
      className={cx('meter', resolvedTone !== 'default' && resolvedTone, className)}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={typeof label === 'string' ? label : undefined}
      data-optimum={optimum}
      {...rest}
    >
      <div className="meter-bar" style={{ width: `${pct}%` }} />
      {label != null ? <span className="meter-label">{label}</span> : null}
    </div>
  );
});
