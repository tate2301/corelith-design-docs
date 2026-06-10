import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  label?: ReactNode;
  /** Visual indeterminate state — sets the DOM property via ref callback. */
  indeterminate?: boolean;
}

/**
 * Checkbox — styled native checkbox.
 *
 * @example
 * ```tsx
 * <Checkbox />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate, className, id, ...rest },
  ref,
) {
  const setRef = (el: HTMLInputElement | null) => {
    if (el) el.indeterminate = Boolean(indeterminate);
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };
  const input = (
    <input
      ref={setRef}
      type="checkbox"
      id={id}
      className={cx('check', className)}
      {...rest}
    />
  );
  if (label == null) return input;
  return (
    <label className="check-row">
      {input}
      <span>{label}</span>
    </label>
  );
});
