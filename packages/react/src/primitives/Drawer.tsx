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

export type DrawerPosition = 'right' | 'left' | 'top' | 'bottom';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  width?: string | number;
}

export function Drawer({
  open,
  onClose,
  position = 'right',
  title,
  description,
  footer,
  children,
  width = 400,
  className,
  ...props
}: DrawerProps) {
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
      className="p-drawer-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1100,
        display: 'flex',
        justifyContent: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
        alignItems: position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'stretch',
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Drawer'}
        className={cn('drawer', `drawer-${position}`, 'p-drawer', `p-drawer-${position}`, className)}
        style={{
          position: 'relative',
          backgroundColor: 'var(--surface, #fff)',
          width: position === 'left' || position === 'right' ? width : '100%',
          maxWidth: '100vw',
          height: position === 'top' || position === 'bottom' ? 'auto' : '100%',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.15))',
          zIndex: 1101,
          overflow: 'hidden',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        {...props}
      >
        {(title || description) && (
          <DrawerHeader title={title} description={description} onClose={onClose} />
        )}
        <DrawerBody>{children}</DrawerBody>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </div>
    </div>,
    document.body,
  );
}

export interface DrawerHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
}

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(function DrawerHeader(
  { title, description, onClose, children, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('drawer-h', 'p-drawer-header', className)}
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border, #e5e7eb)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
      {...props}
    >
      <div>
        {title && <h3 style={{ margin: 0, font: '600 16px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>{title}</h3>}
        {description && <p style={{ margin: '4px 0 0', font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{description}</p>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Close drawer"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            font: '20px/1 sans-serif',
            color: 'var(--text-subtle)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
});

export const DrawerBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DrawerBody(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('drawer-body', 'p-drawer-body', className)}
      style={{
        padding: '20px',
        flex: 1,
        overflowY: 'auto',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export const DrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DrawerFooter(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('drawer-foot', 'p-drawer-footer', className)}
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
});

Object.assign(Drawer, {
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
});
