import { Fragment, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type DayListTone = 'up' | 'down' | 'neutral';

export interface DayListRow {
  label: ReactNode;
  value: ReactNode;
  tone?: DayListTone;
}

export interface DayListProps extends HTMLAttributes<HTMLDivElement> {
  rows: DayListRow[];
}

/**
 * DayList — date-grouped row list (day timeline).
 *
 * @example
 * ```tsx
 * <DayList />
 * ```
 */
export const DayList = forwardRef<HTMLDivElement, DayListProps>(function DayList(
  { rows, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('b-day-list', className)} {...rest}>
      {rows.map((r, i) => {
        const toneClass = r.tone === 'up' ? 'up' : r.tone === 'down' ? 'dn' : null;
        return (
          <Fragment key={i}>
            <div className="b-dl-l">{r.label}</div>
            <div className={cx('b-dl-v', toneClass)}>{r.value}</div>
          </Fragment>
        );
      })}
    </div>
  );
});
