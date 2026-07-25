"use client";

import {
  forwardRef,
  useState,
  type HTMLAttributes,
} from 'react';
import { cn } from '../utils/cn';

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date. */
  value?: Date | null;
  /** Uncontrolled initial selected date. */
  defaultValue?: Date | null;
  /** Fires when a day is selected. */
  onValueChange?: (date: Date) => void;
  /** Controlled visible month (any day within it). */
  month?: Date;
  /** Uncontrolled initial visible month. @default selected value or today. */
  defaultMonth?: Date;
  /** Fires when the visible month changes (prev/next). */
  onMonthChange?: (month: Date) => void;
  /** Disable specific days. */
  isDateDisabled?: (date: Date) => boolean;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const sameDay = (a: Date | null | undefined, b: Date) =>
  !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

/** Build a 6×7 grid of dates starting on the Monday on/before the 1st. */
function buildGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  // getDay: 0=Sun..6=Sat → Monday-based offset.
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * Calendar — a month grid with selectable day, prev/next month, and today.
 * The docs (`p-calendar` / `p-date-picker`) render the grid with inline token
 * styling — no dedicated `.calendar` rule exists in components.css — so cell
 * styling is a token-driven inline fallback. The month/view header reuses the
 * shared `.btn` family.
 *
 * Accessibility:
 *   - Grid is `role="grid"`; each day is a `role="gridcell"` button.
 *   - The selected day carries `aria-selected`; today is marked via
 *     `aria-current="date"`.
 *   - Prev/Next buttons have explicit `aria-label`s. The header announces the
 *     visible month/year.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    value: controlledValue,
    defaultValue,
    onValueChange,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    isDateDisabled,
    className,
    style,
    ...rest
  },
  ref,
) {
  const today = new Date();
  const isValueControlled = controlledValue !== undefined;
  const [valueState, setValueState] = useState<Date | null>(defaultValue ?? null);
  const value = isValueControlled ? controlledValue! : valueState;

  const isMonthControlled = controlledMonth !== undefined;
  const [monthState, setMonthState] = useState<Date>(
    () => startOfMonth(defaultMonth ?? value ?? today),
  );
  const month = isMonthControlled ? startOfMonth(controlledMonth!) : monthState;

  const setMonth = (next: Date) => {
    const m = startOfMonth(next);
    if (!isMonthControlled) setMonthState(m);
    onMonthChange?.(m);
  };

  const selectDay = (d: Date) => {
    if (isDateDisabled?.(d)) return;
    if (!isValueControlled) setValueState(d);
    onValueChange?.(d);
  };

  const grid = buildGrid(month);

  return (
    <div
      ref={ref}
      className={cn('calendar', className)}
      // Token-driven inline fallback: no `.calendar` rule in components.css.
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 14,
        boxShadow: 'var(--shadow-popover)',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          className="btn btn-quiet btn-icon btn-sm"
          aria-label="Previous month"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          ‹
        </button>
        <span
          aria-live="polite"
          style={{ font: '500 14px/1 var(--font-sans)', color: 'var(--text-strong)' }}
        >
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          type="button"
          className="btn btn-quiet btn-icon btn-sm"
          aria-label="Next month"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          ›
        </button>
      </div>

      <div
        role="grid"
        aria-label={`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
        style={{ display: 'grid', gap: 2 }}
      >
        <div
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
            font: 'var(--type-caption)',
            color: 'var(--text-subtle)',
            marginBottom: 4,
          }}
        >
          {WEEKDAYS.map((w) => (
            <div key={w} role="columnheader" style={{ textAlign: 'center', padding: '4px 0' }}>
              {w}
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div key={week} role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {grid.slice(week * 7, week * 7 + 7).map((d) => {
              const outside = d.getMonth() !== month.getMonth();
              const selected = sameDay(value, d);
              const isToday = sameDay(today, d);
              const disabled = isDateDisabled?.(d);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  role="gridcell"
                  aria-selected={selected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-disabled={disabled || undefined}
                  disabled={disabled}
                  tabIndex={selected || (!value && isToday) ? 0 : -1}
                  onClick={() => selectDay(d)}
                  style={{
                    width: '100%',
                    height: 32,
                    borderRadius: 6,
                    font: '500 13px/1 var(--font-mono)',
                    cursor: disabled ? 'default' : 'pointer',
                    border: isToday && !selected ? '1px solid var(--border)' : '0',
                    background: selected ? 'var(--brand)' : 'transparent',
                    color: selected
                      ? 'var(--text-inverse)'
                      : outside
                        ? 'var(--text-subtle)'
                        : 'var(--text-strong)',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
