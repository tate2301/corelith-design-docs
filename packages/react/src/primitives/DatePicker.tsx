"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { usePosition, type Align, type Side } from '../utils/usePosition';
import { Calendar } from './Calendar';

export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date. */
  value?: Date | null;
  /** Uncontrolled initial selected date. */
  defaultValue?: Date | null;
  /** Fires when a date is selected. */
  onValueChange?: (date: Date) => void;
  /** Visible label rendered above the field. */
  label?: string;
  /** Input placeholder when no date is chosen. */
  placeholder?: string;
  /** Format the chosen date for display. @default `D Month YYYY`. */
  format?: (date: Date) => string;
  /** Disable specific days. */
  isDateDisabled?: (date: Date) => boolean;
  disabled?: boolean;
  side?: Side;
  align?: Align;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const defaultFormat = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/**
 * DatePicker — a text field that opens a Calendar popover.
 * Composes the `Calendar` primitive, the shared `.input` / `.field` classes,
 * and the `usePosition` helper for anchoring the popover.
 *
 * Accessibility:
 *   - The trigger input is `readOnly` with `aria-haspopup="dialog"` and
 *     `aria-expanded`; the popover is `role="dialog"`.
 *   - Enter/Space or click opens; Escape closes and restores focus to the field.
 *   - Day selection is delegated to Calendar (grid + gridcell semantics);
 *     choosing a day closes the popover.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  {
    value: controlled,
    defaultValue,
    onValueChange,
    label,
    placeholder = 'Select date',
    format = defaultFormat,
    isDateDisabled,
    disabled,
    side = 'bottom',
    align = 'start',
    className,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState<Date | null>(defaultValue ?? null);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled! : uncontrolled;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const pos = usePosition(inputRef, popoverRef, open, { side, align, sideOffset: 6 });

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popoverRef.current?.contains(t) || inputRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDocPointer, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (d: Date) => {
    if (!isControlled) setUncontrolled(d);
    onValueChange?.(d);
    setOpen(false);
    inputRef.current?.focus();
  };

  const dialogId = `${baseId}-dialog`;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  const field = (
    <input
      ref={inputRef}
      type="text"
      className="input"
      readOnly
      disabled={disabled}
      placeholder={placeholder}
      value={value ? format(value) : ''}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? dialogId : undefined}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
      onClick={() => !disabled && setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
        }
      }}
    />
  );

  return (
    <div ref={ref} className={cn(className)} {...rest}>
      {label ? (
        <div className="field">
          <label className="field-label" htmlFor={`${baseId}-input`}>
            {label}
          </label>
          {field}
        </div>
      ) : (
        field
      )}

      {open && portalTarget
        ? createPortal(
            <div
              ref={popoverRef}
              id={dialogId}
              role="dialog"
              aria-label={label ?? 'Choose date'}
              style={{
                position: 'absolute',
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                zIndex: 1000,
              }}
            >
              <Calendar
                value={value}
                defaultMonth={value ?? undefined}
                isDateDisabled={isDateDisabled}
                onValueChange={select}
                style={{ width: 280 }}
              />
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
});
