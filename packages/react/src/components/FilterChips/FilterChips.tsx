import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import './FilterChips.css';

export interface FilterChipOption<T extends string = string> {
  value: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

/**
 * Props for `FilterChips`.
 *
 * Supports controlled (`value` + `onChange`) and uncontrolled (`defaultValue`)
 * usage.
 */
export interface FilterChipsProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'role'> {
  /** Selected value (controlled). */
  value?: T;
  /** Initial selected value (uncontrolled). */
  defaultValue?: T;
  /** Value-first change handler. */
  onChange?: (value: T, event?: ReactMouseEvent<HTMLButtonElement>) => void;
  options: FilterChipOption<T>[];
  /** ARIA role for the group. Default 'radiogroup'. */
  role?: 'radiogroup' | 'tablist' | 'group';
  ariaLabel?: string;
}

/**
 * FilterChips — a one-of-N chip group, commonly used for quick filters.
 *
 * @example
 * ```tsx
 * <FilterChips
 *   defaultValue="all"
 *   options={[
 *     { value: 'all', label: 'All' },
 *     { value: 'open', label: 'Open', count: 12 },
 *   ]}
 *   ariaLabel="Status filter"
 * />
 * ```
 */
function FilterChipsInner<T extends string>(
  {
    value,
    defaultValue,
    onChange,
    options,
    role = 'radiogroup',
    ariaLabel,
    className,
    ...rest
  }: FilterChipsProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const childRole = role === 'tablist' ? 'tab' : role === 'radiogroup' ? 'radio' : 'button';
  return (
    <div ref={ref} role={role} aria-label={ariaLabel} className={cx('b-filter-chips', className)} {...rest}>
      {options.map((opt) => {
        const selected = opt.value === current;
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
            onClick={() => {
              if (!isControlled) setInternal(opt.value);
              onChange?.(opt.value);
            }}
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
