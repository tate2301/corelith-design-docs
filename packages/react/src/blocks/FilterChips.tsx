"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface FilterChipOption<T extends string = string> {
  value: T;
  label: ReactNode;
  count?: number;
}

export interface FilterChipsProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: T | T[];
  options?: FilterChipOption<T>[];
  onChange?: (value: T | T[]) => void;
  multiple?: boolean;
}

export const FilterChips = forwardRef<HTMLDivElement, FilterChipsProps>(function FilterChips(
  { value, options = [], onChange, multiple = false, className, style, ...props },
  ref,
) {
  const handleSelect = (val: any) => {
    if (!onChange) return;
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.includes(val)) {
        onChange(arr.filter((v) => v !== val));
      } else {
        onChange([...arr, val]);
      }
    } else {
      onChange(val);
    }
  };

  return (
    <div
      ref={ref}
      className={cn('b-filter-chips', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        padding: '4px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ...style,
      }}
      {...props}
    >
      {options.map((opt) => {
        const isSelected = multiple
          ? Array.isArray(value) && value.includes(opt.value)
          : value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            className={cn('p-chip', isSelected && 'selected')}
            onClick={() => handleSelect(opt.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 9999,
              border: `1px solid ${isSelected ? 'var(--brand, #0B5DF0)' : 'var(--border, #e5e7eb)'}`,
              backgroundColor: isSelected ? 'var(--brand-soft, #eff6ff)' : 'var(--surface, #ffffff)',
              color: isSelected ? 'var(--brand-strong, #1d4ed8)' : 'var(--text-strong, #111827)',
              font: '500 13px/1 var(--font-sans, sans-serif)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: 0.7,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '2px 6px',
                  borderRadius: 9999,
                }}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}) as <T extends string = string>(
  props: FilterChipsProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
