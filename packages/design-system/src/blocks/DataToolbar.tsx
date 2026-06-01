import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface DataToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Filter chips / pills slot, rendered left-of-center. */
  filters?: ReactNode;
  /** Search input slot, rendered on the far left. */
  search?: ReactNode;
  /** Right-aligned actions (count, settings cog, primary buttons). */
  actions?: ReactNode;
}

/**
 * DataToolbar — the strip above a table.
 * Layout: search · filters · spacer · actions.
 * Maps to `.dt-toolbar` / `.data-toolbar` in components.css.
 *
 * @example
 * ```tsx
 * <DataToolbar
 *   search={<Input placeholder="Search" />}
 *   filters={<>
 *     <Chip active>Active · 2,418</Chip>
 *     <Chip>Archived · 312</Chip>
 *   </>}
 *   actions={<>
 *     <span className="count">Showing 1–12 of 2,418</span>
 *     <Button variant="quiet" iconOnly aria-label="View options"><SettingsIcon /></Button>
 *   </>}
 * />
 * ```
 */
export const DataToolbar = forwardRef<HTMLDivElement, DataToolbarProps>(function DataToolbar(
  { search, filters, actions, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('data-toolbar dt-toolbar', className)} {...rest}>
      {search ? <div className="search-input search-l">{search}</div> : null}
      {filters ? <div className="data-toolbar-filters" style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>{filters}</div> : null}
      {children}
      <span className="spacer" style={{ flex: 1 }} />
      {actions ? <div className="data-toolbar-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{actions}</div> : null}
    </div>
  );
});
