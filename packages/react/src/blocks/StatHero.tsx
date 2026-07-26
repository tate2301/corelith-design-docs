"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface StatHeroProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  change?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export const StatHero = forwardRef<HTMLDivElement, StatHeroProps>(function StatHero(
  { label, value, change, trend = 'neutral', subtitle, action, children, className, style, ...props },
  ref,
) {
  const trendColor =
    trend === 'up'
      ? 'var(--tone-success, #10b981)'
      : trend === 'down'
      ? 'var(--tone-danger, #ef4444)'
      : 'var(--text-muted, #6b7280)';

  return (
    <div
      ref={ref}
      className={cn('b-stat-hero', className)}
      style={{
        padding: '24px',
        backgroundColor: 'var(--surface-muted, #f8fafc)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ font: '500 13px/1.2 var(--font-sans, sans-serif)', color: 'var(--text-muted, #64748b)' }}>
            {label}
          </div>
          <div
            style={{
              font: '700 32px/1.1 var(--font-sans, sans-serif)',
              color: 'var(--text-strong, #0f172a)',
              marginTop: 4,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {(change || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--type-body-sm)' }}>
          {change && (
            <span
              style={{
                color: trendColor,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--text-muted, #64748b)' }}>{subtitle}</span>}
        </div>
      )}

      {children && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 16,
            borderTop: '1px solid var(--border, #e2e8f0)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
});
