"use client";

import {
  useEffect,
  useRef,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Grabber } from '../primitives/Grabber';

export interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  className,
  ...props
}: BottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="x-bottom-sheet-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Bottom sheet'}
        className={cn('x-bottom-sheet', className)}
        style={{
          position: 'relative',
          backgroundColor: 'var(--surface, #ffffff)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg, 0 -4px 20px rgba(0,0,0,0.15))',
          zIndex: 1101,
          overflow: 'hidden',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        {...props}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <Grabber label="Drag sheet" />
        </div>
        {(title || description) && (
          <BottomSheetHeader title={title} description={description} onClose={onClose} />
        )}
        <BottomSheetBody>{children}</BottomSheetBody>
        {footer && <BottomSheetFooter>{footer}</BottomSheetFooter>}
      </div>
    </div>,
    document.body,
  );
}

export interface BottomSheetHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  onClose?: () => void;
}

export const BottomSheetHeader = forwardRef<HTMLDivElement, BottomSheetHeaderProps>(
  function BottomSheetHeader({ title, description, onClose, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('x-bottom-sheet-header', className)}
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border, #e5e7eb)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
        {...props}
      >
        <div>
          {title && <h3 style={{ margin: 0, font: '600 16px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>{title}</h3>}
          {description && <p style={{ margin: '4px 0 0', font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{description}</p>}
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              font: '20px/1 sans-serif',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  },
);

export const BottomSheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function BottomSheetBody({ children, className, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('x-bottom-sheet-body', className)}
        style={{ padding: '20px', overflowY: 'auto', flex: 1, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const BottomSheetFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function BottomSheetFooter({ children, className, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('x-bottom-sheet-footer', className)}
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border, #e5e7eb)',
          backgroundColor: 'var(--surface-muted, #f9fafb)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Object.assign(BottomSheet, {
  Header: BottomSheetHeader,
  Body: BottomSheetBody,
  Footer: BottomSheetFooter,
});
