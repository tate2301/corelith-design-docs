import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import './KanbanBoard.css';

export interface KanbanColumnDef {
  id: string;
  title: ReactNode;
  /** Soft WIP limit. Renders a warn pill when `items[column.id].length > limit`. */
  limit?: number;
}

export interface KanbanItem {
  id: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  [key: string]: unknown;
}

export type KanbanItems<T extends KanbanItem = KanbanItem> = Record<string, T[]>;

export interface KanbanBoardProps<T extends KanbanItem = KanbanItem> {
  columns: KanbanColumnDef[];
  items: KanbanItems<T>;
  /** Called when an item is moved from one column to another (or reordered within one). */
  onMove?: (itemId: string, from: string, to: string, toIndex: number) => void;
  renderCard?: (item: T, columnId: string) => ReactNode;
  /** Aria-label for the whole board. */
  label?: string;
  className?: string;
}

interface DragState {
  itemId: string;
  fromColumn: string;
}

const LONG_PRESS_MS = 400;

/**
 * KanbanBoard — keyboard-accessible drag-and-drop board.
 *
 * @example
 * ```tsx
 * <KanbanBoard />
 * ```
 */
export function KanbanBoard<T extends KanbanItem = KanbanItem>({
  columns,
  items,
  onMove,
  renderCard,
  label = 'Kanban board',
  className,
}: KanbanBoardProps<T>) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTargetCol, setDropTargetCol] = useState<string | null>(null);
  // Keyboard pick-up state — `Space` on a focused card "picks it up".
  const [pickedUp, setPickedUp] = useState<DragState | null>(null);
  const longPressTimer = useRef<number | null>(null);

  const indexOf = useCallback(
    (columnId: string, itemId: string): number => {
      return (items[columnId] ?? []).findIndex((it) => it.id === itemId);
    },
    [items],
  );

  const onDragStart = (e: DragEvent<HTMLDivElement>, itemId: string, columnId: string) => {
    setDragState({ itemId, fromColumn: columnId });
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', itemId);
    } catch {
      /* jsdom may throw */
    }
  };

  const onDragEnd = () => {
    setDragState(null);
    setDropTargetCol(null);
  };

  const onColumnDragOver = (e: DragEvent<HTMLElement>, columnId: string) => {
    if (!dragState) return;
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = 'move';
    } catch {
      /* jsdom */
    }
    setDropTargetCol(columnId);
  };

  const onColumnDrop = (e: DragEvent<HTMLElement>, columnId: string) => {
    e.preventDefault();
    if (!dragState) return;
    const toIndex = (items[columnId] ?? []).length;
    onMove?.(dragState.itemId, dragState.fromColumn, columnId, toIndex);
    setDragState(null);
    setDropTargetCol(null);
  };

  // Touch fallback — long-press a card to start a drag. We don't implement a
  // full touch DnD here (jsdom can't test it anyway), but we expose the
  // handler so consumers can hook into it.
  const onCardTouchStart = (itemId: string, columnId: string) => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      setDragState({ itemId, fromColumn: columnId });
    }, LONG_PRESS_MS);
  };

  const onCardTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Keyboard accessibility:
  // - Space toggles "pick up"
  // - ←/→ moves between columns (when picked up)
  // - ↑/↓ reorders within column (when picked up)
  const onCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, itemId: string, columnId: string) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setPickedUp((prev) =>
        prev && prev.itemId === itemId ? null : { itemId, fromColumn: columnId },
      );
      return;
    }
    if (!pickedUp || pickedUp.itemId !== itemId) return;

    const colIdx = columns.findIndex((c) => c.id === columnId);
    if (colIdx < 0) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const targetIdx = e.key === 'ArrowLeft' ? colIdx - 1 : colIdx + 1;
      if (targetIdx < 0 || targetIdx >= columns.length) return;
      const target = columns[targetIdx]!;
      onMove?.(itemId, columnId, target.id, (items[target.id] ?? []).length);
      setPickedUp({ itemId, fromColumn: target.id });
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const curr = indexOf(columnId, itemId);
      if (curr < 0) return;
      const next = e.key === 'ArrowUp' ? curr - 1 : curr + 1;
      if (next < 0 || next >= (items[columnId] ?? []).length) return;
      onMove?.(itemId, columnId, columnId, next);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enter "drops" the card at its current position — clears pickup state.
      setPickedUp(null);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setPickedUp(null);
    }
  };

  return (
    <div className={cx('kanban-board', className)} role="list" aria-label={label}>
      {columns.map((col) => {
        const colItems = items[col.id] ?? [];
        const overLimit = typeof col.limit === 'number' && colItems.length > col.limit;
        return (
          <section
            key={col.id}
            role="listitem"
            className={cx(
              'kanban-column',
              dropTargetCol === col.id && 'is-drop-target',
              overLimit && 'is-over-limit',
            )}
            onDragOver={(e) => onColumnDragOver(e, col.id)}
            onDrop={(e) => onColumnDrop(e, col.id)}
            aria-label={typeof col.title === 'string' ? col.title : undefined}
            data-column-id={col.id}
          >
            <header className="kanban-column-header">
              <span className="kanban-column-title">{col.title}</span>
              {typeof col.limit === 'number' ? (
                <span className={cx('kanban-column-count', overLimit && 'kanban-wip-warn')}>
                  {colItems.length}/{col.limit}
                </span>
              ) : (
                <span className="kanban-column-count">{colItems.length}</span>
              )}
            </header>
            <div className="kanban-column-body">
              {colItems.map((item) => {
                const isDragging = dragState?.itemId === item.id;
                const isPicked = pickedUp?.itemId === item.id;
                return (
                  <div
                    key={item.id}
                    className={cx(
                      'kanban-card',
                      isDragging && 'is-dragging',
                      isPicked && 'is-picked-up',
                    )}
                    draggable
                    tabIndex={0}
                    role="button"
                    aria-grabbed={isPicked || undefined}
                    aria-label={
                      typeof item.title === 'string'
                        ? `${item.title}${isPicked ? ' (picked up)' : ''}`
                        : undefined
                    }
                    onDragStart={(e) => onDragStart(e, item.id, col.id)}
                    onDragEnd={onDragEnd}
                    onTouchStart={() => onCardTouchStart(item.id, col.id)}
                    onTouchEnd={onCardTouchEnd}
                    onKeyDown={(e) => onCardKeyDown(e, item.id, col.id)}
                    data-item-id={item.id}
                  >
                    {renderCard ? (
                      renderCard(item, col.id)
                    ) : (
                      <div className="kanban-card-default">
                        {item.title ? <div className="kanban-card-title">{item.title}</div> : null}
                        {item.subtitle ? (
                          <div className="kanban-card-subtitle">{item.subtitle}</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
