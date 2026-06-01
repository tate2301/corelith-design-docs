import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Visible label rendered above the input. Wires up `htmlFor`/`id` automatically. */
  label?: ReactNode;
  /** Subtle helper text shown below the input. */
  hint?: ReactNode;
  /** Error message — when set, the input is announced as invalid. Overrides `hint`. */
  error?: ReactNode;
  /** Sizing. Maps to the height tokens used by `.input`. @default 'md' */
  size?: InputSize;
  /** Optional leading icon (inside the input, on the left). */
  leadingIcon?: ReactNode;
  /** Optional trailing icon (inside the input, on the right). */
  endIcon?: ReactNode;
  /** Optional prefix text (e.g. `$`). Rendered inside the input on the left. */
  prefix?: ReactNode;
  /** Optional suffix text (e.g. `%`). Rendered inside the input on the right. */
  suffix?: ReactNode;
  /** Optional className applied to the outer wrapper (the `.field` element). */
  wrapperClassName?: string;
}

const SIZE_HEIGHT: Record<InputSize, number | undefined> = {
  sm: 30,
  md: undefined, // default .input height (36 px) — leave to CSS
  lg: 44,
};

/**
 * Input — single-line text field primitive.
 * Maps to the `.input` class in components.css, optionally wrapped in `.field`
 * when `label`, `hint`, or `error` are provided.
 *
 * Accessibility:
 *  - `label` is rendered as a `<label htmlFor>` bound to the input id (auto-generated if absent).
 *  - `error` sets `aria-invalid="true"` and wires the message via `aria-describedby`.
 *  - `hint` is also linked via `aria-describedby` when present (error takes precedence).
 *  - Leading/trailing icons are decorative (`aria-hidden`) and padding is added on the input.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    size = 'md',
    leadingIcon,
    endIcon,
    prefix,
    suffix,
    wrapperClassName,
    className,
    id,
    style,
    disabled,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `input-${autoId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, hintId].filter(Boolean).join(' ') || undefined;

  const hasLead = leadingIcon || prefix;
  const hasTrail = endIcon || suffix;

  const inputStyle: React.CSSProperties = { ...style };
  const sizeHeight = SIZE_HEIGHT[size];
  if (sizeHeight !== undefined) inputStyle.height = sizeHeight;
  if (hasLead) inputStyle.paddingLeft = leadingIcon ? 32 : 26;
  if (hasTrail) inputStyle.paddingRight = endIcon ? 32 : 26;

  const inputEl = (
    <input
      ref={ref}
      id={inputId}
      className={cn('input', className)}
      disabled={disabled}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      aria-describedby={describedBy}
      style={inputStyle}
      {...rest}
    />
  );

  // If no affixes and no label/hint/error, return bare input.
  if (!hasLead && !hasTrail && !label && !hint && !error) {
    return inputEl;
  }

  const wrappedInput = (hasLead || hasTrail) ? (
    <span style={{ position: 'relative', display: 'block' }}>
      {leadingIcon ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {leadingIcon}
        </span>
      ) : null}
      {prefix && !leadingIcon ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)',
            pointerEvents: 'none',
          }}
        >
          {prefix}
        </span>
      ) : null}
      {inputEl}
      {endIcon ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {endIcon}
        </span>
      ) : null}
      {suffix && !endIcon ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)',
            pointerEvents: 'none',
          }}
        >
          {suffix}
        </span>
      ) : null}
    </span>
  ) : (
    inputEl
  );

  if (!label && !hint && !error) {
    return wrappedInput;
  }

  return (
    <div className={cn('field', wrapperClassName)}>
      {label ? (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      {wrappedInput}
      {error ? (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      ) : hint ? (
        <span className="field-help" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
});
