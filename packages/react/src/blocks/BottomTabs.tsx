"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface BottomTabItemProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
  label: ReactNode;
  badge?: ReactNode;
}

export const BottomTabItem = forwardRef<HTMLButtonElement, BottomTabItemProps>(function BottomTabItem(
  { active, icon, label, badge, className, style, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn('b-bottom-tab-item', active && 'active', className)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: '6px 0 8px',
        border: 'none',
        backgroundColor: 'transparent',
        color: active ? 'var(--brand, #0B5DF0)' : 'var(--text-muted, #6b7280)',
        font: '500 11px/1 var(--font-sans, sans-serif)',
        position: 'relative',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ fontSize: 18, position: 'relative' }}>
        {icon}
        {badge && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -6,
              fontSize: 10,
              padding: '1px 4px',
              borderRadius: 9999,
              backgroundColor: 'var(--tone-danger, #ef4444)',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            {badge}
          </span>
        )}
      </span>}
      <span>{label}</span>
    </button>
  );
});

export interface BottomTabsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const BottomTabs = forwardRef<HTMLDivElement, BottomTabsProps>(function BottomTabs(
  { children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('b-bottom-tabs', className)}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: 'var(--surface, #ffffff)',
        borderTop: '1px solid var(--border, #e5e7eb)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

Object.assign(BottomTabs, {
  Item: BottomTabItem,
});
