"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Checkbox } from '../primitives/Checkbox';
import { Pagination } from '../primitives/Pagination';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  type GridDensity,
  type SortDirection,
  type TableDensity,
} from '../primitives/Table';
import { DataToolbar } from '../blocks/DataToolbar';
import { EmptyState } from '../blocks/EmptyState';
import { SelectionBar, type SelectionAction } from '../blocks/SelectionBar';

export type { SortDirection, TableDensity, GridDensity, SelectionAction };
export type ColumnAlign = 'left' | 'right' | 'center';

type ScrollCssVars = CSSProperties & { '--table-scroll-max-h'?: string };

export interface DataTableColumn<Row> {
  /** Unique key. Used for sorting and as the React key. */
  key: string;
  /** Header label. */
  header: ReactNode;
  /** Leading type glyph for the header — what kind of value this column holds. */
  icon?: ReactNode;
  /** Cell renderer. Defaults to `String(row[key])`. */
  render?: (row: Row, index: number) => ReactNode;
  /** Enable client-side sort on this column. */
  sortable?: boolean;
  /** Custom comparator for sorting. Defaults to a sensible string/number compare on `accessor`/`key`. */
  sortAccessor?: (row: Row) => string | number;
  /** Text alignment. @default 'left' */
  align?: ColumnAlign;
  /** Header width hint (CSS value). */
  width?: string | number;
}

export interface DataTablePagination {
  /** Current 1-based page. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Fires when the page changes. */
  onPageChange: (page: number) => void;
}

export interface DataTableToolbar {
  /** Search slot (e.g. an `<Input>`). */
  search?: ReactNode;
  /** Filter chips slot. */
  filters?: ReactNode;
  /** Right-aligned actions slot. */
  actions?: ReactNode;
}

export interface DataTableProps<Row> {
  /** Column definitions. */
  columns: DataTableColumn<Row>[];
  /** Row data. */
  data: Row[];
  /** Stable row key getter. @default uses array index */
  rowKey?: (row: Row, index: number) => string | number;
  /** Enable header-click client-side sorting on `sortable` columns. */
  sortable?: boolean;
  /** Enable a leading checkbox column for row selection. */
  selectable?: boolean;
  /** Controlled set of selected row keys. */
  selectedKeys?: ReadonlyArray<string | number>;
  /** Fires with the next selection. */
  onSelectionChange?: (keys: Array<string | number>) => void;
  /** Pagination config. When set, only the current page slice is rendered. */
  pagination?: DataTablePagination;
  /** Toolbar slots rendered above the table. */
  toolbar?: DataTableToolbar;
  /** Empty state shown when there are no rows. */
  emptyState?: ReactNode;
  /** Fires when a body row is clicked (ignores clicks on the checkbox cell). */
  onRowClick?: (row: Row, index: number) => void;
  /**
   * Row density. `grid` is the compact scanning grid — short rows, vertical
   * column rules, chipped values. @default 'grid'
   */
  density?: TableDensity;
  /** Row height within the `grid` density. @default 'default' (36 px) */
  gridDensity?: GridDensity;
  /** Grid only — drop the vertical column rules. */
  borderless?: boolean;
  /** Grid only — tint alternate rows. */
  zebra?: boolean;
  /** Pin the header while the body scrolls. */
  stickyHeader?: boolean;
  /** Pin the leading column while the grid scrolls sideways. */
  stickyFirstColumn?: boolean;
  /** Cap the scroll port's height, in px. Implies a vertical scroll rail. */
  maxHeight?: number;
  /**
   * Quick actions offered on the current selection. Renders a floating
   * {@link SelectionBar} over the foot of the table whenever rows are selected.
   * Each handler receives the selected keys.
   */
  selectionActions?: Array<Omit<SelectionAction, 'onSelect'> & {
    onSelect?: (keys: Array<string | number>) => void;
  }>;
  /** Overflow slot in the selection bar — pass a menu trigger. */
  selectionOverflow?: ReactNode;
  /** Noun after the selection count. @default 'selected' */
  selectionLabel?: string;
  /** Extra className on the wrapping element. */
  className?: string;
}

