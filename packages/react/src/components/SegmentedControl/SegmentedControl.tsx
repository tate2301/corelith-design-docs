import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './SegmentedControl.css';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: T;
  onChange?: (value: T) => void;
  options: SegmentedControlOption<T>[];
  ariaLabel?: string;
  size?: 'sm' | 'md';
}

function SegmentedControlInner<T extends string>(
  { value, onChange, options, ariaLabel, size = 'md', className, ...rest }: SegmentedControlProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx('segmented-control', size === 'sm' && 'sm', className)}
      {...rest}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            className={cx('segmented-control-item', active && 'active')}
            onClick={() => onChange?.(opt.value)}
          >
            {opt.icon ? <span className="sc-ic" aria-hidden="true">{opt.icon}</span> : null}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const SegmentedControl = forwardRef(SegmentedControlInner) as <T extends string = string>(
  props: SegmentedControlProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
