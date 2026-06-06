import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  label?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className, ...rest },
  ref,
) {
  const input = (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      className={cx('switch', className)}
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
