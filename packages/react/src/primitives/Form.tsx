"use client";

import { forwardRef, type FormHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Prevent default submission behavior when true. @default false */
  preventDefault?: boolean;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { preventDefault = false, onSubmit, className, children, noValidate = true, ...props },
  ref,
) {
  // Parameter type is taken from React's own `onSubmit` rather than written out:
  // React 19 narrowed it from FormEvent to SubmitEvent, and hard-coding either
  // one breaks against the other set of types.
  const handleSubmit: NonNullable<FormProps['onSubmit']> = (e) => {
    if (preventDefault) {
      e.preventDefault();
    }
    onSubmit?.(e);
  };

  return (
    <form
      ref={ref}
      noValidate={noValidate}
      onSubmit={handleSubmit}
      className={cn('p-form', className)}
      {...props}
    >
      {children}
    </form>
  );
});
