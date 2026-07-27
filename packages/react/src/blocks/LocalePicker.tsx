"use client";

import { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { Select, type SelectProps } from '../primitives/Select';

export interface LocaleOption {
  code: string;
  label: string;
  flag?: string;
}

export interface LocalePickerProps extends Omit<SelectProps, 'onChange' | 'value' | 'children'> {
  value?: string;
  onChange?: (locale: string) => void;
  locales?: LocaleOption[];
}

const DEFAULT_LOCALES: LocaleOption[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

export const LocalePicker = forwardRef<HTMLSelectElement, LocalePickerProps>(function LocalePicker(
  {
    value = 'en',
    onChange,
    locales = DEFAULT_LOCALES,
    className,
    ...props
  },
  ref,
) {
  return (
    <Select
      ref={ref}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn('b-locale-picker', className)}
      {...props}
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag ? `${l.flag} ${l.label}` : l.label}
        </option>
      ))}
    </Select>
  );
});
