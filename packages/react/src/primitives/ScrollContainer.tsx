"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollSnapAxis = 'none' | 'x' | 'y' | 'both';
export type ScrollIndicator = 'none' | 'fade' | 'shadow';
export type ScrollOverscroll = 'auto' | 'contain' | 'none';

export interface ScrollContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll axis. `both` scrolls freely in two dimensions. @default 'vertical' */
  orientation?: ScrollOrientation;
  /** Fixed max height — content above it scrolls. Ignored for `horizontal`. */
  maxHeight?: number | string;
  /** Scroll-snap axis for `ScrollSnapItem` children. @default 'none' */
  snap?: ScrollSnapAxis;
  /** Overflow affordance drawn on the leading/trailing edge when content
   *  actually overflows. Defaults to `'fade'`, or `'none'` when the deprecated
   *  `fade` prop is explicitly `false`. */
  indicator?: ScrollIndicator;
  /** `overscroll-behavior` on the scrolling element. @default 'auto' */
  overscroll?: ScrollOverscroll;
  /** Hide the scrollbar entirely while keeping the region scrollable.
   *  @default false */
  hideScrollbar?: boolean;
  /**
   * Show gradient fade edges when content overflows. @default true
   * @deprecated Use `indicator="fade"` / `indicator="none"` instead. Kept as an
   * alias so existing call sites keep working; `indicator` wins when both are
   * supplied.
   */
  fade?: boolean;
  children?: ReactNode;
}

/**
 * ScrollContainer — a scroll area with edge affordances, optional scroll-snap,
 * and a thin scrollbar. Maps to `.scroll-area` / `.scroll-area-viewport` in
 * surfaces.css.
 *
 * Element layout — this renders two nested divs:
 *   - the OUTER `.scroll-area` is the positioning context and receives
 *     `className`, `style`, and the `data-*` state attributes;
 *   - the INNER `.scroll-area-viewport` is the element that actually scrolls,
 *     and receives the forwarded `ref` plus every other prop (`{...rest}` —
 *     `aria-label`, `id`, handlers, …).
 *
 * Edge affordances are drawn as pseudo-elements on the outer element and only
 * appear when content overflows on that edge. For `orientation="both"` the
 * indicator tracks the vertical edges.
 *
 * @example
 * <ScrollContainer maxHeight={320} aria-label="Activity">
 *   <Feed />
 * </ScrollContainer>
 *
 * @example
 * // Horizontal carousel with snapping and no visible scrollbar.
 * <ScrollContainer orientation="horizontal" snap="x" hideScrollbar indicator="shadow">
 *   {cards.map((c) => <ScrollSnapItem key={c.id} align="center">{c.node}</ScrollSnapItem>)}
 * </ScrollContainer>
 *
 * Accessibility:
 *   - The scrollable region is focusable (`tabIndex=0`) with `role="region"` so
 *     keyboard users can scroll it; pass `aria-label` to name it.
 *   - Edge affordances are decorative pseudo-elements and never hit-test.
 */
export const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  function ScrollContainer(
    {
      orientation = 'vertical',
      maxHeight,
      snap = 'none',
      indicator,
      overscroll = 'auto',
      hideScrollbar = false,
      fade = true,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [edges, setEdges] = useState({ start: false, end: false });
    // `both` tracks the vertical edges for the indicator.
    const vertical = orientation !== 'horizontal';
    const resolvedIndicator: ScrollIndicator = indicator ?? (fade ? 'fade' : 'none');

    const update = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      if (vertical) {
        setEdges({
          start: el.scrollTop > 1,
          end: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
        });
      } else {
        setEdges({
          start: el.scrollLeft > 1,
          end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        });
      }
    }, [vertical]);

    useEffect(() => {
      update();
      const el = innerRef.current;
      if (!el) return;
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [update]);

    const setRefs = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    return (
      <div
        className={cn('scroll-area', className)}
        data-orientation={orientation}
        data-indicator={resolvedIndicator}
        data-snap={snap === 'none' ? undefined : snap}
        data-overscroll={overscroll}
        data-hide-scrollbar={hideScrollbar ? '' : undefined}
        data-edge-start={edges.start ? '' : undefined}
        data-edge-end={edges.end ? '' : undefined}
        style={style}
      >
        <div
          ref={setRefs}
          className="scroll-area-viewport"
          role="region"
          tabIndex={0}
          onScroll={update}
          style={vertical && maxHeight != null ? { maxHeight } : undefined}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);

export interface ScrollSnapItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Where the item lands relative to the scrollport. @default 'start' */
  align?: 'start' | 'center' | 'end';
  children?: ReactNode;
}

/**
 * ScrollSnapItem — a scroll-snap target inside a `ScrollContainer` whose `snap`
 * prop is set. Maps to `.snap-item` in surfaces.css.
 *
 * @example
 * <ScrollContainer orientation="horizontal" snap="x">
 *   <ScrollSnapItem align="center">Slide 1</ScrollSnapItem>
 * </ScrollContainer>
 */
export const ScrollSnapItem = forwardRef<HTMLDivElement, ScrollSnapItemProps>(
  function ScrollSnapItem({ align = 'start', className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn('snap-item', className)} data-align={align} {...rest}>
        {children}
      </div>
    );
  },
);

export interface PullToRefreshHintProps extends HTMLAttributes<HTMLDivElement> {
  /** The user is currently dragging past the top of the list. @default false */
  pulling?: boolean;
  /** Pull distance in px at which a refresh fires — drives the hint's reserved
   *  height via the `--ptr-threshold` custom property. @default 64 */
  threshold?: number;
  /** Hint copy. @default 'Pull to refresh' */
  label?: ReactNode;
}

/**
 * PullToRefreshHint — the "pull to refresh" affordance parked above a scrolling
 * list. Maps to `.pull-to-refresh-hint` in surfaces.css. It is presentational
 * only; wire the gesture and the refresh call yourself.
 *
 * @example
 * <ScrollContainer maxHeight="60vh">
 *   <PullToRefreshHint pulling={dragging} threshold={72} />
 *   <List />
 * </ScrollContainer>
 *
 * Accessibility: the hint is an `aria-live="polite"` status region so the copy
 * change is announced without stealing focus.
 */
export const PullToRefreshHint = forwardRef<HTMLDivElement, PullToRefreshHintProps>(
  function PullToRefreshHint(
    { pulling = false, threshold = 64, label, className, style, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn('pull-to-refresh-hint', className)}
        data-pulling={pulling ? '' : undefined}
        role="status"
        aria-live="polite"
        style={{ ['--ptr-threshold' as string]: `${threshold}px`, ...style } as CSSProperties}
        {...rest}
      >
        {label ?? 'Pull to refresh'}
      </div>
    );
  },
);
