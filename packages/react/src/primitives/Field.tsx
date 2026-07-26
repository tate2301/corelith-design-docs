"use client";

import {
  createContext,
  useContext,
  useId,
  forwardRef,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface FieldContextValue {
  id: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  errorId?: string;
  descriptionId?: string;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  return useContext(FieldContext);
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  children?: ReactNode;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    id: idProp,
    invalid,
    required,
    disabled,
    label,
    description,
    error,
    children,
    className,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp || generatedId;
  const descriptionId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-err` : undefined;

  const contextValue: FieldContextValue = {
    id,
    invalid: Boolean(invalid || error),
    required,
    disabled,
    errorId,
    descriptionId,
  };

  return (
    <FieldContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn('p-field', (invalid || error) && 'invalid', disabled && 'disabled', className)}
        {...props}
      >
        {label && <FieldLabel>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
        {children}
        {error && <FieldError>{error}</FieldError>}
      </div>
    </FieldContext.Provider>
  );
});

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(function FieldLabel(
  { children, className, htmlFor: htmlForProp, ...props },
  ref,
) {
  const ctx = useFieldContext();
  const htmlFor = htmlForProp || ctx?.id;

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn('p-field-label', className)}
      {...props}
    >
      {children}
      {ctx?.required ? <span aria-hidden="true" style={{ color: 'var(--tone-danger)', marginLeft: 4 }}>*</span> : null}
    </label>
  );
});

export interface FieldDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const FieldDescription = forwardRef<HTMLDivElement, FieldDescriptionProps>(
  function FieldDescription({ children, className, id: idProp, ...props }, ref) {
    const ctx = useFieldContext();
    const id = idProp || ctx?.descriptionId;

    return (
      <div
        ref={ref}
        id={id}
        className={cn('p-field-description', className)}
        style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginBottom: 4 }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export interface FieldErrorProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(function FieldError(
  { children, className, id: idProp, ...props },
  ref,
) {
  const ctx = useFieldContext();
  const id = idProp || ctx?.errorId;

  return (
    <div
      ref={ref}
      id={id}
      role="alert"
      className={cn('p-field-error', className)}
      style={{ font: 'var(--type-body-sm)', color: 'var(--tone-danger)', marginTop: 4 }}
      {...props}
    >
      {children}
    </div>
  );
});

Object.assign(Field, {
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
});
