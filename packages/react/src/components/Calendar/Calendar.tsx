import { forwardRef, useMemo, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import './Calendar.css';

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Currently selected date (local-time semantics). */
  value?: Date | null;
  /** First day of the visible month. Defaults to value's month or today. */
  month?: Date;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  /** Concrete dates (compared by Y-M-D) that should be non-interactive. */
  disabledDates?: Date[];
  weekStartsOn?: 0 | 1; // 0 = Sun, 1 = Mon
  locale?: string;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isBefore = (a: Date, b: Date) => a.getTime() < new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
const isAfter = (a: Date, b: Date) => a.getTime() > new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value, month, onChange, min, max, disabledDates, weekStartsOn = 1, locale, className, ...rest },
  ref,
) {
  const today = useMemo(() => new Date(), []);
  const cursor = month ?? value ?? today;
  const year = cursor.getFullYear();
  const monthIdx = cursor.getMonth();

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, monthIdx, 1)),
    [locale, year, monthIdx],
  );

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const base = new Date(2024, 0, weekStartsOn === 1 ? 1 : 0); // Mon Jan 1 2024 / Sun Dec 31 2023 anchor
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)));
  }, [locale, weekStartsOn]);

  const cells = useMemo(() => {
    const first = new Date(year, monthIdx, 1);
    const firstDow = first.getDay();
    const offset = (firstDow - weekStartsOn + 7) % 7;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const total = Math.ceil((offset + daysInMonth) / 7) * 7;
    const out: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < total; i++) {
      const dayNum = i - offset + 1;
      const d = new Date(year, monthIdx, dayNum);
      out.push({ date: d, inMonth: dayNum >= 1 && dayNum <= daysInMonth });
    }
    return out;
  }, [year, monthIdx, weekStartsOn]);

  const isDisabled = (d: Date) => {
    if (min && isBefore(d, min)) return true;
    if (max && isAfter(d, max)) return true;
    if (disabledDates?.some((x) => sameDay(x, d))) return true;
    return false;
  };

  return (
    <div ref={ref} className={cx('calendar', className)} role="grid" aria-label={monthLabel} {...rest}>
      <div className="cal-head">{monthLabel}</div>
      <div className="cal-weekdays" role="row">
        {weekdays.map((w) => (
          <div key={w} role="columnheader" className="cal-wd">{w}</div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map(({ date, inMonth }, i) => {
          const disabled = isDisabled(date);
          const selected = value ? sameDay(date, value) : false;
          const isToday = sameDay(date, today);
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              disabled={disabled || !inMonth}
              aria-selected={selected || undefined}
              aria-current={isToday ? 'date' : undefined}
              className={cx('cal-day', selected && 'selected', !inMonth && 'muted', isToday && 'today')}
              onClick={() => inMonth && !disabled && onChange?.(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
});
