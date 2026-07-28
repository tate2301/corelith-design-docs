"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Avatar } from './Avatar';
import { accentFor, type Accent } from '../tokens/accents';

export type RecordChipSize = 'sm' | 'md' | 'lg';

export interface RecordChipProps
  extends Omit<AnchorHTMLAttributes<HTMLElement>, 'onClick' | 'color'> {
  /** The referenced record's display name. */
  name: string;
  /** Avatar image. Falls back to accent-tinted initials from `name`. */
  src?: string;
  /**
   * Avatar accent. Defaults to a hash of `name`, so the same record is the
   * same colour everywhere it's referenced — no colour assignment to store.
   */
  accent?: Accent;
  /** Renders an `<a>` instead of a `<button>`. */
  href?: string;
  /** Size. @default 'md' */
  size?: RecordChipSize;
  /** Drop the pill background — for a cell that already reads as a link. */
  plain?: boolean;
  /** Hide the avatar and show only the name. */
  hideAvatar?: boolean;
  /** Leading node in place of the avatar — an emoji, an icon tile. */
  leading?: ReactNode;
  /** When set, renders a trailing × that calls this. */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible label for the remove button. @default `Remove ${name}` */
  removeLabel?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * RecordChip — a reference to another record, rendered as an avatar + name
 * pill. The linked-record cell in a CRM-style grid.
 *
 * The pill shape is doing real work: it distinguishes "this cell holds a
 * pointer to another record you can open" from "this cell holds a string that
 * happens to look like a name". Bare text can't make that distinction, which
 * is why reference-heavy grids read as undifferentiated gray without it.
 *
 * @example
 * ```tsx
 * <RecordChip name="Nicolas Sharp" href="/people/nsharp" />
 * <RecordChip name="Modal" src={logo} size="sm" />
 * ```
 */
export const RecordChip = forwardRef<HTMLElement, RecordChipProps>(function RecordChip(
  {
    name,
    src,
    accent,
    href,
    size = 'md',
    plain,
    hideAvatar,
    leading,
    onRemove,
    removeLabel,
    onClick,
    className,
    children,
    ...rest
  },
  ref,
) {
  const hue = accent ?? accentFor(name);

  const content = (
    <>
      {hideAvatar ? null : (leading ?? <Avatar src={src} name={name} accent={hue} size="xs" />)}
      <span className="record-chip-name">{children ?? name}</span>
      {onRemove ? (
        <button
          type="button"
          className="record-chip-x"
          aria-label={removeLabel ?? `Remove ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(e);
          }}
        >
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </>
  );

  const classes = cn(
    'record-chip',
    size === 'sm' && 'record-chip-sm',
    size === 'lg' && 'record-chip-lg',
    plain && 'record-chip-plain',
    className,
  );

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        data-accent={hue}
        data-slot="record-chip"
        onClick={onClick}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={classes}
      data-accent={hue}
      data-slot="record-chip"
      onClick={onClick}
      {...(rest as HTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

export interface RecordChipGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** Show at most this many chips, then a "+N" counter. @default 3 */
  max?: number;
  /** Accessible description of the overflow. @default `${n} more` */
  overflowLabel?: (count: number) => string;
}

/**
 * RecordChipGroup — a multi-value reference cell. Renders up to `max` chips
 * and collapses the rest into a counter, so a record with twelve collaborators
 * doesn't blow the column width.
 *
 * @example
 * ```tsx
 * <RecordChipGroup max={2}>
 *   <RecordChip name="Alicia Reed" />
 *   <RecordChip name="Tyler Robinson" />
 *   <RecordChip name="Olivia Johnson" />
 * </RecordChipGroup>
 * ```
 */
export const RecordChipGroup = forwardRef<HTMLSpanElement, RecordChipGroupProps>(
  function RecordChipGroup(
    { max = 3, overflowLabel = (n) => `${n} more`, className, children, ...rest },
    ref,
  ) {
    const items = Array.isArray(children) ? children.flat() : children ? [children] : [];
    const shown = items.slice(0, max);
    const hidden = items.length - shown.length;

    return (
      <span ref={ref} className={cn('record-chip-group', className)} data-slot="record-chip-group" {...rest}>
        {shown}
        {hidden > 0 ? (
          <span className="record-chip-more" title={overflowLabel(hidden)}>
            +{hidden}
          </span>
        ) : null}
      </span>
    );
  },
);

export interface CellPillProps extends AnchorHTMLAttributes<HTMLElement> {
  /** Accent hue for the tint. @default 'gray' */
  accent?: Accent;
  /** Renders an `<a>` when set. */
  href?: string;
  /** Leading icon. */
  icon?: ReactNode;
}

/**
 * CellPill — a typed cell value (an email, a URL, a select option) shown as a
 * tinted pill rather than bare text.
 *
 * @example
 * ```tsx
 * <CellPill accent="violet" href="mailto:nick@attio.com">nick@attio.com</CellPill>
 * ```
 */
export const CellPill = forwardRef<HTMLElement, CellPillProps>(function CellPill(
  { accent = 'gray', href, icon, className, children, ...rest },
  ref,
) {
  const content = (
    <>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span className="cell-pill-text">{children}</span>
    </>
  );
  const classes = cn('cell-pill', className);

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        data-accent={accent}
        data-slot="cell-pill"
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={classes}
      data-accent={accent}
      data-slot="cell-pill"
      {...(rest as HTMLAttributes<HTMLSpanElement>)}
    >
      {content}
    </span>
  );
});
