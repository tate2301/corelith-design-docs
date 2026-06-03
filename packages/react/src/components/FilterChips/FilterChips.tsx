import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './FilterChips.css';

export interface FilterChipOption<T extends string = string> {
  value: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface FilterChipsProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'role'> {
  value: T;
  onChange: (value: T) => void;
  options: FilterChipOption<T>[];
  /** ARIA role for the group. Default 'radiogroup'. */
  role?: 'radiogroup' | 'tablist' | 'group';
  ariaLabel?: string;
}

function FilterChipsInner<T extends string>(
  { value, onChange, options, role = 'radiogroup', ariaLabel, className, ...rest }: FilterChipsProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const childRole = role === 'tablist' ? 'tab' : role === 'radiogroup' ? 'radio' : 'button';
  return (
    <div ref={ref} role={role} aria-label={ariaLabel} className={cx('b-filter-chips', className)} {...rest}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role={childRole}
            aria-checked={role === 'radiogroup' ? selected : undefined}
            aria-selected={role === 'tablist' ? selected : undefined}
            aria-pressed={role === 'group' ? selected : undefined}
            disabled={opt.disabled}
            className={cx('b-fc', selected && 'is-selected')}
            onClick={() => onChange(opt.value)}
          >
            <span className="b-fc-label">{opt.label}</span>
            {opt.count != null ? <span className="b-fc-count">{opt.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export const FilterChips = forwardRef(FilterChipsInner) as <T extends string = string>(
  props: FilterChipsProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
