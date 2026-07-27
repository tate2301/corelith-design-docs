"use client";

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Button, type ButtonVariant } from '../primitives/Button';

export interface BulkAction {
  /** Stable id (React key). */
  id: string;
  /** Button label. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Button variant. @default 'secondary' */
  variant?: ButtonVariant;
  /** Mark as destructive (danger styling). */
  destructive?: boolean;
  /** Fires with the current selected count. */
  onClick: (selectedCount: number) => void;
  /** Disable the action. */
  disabled?: boolean;
}

export interface BulkEditBarProps {
  /** Number of selected rows. The bar hides itself when 0 (unless `forceShow`). */
  selectedCount: number;
  /** Actions rendered on the right. */
  actions: BulkAction[];
  /** Fires when the user clears the selection. */
  onClear: () => void;
  /** Singular/plural noun for the count label. @default ['item', 'items'] */
  noun?: [singular: string, plural: string];
  /** Render even when `selectedCount` is 0. @default false */
  forceShow?: boolean;
  /** Render fixed at the bottom of the viewport (floating bar) via a portal. @default false */
  floating?: boolean;
  /** Extra className. */
  className?: string;
}

/**
 * BulkEditBar — the action bar that appears when table rows are selected.
 * Composes `Button` primitives and the `.bulk-edit-bar` / `.bulk-edit-count` /
 * `.bulk-edit-actions` rules from tables.css; pairs naturally with
 * `DataTable`'s `selectable` + `onSelectionChange`. Hides itself when nothing
 * is selected.
 *
 * Set `floating` to dock it to the bottom of the viewport (portalled), or leave
 * it inline to render in document flow.
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<Array<string | number>>([]);
 * <DataTable ... selectable selectedKeys={selected} onSelectionChange={setSelected} />
 * <BulkEditBar
 *   selectedCount={selected.length}
 *   noun={['supplier', 'suppliers']}
 *   onClear={() => setSelected([])}
 *   floating
 *   actions={[
 *     { id: 'tag', label: 'Add tag', onClick: () => openTagDialog(selected) },
 *     { id: 'archive', label: 'Archive', destructive: true, onClick: () => archive(selected) },
 *   ]}
 * />
 * ```
 */
export function BulkEditBar({
  selectedCount,
  actions,
  onClear,
  noun = ['item', 'items'],
  forceShow = false,
  floating = false,
  className,
}: BulkEditBarProps) {
  if (selectedCount === 0 && !forceShow) return null;

  const label = `${selectedCount} ${selectedCount === 1 ? noun[0] : noun[1]} selected`;

  const bar = (
    <div role="region" aria-label="Bulk actions" className={cn('bulk-edit-bar', className)}>
      <span className="bulk-edit-count" aria-live="polite">
        {label}
      </span>
      <div className="bulk-edit-actions">
        {actions.map((a) => (
          <Button
            key={a.id}
            size="sm"
            variant={a.destructive ? 'danger' : a.variant ?? 'secondary'}
            startIcon={a.icon}
            disabled={a.disabled}
            onClick={() => a.onClick(selectedCount)}
          >
            {a.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="quiet"
          size="sm"
          iconOnly
          aria-label="Clear selection"
          onClick={onClear}
          style={{
            color: 'inherit',
            fontSize: 18,
            opacity: 0.8,
          }}
        >
          ×
        </Button>
      </div>
    </div>
  );

  if (!floating) return bar;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1050,
        width: 'min(640px, calc(100vw - 32px))',
      }}
    >
      {bar}
    </div>,
    portalTarget,
  );
}
