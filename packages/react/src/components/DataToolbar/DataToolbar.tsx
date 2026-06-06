import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './DataToolbar.css';

export interface DataToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const DataToolbarRoot = forwardRef<HTMLDivElement, DataToolbarProps>(function DataToolbar(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="toolbar" className={cx('b-data-toolbar', className)} {...rest}>
      {children}
    </div>
  );
});

export interface DataToolbarSearchProps extends HTMLAttributes<HTMLDivElement> {}
function DataToolbarSearch({ className, ...rest }: DataToolbarSearchProps) {
  return <div className={cx('b-data-toolbar-search', className)} {...rest} />;
}

export interface DataToolbarFiltersProps extends HTMLAttributes<HTMLDivElement> {}
function DataToolbarFilters({ className, ...rest }: DataToolbarFiltersProps) {
  return <div className={cx('b-data-toolbar-filters', className)} {...rest} />;
}

export interface DataToolbarActionsProps extends HTMLAttributes<HTMLDivElement> {}
function DataToolbarActions({ className, ...rest }: DataToolbarActionsProps) {
  return <div className={cx('b-data-toolbar-actions', className)} {...rest} />;
}

type DataToolbarComponent = typeof DataToolbarRoot & {
  Search: typeof DataToolbarSearch;
  Filters: typeof DataToolbarFilters;
  Actions: typeof DataToolbarActions;
};

export const DataToolbar = DataToolbarRoot as DataToolbarComponent;
DataToolbar.Search = DataToolbarSearch;
DataToolbar.Filters = DataToolbarFilters;
DataToolbar.Actions = DataToolbarActions;
