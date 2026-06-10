import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'content'> {
  content: ReactNode;
  placement?: TooltipPlacement;
  /** Single focusable child element to wrap. */
  children: ReactElement;
  /** Always shown (skips hover/focus gating). */
  open?: boolean;
}

/**
 * Tooltip — Corelith component.
 *
 * @example
 * ```tsx
 * <Tooltip />
 * ```
 */
export function Tooltip({
  content,
  placement = 'top',
  children,
  open,
  className,
  ...rest
}: TooltipProps) {
  const id = useId();
  const tooltipId = `huchu-tip-${id}`;
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const visible = open ?? (hover || focus);

  if (!isValidElement(children)) return children;

  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    'aria-describedby': tooltipId,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
  });

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {trigger}
      {visible ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={cx('tooltip', `tooltip-${placement}`, className)}
          style={{ position: 'absolute', zIndex: 100, pointerEvents: 'none' }}
          {...rest}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
