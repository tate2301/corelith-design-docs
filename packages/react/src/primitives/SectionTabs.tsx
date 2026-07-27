"use client";

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export interface SectionTabsProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name for the nav landmark, e.g. "Invoice sections". Required. */
  label: string;
  children?: ReactNode;
}

/**
 * SectionTabs — a navigation-shaped tab strip for switching *pages*, not panels.
 *
 * Use this (not `Tabs`) when each tab is a route: it renders a `<nav>` landmark
 * and marks the active tab with `aria-current="page"` rather than the
 * tablist/tab/tabpanel triple, which would lie about there being panels in the
 * document.
 *
 * The active indicator is deliberately neutral (`--text-strong`) rather than
 * brand — that is what visually distinguishes a section strip from the
 * brand-underlined in-page `.under-tabs`.
 *
 * @example
 * ```tsx
 * <SectionTabs label="Invoice sections">
 *   <SectionTab active icon={<ListIcon />} count={12}>Lines</SectionTab>
 *   <SectionTab asChild count={3}>
 *     <Link href="/invoices/1/payments">Payments</Link>
 *   </SectionTab>
 *   <SectionTab disabled>Audit</SectionTab>
 * </SectionTabs>
 * ```
 */
export const SectionTabs = forwardRef<HTMLElement, SectionTabsProps>(function SectionTabs(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <nav
      ref={ref as React.Ref<HTMLElement>}
      aria-label={label}
      className={cn('section-tabs', className)}
      data-slot="section-tabs"
      {...rest}
    >
      {children}
    </nav>
  );
});

export interface SectionTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Marks this tab as the current section. */
  active?: boolean;
  /** Leading icon; decorative, hidden from assistive tech. */
  icon?: ReactNode;
  /** Trailing count badge. Values above 99 render as "99+". */
  count?: number;
  /**
   * Render onto the supplied child instead of a `<button>` — the escape hatch
   * for framework links (`next/link`, `react-router` `<Link>`).
   */
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * SectionTab — one entry in a `SectionTabs` strip. A `<button>` by default;
 * with `asChild` it projects onto a link so real navigation works.
 *
 * Accessibility: the active tab carries `aria-current="page"`. Disabled tabs
 * get `disabled` on the button form and `aria-disabled` on the `asChild` form
 * (a link cannot be natively disabled).
 */
export const SectionTab = forwardRef<HTMLButtonElement, SectionTabProps>(function SectionTab(
  { active, icon, count, disabled, asChild, className, children, ...rest },
  ref,
) {
  // Under `asChild` the label comes from the cloned child's own children, so the
  // icon/count decoration is parameterised rather than closing over `children`.
  const renderBody = (label: ReactNode) => (
    <>
      {icon != null ? (
        <span className="icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {label}
      {count !== undefined ? (
        <span className="section-tab-count">{count > 99 ? '99+' : count}</span>
      ) : null}
    </>
  );

  const props = {
    className: cn('section-tab', active && 'active', className),
    'data-slot': 'section-tab',
    'data-state': active ? 'active' : 'inactive',
    'aria-current': active ? ('page' as const) : undefined,
    ...rest,
  };

  if (asChild) {
    const child = children as React.ReactElement<{ children?: ReactNode }>;
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        {...props}
        aria-disabled={disabled || undefined}
        slottedChildren={renderBody(child.props?.children)}
      >
        {child}
      </Slot>
    );
  }

  return (
    <button ref={ref} type="button" disabled={disabled} {...props}>
      {renderBody(children)}
    </button>
  );
});