/**
 * DataTable — a sortable, selectable, paginated table assembly.
 * Composes the `.dtable` markup + `DataToolbar` block + `Pagination` + `Checkbox`
 * primitives + an `EmptyState` fallback. Sorting is client-side; pagination
 * slices the (sorted) data so the same component works with in-memory data.
 *
 * For server-driven data, omit `sortable`/`pagination` slicing by passing only
 * the current page of `data` and wiring `pagination.onPageChange` to your fetch.
 *
 * **Density.** Defaults to `grid` — the compact scanning layout: 36 px rows,
 * vertical column rules, brand-tinted selected rows. Pass `density="compact"`
 * for the previous look or `density="default"` for the roomy reading table.
 *
 * **Cells.** Reach for `RecordChip` on a reference column and `CellPill` on a
 * typed value (email, URL, select option) rather than rendering bare strings —
 * that is most of what separates a legible grid from a gray one.
 *
 * **Selection.** With `selectionActions`, a floating `SelectionBar` appears
 * over the foot of the table once rows are checked; each handler is called
 * with the selected keys.
 *
 * @example
 * ```tsx
 * type Contact = { id: string; name: string; added: string; email: string };
 * const columns: DataTableColumn<Contact>[] = [
 *   { key: 'name', header: 'Contact', icon: <UserIcon />, sortable: true,
 *     render: (r) => <RecordChip name={r.name} href={`/people/${r.id}`} /> },
 *   { key: 'added', header: 'Date added', icon: <CalendarIcon />, sortable: true },
 *   { key: 'email', header: 'Email', icon: <AtIcon />,
 *     render: (r) => <CellPill accent="violet" href={`mailto:${r.email}`}>{r.email}</CellPill> },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={contacts}
 *   rowKey={(r) => r.id}
 *   sortable
 *   selectable
 *   selectedKeys={selected}
 *   onSelectionChange={setSelected}
 *   stickyHeader
 *   selectionActions={[
 *     { id: 'add', label: 'Add to collection', icon: <PlusIcon />, onSelect: addAll },
 *     { id: 'email', label: 'Send email', icon: <MailIcon />, onSelect: emailAll },
 *   ]}
 * />
 * ```
 */
