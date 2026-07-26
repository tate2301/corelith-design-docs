"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface RoleOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface RoleSwitcherProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: T;
  options?: RoleOption<T>[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleSwitcher = forwardRef<HTMLDivElement, RoleSwitcherProps>(function RoleSwitcher(
  { value, options = [], onChange, size = 'md', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="Role selector"
      className={cn('segmented-control', 'p-role-switcher', size, className)}
      style={{
        display: 'inline-flex',
        padding: 2,
        backgroundColor: 'var(--surface-muted, #f3f4f6)',
        borderRadius: 8,
        border: '1px solid var(--border, #e5e7eb)',
      }}
      {...props}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            style={{
              padding: size === 'sm' ? '4px 10px' : size === 'lg' ? '8px 18px' : '6px 14px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: isSelected ? 'var(--surface, #ffffff)' : 'transparent',
              color: isSelected ? 'var(--text-strong, #111827)' : 'var(--text-muted, #6b7280)',
              font: '500 13px/1 var(--font-sans, sans-serif)',
              boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}) as <T extends string = string>(
  props: RoleSwitcherProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
