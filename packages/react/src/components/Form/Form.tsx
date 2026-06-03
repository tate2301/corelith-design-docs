import { forwardRef, type FormHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import './Form.css';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Submit on Enter (default true). Set false to require explicit submit click. */
  submitOnEnter?: boolean;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { className, submitOnEnter = true, onKeyDown, noValidate = true, ...rest },
  ref,
) {
  return (
    <form
      ref={ref}
      className={cx('form', className)}
      noValidate={noValidate}
      onKeyDown={(e) => {
        if (!submitOnEnter && e.key === 'Enter' && e.target instanceof HTMLInputElement) {
          e.preventDefault();
        }
        onKeyDown?.(e);
      }}
      {...rest}
    />
  );
});
