"use client";

import {
  createContext,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

/**
 * `default` — the comfortable reading table (`.table`).
 * `compact`  — the denser reading table (`.dtable`).
 * `grid`     — the scanning grid: short rows, vertical column rules, chipped
 *              values (`.dtable.dtable-grid`). Pair with `RecordChip`,
 *              `CellPill` and `SelectionBar`.
 */
export type TableDensity = 'default' | 'compact' | 'grid';
export type GridDensity = 'dense' | 'default' | 'relaxed';
export type SortDirection = 'asc' | 'desc';

interface TableContextValue {
  density: TableDensity;
  stickyHeader: boolean;
}
const TableContext = createContext<TableContextValue>({ density: 'default', stickyHeader: false });

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Row density. @default 'default' */
  density?: TableDensity;
  /** Row height within the `grid` density. @default 'default' (36 px) */
  gridDensity?: GridDensity;
  /** Grid only — drop the vertical column rules. */
  borderless?: boolean;
  /** Grid only — tint alternate rows. */
  zebra?: boolean;
  /** Grid only — override the row height directly, in px. */
  rowHeight?: number;
  /** Pin the header on scroll — adds `.sticky-head`. @default false */
  stickyHeader?: boolean;
  /**
   * Offset in px the pinned header should sit below the scroll port's top
   * edge (e.g. to clear a sticky app bar). Feeds `--table-sticky-top`.
   * Only meaningful with `stickyHeader`.
   */
  stickyOffset?: number;
  /** Quiet variant — drop the internal row dividers. */
  quiet?: boolean;
  children?: ReactNode;
}

type TableCssVars = CSSProperties & {
  '--table-sticky-top'?: string;
  '--grid-row-h'?: string;
};

/**
 * Table — a semantic table primitive. Composes `.table` (comfortable) or
 * `.dtable` (compact/dense) from components.css, including their `.num`,
 * `.sortable`/`.asc`/`.desc`, `tr.selected`, and `.quiet` modifiers.
 *
 * `stickyHeader` adds `.sticky-head` (tables.css) which pins every `th` —
 * pair it with a scroll port such as `.table-scroll.capped`. `stickyOffset`
 * sets `--table-sticky-top` so the header can clear a sticky app bar.
 *
 * Accessibility:
 *   - Renders a real `<table>` with `<thead>`/`<tbody>` so AT gets native row
 *     and column semantics.
 *   - Sortable headers expose `aria-sort` and behave as buttons (Enter/Space)
 *     via `Table.HeaderCell sortable`.
 *   - Row selection uses a checkbox slot in the leading cell; mark the selected
 *     row with `selected` so it gets `aria-selected` + `.selected`.
 */
const TableRoot = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    density = 'default',
    gridDensity = 'default',
    borderless,
    zebra,
    rowHeight,
    stickyHeader = false,
    stickyOffset,
    quiet,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  // `grid` layers onto `.dtable` so it inherits the dense table's sticky-head,
  // row-action and expander rules rather than restating them.
  const isGrid = density === 'grid';
  const base = density === 'default' ? 'table' : 'dtable';

  const tableStyle: TableCssVars | undefined =
    stickyOffset != null || rowHeight != null
      ? {
          ...(stickyOffset != null ? { '--table-sticky-top': `${stickyOffset}px` } : {}),
          ...(rowHeight != null ? { '--grid-row-h': `${rowHeight}px` } : {}),
          ...style,
        }
      : style;

  return (
    <TableContext.Provider value={{ density, stickyHeader }}>
      <table
        ref={ref}
        className={cn(
          base,
          isGrid && 'dtable-grid',
          isGrid && gridDensity === 'dense' && 'dtable-grid-dense',
          isGrid && gridDensity === 'relaxed' && 'dtable-grid-relaxed',
          isGrid && borderless && 'dtable-grid-borderless',
          isGrid && zebra && 'dtable-grid-zebra',
          stickyHeader && 'sticky-head',
          quiet && 'quiet',
          className,
        )}
        style={tableStyle}
        data-density={density}
        {...rest}
      >
        {children}
      </table>
    </TableContext.Provider>
  );
});

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
}
const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, children, ...rest },
  ref,
) {
  // Sticky pinning lives on the `<table>` as `.sticky-head` (tables.css), which
  // pins each `th` — a sticky `<thead>` is not honoured by every engine.
  return (
    <thead ref={ref} className={cn(className)} {...rest}>
      {children}
    </thead>
  );
});

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
}
const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, children, ...rest },
  ref,
) {
  return (
    <tbody ref={ref} className={cn(className)} {...rest}>
      {children}
    </tbody>
  );
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Marks the row as selected — adds `.selected` + `aria-selected`. */
  selected?: boolean;
  children?: ReactNode;
}
const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, children, ...rest },
  ref,
) {
  return (
    <tr
      ref={ref}
      aria-selected={selected || undefined}
      className={cn(selected && 'selected', className)}
      {...rest}
    >
      {children}
    </tr>
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Right-align with tabular figures (`.num`). */
  numeric?: boolean;
  children?: ReactNode;
}
const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { numeric, className, children, ...rest },
  ref,
) {
  return (
    <td ref={ref} className={cn(numeric && 'num', className)} {...rest}>
      {children}
    </td>
  );
});

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Right-align with tabular figures (`.num`). */
  numeric?: boolean;
  /** Make the header sortable — renders the sort affordance and `aria-sort`. */
  sortable?: boolean;
  /** Current sort direction when this column is the active sort. */
  sortDirection?: SortDirection | null;
  /** Fires when a sortable header is activated (click / Enter / Space). */
  onSort?: () => void;
  /**
   * Leading type glyph, wrapped with the label in a `.grid-th` flex row. Tells
   * the reader what kind of value the column holds before they've read a row.
   */
  icon?: ReactNode;
  children?: ReactNode;
}
const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    { numeric, sortable, sortDirection, onSort, icon, className, children, onClick, onKeyDown, ...rest },
    ref,
  ) {
    const ariaSort = !sortable
      ? undefined
      : sortDirection === 'asc'
        ? 'ascending'
        : sortDirection === 'desc'
          ? 'descending'
          : 'none';
    return (
      <th
        ref={ref}
        scope="col"
        aria-sort={ariaSort}
        tabIndex={sortable ? 0 : undefined}
        className={cn(
          numeric && 'num',
          sortable && 'sortable',
          sortable && sortDirection === 'asc' && 'asc',
          sortable && sortDirection === 'desc' && 'desc',
          className,
        )}
        onClick={(e) => {
          onClick?.(e);
          if (sortable) onSort?.();
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (sortable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSort?.();
          }
        }}
        {...rest}
      >
        {icon ? (
          <span className="grid-th">
            <span className="grid-th-icon" aria-hidden="true">
              {icon}
            </span>
            <span className="grid-th-label">{children}</span>
          </span>
        ) : (
          children
        )}
      </th>
    );
  },
);


export type TableComponent = typeof TableRoot & {
  Head: typeof TableHead;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Cell: typeof TableCell;
  HeaderCell: typeof TableHeaderCell;
};

export { TableHead, TableBody, TableRow, TableCell, TableHeaderCell };

/**
 * Compound access (`Table.Head`) alongside the named exports.
 *
 * `Object.assign` returns the intersection, so the statics carry their types.
 * The previous `(Table as unknown as Record<string, unknown>).Head = …` form
 * attached them at runtime but erased them from the type, so `<Table.Head>`
 * failed to compile.
 */
export const Table: TableComponent = Object.assign(TableRoot, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  HeaderCell: TableHeaderCell,
});
