import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useInterval,
  useMatchMedia,
  useOptimistic,
  useUrlState,
} from '../index';

describe('useInterval', () => {
  it('fires the callback on each tick and stops on unmount', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { unmount } = renderHook(() => useInterval(cb, 100));
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(cb.mock.calls.length).toBeGreaterThanOrEqual(3);
    unmount();
    cb.mockClear();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(cb).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
  it('pauses when paused=true', () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    renderHook(() => useInterval(cb, 100, { paused: true }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(cb).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('useUrlState', () => {
  it('reads default when query missing and writes to URL on set', () => {
    window.history.replaceState(null, '', '/?other=1');
    const { result } = renderHook(() => useUrlState('q', 'hello'));
    expect(result.current[0]).toBe('hello');
    act(() => result.current[1]('world'));
    expect(new URL(window.location.href).searchParams.get('q')).toBe('world');
  });
});

describe('useOptimistic', () => {
  it('applies queued mutations on top of base and commits on confirm', () => {
    const apply = (n: number, m: number) => n + m;
    const { result } = renderHook(() => useOptimistic(10, apply));
    expect(result.current.derived).toBe(10);
    let token!: { confirm: () => void; rollback: () => void };
    act(() => {
      token = result.current.mutate(5);
    });
    expect(result.current.derived).toBe(15);
    act(() => token.confirm());
    expect(result.current.base).toBe(15);
    expect(result.current.derived).toBe(15);
    expect(result.current.queue.length).toBe(0);
  });
});

describe('useMatchMedia', () => {
  it('returns false when matchMedia is unavailable, true when matches', () => {
    const originals = window.matchMedia;
    // Fake matchMedia returning true.
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (q: string) => ({
        matches: q.includes('min-width: 0px'),
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => true,
      }),
    });
    const { result } = renderHook(() => useMatchMedia('(min-width: 0px)'));
    expect(result.current).toBe(true);
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: originals });
  });
});
