import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useFieldContext } from '../Field/Field';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Optional content rendered inside the input chrome, before the field. */
  leadingIcon?: ReactNode;
  /** Optional content rendered inside the input chrome, after the field. */
  trailingIcon?: ReactNode;
  /** Alias for `trailingIcon` — accepts non-icon content (e.g. `<Kbd>⌘K</Kbd>`). */
  trailingSlot?: ReactNode;
}

/**
 * Input — Corelith component.
 *
 * @example
 * ```tsx
 * <Input />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    id,
    invalid,
    leadingIcon,
    trailingIcon,
    trailingSlot,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();
  const resolvedId = id ?? field?.inputId;
  const resolvedDescribedBy = ariaDescribedBy ?? field?.describedBy;
  const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid ?? undefined;
  const trailing = trailingIcon ?? trailingSlot;

  const inputEl = (
    <input
      ref={ref}
      id={resolvedId}
      className={cx('input', resolvedInvalid && 'is-invalid', className)}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      {...rest}
    />
  );

  // Bare <input/> when no icons — preserves existing layout/styling for callers
  // that already wrap the input themselves.
  if (!leadingIcon && !trailing) return inputEl;

  return (
    <div className={cx('input-wrap', resolvedInvalid && 'is-invalid')}>
      {leadingIcon ? (
        <span className="input-icon input-icon-leading" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {inputEl}
      {trailing ? (
        <span className="input-icon input-icon-trailing" aria-hidden="true">
          {trailing}
        </span>
      ) : null}
    </div>
  );
});