export function DataTable<Row>({
  columns,
  data,
  rowKey,
  sortable,
  selectable,
  selectedKeys,
  onSelectionChange,
  pagination,
  toolbar,
  emptyState,
  onRowClick,
  density = 'grid',
  gridDensity,
  borderless,
  zebra,
  stickyHeader,
  stickyFirstColumn,
  maxHeight,
  selectionActions,
  selectionOverflow,
  selectionLabel,
  className,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<{ key: string; dir: SortDirection } | null>(null);
  const isGrid = density === 'grid';

  const getKey = (row: Row, index: number): string | number =>
    rowKey ? rowKey(row, index) : index;

  const sorted = useMemo(() => {
    if (!sortable || !sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const accessor =
      col.sortAccessor ??
      ((row: Row) => (row as Record<string, unknown>)[col.key] as string | number);
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [sortable, sort, data, columns]);

  const pageRows = useMemo(() => {
    if (!pagination) return sorted;
    const start = (pagination.page - 1) * pagination.pageSize;
    return sorted.slice(start, start + pagination.pageSize);
  }, [sorted, pagination]);

  const pageCount = pagination ? Math.max(1, Math.ceil(data.length / pagination.pageSize)) : 1;

  const selected = useMemo(
    () => new Set(selectedKeys ?? []),
    [selectedKeys],
  );

  const pageKeys = pageRows.map((r, i) => getKey(r, i));
  const allSelected = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const someSelected = pageKeys.some((k) => selected.has(k));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (allSelected) pageKeys.forEach((k) => next.delete(k));
    else pageKeys.forEach((k) => next.add(k));
    onSelectionChange([...next]);
  };

  const toggleRow = (key: string | number) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange([...next]);
  };

  const onHeaderClick = (col: DataTableColumn<Row>) => {
    if (!sortable || !col.sortable) return;
    setSort((cur) => {
      if (cur?.key !== col.key) return { key: col.key, dir: 'asc' };
      if (cur.dir === 'asc') return { key: col.key, dir: 'desc' };
      return null;
    });
  };

  return (
    <div className={cn('data-table', className)}>
      {toolbar ? (
        <DataToolbar search={toolbar.search} filters={toolbar.filters} actions={toolbar.actions} />
      ) : null}

      {data.length === 0 && emptyState ? (
        emptyState
      ) : data.length === 0 ? (
        <EmptyState title="Nothing here yet" body="Rows will appear here once data is available." />
      ) : (
        <>
          <div
            className={cn('table-scroll', maxHeight != null && 'capped')}
            data-sticky-first={stickyFirstColumn ? '' : undefined}
            style={maxHeight != null ? ({ '--table-scroll-max-h': `${maxHeight}px` } as ScrollCssVars) : undefined}
          >
            <Table
              density={density}
              gridDensity={gridDensity}
              borderless={borderless}
              zebra={zebra}
              stickyHeader={stickyHeader}
            >
              <TableHead>
                <TableRow>
                  {selectable ? (
                    <TableHeaderCell className={isGrid ? 'grid-select' : undefined} style={isGrid ? undefined : { width: 36 }}>
                      <Checkbox
                        aria-label="Select all rows on this page"
                        checked={allSelected}
                        indeterminate={!allSelected && someSelected}
                        onChange={toggleAll}
                      />
                    </TableHeaderCell>
                  ) : null}
                  {columns.map((col) => {
                    const active = sort?.key === col.key;
                    const canSort = Boolean(sortable && col.sortable);
                    return (
                      <TableHeaderCell
                        key={col.key}
                        icon={col.icon}
                        numeric={col.align === 'right'}
                        sortable={canSort}
                        sortDirection={active ? sort?.dir : null}
                        onSort={() => onHeaderClick(col)}
                        style={{
                          width: col.width,
                          textAlign: col.align === 'center' ? 'center' : undefined,
                        }}
                      >
                        {col.header}
                      </TableHeaderCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((row, i) => {
                  const key = getKey(row, i);
                  const isSelected = selected.has(key);
                  return (
                    <TableRow
                      key={key}
                      selected={isSelected}
                      onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                      style={onRowClick ? { cursor: 'pointer' } : undefined}
                    >
                      {selectable ? (
                        <TableCell
                          className={isGrid ? 'grid-select' : undefined}
                          onClick={(e) => e.stopPropagation()}
                          style={isGrid ? undefined : { width: 36 }}
                        >
                          <Checkbox
                            aria-label="Select row"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                          />
                        </TableCell>
                      ) : null}
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          numeric={col.align === 'right'}
                          style={{ textAlign: col.align === 'center' ? 'center' : undefined }}
                        >
                          {col.render ? col.render(row, i) : String((row as Record<string, unknown>)[col.key] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Quick actions on the current selection. Sits inside the same
              stacking context as the grid so it floats over the last rows. */}
          {selectionActions?.length && selected.size > 0 ? (
            <SelectionBar
              count={selected.size}
              label={selectionLabel}
              overflow={selectionOverflow}
              onClear={onSelectionChange ? () => onSelectionChange([]) : undefined}
              actions={selectionActions.map((a) => ({
                ...a,
                onSelect: a.onSelect ? () => a.onSelect!([...selected]) : undefined,
              }))}
            />
          ) : null}
        </>
      )}

      {pagination && data.length > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14 }}>
          <Pagination page={pagination.page} count={pageCount} onPageChange={pagination.onPageChange} />
        </div>
      ) : null}
    </div>
  );
}
