import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  /** Render N stacked skeleton rows (useful for list placeholders). */
  lines?: number;
  /** Pixel gap between lines when `lines > 1`. */
  gap?: number;
}

/**
 * Skeleton — content placeholder for loading states.
 *
 * @example
 * ```tsx
 * <Skeleton />
 * ```
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width, height, lines = 1, gap = 8, className, style, ...rest },
  ref,
) {
  if (lines > 1) {
    return (
      <div ref={ref} style={{ display: 'grid', gap, ...style }} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cx('skeleton', className)}
            aria-hidden="true"
            style={{ width, height: height ?? 12 }}
          />
        ))}
      </div>
    );
  }
  const composed: CSSProperties = { width, height, ...style };
  return (
    <div
      ref={ref}
      className={cx('skeleton', className)}
      aria-hidden="true"
      style={composed}
      {...rest}
    />
  );
});
