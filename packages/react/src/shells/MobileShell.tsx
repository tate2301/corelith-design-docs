"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface MobileShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const MobileShell = forwardRef<HTMLDivElement, MobileShellProps>(function MobileShell(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('x-mobile-shell', className)}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--canvas, #f8fafc)',
        position: 'relative',
        paddingBottom: 56, // height of bottom tabs
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export interface MobileShellHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  children?: ReactNode;
}

export const MobileShellHeader = forwardRef<HTMLDivElement, MobileShellHeaderProps>(
  function MobileShellHeader({ title, leftAction, rightAction, children, className, style, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={cn('x-mobile-shell-header', className)}
        style={{
          height: 48,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          backgroundColor: 'var(--surface, #ffffff)',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          ...style,
        }}
        {...props}
      >
        <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>{leftAction}</div>
        <div
          style={{
            font: '600 15px/1.2 var(--font-sans)',
            color: 'var(--text-strong)',
            textAlign: 'center',
            flex: 1,
          }}
        >
          {title || children}
        </div>
        <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {rightAction}
        </div>
      </header>
    );
  },
);

export interface MobileShellBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const MobileShellBody = forwardRef<HTMLDivElement, MobileShellBodyProps>(function MobileShellBody(
  { children, className, style, ...props },
  ref,
) {
  return (
    <main
      ref={ref}
      className={cn('x-mobile-shell-body', className)}
      style={{ flex: 1, padding: 16, overflowY: 'auto', ...style }}
      {...props}
    >
      {children}
    </main>
  );
});

Object.assign(MobileShell, {
  Header: MobileShellHeader,
  Body: MobileShellBody,
});
