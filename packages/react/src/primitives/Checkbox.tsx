"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Optional label displayed to the right of the checkbox. */
  label?: ReactNode;
  /** Render the box in an indeterminate "tri-state" visual. */
  indeterminate?: boolean;
  /** Optional className applied to the wrapping `<label>` element when `label` is set. */
  wrapperClassName?: string;
}

/**
 * Checkbox — styled native checkbox.
 * Maps to the `.check` class in components.css; when paired with a label, the
 * wrapping element gets `.check-row` for tight inline alignment.
 *
 * Supports both controlled (`checked` + `onChange`) and uncontrolled
 * (`defaultChecked`) usage. `indeterminate` is applied via the DOM property
 * since HTML has no `indeterminate` attribute.
 *
 * Accessibility: relies on the native checkbox role and the surrounding
 * `<label>` for click-to-toggle.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    indeterminate,
    wrapperClassName,
    className,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `checkbox-${autoId}`;
  const innerRef = useRef<HTMLInputElement | null>(null);

  // Mirror the indeterminate visual to the underlying DOM node every render
  // so it stays in sync when callers toggle the prop.
  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  const setRef = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
  };

  const input = (
    <input
      ref={setRef}
      id={inputId}
      type="checkbox"
      className={cn('check', className)}
      aria-checked={indeterminate ? 'mixed' : undefined}
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
