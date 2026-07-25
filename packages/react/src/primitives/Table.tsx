"use client";

import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type TableDensity = 'default' | 'compact';
export type SortDirection = 'asc' | 'desc';

interface TableContextValue {
  density: TableDensity;
  stickyHeader: boolean;
}
const TableContext = createContext<TableContextValue>({ density: 'default', stickyHeader: false });

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Row density. `compact` maps to the dense `.dtable` styling. @default 'default' */
  density?: TableDensity;
  /** Pin the header on scroll. @default false */
  stickyHeader?: boolean;
  /** Quiet variant — drop the internal row dividers. */
  quiet?: boolean;
  children?: ReactNode;
}

/**
 * Table — a semantic table primitive. Composes `.table` (comfortable) or
 * `.dtable` (compact/dense) from components.css, including their `.num`,
 * `.sortable`/`.asc`/`.desc`, `tr.selected`, and `.quiet` modifiers.
 *
 * Accessibility:
 *   - Renders a real `<table>` with `<thead>`/`<tbody>` so AT gets native row
 *     and column semantics.
 *   - Sortable headers expose `aria-sort` and behave as buttons (Enter/Space)
 *     via `Table.HeaderCell sortable`.
 *   - Row selection uses a checkbox slot in the leading cell; mark the selected
 *     row with `selected` so it gets `aria-selected` + `.selected`.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = 'default', stickyHeader = false, quiet, className, children, ...rest },
  ref,
) {
  const base = density === 'compact' ? 'dtable' : 'table';
  return (
    <TableContext.Provider value={{ density, stickyHeader }}>
      <table ref={ref} className={cn(base, quiet && 'quiet', className)} {...rest}>
        {children}
      </table>
    </TableContext.Provider>
  );
});

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
}
const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, style, children, ...rest },
  ref,
) {
  const { stickyHeader } = useContext(TableContext);
  return (
    <thead
      ref={ref}
      className={cn(className)}
      // Sticky header is layout-only; no dedicated class exists.
      style={stickyHeader ? { position: 'sticky', top: 0, zIndex: 1, ...style } : style}
      {...rest}
    >
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
  children?: ReactNode;
}
const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    { numeric, sortable, sortDirection, onSort, className, children, onClick, onKeyDown, ...rest },
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
        {children}
      </th>
    );
  },
);

(Table as unknown as Record<string, unknown>).Head = TableHead;
(Table as unknown as Record<string, unknown>).Body = TableBody;
(Table as unknown as Record<string, unknown>).Row = TableRow;
(Table as unknown as Record<string, unknown>).Cell = TableCell;
(Table as unknown as Record<string, unknown>).HeaderCell = TableHeaderCell;

export type TableComponent = typeof Table & {
  Head: typeof TableHead;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Cell: typeof TableCell;
  HeaderCell: typeof TableHeaderCell;
};

export { TableHead, TableBody, TableRow, TableCell, TableHeaderCell };
