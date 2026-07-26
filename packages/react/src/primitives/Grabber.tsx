"use client";

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface GrabberProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const Grabber = forwardRef<HTMLDivElement, GrabberProps>(function Grabber(
  { label = 'Drag to reorder', className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={label}
      className={cn('p-grabber', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        cursor: 'grab',
        color: 'var(--text-subtle, #9ca3af)',
        userSelect: 'none',
        ...style,
      }}
      {...props}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="3.5" cy="3" r="1" />
        <circle cx="8.5" cy="3" r="1" />
        <circle cx="3.5" cy="6" r="1" />
        <circle cx="8.5" cy="6" r="1" />
        <circle cx="3.5" cy="9" r="1" />
        <circle cx="8.5" cy="9" r="1" />
      </svg>
    </div>
  );
});
