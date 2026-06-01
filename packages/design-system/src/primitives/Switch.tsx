import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Optional label displayed to the right of the switch. */
  label?: ReactNode;
  /** Optional className applied to the wrapping `<label>` element when `label` is set. */
  wrapperClassName?: string;
}

/**
 * Switch — toggle control built on a native checkbox.
 * Maps to the `.switch` class in components.css.
 *
 * Accessibility: the underlying `<input type="checkbox">` is given
 * `role="switch"` so assistive tech announces it as a two-state toggle rather
 * than a checkbox. Pairs cleanly with `aria-label` when no visible label is
 * provided, or with the `label` prop for an inline `.check-row` layout.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    wrapperClassName,
    className,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `switch-${autoId}`;

  const input = (
    <input
      ref={ref}
      id={inputId}
      type="checkbox"
      role="switch"
      className={cn('switch', className)}
      {...rest}
    />
  );

  if (label === undefined || label === null) {
    return input;
  }

  return (
    <label className={cn('check-row', wrapperClassName)} htmlFor={inputId}>
      {input}
      <span>{label}</span>
    </label>
  );
});
