import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type StatCardTone = 'default' | 'success' | 'warn' | 'danger';
export type StatCardDeltaTone = 'up' | 'down' | 'neutral';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** Optional unit (e.g. 'kg', '%') rendered smaller next to the value. */
  unit?: ReactNode;
  delta?: ReactNode;
  deltaTone?: StatCardDeltaTone;
  tone?: StatCardTone;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { label, value, unit, delta, deltaTone = 'neutral', tone = 'default', className, ...rest },
  ref,
) {
  const deltaClass = deltaTone === 'up' ? 'up' : deltaTone === 'down' ? 'dn' : null;
  const toneClass = tone === 'default' ? null : tone;
  return (
    <div ref={ref} className={cx('stat-tile', className)} {...rest}>
      <div className="lbl">{label}</div>
      <div className={cx('val', toneClass)}>
        {value}
        {unit != null ? <span className="u">{unit}</span> : null}
      </div>
      {delta != null ? <div className={cx('delta', deltaClass)}>{delta}</div> : null}
    </div>
  );
});
