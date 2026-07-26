"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export interface SaveBarProps extends HTMLAttributes<HTMLDivElement> {
  dirty?: boolean;
  open?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  saveLabel?: string;
  discardLabel?: string;
  message?: ReactNode;
  loading?: boolean;
}

export const SaveBar = forwardRef<HTMLDivElement, SaveBarProps>(function SaveBar(
  {
    dirty = false,
    open,
    onSave,
    onDiscard,
    saveLabel = 'Save changes',
    discardLabel = 'Discard',
    message = 'Unsaved changes',
    loading = false,
    className,
    style,
    ...props
  },
  ref,
) {
  const isVisible = open !== undefined ? open : dirty;

  return (
    <div
      ref={ref}
      className={cn('p-save-bar', isVisible && 'dirty', className)}
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: 'var(--ink, #18181b)',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        zIndex: 1050,
        maxWidth: '90vw',
        pointerEvents: isVisible ? 'auto' : 'none',
        ...style,
      }}
      {...props}
    >
      <span className="label" style={{ font: '500 14px/1.2 var(--font-sans, sans-serif)' }}>
        {message}
      </span>
      <div className="actions" style={{ display: 'flex', gap: 8 }}>
        {onDiscard && (
          <Button variant="secondary" size="sm" onClick={onDiscard} disabled={loading}>
            {discardLabel}
          </Button>
        )}
        {onSave && (
          <Button variant="primary" size="sm" onClick={onSave} loading={loading}>
            {saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
});
