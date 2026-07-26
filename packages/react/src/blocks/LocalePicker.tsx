"use client";

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Select } from '../primitives/Select';

export interface LocaleOption {
  code: string;
  label: string;
  flag?: string;
}

export interface LocalePickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
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
      options={locales.map((l) => ({
        value: l.code,
        label: l.flag ? `${l.flag} ${l.label}` : l.label,
      }))}
      className={cn('b-locale-picker', className)}
      {...props}
    />
  );
});
