import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type Crumb = {
  /** Visible label. */
  label: ReactNode;
  /** Optional href. When omitted, the crumb renders as plain text (the current page). */
  href?: string;
};

export type MetaPill = {
  /** Pill label. */
  label: ReactNode;
  /** Visual tone. @default 'neutral' */
  tone?: 'neutral' | 'brand' | 'success' | 'warn' | 'danger';
  /** Optional leading icon node. */
  icon?: ReactNode;
};

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Page title. Rendered as <h1>. */
  title: ReactNode;
  /** Sub-title / one-sentence description under the title. */
  lede?: ReactNode;
  /** Optional breadcrumb trail rendered above the title. */
  crumbs?: Crumb[];
  /** Optional row of meta pills shown below the lede. */
  metaPills?: MetaPill[];
  /** Single primary call-to-action on the right. */
  primaryAction?: ReactNode;
  /** Up to two additional secondary/quiet actions, left of the primary. */
  secondaryActions?: ReactNode;
  /** Polymorphic root element. @default 'header' */
  as?: ElementType;
}

const TONE_CLASS: Record<NonNullable<MetaPill['tone']>, string> = {
  neutral: '',
  brand: 'b',
  success: 's',
  warn: 'w',
  danger: 'd',
};

/**
 * PageHeader — the top of every product page.
 * Composes crumbs, title, lede, meta pills, and an action row.
 * Maps to `.dash-page-h` in dash.css.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Park Centre · today"
 *   lede="Three tills open, one cashier on lunch."
 *   crumbs={[{ label: 'Home', href: '/' }, { label: 'Park Centre' }]}
 *   metaPills={[{ label: 'Open · 7:30am', tone: 'brand' }]}
 *   primaryAction={<Button variant="primary">Open till</Button>}
 *   secondaryActions={<Button variant="quiet">Export</Button>}
 * />
 * ```
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  {
    title,
    lede,
    crumbs,
    metaPills,
    primaryAction,
    secondaryActions,
    as,
    className,
    ...rest
  },
  ref,
) {
  const Comp = (as ?? 'header') as ElementType;
  const hasActions = Boolean(primaryAction || secondaryActions);

  return (
    <Comp ref={ref} className={cn('dash-page-h', className)} {...rest}>
      <div className="meta">
        {crumbs && crumbs.length > 0 ? (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {c.href ? <a href={c.href}>{c.label}</a> : <span className="current">{c.label}</span>}
                {i < crumbs.length - 1 ? <span className="sep">/</span> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
        {metaPills && metaPills.length > 0 ? (
          <div className="h-pills">
            {metaPills.map((p, i) => (
              <span key={i} className={cn('p', TONE_CLASS[p.tone ?? 'neutral'])}>
                {p.icon ? (
                  <span aria-hidden="true" style={{ marginRight: 6, display: 'inline-flex' }}>
                    {p.icon}
                  </span>
                ) : null}
                {p.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {hasActions ? (
        <div className="actions">
          {secondaryActions}
          {primaryAction}
        </div>
      ) : null}
    </Comp>
  );
});
