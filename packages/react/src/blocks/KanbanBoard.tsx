"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { ACCENT_CYCLE, type Accent } from '../tokens/accents';

export interface KanbanCardData {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  tags?: ReactNode[];
  /** Accent for the card's leading rail. Inherits the column's when omitted. */
  accent?: Accent;
}

export interface KanbanColumnData {
  id: string;
  title: ReactNode;
  cards: KanbanCardData[];
  /**
   * Column accent. Defaults to the column's position in the accent rotation,
   * so a board is colour-coded left to right with nothing to configure.
   */
  accent?: Accent;
}

export interface KanbanBoardProps extends HTMLAttributes<HTMLDivElement> {
  columns: KanbanColumnData[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  /**
   * Colour the column headers and card rails. Turn off for a board where the
   * columns are stages of one thing and colour would imply a distinction that
   * isn't there. @default true
   */
  colorful?: boolean;
}

export const KanbanBoard = forwardRef<HTMLDivElement, KanbanBoardProps>(function KanbanBoard(
  { columns = [], onCardMove, colorful = true, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('b-kanban-board', className)}
      style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 8,
        alignItems: 'flex-start',
        ...style,
      }}
      {...props}
    >
      {columns.map((col, colIndex) => {
        const hue: Accent =
          col.accent ?? (colorful ? ACCENT_CYCLE[colIndex % ACCENT_CYCLE.length]! : 'gray');
        return (
        <div
          key={col.id}
          className="b-kanban-column"
          data-accent={hue}
          style={{
            flex: '0 0 280px',
            backgroundColor: 'var(--surface-muted, #f8fafc)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 200,
          }}
        >
          {/* The tint sits on the header strip, not the column body — a
              six-column board with six tinted columns is a paint chart. */}
          <div className="kanban-col-head">
            <span>{col.title}</span>
            <span className="kanban-col-count">{col.cards.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {col.cards.map((card) => (
              <div
                key={card.id}
                // The card inherits the column's hue unless it names its own,
                // and wears it as a leading rail — colour without a second
                // tinted surface stacked on the first.
                className={cn('b-kanban-card', colorful && 'accent-rail')}
                data-accent={card.accent ?? hue}
                style={{
                  backgroundColor: 'var(--surface, #ffffff)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: 8,
                  padding: 12,
                  paddingLeft: colorful ? 14 : 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ font: '500 13px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>
                  {card.title}
                </div>
                {card.description && (
                  <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
                    {card.description}
                  </div>
                )}
                {card.tags && card.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {card.tags.map((tag, idx) => (
                      <span key={idx}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
});
