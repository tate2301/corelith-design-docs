"use client";

import { useState } from 'react';
import type { KanbanColumnData } from '../blocks/KanbanBoard';

export function useKanban(initialColumns: KanbanColumnData[] = []) {
  const [columns, setColumns] = useState<KanbanColumnData[]>(initialColumns);

  const moveCard = (cardId: string, fromColumnId: string, toColumnId: string) => {
    setColumns((prevCols) => {
      const sourceCol = prevCols.find((c) => c.id === fromColumnId);
      const cardToMove = sourceCol?.cards.find((c) => c.id === cardId);

      if (!cardToMove) return prevCols;

      return prevCols.map((col) => {
        if (col.id === fromColumnId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === toColumnId) {
          return { ...col, cards: [...col.cards, cardToMove] };
        }
        return col;
      });
    });
  };

  return {
    columns,
    setColumns,
    moveCard,
  };
}
