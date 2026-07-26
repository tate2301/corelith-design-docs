"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface KanbanCardData {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  tags?: ReactNode[];
}

export interface KanbanColumnData {
  id: string;
  title: ReactNode;
  cards: KanbanCardData[];
}

export interface KanbanBoardProps extends HTMLAttributes<HTMLDivElement> {
  columns: KanbanColumnData[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string) => void;
}

export const KanbanBoard = forwardRef<HTMLDivElement, KanbanBoardProps>(function KanbanBoard(
  { columns = [], onCardMove, className, style, ...props },
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
      {columns.map((col) => (
        <div
          key={col.id}
          className="b-kanban-column"
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 8,
              borderBottom: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <span style={{ font: '600 13px/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>
              {col.title}
            </span>
            <span
              style={{
                font: '600 11px/1 var(--font-mono)',
                color: 'var(--text-subtle)',
                backgroundColor: 'var(--surface)',
                padding: '2px 6px',
                borderRadius: 9999,
              }}
            >
              {col.cards.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {col.cards.map((card) => (
              <div
                key={card.id}
                className="b-kanban-card"
                style={{
                  backgroundColor: 'var(--surface, #ffffff)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: 8,
                  padding: 12,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
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
      ))}
    </div>
  );
});
