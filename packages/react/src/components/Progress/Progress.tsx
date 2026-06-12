import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './Progress.css';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0..1 fraction, or pass `max` and use values 0..max. Pass `null`/`undefined` for indeterminate. */
  value?: number | null;
  max?: number;
  label?: ReactNode;
}

/**
 * Progress — determinate progress bar (role="progressbar").
 *
 * @example
 * ```tsx
 * <Progress />
 * ```
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 1, label, className, ...rest },
  ref,
) {
  const indeterminate = value == null;
  const pct = indeterminate ? 0 : Math.max(0, Math.min(1, value / (max || 1))) * 100;
  return (
    <div
      ref={ref}
      className={cx('progress', indeterminate && 'indeterminate', className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={typeof label === 'string' ? label : undefined}
      {...rest}
    >
      <div className="progress-bar" style={{ width: indeterminate ? undefined : `${pct}%` }} />
      {label != null ? <span className="progress-label">{label}</span> : null}
    </div>
  );
});
