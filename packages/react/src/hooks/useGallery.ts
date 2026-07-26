"use client";

import { useState } from 'react';

export function useGallery(initialIndex = 0) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initialIndex);

  const show = (idx?: number) => {
    if (idx !== undefined) setIndex(idx);
    setOpen(true);
  };

  const close = () => setOpen(false);
  const next = (max: number) => setIndex((i) => Math.min(max - 1, i + 1));
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  return {
    open,
    index,
    show,
    close,
    next,
    prev,
    setIndex,
  };
}
