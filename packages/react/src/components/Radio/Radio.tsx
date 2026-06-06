import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { name, value, onChange, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const resolvedName = name ?? `huchu-radio-${auto}`;
  return (
    <RadioGroupContext.Provider value={{ name: resolvedName, value, onChange: onChange ?? (() => {}) }}>
      <div ref={ref} role="radiogroup" className={cx('radio-group', className)} {...rest}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  label?: ReactNode;
  value: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, value, checked, onChange, name, ...rest },
  ref,
) {
  const ctx = useContext(RadioGroupContext);
  const resolvedName = name ?? ctx?.name;
  const resolvedChecked = checked ?? (ctx ? ctx.value === value : undefined);
  const input = (
    <input
      ref={ref}
      type="radio"
      name={resolvedName}
      value={value}
      checked={resolvedChecked}
      onChange={(e) => {
        ctx?.onChange(value);
        onChange?.(e);
      }}
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
