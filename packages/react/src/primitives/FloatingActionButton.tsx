"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type FloatingActionButtonPosition = 'bottom-right' | 'bottom-center' | 'bottom-left';

export interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading glyph. Sized to 20×20 by `.fab-icon`. */
  icon?: ReactNode;
  /** Pill label. Omit for an icon-only FAB — then `aria-label` is required. */
  label?: ReactNode;
  /** Which corner (or centre) of the viewport to pin to. @default 'bottom-right' */
  position?: FloatingActionButtonPosition;
  /** Distance in px from the bottom edge, before the safe-area inset is added.
   *  @default 24 */
  offset?: number;
}

/**
 * FloatingActionButton — a pill FAB fixed over the content for the single most
 * important action on a mobile screen. Maps to `.fab` (+ `--bottom-right`,
 * `--bottom-center`, `--bottom-left`, `--icon-only`) in mobile.css.
 *
 * Only the `offset` is inline: it is caller-parameterised and feeds
 * `bottom: calc(<offset>px + env(safe-area-inset-bottom, 0px))` so the button
 * clears the home indicator. Everything else is CSS.
 *
 * Accessibility:
 *   - With no `label` the button renders icon-only and has no accessible name,
 *     so callers **must** pass `aria-label` (or `aria-labelledby`).
 *   - The icon is `aria-hidden`; the label carries the name when present.
 *
 * @example
 * <FloatingActionButton icon={<PlusIcon />} label="New order" />
 *
 * @example
 * // Icon-only — aria-label is mandatory.
 * <FloatingActionButton icon={<PlusIcon />} aria-label="New order" position="bottom-center" />
 */
export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  function FloatingActionButton(
    { icon, label, position = 'bottom-right', offset = 24, className, style, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        data-slot="fab"
        data-position={position}
        className={cn(
          'fab',
          `fab--${position}`,
          label == null && 'fab--icon-only',
          className,
        )}
        // Caller-parameterised, so it cannot live in the stylesheet.
        style={{ bottom: `calc(${offset}px + env(safe-area-inset-bottom, 0px))`, ...style }}
        {...rest}
      >
        {icon != null ? (
          <span className="fab-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {label != null ? <span className="fab-label">{label}</span> : null}
      </button>
    );
  },
);
