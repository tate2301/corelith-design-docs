"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface AuthShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const AuthShell = forwardRef<HTMLDivElement, AuthShellProps>(function AuthShell(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('x-auth-shell', className)}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: 'var(--canvas, #f8fafc)',
        ...style,
      }}
      {...props}
    >
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {children}
      </div>
    </div>
  );
});

export interface AuthShellBrandProps extends HTMLAttributes<HTMLDivElement> {
  product?: ReactNode;
  logo?: ReactNode;
}

export const AuthShellBrand = forwardRef<HTMLDivElement, AuthShellBrandProps>(function AuthShellBrand(
  { product = 'Corelith', logo, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('x-auth-brand', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        font: '700 20px/1 var(--font-sans)',
        color: 'var(--brand, #0B5DF0)',
        ...style,
      }}
      {...props}
    >
      {logo}
      <span>{product}</span>
    </div>
  );
});

export interface AuthShellCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

export const AuthShellCard = forwardRef<HTMLDivElement, AuthShellCardProps>(function AuthShellCard(
  { title, subtitle, children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('x-auth-card', className)}
      style={{
        backgroundColor: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 16,
        padding: '32px 24px',
        boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.05))',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        ...style,
      }}
      {...props}
    >
      {(title || subtitle) && (
        <div style={{ textAlign: 'center' }}>
          {title && (
            <h1 style={{ margin: 0, font: '600 20px/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{ margin: '6px 0 0', font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
});

export interface AuthShellFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const AuthShellFooter = forwardRef<HTMLDivElement, AuthShellFooterProps>(function AuthShellFooter(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('x-auth-footer', className)}
      style={{
        textAlign: 'center',
        font: 'var(--type-body-sm)',
        color: 'var(--text-muted)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

Object.assign(AuthShell, {
  Brand: AuthShellBrand,
  Card: AuthShellCard,
  Footer: AuthShellFooter,
});
