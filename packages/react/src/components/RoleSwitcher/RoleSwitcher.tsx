import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export interface RoleSwitcherOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

/**
 * Props for `RoleSwitcher`. Supports controlled (`value` + `onChange`) and
 * uncontrolled (`defaultValue`) modes.
 */
export interface RoleSwitcherProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Selected role (controlled). */
  value?: T;
  /** Initial selected role (uncontrolled). */
  defaultValue?: T;
  /** Value-first change handler. */
  onChange?: (value: T, event?: ReactMouseEvent<HTMLButtonElement>) => void;
  options: RoleSwitcherOption<T>[];
  ariaLabel?: string;
}

/**
 * RoleSwitcher — toggle between user roles (e.g. "Driver" / "Admin").
 *
 * @example
 * ```tsx
 * <RoleSwitcher
 *   defaultValue="driver"
 *   options={[
 *     { value: 'driver', label: 'Driver' },
 *     { value: 'admin', label: 'Admin' },
 *   ]}
 * />
 * ```
 */
function RoleSwitcherInner<T extends string>(
  {
    value,
    defaultValue,
    onChange,
    options,
    ariaLabel,
    className,
    ...rest
  }: RoleSwitcherProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cx('p-role-switcher', className)}
      {...rest}
    >
      {options.map((opt) => {
        const pressed = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={pressed}
            disabled={opt.disabled}
            onClick={() => {
              if (!isControlled) setInternal(opt.value);
              onChange?.(opt.value);
            }}
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
