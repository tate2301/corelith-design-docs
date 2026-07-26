"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cn } from '../utils/cn';

export interface InlineEditProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const InlineEdit = forwardRef<HTMLDivElement, InlineEditProps>(function InlineEdit(
  { value, onSave, placeholder = 'Click to edit', disabled = false, className, style, ...props },
  ref,
) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    if (!editing) return;
    setEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={cn('input', 'p-inline-edit', className)}
        style={{ height: 32, padding: '2px 8px', ...style }}
      />
    );
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && setEditing(true)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setEditing(true);
        }
      }}
      className={cn('p-inline-edit-view', disabled && 'disabled', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px transparent solid',
        font: 'inherit',
        color: value ? 'inherit' : 'var(--text-subtle, #9ca3af)',
        ...style,
      }}
      {...props}
    >
      {value || placeholder}
    </div>
  );
});
