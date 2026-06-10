import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import './Field.css';

interface FieldContextValue {
  inputId: string;
  descId?: string;
  errorId?: string;
  invalid: boolean;
  describedBy?: string;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

type FieldComponent = ((props: FieldProps & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement) & {
  Label: typeof FieldLabel;
  Description: typeof FieldDescription;
  Error: typeof FieldError;
};

const FieldRoot = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, description, error, required, className, children, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = `huchu-field-${reactId}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const errorId = error ? `${inputId}-err` : undefined;
  const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

  const ctx = useMemo<FieldContextValue>(
    () => ({ inputId, descId, errorId, invalid: Boolean(error), describedBy }),
    [inputId, descId, errorId, error, describedBy],
  );

  return (
    <FieldContext.Provider value={ctx}>
      <div ref={ref} className={cx('field', error && 'has-error', className)} {...rest}>
        {label != null ? (
          <FieldLabel htmlFor={inputId}>
            {label}
            {required ? <span className="field-required" aria-hidden="true"> *</span> : null}
          </FieldLabel>
        ) : null}
        {children}
        {description ? (
          <FieldDescription id={descId}>{description}</FieldDescription>
        ) : null}
        {error ? (
          <FieldError id={errorId}>{error}</FieldError>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
});

function FieldLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  const { className, ...rest } = props;
  return <label className={cx('field-label', className)} {...rest} />;
}

function FieldDescription(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cx('field-desc', className)} {...rest} />;
}

function FieldError(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div role="alert" className={cx('field-error', className)} {...rest} />;
}

/**
 * Field — label + control + help/error wrapper.
 *
 * @example
 * ```tsx
 * <Field />
 * ```
 */
export const Field = FieldRoot as unknown as FieldComponent;
Field.Label = FieldLabel;
Field.Description = FieldDescription;
Field.Error = FieldError;
