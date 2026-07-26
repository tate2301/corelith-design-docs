"use client";

import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="menu"
      className={cn('p-menu', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 160,
        padding: '4px 0',
        backgroundColor: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: 8,
        boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  destructive?: boolean;
  active?: boolean;
  children?: ReactNode;
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { icon, destructive, active, children, className, style, onClick, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      role="menuitem"
      type="button"
      className={cn('p-menu-item', active && 'active', destructive && 'destructive', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '6px 12px',
        border: 'none',
        backgroundColor: active ? 'var(--surface-muted, #f3f4f6)' : 'transparent',
        color: destructive ? 'var(--tone-danger, #ef4444)' : 'var(--text-strong, #111827)',
        font: '500 13px/1.2 var(--font-sans, sans-serif)',
        textAlign: 'left',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
    </button>
  );
});

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(function MenuLabel(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('p-menu-label', className)}
      style={{
        padding: '6px 12px 2px',
        font: '600 10px/1 var(--font-mono, monospace)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-subtle, #9ca3af)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export interface MenuDividerProps extends HTMLAttributes<HTMLDivElement> {}

export const MenuDivider = forwardRef<HTMLDivElement, MenuDividerProps>(function MenuDivider(
  { className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      className={cn('p-menu-divider', className)}
      style={{
        height: 1,
        backgroundColor: 'var(--border, #e5e7eb)',
        margin: '4px 0',
        ...style,
      }}
      {...props}
    />
  );
});

export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      className={cn('p-menu-group', className)}
      style={{ display: 'flex', flexDirection: 'column', ...style }}
      {...props}
    >
      {children}
    </div>
  );
});

Object.assign(Menu, {
  Item: MenuItem,
  Label: MenuLabel,
  Divider: MenuDivider,
  Group: MenuGroup,
});
