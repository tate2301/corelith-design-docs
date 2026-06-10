import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './Stack.css';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  children?: ReactNode;
}

const ALIGN: Record<StackAlign, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};
const JUSTIFY: Record<StackJustify, CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
};

/**
 * Stack — flexbox layout primitive (row/column).
 *
 * @example
 * ```tsx
 * <Stack />
 * ```
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { as: As = 'div', direction = 'vertical', gap = 'md', align, justify, wrap, className, style, ...rest },
  ref,
) {
  const composed: CSSProperties = {
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: gap === 'none' ? 0 : `var(--space-${gap}, var(--gap-${gap}, 12px))`,
    alignItems: align ? ALIGN[align] : undefined,
    justifyContent: justify ? JUSTIFY[justify] : undefined,
    flexWrap: wrap ? 'wrap' : undefined,
    ...style,
  };
  return <As ref={ref} className={cx('x-stack', `x-stack-${direction}`, className)} style={composed} {...rest} />;
});
