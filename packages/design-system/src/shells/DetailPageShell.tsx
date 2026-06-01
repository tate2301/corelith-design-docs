import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

/**
 * Scoped responsive rule: collapse the 1.4fr + 1fr split to a single column
 * under 720px. Kept here (rather than in the CSS sources) because the shell
 * owns its own layout chrome; the class hook is `.detail-page-shell`.
 */
const RESPONSIVE_CSS = `
@media (max-width: 720px) {
  .detail-page-shell .detail-page-shell-grid {
    grid-template-columns: 1fr !important;
  }
}
`;

export interface DetailPageShellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Record hero slot — eyebrow / title / meta for the record. Renders as the
   * `.detail-hero` card above the body. Pass your own hero content (or a
   * `<RecordHero>` block).
   */
  hero?: ReactNode;
  /**
   * Optional tab strip rendered between the hero and the body (e.g. Overview /
   * Activity / Documents). When omitted, no strip is rendered.
   */
  tabs?: ReactNode;
  /**
   * Right-hand aside slot — activity feed, metadata, related records. Always
   * secondary; never put primary content here. Renders as the `1fr` column.
   */
  sidebar?: ReactNode;
  /**
   * Width of the aside column on desktop. @default '1fr' (yields a 1.4fr + 1fr
   * split with the main column). Pass e.g. `320` for a fixed-width aside.
   */
  asideWidth?: number | string;
}

/**
 * DetailPageShell — the standing layout for any single-record detail page:
 * a record hero, an optional tab strip, then a main / aside split (1.4fr +
 * 1fr by default). Collapses to a single column under 720px.
 *
 * Use the same shell for every detail page (pours, students, employees) so the
 * eye always knows where to look. Maps to `.detail-page` / `.detail-hero` /
 * `.detail-grid` in components.css.
 *
 * @example
 * ```tsx
 * <DetailPageShell
 *   hero={
 *     <>
 *       <div className="dh-eyebrow">R-19281 · 14:32</div>
 *       <h1>$ 17.21 · cash sale</h1>
 *       <div className="dh-meta">4 items · Faith Moyo · Till 02</div>
 *     </>
 *   }
 *   tabs={<TabStrip items={['Line items', 'Activity']} />}
 *   sidebar={<ActivityFeed events={events} />}
 * >
 *   <LineItemsTable rows={lines} />
 * </DetailPageShell>
 * ```
 */
export const DetailPageShell = forwardRef<HTMLDivElement, DetailPageShellProps>(
  function DetailPageShell(
    { hero, tabs, sidebar, asideWidth = '1fr', className, children, style, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn('detail-page detail-page-shell', className)}
        style={{
          display: 'grid',
          gap: 16,
          minWidth: 0,
          ...style,
        }}
        {...rest}
      >
        <style>{RESPONSIVE_CSS}</style>

        {hero ? (
          <div
            className="detail-hero detail-page-shell-hero"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '22px 26px',
            }}
          >
            {hero}
          </div>
        ) : null}

        {tabs ? (
          <nav className="detail-page-shell-tabs" aria-label="Record sections">
            {tabs}
          </nav>
        ) : null}

        <div
          className="detail-grid detail-page-shell-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: sidebar
              ? `1.4fr ${typeof asideWidth === 'number' ? `${asideWidth}px` : asideWidth}`
              : '1fr',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <div className="detail-page-shell-main" style={{ minWidth: 0 }}>
            {children}
          </div>
          {sidebar ? (
            <aside className="detail-page-shell-aside" style={{ minWidth: 0 }}>
              {sidebar}
            </aside>
          ) : null}
        </div>
      </div>
    );
  },
);
