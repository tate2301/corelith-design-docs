"use client";

import { forwardRef, useMemo, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page (1-based). */
  page: number;
  /** Total page count. */
  count: number;
  /** Fires when the user picks a page. */
  onPageChange?: (page: number) => void;
  /** Sibling pages to show around the current. @default 1 */
  siblings?: number;
  /** Pages always shown at the ends. @default 1 */
  boundary?: number;
  /** Label for the prev arrow. @default 'Previous page' */
  prevLabel?: string;
  /** Label for the next arrow. @default 'Next page' */
  nextLabel?: string;
  /** Accessible label for the nav. @default 'Pagination' */
  'aria-label'?: string;
}

/**
 * Pagination — numbered pager with prev/next, sibling window and ellipsis.
 * Maps to the `.pg` / `.pn` markup style used in the docs (pagination.html).
 *
 * Accessibility:
 *   - Wrapped in `<nav aria-label="Pagination">`.
 *   - Current page button gets `aria-current="page"`.
 *   - Ellipses are non-interactive `<span>`s with `aria-hidden="true"`.
 *   - Prev / Next buttons disable (not hide) at the edges so focus order is
 *     stable across renders.
 */
function buildRange(page: number, count: number, siblings: number, boundary: number): Array<number | 'dots'> {
  const totalNumbers = siblings * 2 + boundary * 2 + 3; // first + last + current + 2 dots
  if (count <= totalNumbers) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const startPages = Array.from({ length: boundary }, (_, i) => i + 1);
  const endPages = Array.from({ length: boundary }, (_, i) => count - boundary + i + 1);
  const siblingStart = Math.max(
    Math.min(page - siblings, count - boundary - siblings * 2 - 1),
    boundary + 2,
  );
  const siblingEnd = Math.min(
    Math.max(page + siblings, boundary + siblings * 2 + 2),
    count - boundary - 1,
  );
  const items: Array<number | 'dots'> = [];
  items.push(...startPages);
  if (siblingStart > boundary + 2) items.push('dots');
  else if (boundary + 1 < count - boundary) items.push(boundary + 1);
  for (let i = siblingStart; i <= siblingEnd; i++) items.push(i);
  if (siblingEnd < count - boundary - 1) items.push('dots');
  else if (count - boundary > boundary) items.push(count - boundary);
  items.push(...endPages);
  // de-dupe consecutive duplicates (can occur with very small counts).
  return items.filter((v, i, a) => v !== a[i - 1]);
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    count,
    onPageChange,
    siblings = 1,
    boundary = 1,
    prevLabel = 'Previous page',
    nextLabel = 'Next page',
    className,
    ...rest
  },
  ref,
) {
  const items = useMemo(() => buildRange(page, count, siblings, boundary), [page, count, siblings, boundary]);
  const go = (p: number) => {
    if (p < 1 || p > count || p === page) return;
    onPageChange?.(p);
  };

  return (
    <nav
      ref={ref}
      aria-label={rest['aria-label'] ?? 'Pagination'}
      className={cn('pg', className)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
      {...rest}
    >
      <button
        type="button"
        className="pn nav"
        aria-label={prevLabel}
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      >
        ‹
      </button>
      {items.map((it, idx) =>
        it === 'dots' ? (
          <span key={`dots-${idx}`} className="pn dot" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            className={cn('pn', it === page && 'current')}
            aria-current={it === page ? 'page' : undefined}
            aria-label={`Page ${it}`}
            onClick={() => go(it)}
          >
            {it}
          </button>
        ),
      )}
      <button
        type="button"
        className="pn nav"
        aria-label={nextLabel}
        disabled={page >= count}
        onClick={() => go(page + 1)}
      >
        ›
      </button>
    </nav>
  );
});
