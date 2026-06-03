import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useFieldContext } from '../Field/Field';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, id, invalid, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, ...rest },
  ref,
) {
  const field = useFieldContext();
  const resolvedId = id ?? field?.inputId;
  const resolvedDescribedBy = ariaDescribedBy ?? field?.describedBy;
  const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid ?? undefined;
  return (
    <input
      ref={ref}
      id={resolvedId}
      className={cx('input', resolvedInvalid && 'is-invalid', className)}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      {...rest}
    />
  );
});
