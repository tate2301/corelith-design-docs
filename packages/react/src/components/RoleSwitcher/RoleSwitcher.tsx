import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface RoleSwitcherOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface RoleSwitcherProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: T;
  onChange: (value: T) => void;
  options: RoleSwitcherOption<T>[];
  ariaLabel?: string;
}

function RoleSwitcherInner<T extends string>(
  { value, onChange, options, ariaLabel, className, ...rest }: RoleSwitcherProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cx('p-role-switcher', className)}
      {...rest}
    >
      {options.map((opt) => {
        const pressed = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={pressed}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const RoleSwitcher = forwardRef(RoleSwitcherInner) as <T extends string = string>(
  props: RoleSwitcherProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
