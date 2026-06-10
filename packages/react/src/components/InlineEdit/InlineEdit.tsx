import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../utils/cx';
import './InlineEdit.css';

export interface InlineEditProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  value: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** When true, render the input from the start. */
  editing?: boolean;
}

/**
 * InlineEdit — click-to-edit value display.
 *
 * @example
 * ```tsx
 * <InlineEdit />
 * ```
 */
export const InlineEdit = forwardRef<HTMLSpanElement, InlineEditProps>(function InlineEdit(
  { value, onSave, onCancel, placeholder, disabled, editing: controlledEditing, className, ...rest },
  ref,
) {
  const [editing, setEditing] = useState<boolean>(controlledEditing ?? false);
  const [draft, setDraft] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (controlledEditing !== undefined) setEditing(controlledEditing);
  }, [controlledEditing]);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave?.(draft);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(value);
    onCancel?.();
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  if (editing) {
    return (
      <span ref={ref} className={cx('p-inline-edit', 'editing', className)} {...rest}>
        <input
          ref={inputRef}
          className="p-inline-edit-input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
        />
      </span>
    );
  }
  return (
    <span
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={cx('p-inline-edit', disabled && 'disabled', className)}
      onClick={() => !disabled && setEditing(true)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setEditing(true);
        }
      }}
      {...rest}
    >
      {value || <span className="p-inline-edit-placeholder">{placeholder}</span>}
    </span>
  );
});
