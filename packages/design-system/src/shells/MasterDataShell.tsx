import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

/**
 * Scoped responsive rules: under 720px the two-pane split becomes a single
 * drill-in column. `data-pane` on the root selects which pane is visible:
 * `"list"` (default) shows the list rail full-width; `"detail"` shows the
 * detail pane full-width (the operator has drilled into a record).
 * Class hook: `.master-data-shell`.
 */
const RESPONSIVE_CSS = `
@media (max-width: 720px) {
  .master-data-shell {
    grid-template-columns: 1fr !important;
  }
  .master-data-shell[data-pane="list"] .master-data-shell-detail { display: none; }
  .master-data-shell[data-pane="detail"] .master-data-shell-list { display: none; }
  .master-data-shell .master-data-shell-list { border-right: none !important; }
}
`;

export interface MasterDataShellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * List rail slot — the master list (search pinned at top + selectable rows).
   * Renders in the fixed-width left column.
   */
  list?: ReactNode;
  /**
   * Detail pane slot — the editor / inspector for the selected record. Show an
   * empty-state here until the operator picks (don't auto-select the first row).
   * Renders in the flexible right column. Also accepts `children` as a fallback.
   */
  detail?: ReactNode;
  /** Width of the list rail in px. @default 320 */
  listWidth?: number;
  /**
   * Which pane is shown on mobile (drill-in). `"list"` shows the rail; once a
   * record is picked, set `"detail"`. Ignored on desktop. @default 'list'
   */
  pane?: 'list' | 'detail';
}

/**
 * MasterDataShell — a split master/detail layout for high-frequency edit work
 * (chart of accounts, taxes, classes): a list rail on the left, a detail pane
 * on the right, in a single bordered card. Under 720px it collapses to a
 * single-column drill-in controlled by `pane`.
 *
 * Use this when the operator edits dozens of records in a session; prefer a
 * plain form page for one-off setups.
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string | null>(null);
 * <MasterDataShell
 *   pane={selected ? 'detail' : 'list'}
 *   list={
 *     <>
 *       <SearchInput placeholder="Search accounts…" />
 *       <AccountRow active onClick={() => setSelected('1000')}>Cash · Park Centre</AccountRow>
 *       <AccountRow onClick={() => setSelected('1010')}>Cash · Avondale</AccountRow>
 *     </>
 *   }
 *   detail={
 *     selected ? (
 *       <FormShell.Section title="Cash · Park Centre">…</FormShell.Section>
 *     ) : (
 *       <EmptyState>Pick an account to edit.</EmptyState>
 *     )
 *   }
 * />
 * ```
 */
export const MasterDataShell = forwardRef<HTMLDivElement, MasterDataShellProps>(
  function MasterDataShell(
    { list, detail, listWidth = 320, pane = 'list', className, children, style, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-pane={pane}
        className={cn('master-shell master-data-shell', className)}
        style={{
          display: 'grid',
          gridTemplateColumns: `${listWidth}px 1fr`,
          gap: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'clip',
          minHeight: 480,
          minWidth: 0,
          ...style,
        }}
        {...rest}
      >
        <style>{RESPONSIVE_CSS}</style>

        <div
          className="master-data-shell-list"
          style={{
            borderRight: '1px solid var(--border)',
            minWidth: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {list}
        </div>

        <div
          className="master-data-shell-detail"
          style={{ minWidth: 0, overflowY: 'auto', padding: '24px 28px' }}
        >
          {detail ?? children}
        </div>
      </div>
    );
  },
);
