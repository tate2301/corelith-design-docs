"use client";

import {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { useFieldContext } from './Field';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    hint,
    error,
    wrapperClassName,
    className,
    id: idProp,
    disabled: disabledProp,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    style,
    ...rest
  },
  ref,
) {
  const ctx = useFieldContext();
  const autoId = useId();
  const textareaId = idProp ?? ctx?.id ?? `textarea-${autoId}`;
  const disabled = disabledProp ?? ctx?.disabled;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : ctx?.errorId;
  const descriptionId = ctx?.descriptionId;
  const describedBy = [ariaDescribedBy, errorId, hintId, descriptionId].filter(Boolean).join(' ') || undefined;

  const textareaEl = (
    <textarea
      ref={ref}
      id={textareaId}
      className={cn('input', 'p-textarea', className)}
      disabled={disabled}
      aria-invalid={ariaInvalid ?? (error ? true : ctx?.invalid ? true : undefined)}
      aria-describedby={describedBy}
      style={{ minHeight: 80, resize: 'vertical', ...style }}
      {...rest}
    />
  );

  if (!label && !hint && !error) {
    return textareaEl;
  }

  return (
    <div className={cn('field', wrapperClassName)}>
      {label ? (
        <label className="field-label" htmlFor={textareaId}>
          {label}
        </label>
      ) : null}
      {textareaEl}
      {error ? (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      ) : hint ? (
        <span className="field-help" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
});
