"use client";

import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from '../primitives/Button';
import { PageHeader, type Crumb } from '../blocks/PageHeader';
import { DataTable, type DataTableColumn } from './DataTable';

export interface MasterDataProps<Row> {
  /** Page title. */
  title: ReactNode;
  /** Sub-title / lede under the title. */
  lede?: ReactNode;
  /** Breadcrumbs above the title. */
  crumbs?: Crumb[];
  /** Table column definitions (DataTable shape). */
  columns: DataTableColumn<Row>[];
  /** Row data. */
  data: Row[];
  /** Stable row identity. Also used to match the selected record. */
  rowKey: (row: Row) => string | number;
  /** Controlled selected record key (the open detail). */
  selectedKey?: string | number | null;
  /** Fires when a row is opened (or the detail is closed → null). */
  onSelect?: (key: string | number | null) => void;
  /** Renders the detail pane for the selected row. */
  renderDetail?: (row: Row) => ReactNode;
  /** "Create" action label. When set, a primary button is shown. */
  createLabel?: ReactNode;
  /** Fires when the create button is clicked. */
  onCreate?: () => void;
  /** Search slot for the table toolbar. */
  search?: ReactNode;
  /** Filter chips for the table toolbar. */
  filters?: ReactNode;
  /** Empty-state node when there's no data. */
  emptyState?: ReactNode;
  /** Detail pane width in px (side-by-side layout). @default 380 */
  detailWidth?: number;
  /** Extra className. */
  className?: string;
}

/**
 * MasterData — a master/detail CRUD assembly. Composes `PageHeader` (title +
 * create action), `DataTable` (the master list with search/filters), and a
 * detail pane rendered side-by-side when a row is selected. Selection is
 * controlled via `selectedKey` / `onSelect`, so it plugs into routing.
 *
 * @example
 * ```tsx
 * type Supplier = { id: string; name: string; town: string; balance: number };
 * const [selected, setSelected] = useState<string | number | null>(null);
 * <MasterData<Supplier>
 *   title="Suppliers"
 *   lede="Everyone you buy from."
 *   createLabel="New supplier"
 *   onCreate={() => openCreate()}
 *   columns={[
 *     { key: 'name', header: 'Supplier', sortable: true },
 *     { key: 'town', header: 'Town' },
 *     { key: 'balance', header: 'Balance', align: 'right', render: (r) => `US$${r.balance.toLocaleString()}` },
 *   ]}
 *   data={[{ id: 'SUP-01', name: 'Mukamba Group', town: 'Harare', balance: 48200 }]}
 *   rowKey={(r) => r.id}
 *   selectedKey={selected}
 *   onSelect={setSelected}
 *   renderDetail={(r) => <SupplierDetail supplier={r} />}
 *   search={<Input placeholder="Search suppliers" />}
 * />
 * ```
 */
export function MasterData<Row>({
  title,
  lede,
  crumbs,
  columns,
  data,
  rowKey,
  selectedKey,
  onSelect,
  renderDetail,
  createLabel,
  onCreate,
  search,
  filters,
  emptyState,
  detailWidth = 380,
  className,
}: MasterDataProps<Row>) {
  // Uncontrolled fallback for selection.
  const [internalKey, setInternalKey] = useState<string | number | null>(null);
  const isControlled = selectedKey !== undefined;
  const activeKey = isControlled ? selectedKey : internalKey;

  const select = (key: string | number | null) => {
    if (!isControlled) setInternalKey(key);
    onSelect?.(key);
  };

  const selectedRow = useMemo(
    () => (activeKey == null ? undefined : data.find((r) => rowKey(r) === activeKey)),
    [activeKey, data, rowKey],
  );

  const showDetail = Boolean(renderDetail && selectedRow);

  return (
    <div className={cn('master-data', className)}>
      <PageHeader
        title={title}
        lede={lede}
        crumbs={crumbs}
        primaryAction={
          createLabel ? (
            <Button variant="primary" onClick={onCreate}>
              {createLabel}
            </Button>
          ) : undefined
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showDetail ? `1fr ${detailWidth}px` : '1fr',
          gap: 20,
          alignItems: 'start',
          marginTop: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <DataTable
            columns={columns}
            data={data}
            rowKey={(r) => rowKey(r)}
            sortable
            toolbar={search || filters ? { search, filters } : undefined}
            emptyState={emptyState}
            onRowClick={(row) => select(rowKey(row))}
          />
        </div>

        {showDetail && selectedRow ? (
          <aside
            aria-label="Record detail"
            style={{
              position: 'sticky',
              top: 16,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'clip',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '8px 8px 0',
              }}
            >
              <Button
                type="button"
                variant="quiet"
                size="sm"
                iconOnly
                aria-label="Close detail"
                onClick={() => select(null)}
                style={{ color: 'var(--text-muted)', fontSize: 18 }}
              >
                ×
              </Button>
            </div>
            <div style={{ padding: '0 18px 18px' }}>{renderDetail!(selectedRow)}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
