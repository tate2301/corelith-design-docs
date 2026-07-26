"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Checkbox } from '../primitives/Checkbox';

export interface ChecklistItemProps extends HTMLAttributes<HTMLDivElement> {
  done?: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  onToggle?: (done: boolean) => void;
  action?: ReactNode;
}

export const ChecklistItem = forwardRef<HTMLDivElement, ChecklistItemProps>(function ChecklistItem(
  { done = false, title, subtitle, onToggle, action, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('b-checklist-item', done && 'done', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: 8,
        gap: 12,
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
        <Checkbox
          checked={done}
          onChange={(e) => onToggle?.(e.target.checked)}
          style={{ marginTop: 2 }}
        />
        <div>
          <div
            style={{
              font: '500 14px/1.3 var(--font-sans)',
              color: done ? 'var(--text-muted)' : 'var(--text-strong)',
              textDecoration: done ? 'line-through' : 'none',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-subtle)', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
});

export interface ChecklistProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  progress?: { completed: number; total: number };
}

export const Checklist = forwardRef<HTMLDivElement, ChecklistProps>(function Checklist(
  { children, progress, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('b-checklist', className)}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}
      {...props}
    >
      {progress && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
            font: '500 12px/1 var(--font-sans)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Progress</span>
          <span>
            {progress.completed} of {progress.total} completed
          </span>
        </div>
      )}
      {children}
    </div>
  );
});

Object.assign(Checklist, {
  Item: ChecklistItem,
});
