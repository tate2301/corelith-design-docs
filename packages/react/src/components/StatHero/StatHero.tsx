import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface StatHeroSecondary {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
}

export interface StatHeroProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  secondaries?: StatHeroSecondary[];
}

/**
 * StatHero — large hero metric block.
 *
 * @example
 * ```tsx
 * <StatHero />
 * ```
 */
export const StatHero = forwardRef<HTMLDivElement, StatHeroProps>(function StatHero(
  { label, value, description, secondaries, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('b-stat-hero', className)} {...rest}>
      <div className="b-sh-lead">
        <div className="b-sh-l">{label}</div>
        <div className="b-sh-v">{value}</div>
        {description ? <div className="b-sh-d">{description}</div> : null}
      </div>
      {secondaries && secondaries.length > 0 ? (
        <div className="b-sh-row">
          {secondaries.map((s, i) => (
            <div key={i} className="b-sh-s">
              <div className="b-sh-l">{s.label}</div>
              <div className="b-sh-v">{s.value}</div>
              {s.sub ? <div className="b-sh-sb">{s.sub}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
});
