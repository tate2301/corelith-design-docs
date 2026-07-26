"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  current?: number;
  total?: number;
  steps?: StepItem[];
  onChange?: (step: number) => void;
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { current = 1, total, steps, onChange, className, ...props },
  ref,
) {
  const stepList: StepItem[] = steps
    ? steps
    : Array.from({ length: total ?? 3 }, (_, i) => ({
        title: `Step ${i + 1}`,
      }));

  return (
    <div
      ref={ref}
      role="navigation"
      aria-label="Progress steps"
      className={cn('p-stepper', className)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}
      {...props}
    >
      {stepList.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;

        return (
          <div
            key={idx}
            className={cn('p-stepper-step', isActive && 'active', isDone && 'done')}
            onClick={() => onChange?.(stepNum)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: onChange ? 'pointer' : 'default',
              flex: 1,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: '600 12px/1 var(--font-mono, monospace)',
                backgroundColor: isDone
                  ? 'var(--tone-success, #10b981)'
                  : isActive
                  ? 'var(--brand, #0B5DF0)'
                  : 'var(--surface-muted, #e5e7eb)',
                color: isDone || isActive ? '#fff' : 'var(--text-muted, #6b7280)',
              }}
            >
              {isDone ? '✓' : stepNum}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  font: '500 13px/1.2 var(--font-sans, sans-serif)',
                  color: isActive ? 'var(--text-strong, #111827)' : 'var(--text-muted, #6b7280)',
                }}
              >
                {step.title}
              </span>
              {step.description && (
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-subtle)' }}>
                  {step.description}
                </span>
              )}
            </div>
            {idx < stepList.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isDone ? 'var(--tone-success, #10b981)' : 'var(--border, #e5e7eb)',
                  marginLeft: 8,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
