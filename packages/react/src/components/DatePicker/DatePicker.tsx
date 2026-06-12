import { useState, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Input } from '../Input/Input';
import { Popover } from '../Popover/Popover';
import { Calendar } from '../Calendar/Calendar';
import './DatePicker.css';

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  /** Format function used in the trigger. Defaults to `toLocaleDateString()`. */
  format?: (d: Date) => string;
  placeholder?: string;
  disabled?: boolean;
  /** Optional id for the underlying input — useful with `<Field>`. */
  id?: string;
  /** Custom leading icon for the input. Defaults to a tiny calendar glyph. */
  icon?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

const CalendarGlyph = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

/**
 * Single-date popover picker. Composes `Input` + `Popover` + `Calendar`.
 */
/**
 * DatePicker — input + calendar popover.
 *
 * @example
 * ```tsx
 * <DatePicker />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  min,
  max,
  format,
  placeholder = 'Pick a date',
  disabled,
  id,
  icon,
  className,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const display = value ? (format ? format(value) : value.toLocaleDateString()) : '';

  return (
    <span className={cx('date-picker-anchor', className)}>
      <Input
        id={id}
        type="text"
        readOnly
        value={display}
        placeholder={placeholder}
        disabled={disabled}
        className="date-picker-trigger"
        trailingIcon={icon ?? CalendarGlyph}
        aria-label={ariaLabel ?? 'Date'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setOpen((p) => !p);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open ? (
        <Popover
          open
          onClose={() => setOpen(false)}
          className="date-picker-popover"
          dismissOnOutside
          dismissOnEscape
        >
          <Calendar
            value={value ?? null}
            min={min}
            max={max}
            onChange={(d) => {
              onChange?.(d);
              setOpen(false);
            }}
          />
        </Popover>
      ) : null}
    </span>
  );
}
