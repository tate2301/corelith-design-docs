"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type ScrollOrientation = 'vertical' | 'horizontal';

export interface ScrollContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll axis. @default 'vertical' */
  orientation?: ScrollOrientation;
  /** Fixed max height (vertical) — content above it scrolls. */
  maxHeight?: number | string;
  /** Show gradient fade edges when content overflows. @default true */
  fade?: boolean;
  children?: ReactNode;
}

/**
 * ScrollContainer — a scroll area with gradient fade edges and a thin
 * scrollbar. The docs (`p-scroll-container`) reference `.scroll-area`, but no
 * rule exists in components.css, so the thin-scrollbar and fade-mask treatment
 * are token-driven inline fallbacks. Fades appear only when content actually
 * overflows on the leading/trailing edge.
 *
 * Accessibility:
 *   - The scrollable region is focusable (`tabIndex=0`) with `role="region"` so
 *     keyboard users can scroll it; pass `aria-label` to name it.
 *   - Fade overlays are decorative and `pointer-events: none`.
 */
export const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  function ScrollContainer(
    { orientation = 'vertical', maxHeight, fade = true, className, style, children, ...rest },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [edges, setEdges] = useState({ start: false, end: false });
    const vertical = orientation === 'vertical';

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

    const fadeStyle = (edge: 'start' | 'end'): React.CSSProperties => {
      const size = 24;
      const base: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'none',
        background: `linear-gradient(${
          vertical ? (edge === 'start' ? 'to bottom' : 'to top') : edge === 'start' ? 'to right' : 'to left'
        }, var(--surface), transparent)`,
      };
      if (vertical) {
        return {
          ...base,
          left: 0,
          right: 0,
          height: size,
          ...(edge === 'start' ? { top: 0 } : { bottom: 0 }),
        };
      }
      return {
        ...base,
        top: 0,
        bottom: 0,
        width: size,
        ...(edge === 'start' ? { left: 0 } : { right: 0 }),
      };
    };

    return (
      <div
        className={cn('scroll-area', className)}
        style={{ position: 'relative', ...style }}
      >
        <div
          ref={setRefs}
          role="region"
          tabIndex={0}
          onScroll={update}
          // Token-driven inline fallback: no `.scroll-area` rule in components.css.
          style={{
            overflowX: vertical ? 'hidden' : 'auto',
            overflowY: vertical ? 'auto' : 'hidden',
            maxHeight: vertical ? maxHeight : undefined,
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border-strong) transparent',
          }}
          {...rest}
        >
          {children}
        </div>
        {fade && edges.start ? <div aria-hidden="true" style={fadeStyle('start')} /> : null}
        {fade && edges.end ? <div aria-hidden="true" style={fadeStyle('end')} /> : null}
      </div>
    );
  },
);
