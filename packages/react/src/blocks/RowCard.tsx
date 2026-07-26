"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface RowCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}

export const RowCard = forwardRef<HTMLDivElement, RowCardProps>(function RowCard(
  { icon, title, subtitle, status, action, onClick, selected, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn('b-row-card', selected && 'selected', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: selected ? 'var(--brand-soft, #eff6ff)' : 'var(--surface, #ffffff)',
        border: `1px solid ${selected ? 'var(--brand, #0B5DF0)' : 'var(--border, #e5e7eb)'}`,
        borderRadius: 10,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        gap: 12,
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        {icon && <span style={{ flexShrink: 0, display: 'inline-flex' }}>{icon}</span>}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="b-row-card-title"
            style={{
              font: '500 14px/1.3 var(--font-sans, sans-serif)',
              color: 'var(--text-strong, #111827)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className="b-row-card-sub"
              style={{
                font: 'var(--type-body-sm)',
                color: 'var(--text-muted, #6b7280)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {status}
        {action}
      </div>
    </div>
  );
});
