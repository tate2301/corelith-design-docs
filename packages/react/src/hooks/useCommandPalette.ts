"use client";

import { useState, useCallback } from 'react';

export function useCommandPalette(initialState = false) {
  const [open, setOpen] = useState(initialState);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return {
    open,
    setOpen,
    toggle,
  };
}
