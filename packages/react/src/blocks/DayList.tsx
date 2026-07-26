"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface DayListItem {
  date: ReactNode;
  label: ReactNode;
  value: ReactNode;
  tone?: 'up' | 'down' | 'neutral';
}

export interface DayListProps extends HTMLAttributes<HTMLDivElement> {
  items: DayListItem[];
}

export const DayList = forwardRef<HTMLDivElement, DayListProps>(function DayList(
  { items = [], className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('b-day-list', className)}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}
      {...props}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="b-day-list-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--surface, #ffffff)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: 8,
            font: 'var(--type-body-sm)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ font: '500 12px/1 var(--font-mono, monospace)', color: 'var(--text-subtle)' }}>
              {item.date}
            </span>
            <span style={{ font: '500 13px/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>
              {item.label}
            </span>
          </div>
          <span
            style={{
              fontWeight: 600,
              color:
                item.tone === 'up'
                  ? 'var(--tone-success, #10b981)'
                  : item.tone === 'down'
                  ? 'var(--tone-danger, #ef4444)'
                  : 'var(--text-strong)',
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
});
