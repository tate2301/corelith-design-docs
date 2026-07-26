"use client";

import { forwardRef, type FormHTMLAttributes, type FormEvent } from 'react';
import { cn } from '../utils/cn';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Prevent default submission behavior when true. @default false */
  preventDefault?: boolean;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { preventDefault = false, onSubmit, className, children, noValidate = true, ...props },
  ref,
) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
