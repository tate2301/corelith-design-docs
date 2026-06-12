import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import './SegmentedControl.css';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Props for `SegmentedControl`.
 *
 * Controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes
 * are both supported. `onChange` receives the next value; for callers that
 * need the originating click event the optional `event` arg is also passed.
 *
 * Sizes: `'sm' | 'md'`.
 */
export interface SegmentedControlProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Selected value (controlled). */
  value?: T;
  /** Initial selected value (uncontrolled). */
  defaultValue?: T;
  /** Value-first change handler. */
  onChange?: (value: T, event?: ReactMouseEvent<HTMLButtonElement>) => void;
  options: SegmentedControlOption<T>[];
  ariaLabel?: string;
  size?: 'sm' | 'md';
}

/**
 * SegmentedControl — radio-group styled as connected buttons.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   defaultValue="day"
 *   options={[
 *     { value: 'day', label: 'Day' },
 *     { value: 'week', label: 'Week' },
 *   ]}
 *   ariaLabel="View granularity"
 * />
 * ```
 */
function SegmentedControlInner<T extends string>(
  {
    value,
    defaultValue,
    onChange,
    options,
    ariaLabel,
    size = 'md',
    className,
    ...rest
  }: SegmentedControlProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx('segmented-control', size === 'sm' && 'sm', className)}
      {...rest}
    >
      {options.map((opt) => {
        const active = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            className={cx('segmented-control-item', active && 'active')}
            onClick={() => {
              if (!isControlled) setInternal(opt.value);
              onChange?.(opt.value);
            }}
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
