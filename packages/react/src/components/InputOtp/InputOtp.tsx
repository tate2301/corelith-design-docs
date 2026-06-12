import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../utils/cx';
import './InputOtp.css';

export interface InputOtpHandle {
  focus: () => void;
}

export interface InputOtpProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

/**
 * InputOtp — Corelith component.
 *
 * @example
 * ```tsx
 * <InputOtp />
 * ```
 */
export const InputOtp = forwardRef<InputOtpHandle, InputOtpProps>(function InputOtp(
  { length = 6, value, onChange, autoFocus, disabled, invalid, className, id, ariaLabel = 'One-time code' },
  ref,
) {
  const cellsRef = useRef<Array<HTMLInputElement | null>>([]);
  const cells: string[] = Array.from({ length }, (_, i) => value[i] ?? '');

  useImperativeHandle(ref, () => ({
    focus() {
      const idx = Math.min(value.length, length - 1);
      cellsRef.current[idx]?.focus();
    },
  }));

  const setAt = (i: number, ch: string) => {
    const next = (value.padEnd(length, ' ').slice(0, i) + ch + value.padEnd(length, ' ').slice(i + 1))
      .replace(/\s+$/g, '')
      .trimEnd();
    onChange(next);
  };

  const handleInput = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) {
      setAt(i, '');
      return;
    }
    setAt(i, digit);
    if (i < length - 1) cellsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !cells[i] && i > 0) {
      e.preventDefault();
      cellsRef.current[i - 1]?.focus();
      setAt(i - 1, '');
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      cellsRef.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault();
      cellsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    const next = Math.min(text.length, length - 1);
    requestAnimationFrame(() => cellsRef.current[next]?.focus());
  };

  return (
    <div
      className={cx('input-otp', invalid && 'is-invalid', className)}
      id={id}
      role="group"
      aria-label={ariaLabel}
    >
      {cells.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            cellsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          className="input-otp-cell"
          value={ch}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`Digit ${i + 1} of ${length}`}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
});
