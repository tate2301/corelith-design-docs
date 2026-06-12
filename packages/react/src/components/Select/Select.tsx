import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useFieldContext } from '../Field/Field';

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  /** Convenience: provide options as data rather than children. */
  options?: SelectOption[];
  placeholder?: string;
}

/**
 * Select — styled native <select>.
 *
 * @example
 * ```tsx
 * <Select />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    id,
    invalid,
    options,
    placeholder,
    children,
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
  return (
    <select
      ref={ref}
      id={resolvedId}
      className={cx('select', resolvedInvalid && 'is-invalid', className)}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      {...rest}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );
});
