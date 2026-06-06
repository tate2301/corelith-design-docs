import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Total row count to show next to the pager. */
  total?: number;
  /** Optional page-size picker rendered on the left. */
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  ariaLabel?: string;
}

function buildRange(page: number, pageCount: number): Array<number | 'gap'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: Array<number | 'gap'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push('gap');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < pageCount - 1) out.push('gap');
  out.push(pageCount);
  return out;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    pageCount,
    onChange,
    total,
    pageSize,
    pageSizeOptions = [10, 25, 50, 100],
    onPageSizeChange,
    ariaLabel = 'Pagination',
    className,
    ...rest
  },
  ref,
) {
  const range = buildRange(page, pageCount);
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cx('p-pagination', className)}
      {...rest}
    >
      {total != null ? (
        <span className="pg-count">
          <strong>{total.toLocaleString()}</strong> total
        </span>
      ) : null}
      {pageSize != null && onPageSizeChange ? (
        <label className="pg-size">
          Rows per page
          <select
            className="select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      ) : null}
      <span className="pg-spacer" />
      <span className="pg-nav">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {range.map((r, i) =>
          r === 'gap' ? (
            <span key={`gap-${i}`} className="pn dot" aria-hidden="true">…</span>
          ) : (
            <button
              key={r}
              type="button"
              aria-current={r === page ? 'page' : undefined}
              className={cx('pn', r === page && 'current')}
              onClick={() => onChange(r as number)}
            >
              {r}
            </button>
          ),
        ) as ReactNode}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </span>
    </nav>
  );
});
