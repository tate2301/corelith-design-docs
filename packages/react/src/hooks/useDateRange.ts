"use client";

import { useState } from 'react';

export interface DateRange {
  startDate?: Date | null;
  endDate?: Date | null;
}

export function useDateRange(initialRange: DateRange = {}) {
  const [range, setRange] = useState<DateRange>(initialRange);

  const setStartDate = (date: Date | null) => {
    setRange((prev) => ({ ...prev, startDate: date }));
  };

  const setEndDate = (date: Date | null) => {
    setRange((prev) => ({ ...prev, endDate: date }));
  };

  const reset = () => setRange({});

  return {
    range,
    startDate: range.startDate,
    endDate: range.endDate,
    setRange,
    setStartDate,
    setEndDate,
    reset,
  };
}
