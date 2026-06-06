import { useCallback, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type DataTableSortDir = 'asc' | 'desc';

export interface DataTableSortState {
  columnId: string;
  direction: DataTableSortDir;
}

export interface DataTableColumn<Row> {
  id: string;
  header: ReactNode;
  /** Renderer. Defaults to row[id]. */
  cell?: (row: Row, index: number) => ReactNode;
  /** Right-align numeric values. */
  numeric?: boolean;
  /** Mark column sortable. */
  sortable?: boolean;
  /** Custom width (CSS value). */
  width?: string | number;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Stable row key extractor. */
  getRowId: (row: Row, index: number) => string;
  /** Selection */
  selectable?: boolean;
  selected?: ReadonlyArray<string>;
  onSelectionChange?: (next: string[]) => void;
  /** Sorting (controlled). */
  sort?: DataTableSortState;
  onSortChange?: (next: DataTableSortState | undefined) => void;
  /** Optional caption / footer slots. */
  caption?: ReactNode;
  footer?: ReactNode;
  /** Empty-state slot. */
  emptyState?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  selectable,
  selected,
  onSelectionChange,
  sort,
  onSortChange,
  caption,
  footer,
  emptyState,
  className,
  ariaLabel,
}: DataTableProps<Row>) {
  const selectedSet = new Set(selected ?? []);
  const allSelected = rows.length > 0 && rows.every((r, i) => selectedSet.has(getRowId(r, i)));

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) onSelectionChange([]);
    else onSelectionChange(rows.map((r, i) => getRowId(r, i)));
  }, [allSelected, onSelectionChange, rows, getRowId]);

  const toggleOne = useCallback(
    (id: string) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange(Array.from(next));
    },
    [onSelectionChange, selectedSet],
  );

  const handleSort = (col: DataTableColumn<Row>) => {
    if (!col.sortable || !onSortChange) return;
    if (!sort || sort.columnId !== col.id) {
      onSortChange({ columnId: col.id, direction: 'asc' });
    } else if (sort.direction === 'asc') {
      onSortChange({ columnId: col.id, direction: 'desc' });
    } else {
      onSortChange(undefined);
    }
  };

  return (
    <table className={cx('dtable', className)} aria-label={ariaLabel}>
      {caption ? <caption>{caption}</caption> : null}
      <thead>
        <tr>
          {selectable ? (
            <th style={{ width: 32 }}>
              <input
                type="checkbox"
                className="check"
                aria-label="Select all rows"
                checked={allSelected}
                onChange={toggleAll}
              />
            </th>
          ) : null}
          {columns.map((c) => {
            const isSorted = sort?.columnId === c.id;
            const sortClass = c.sortable
              ? cx('sortable', isSorted && sort?.direction)
              : null;
            return (
              <th
                key={c.id}
                scope="col"
                className={cx(sortClass, c.numeric && 'num')}
                style={c.width ? { width: c.width } : undefined}
                aria-sort={
                  !c.sortable
                    ? undefined
                    : !isSorted
                    ? 'none'
                    : sort?.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                }
                onClick={c.sortable ? () => handleSort(c) : undefined}
              >
                {c.header}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && emptyState ? (
          <tr>
            <td colSpan={(selectable ? 1 : 0) + columns.length}>{emptyState}</td>
          </tr>
        ) : (
          rows.map((row, i) => {
            const id = getRowId(row, i);
            const isSelected = selectedSet.has(id);
            return (
              <tr key={id} className={cx(isSelected && 'selected')}>
                {selectable ? (
                  <td>
                    <input
                      type="checkbox"
                      className="check"
                      aria-label={`Select row ${i + 1}`}
                      checked={isSelected}
                      onChange={() => toggleOne(id)}
                    />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td key={c.id} className={cx(c.numeric && 'num')}>
                    {c.cell
                      ? c.cell(row, i)
                      : ((row as Record<string, unknown>)[c.id] as ReactNode) ?? null}
                  </td>
                ))}
              </tr>
            );
          })
        )}
      </tbody>
      {footer ? <tfoot><tr><td colSpan={(selectable ? 1 : 0) + columns.length}>{footer}</td></tr></tfoot> : null}
    </table>
  );
}
