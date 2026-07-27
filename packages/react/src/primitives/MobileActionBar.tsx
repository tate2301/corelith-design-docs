"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type MobileActionBarVariant = 'default' | 'floating' | 'sheet';

export interface MobileActionBarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Placement treatment.
   *   - `default` — fixed to the bottom edge, full width, top border.
   *   - `floating` — inset from the edges, card radius, elevation.
   *   - `sheet` — sticky in normal flow, never fixed, no blur.
   * @default 'default'
   */
  variant?: MobileActionBarVariant;
  /** Pad for the bottom safe-area inset. @default true */
  safeArea?: boolean;
  /** Frost the surface with a backdrop blur. Forced off for `sheet`.
   *  @default true */
  blur?: boolean;
  /** Optional summary block shown above the actions (e.g. order totals). */
  summary?: ReactNode;
  /**
   * @deprecated Use `variant`. `fixed={false}` is an alias for
   * `variant="sheet"`; an explicit `variant` always wins.
   */
  fixed?: boolean;
  /** Action buttons, or a `MobileActionBarContent` subtree. */
  children?: ReactNode;
}

export type MobileActionBarContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileActionBarContent — the flex row that lays the actions out. Maps to
 * `.action-bar-content`.
 *
 * `MobileActionBar` injects one of these around bare `children`; pass it
 * explicitly (as a direct child) and the bar skips the injected wrapper so the
 * markup is never double-nested.
 *
 * @example
 * <MobileActionBar>
 *   <MobileActionBarContent>
 *     <MobileActionBarPrimary><Button variant="primary">Charge</Button></MobileActionBarPrimary>
 *   </MobileActionBarContent>
 * </MobileActionBar>
 */
export const MobileActionBarContent = forwardRef<HTMLDivElement, MobileActionBarContentProps>(
  function MobileActionBarContent({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-action-bar-content"
        className={cn('action-bar-content', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export type MobileActionBarPrimaryProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileActionBarPrimary — the growing slot (`flex: 1`) that holds the main
 * action. Maps to `.action-bar-primary`.
 *
 * @example
 * <MobileActionBarPrimary><Button variant="primary" fullWidth>Pay</Button></MobileActionBarPrimary>
 */
export const MobileActionBarPrimary = forwardRef<HTMLDivElement, MobileActionBarPrimaryProps>(
  function MobileActionBarPrimary({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-action-bar-primary"
        className={cn('action-bar-primary', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export type MobileActionBarSecondaryProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileActionBarSecondary — the non-shrinking slot (`flex-shrink: 0`) for
 * ancillary controls. Maps to `.action-bar-secondary`.
 *
 * @example
 * <MobileActionBarSecondary><Button variant="ghost">Cancel</Button></MobileActionBarSecondary>
 */
export const MobileActionBarSecondary = forwardRef<HTMLDivElement, MobileActionBarSecondaryProps>(
  function MobileActionBarSecondary({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-action-bar-secondary"
        className={cn('action-bar-secondary', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

/**
 * MobileActionBar — a bottom-pinned action bar for mobile flows (Charge / Pay).
 * Maps to `.action-bar` (+ `--floating`, `--sheet`) in mobile.css; the surface,
 * borders, elevation, and safe-area padding all live in CSS. Buttons inside
 * reuse the shared `.btn` family.
 *
 * Children handling: bare children are wrapped in a `MobileActionBarContent`
 * flex row. If any direct child *is* a `MobileActionBarContent`, children are
 * rendered as given so the wrapper is never duplicated.
 *
 * Accessibility:
 *   - Renders a landmark `<div role="toolbar">` so AT can jump to the primary
 *     actions; pass `aria-label` to name it.
 *   - Honours the bottom safe-area inset via `env(safe-area-inset-bottom)`
 *     unless `safeArea={false}`.
 *
 * @example
 * <MobileActionBar aria-label="Order actions" summary={<Total value="$48.00" />}>
 *   <Button variant="primary">Charge</Button>
 * </MobileActionBar>
 *
 * @example
 * <MobileActionBar variant="floating" blur={false}>…</MobileActionBar>
 */
export const MobileActionBar = forwardRef<HTMLDivElement, MobileActionBarProps>(
  function MobileActionBar(
    { variant, safeArea = true, blur = true, summary, fixed, className, children, ...rest },
    ref,
  ) {
    // `fixed` is the pre-variant API. An explicit `variant` always wins.
    const resolved: MobileActionBarVariant = variant ?? (fixed === false ? 'sheet' : 'default');
    // `sheet` sits in normal flow, so there is nothing behind it to frost.
    const blurred = resolved === 'sheet' ? false : blur;

    // Don't double-wrap: a caller that composes its own content row keeps it.
    const hasOwnContent = Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === MobileActionBarContent,
    );

    return (
      <div
        ref={ref}
        role="toolbar"
        data-slot="mobile-action-bar"
        data-variant={resolved}
        data-safe-area={String(safeArea)}
        data-blur={String(blurred)}
        className={cn(
          'action-bar',
          resolved !== 'default' && `action-bar--${resolved}`,
          className,
        )}
        {...rest}
      >
        {summary != null ? <div className="action-bar-summary">{summary}</div> : null}
        {hasOwnContent ? children : <MobileActionBarContent>{children}</MobileActionBarContent>}
      </div>
    );
  },
);
