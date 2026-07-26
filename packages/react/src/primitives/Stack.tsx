"use client";

import { forwardRef, type HTMLAttributes, type ElementType, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string;
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const GAP_MAP: Record<string, string> = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

const ALIGN_MAP: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<StackJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export interface StackProps extends HTMLAttributes<HTMLElement> {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  inline?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 'md',
    align,
    justify,
    wrap,
    inline = false,
    as: Component = 'div',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const gapValue = typeof gap === 'number' ? `${gap}px` : (GAP_MAP[gap] ?? gap);
  const flexWrap = typeof wrap === 'boolean' ? (wrap ? 'wrap' : 'nowrap') : wrap;

  const combinedStyle = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    gap: gapValue,
    ...(align && { alignItems: ALIGN_MAP[align] }),
    ...(justify && { justifyContent: JUSTIFY_MAP[justify] }),
    ...(flexWrap && { flexWrap }),
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={cn('x-stack', className)}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Component>
  );
});
