"use client";

import { useLayoutEffect, useState, type RefObject } from 'react';

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

export interface PositionOptions {
  /** Side of the anchor to align against. @default 'bottom' */
  side?: Side;
  /** Alignment along the cross-axis. @default 'center' */
  align?: Align;
  /** Gap in pixels between anchor and floating element. @default 8 */
  sideOffset?: number;
  /** Cross-axis offset in pixels. @default 0 */
  alignOffset?: number;
  /** Re-measure when this value changes (e.g. open flag). */
  deps?: ReadonlyArray<unknown>;
}

export interface ComputedPosition {
  top: number;
  left: number;
  side: Side;
}

/**
 * Tiny anchor positioner — no Floating UI. Reads getBoundingClientRect()
 * on both elements once after mount/update, then sets absolute coordinates
 * relative to the document. Auto-flips along the requested side if the
 * preferred placement would overflow the viewport.
 *
 * Limitations (vs. Floating UI):
 *   - No virtualised scroll containers; uses window scroll only.
 *   - Does not reposition on every scroll/resize event by default — the
 *     `deps` argument is the escape hatch (pass `[open, anchorRect]`).
 *   - Only flips, never shifts. Sufficient for menus, popovers, tooltips.
 */
export function usePosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  open: boolean,
  options: PositionOptions = {},
): ComputedPosition | null {
  const { side = 'bottom', align = 'center', sideOffset = 8, alignOffset = 0, deps = [] } = options;
  const [pos, setPos] = useState<ComputedPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    const compute = () => {
      const a = anchor.getBoundingClientRect();
      const f = floating.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = window.scrollX;
      const sy = window.scrollY;

      // Decide effective side with auto-flip when out of viewport.
      let effSide: Side = side;
      const fitsTop = a.top - f.height - sideOffset >= 0;
      const fitsBottom = a.bottom + f.height + sideOffset <= vh;
      const fitsLeft = a.left - f.width - sideOffset >= 0;
      const fitsRight = a.right + f.width + sideOffset <= vw;
      if (side === 'top' && !fitsTop && fitsBottom) effSide = 'bottom';
      else if (side === 'bottom' && !fitsBottom && fitsTop) effSide = 'top';
      else if (side === 'left' && !fitsLeft && fitsRight) effSide = 'right';
      else if (side === 'right' && !fitsRight && fitsLeft) effSide = 'left';

      let top = 0;
      let left = 0;
      if (effSide === 'top' || effSide === 'bottom') {
        top = effSide === 'top' ? a.top - f.height - sideOffset : a.bottom + sideOffset;
        if (align === 'start') left = a.left + alignOffset;
        else if (align === 'end') left = a.right - f.width - alignOffset;
        else left = a.left + a.width / 2 - f.width / 2 + alignOffset;
        // Clamp to viewport.
        left = Math.max(8, Math.min(left, vw - f.width - 8));
      } else {
        left = effSide === 'left' ? a.left - f.width - sideOffset : a.right + sideOffset;
        if (align === 'start') top = a.top + alignOffset;
        else if (align === 'end') top = a.bottom - f.height - alignOffset;
        else top = a.top + a.height / 2 - f.height / 2 + alignOffset;
        top = Math.max(8, Math.min(top, vh - f.height - 8));
      }

      setPos({ top: top + sy, left: left + sx, side: effSide });
    };

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, side, align, sideOffset, alignOffset, ...deps]);

  return pos;
}
