"use client";

import { useState } from 'react';
import type { NotificationItemSetting } from '../blocks/NotificationMatrix';

export function usePreferences(initialItems: NotificationItemSetting[] = []) {
  const [items, setItems] = useState<NotificationItemSetting[]>(initialItems);

  const toggle = (itemId: string, channelKey: string, enabled: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            channels: {
              ...item.channels,
              [channelKey]: enabled,
            },
          };
        }
        return item;
      }),
    );
  };

  return {
    items,
    setItems,
    toggle,
  };
}
