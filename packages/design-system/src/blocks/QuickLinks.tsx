import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type QuickLinkData = {
  /** Leading icon, rendered in a rounded brand tile. */
  icon?: ReactNode;
  /** Verb-led title ("New sale"). */
  title: ReactNode;
  /** Small context line ("Faith just rang R-19281"). */
  meta?: ReactNode;
  /** Call-to-action text shown at the foot. @default 'Open →' */
  cta?: ReactNode;
  /** Destination. */
  href?: string;
};

export interface QuickLinksProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns in the grid. @default 4 */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Inline items API. Mutually exchangeable with <QuickLinks.Link> children. */
  items?: QuickLinkData[];
}

export interface QuickLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'title'>,
    QuickLinkData {}

/**
 * QuickLinks.Link — a single launcher tile (icon · title · meta · CTA).
 */
function QuickLink({ icon, title, meta, cta = 'Open →', href, className, style, ...rest }: QuickLinkProps) {
  return (
    <a
      href={href}
      className={cn('quick-link', className)}
      style={{
        display: 'grid',
        gridTemplateRows: '32px 1fr auto',
        gap: 8,
        padding: '18px 20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        textDecoration: 'none',
        color: 'inherit',
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--brand-soft)',
          color: 'var(--brand-strong)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </span>
      <div>
        <div style={{ font: '600 14px/1.3 var(--font-sans)', color: 'var(--text-strong)', marginBottom: 4 }}>{title}</div>
        {meta != null ? <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{meta}</div> : null}
      </div>
      {cta != null ? (
        <span style={{ font: '500 12.5px/1 var(--font-sans)', color: 'var(--brand-strong)' }}>{cta}</span>
      ) : null}
    </a>
  );
}

QuickLink.displayName = 'QuickLinks.Link';

type QuickLinksComponent = ReturnType<
  typeof forwardRef<HTMLDivElement, QuickLinksProps>
> & {
  Link: typeof QuickLink;
};

/**
 * QuickLinks — a verb-led launcher grid for the operator's next move.
 * Personalise to the role; keep to six or fewer. Maps to `system/b-quick-links.html`.
 *
 * Accepts links via the `items` prop or as `<QuickLinks.Link>` children.
 *
 * @example
 * ```tsx
 * <QuickLinks cols={4} items={[
 *   { icon: <CartIcon />, title: 'New sale', meta: 'Faith just rang R-19281', href: '/sale/new' },
 *   { icon: <SearchIcon />, title: 'Find customer', meta: '138 loyalty members', href: '/customers' },
 * ]} />
 * ```
 */
const QuickLinksBase = forwardRef<HTMLDivElement, QuickLinksProps>(function QuickLinks(
  { cols = 4, items, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('quick-links', `quick-links-${cols}`, className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 12,
        ...style,
      }}
      {...rest}
    >
      {items?.map((it, i) => <QuickLink key={i} {...it} />)}
      {children}
    </div>
  );
});

export const QuickLinks = QuickLinksBase as QuickLinksComponent;
QuickLinks.Link = QuickLink;
