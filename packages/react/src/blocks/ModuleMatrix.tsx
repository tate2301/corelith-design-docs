import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

/** Maps to the canonical `.status-dot` modifier classes. */
export type ModuleStatus = 'ok' | 'attention' | 'danger' | 'progress' | 'neutral';

export type ModuleData = {
  /** Optional leading icon, rendered in a rounded tile. */
  icon?: ReactNode;
  /** Module name ("Retail"). */
  name: ReactNode;
  /** Headline metric ("$ 11.4k today"). */
  metric: ReactNode;
  /** Small footnote ("3 sites"). */
  note?: ReactNode;
  /** Status dot tone. @default 'ok' */
  status?: ModuleStatus;
  /** Make the tile a link. */
  href?: string;
};

export interface ModuleMatrixProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns in the grid. @default 4 */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Inline items API. Mutually exchangeable with <ModuleMatrix.Item> children. */
  items?: ModuleData[];
}

export interface ModuleItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>,
    ModuleData {}

const DOT_CLASS: Record<ModuleStatus, string> = {
  ok: 'ok',
  attention: 'attention',
  danger: 'danger',
  progress: 'progress',
  neutral: '',
};

/**
 * ModuleMatrix.Item — a single module tile (icon · name · status · metric · note).
 */
function ModuleMatrixItem({ icon, name, metric, note, status = 'ok', href, className, style, ...rest }: ModuleItemProps) {
  const inner = (
    <div
      style={{
        padding: '16px 18px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon ? (
          <span
            aria-hidden="true"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--surface-muted)',
              color: 'var(--text-strong)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {icon}
          </span>
        ) : null}
        <span style={{ font: '600 13px/1 var(--font-sans)', color: 'var(--text-strong)' }}>{name}</span>
        <span className={cn('status-dot', DOT_CLASS[status])} style={{ marginLeft: 'auto' }} aria-hidden="true" />
      </div>
      <div
        style={{
          font: '700 20px/1 var(--font-sans)',
          color: 'var(--text-strong)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {metric}
      </div>
      {note != null ? <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{note}</div> : null}
    </div>
  );

  return href ? (
    <a href={href} className={cn('module-item', className)} style={{ textDecoration: 'none', color: 'inherit', ...style }} {...rest}>
      {inner}
    </a>
  ) : (
    <div className={cn('module-item', className)} style={style} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {inner}
    </div>
  );
}

ModuleMatrixItem.displayName = 'ModuleMatrix.Item';

type ModuleMatrixComponent = ReturnType<
  typeof forwardRef<HTMLDivElement, ModuleMatrixProps>
> & {
  Item: typeof ModuleMatrixItem;
};

/**
 * ModuleMatrix — a launcher grid of modules, each showing one metric and one
 * status dot. A launcher, not a workbench. Maps to `system/b-module-matrix.html`.
 *
 * @example
 * ```tsx
 * <ModuleMatrix cols={4} items={[
 *   { icon: <ShopIcon />, name: 'Retail', metric: '$ 11.4k today', note: '3 sites', status: 'ok', href: '/retail' },
 *   { icon: <GemIcon />, name: 'Gold ops', metric: '2.84 kg pours', note: '3 exceptions', status: 'attention' },
 * ]} />
 * ```
 */
const ModuleMatrixBase = forwardRef<HTMLDivElement, ModuleMatrixProps>(function ModuleMatrix(
  { cols = 4, items, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('module-matrix', `module-matrix-${cols}`, className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 12,
        ...style,
      }}
      {...rest}
    >
      {items?.map((it, i) => <ModuleMatrixItem key={i} {...it} />)}
      {children}
    </div>
  );
});

export const ModuleMatrix = ModuleMatrixBase as ModuleMatrixComponent;
ModuleMatrix.Item = ModuleMatrixItem;
