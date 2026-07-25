"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react';
import { cn } from '../utils/cn';

export interface InputOTPProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Number of character cells. @default 6 */
  length?: number;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires on every change with the joined string. */
  onValueChange?: (value: string) => void;
  /** Fires once the final cell is filled. */
  onComplete?: (value: string) => void;
  /** Accepted characters. @default digits only. */
  pattern?: RegExp;
  /** Accessible group label. @default 'One-time code' */
  'aria-label'?: string;
  disabled?: boolean;
}

/**
 * InputOTP — N segmented single-character inputs for one-time codes.
 * The docs (`p-input-otp`) render the cells with inline token styling — there
 * is no `.input-otp` rule in components.css — so the cell chrome (border,
 * size, focus ring) is a token-driven inline fallback.
 *
 * Accessibility:
 *   - Wrapper is `role="group"` with an `aria-label`.
 *   - Each cell is `inputMode="numeric"` with `autoComplete="one-time-code"`.
 *   - Typing auto-advances to the next cell; Backspace clears and steps back;
 *     Left/Right arrows move between cells; pasting a full code distributes the
 *     characters across all cells.
 */
export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(function InputOTP(
  {
    length = 6,
    value: controlled,
    defaultValue = '',
    onValueChange,
    onComplete,
    pattern = /^[0-9]$/,
    'aria-label': ariaLabel = 'One-time code',
    disabled,
    className,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled! : uncontrolled;
  const cells = useRef<(HTMLInputElement | null)[]>([]);

  const chars = Array.from({ length }, (_, i) => value[i] ?? '');

  const commit = (next: string) => {
    const trimmed = next.slice(0, length);
    if (!isControlled) setUncontrolled(trimmed);
    onValueChange?.(trimmed);
    if (trimmed.length === length) onComplete?.(trimmed);
  };

  const setCharAt = (index: number, ch: string) => {
    const arr = chars.slice();
    arr[index] = ch;
    commit(arr.join('').replace(/\s+$/, ''));
  };

  const focusCell = (i: number) => {
    const clamped = Math.max(0, Math.min(length - 1, i));
    cells.current[clamped]?.focus();
    cells.current[clamped]?.select();
  };

  const onChange = (index: number, raw: string) => {
    const ch = raw.slice(-1);
    if (ch && !pattern.test(ch)) return;
    setCharAt(index, ch);
    if (ch) focusCell(index + 1);
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[index]) {
        setCharAt(index, '');
      } else {
        setCharAt(index - 1 >= 0 ? index - 1 : index, '');
        focusCell(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const onPaste = (index: number, e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const filtered = Array.from(text)
      .filter((c) => pattern.test(c))
      .join('');
    if (!filtered) return;
    const arr = chars.slice();
    for (let i = 0; i < filtered.length && index + i < length; i++) {
      arr[index + i] = filtered[i];
    }
    commit(arr.join('').replace(/\s+$/, ''));
    focusCell(index + filtered.length);
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cn('input-otp', className)}
      style={{ display: 'flex', gap: 8 }}
      {...rest}
    >
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            cells.current[i] = el;
          }}
          id={`${baseId}-${i}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          value={ch}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
          onFocus={(e) => e.target.select()}
          // Token-driven inline fallback: no `.input-otp` rule in components.css.
          style={{
            width: 44,
            height: 52,
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            textAlign: 'center',
            font: '600 22px/1 var(--font-mono)',
            color: 'var(--text-strong)',
            background: 'var(--surface)',
            outlineColor: 'var(--focus-ring)',
          }}
        />
      ))}
    </div>
  );
});
