import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useFieldContext } from '../Field/Field';
import './TextArea.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, id, invalid, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, ...rest },
  ref,
) {
  const field = useFieldContext();
  const resolvedId = id ?? field?.inputId;
  const resolvedDescribedBy = ariaDescribedBy ?? field?.describedBy;
  const resolvedInvalid = ariaInvalid ?? invalid ?? field?.invalid ?? undefined;
  return (
    <textarea
      ref={ref}
      id={resolvedId}
      className={cx('textarea', resolvedInvalid && 'is-invalid', className)}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      {...rest}
    />
  );
});
