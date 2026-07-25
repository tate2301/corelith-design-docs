import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface ListPageShellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Page header slot — sits directly on the canvas (no card), above the list
   * card. Typically a `<PageHeader title actions>` block. Maps to `.dash-page-h`.
   */
  header?: ReactNode;
  /**
   * Data toolbar slot — search, filter chips, export. Renders as the first
   * row inside the list card and stays pinned while the list region scrolls.
   * Maps to `.dt-toolbar`.
   */
  toolbar?: ReactNode;
  /**
   * Pagination slot — pinned to the bottom of the list card (page counter +
   * prev/next). Maps to the list-page footer row.
   */
  pagination?: ReactNode;
  /**
   * When true, the list region scrolls within the card (toolbar + pagination
   * stay fixed). When false the whole page scrolls. @default true
   */
  scrollList?: boolean;
}

/**
 * ListPageShell — the standard chrome for every data-table page:
 * canvas page header, then a card containing a pinned data toolbar, a
 * scrollable list region, and a sticky pagination footer.
 *
 * The outer container is never a card — the header sits on the canvas and the
 * table lives in the card (per the list-page rules).
 *
 * @example
 * ```tsx
 * <ListPageShell
 *   header={
 *     <PageHeader title="Receipts" subtitle="147 today across Park Centre.">
 *       <Button variant="quiet" startIcon={<Icon name="download" />}>Export</Button>
 *       <Button variant="primary" startIcon={<Icon name="plus" />}>New sale</Button>
 *     </PageHeader>
 *   }
 *   toolbar={
 *     <>
 *       <SearchInput placeholder="Search receipts…" />
 *       <Chip>All · 147</Chip>
 *       <Chip>Cash · 96</Chip>
 *     </>
 *   }
 *   pagination={
 *     <>
 *       <span>Page 1 of 8</span>
 *       <span style={{ flex: 1 }} />
 *       <Button variant="quiet" size="sm">← Previous</Button>
 *       <Button variant="secondary" size="sm">Next →</Button>
 *     </>
 *   }
 * >
 *   <DataTable rows={receipts} />
 * </ListPageShell>
 * ```
 */
export const ListPageShell = forwardRef<HTMLDivElement, ListPageShellProps>(function ListPageShell(
  { header, toolbar, pagination, scrollList = true, className, children, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('list-page list-page-shell', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        // Token fallback: list page never sets a card background on the outer
        // container — it lives on the canvas.
        gap: 20,
        ...style,
      }}
      {...rest}
    >
      {header ? (
        <header className="dash-page-h list-page-shell-header" style={{ flex: '0 0 auto' }}>
          {header}
        </header>
      ) : null}

      <div
        className="list-page-shell-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          flex: scrollList ? 1 : '0 0 auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'clip',
        }}
      >
        {toolbar ? (
          <div
            className="dt-toolbar list-page-shell-toolbar"
            style={{
              flex: '0 0 auto',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              padding: '12px 18px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {toolbar}
          </div>
        ) : null}

        <div
          className="list-page-shell-list"
          style={
            scrollList
              ? { flex: 1, minHeight: 0, overflowY: 'auto' }
              : { flex: '0 0 auto' }
          }
        >
          {children}
        </div>

        {pagination ? (
          <div
            className="list-page-shell-pagination"
            style={{
              flex: '0 0 auto',
              padding: '12px 18px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              font: 'var(--type-caption)',
              color: 'var(--text-muted)',
              background: 'var(--surface)',
            }}
          >
            {pagination}
          </div>
        ) : null}
      </div>
    </div>
  );
});
