"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { usePosition, type Align, type Side } from '../utils/usePosition';

interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  openTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  closeTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  openDelay: number;
  closeDelay: number;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);
const useHC = () => {
  const ctx = useContext(HoverCardContext);
  if (!ctx) throw new Error('HoverCard primitive: child must be inside <HoverCard>.');
  return ctx;
};

export interface HoverCardProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Delay before opening on hover, ms. @default 500 */
  openDelay?: number;
  /** Delay before closing after leave, ms. @default 200 */
  closeDelay?: number;
  children?: ReactNode;
}

/**
 * HoverCard — a richer tooltip: previews on hover (avatars, profile chips,
 * record references). Composes `.popover` from components.css.
 *
 * Accessibility:
 *   - Hover-only by design (per docs guidance — keyboard users land on the
 *     trigger via Tab and do not need a card to pop). If the trigger is
 *     itself focusable and you need focus-reveal, wrap with an explicit
 *     `<Popover>` instead.
 *   - Content uses `role="tooltip"` with a generous open delay.
 *   - Escape closes; hovering the card itself keeps it open.
 */
export function HoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 500,
  closeDelay = 200,
  children,
}: HoverCardProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp! : uncontrolled;
  const anchorRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolled(v);
    onOpenChange?.(v);
  };

  return (
    <HoverCardContext.Provider
      value={{ open, setOpen, anchorRef, contentRef, openTimer, closeTimer, openDelay, closeDelay }}
    >
      {children}
    </HoverCardContext.Provider>
  );
}

export interface HoverCardTriggerProps {
  /** Accepts Radix-style trigger composition. This trigger already clones its child. */
  asChild?: boolean;
  children: ReactElement;
}

export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(function HoverCardTrigger(
  { children },
  ref,
) {
  const ctx = useHC();
  if (!isValidElement(children)) {
    throw new Error('HoverCard.Trigger: children must be a single React element.');
  }
  const childProps = children.props as Record<string, unknown> & {
    onPointerEnter?: (e: React.PointerEvent) => void;
    onPointerLeave?: (e: React.PointerEvent) => void;
    ref?: React.Ref<HTMLElement>;
  };

  const setRefs = (node: HTMLElement | null) => {
    ctx.anchorRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref && typeof ref === 'object')
      (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    const r = childProps.ref;
    if (typeof r === 'function') r(node);
    else if (r && typeof r === 'object') (r as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  const scheduleOpen = () => {
    if (ctx.closeTimer.current) clearTimeout(ctx.closeTimer.current);
    if (ctx.openTimer.current) clearTimeout(ctx.openTimer.current);
    ctx.openTimer.current = setTimeout(() => ctx.setOpen(true), ctx.openDelay);
  };
  const scheduleClose = () => {
    if (ctx.openTimer.current) clearTimeout(ctx.openTimer.current);
    if (ctx.closeTimer.current) clearTimeout(ctx.closeTimer.current);
    ctx.closeTimer.current = setTimeout(() => ctx.setOpen(false), ctx.closeDelay);
  };

  return cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: setRefs,
    'data-slot': 'hover-card-trigger',
    'data-state': ctx.open ? 'open' : 'closed',
    onPointerEnter: (e: React.PointerEvent) => {
      childProps.onPointerEnter?.(e);
      scheduleOpen();
    },
    onPointerLeave: (e: React.PointerEvent) => {
      childProps.onPointerLeave?.(e);
      scheduleClose();
    },
  });
});

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
}

export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    { side = 'bottom', align = 'center', sideOffset = 8, alignOffset = 0, className, children, style, ...rest },
    ref,
  ) {
    const ctx = useHC();
    const pos = usePosition(ctx.anchorRef, ctx.contentRef, ctx.open, {
      side,
      align,
      sideOffset,
      alignOffset,
    });

    const setRefs = (node: HTMLDivElement | null) => {
      ctx.contentRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useEffect(() => {
      if (!ctx.open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') ctx.setOpen(false);
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [ctx]);

    if (!ctx.open) return null;
    const portalTarget = typeof document !== 'undefined' ? document.body : null;
    if (!portalTarget) return null;

    const cancelClose = () => {
      if (ctx.closeTimer.current) {
        clearTimeout(ctx.closeTimer.current);
        ctx.closeTimer.current = null;
      }
    };
    const scheduleClose = () => {
      cancelClose();
      ctx.closeTimer.current = setTimeout(() => ctx.setOpen(false), ctx.closeDelay);
    };

    return createPortal(
      <div
        ref={setRefs}
        role="tooltip"
        className={cn('popover', className)}
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
        style={{
          position: 'absolute',
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          zIndex: 1000,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>,
      portalTarget,
    );
  },
);

(HoverCard as unknown as Record<string, unknown>).Trigger = HoverCardTrigger;
(HoverCard as unknown as Record<string, unknown>).Content = HoverCardContent;

export type HoverCardComponent = typeof HoverCard & {
  Trigger: typeof HoverCardTrigger;
  Content: typeof HoverCardContent;
};
