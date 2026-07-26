"use client";

import {
  createContext,
  useContext,
  useId,
  forwardRef,
  type InputHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  children?: ReactNode;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { name: nameProp, value, onChange, disabled, orientation = 'vertical', children, className, ...props },
  ref,
) {
  const generatedName = useId();
  const name = nameProp || generatedName;

  return (
    <RadioGroupContext.Provider value={{ name, value, onChange, disabled }}>
      <div
        ref={ref}
        role="radiogroup"
        className={cn('p-radio-group', orientation === 'horizontal' && 'horizontal', className)}
        style={{
          display: 'flex',
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          gap: orientation === 'horizontal' ? 16 : 8,
        }}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: ReactNode;
  value: string;
  onChange?: (value: string) => void;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, value, onChange, disabled: disabledProp, checked: checkedProp, className, id: idProp, ...props },
  ref,
) {
  const ctx = useRadioGroupContext();
  const autoId = useId();
  const id = idProp || `radio-${autoId}`;

  const name = ctx?.name || props.name;
  const checked = ctx ? ctx.value === value : checkedProp;
  const disabled = disabledProp || ctx?.disabled;

  const handleChange = () => {
    onChange?.(value);
    ctx?.onChange?.(value);
  };

  const radioEl = (
    <input
      ref={ref}
      type="radio"
      id={id}
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
      className={cn('check', 'radio', className)}
      style={{ borderRadius: '50%' }}
      {...props}
    />
  );

  if (!label) return radioEl;

  return (
    <label
      htmlFor={id}
      className={cn('check-row', disabled && 'disabled')}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
    >
      {radioEl}
      <span>{label}</span>
    </label>
  );
});

Object.assign(RadioGroup, {
  Item: Radio,
});
