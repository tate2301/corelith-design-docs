import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';
import { accentFor, type Accent } from '../tokens/accents';

export type IconTileSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconTileVariant = 'soft' | 'solid' | 'outline';

export interface IconTileProps extends HTMLAttributes<HTMLSpanElement> {
  /** Accent hue. @default 'gray' */
  accent?: Accent;
  /**
   * Derive the accent from this string instead of passing one. Same hash the
   * avatar uses, so a module keeps one colour wherever it appears.
   */
  accentSeed?: string;
  /** Box size. @default 'md' (32 px) */
  size?: IconTileSize;
  /** Fill treatment. @default 'soft' */
  variant?: IconTileVariant;
  /** Fully round instead of the rounded square. */
  round?: boolean;
  /** Render the tile styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

const SIZE_CLASS: Record<IconTileSize, string | undefined> = {
  xs: 'icon-tile-xs',
  sm: 'icon-tile-sm',
  md: undefined,
  lg: 'icon-tile-lg',
  xl: 'icon-tile-xl',
};

const VARIANT_CLASS: Record<IconTileVariant, string | undefined> = {
  soft: undefined,
  solid: 'icon-tile-solid',
  outline: 'icon-tile-outline',
};

/**
 * IconTile — the rounded, tinted square behind an icon, an emoji, or a two-
 * or three-letter stub.
 *
 * The system had already grown five hand-rolled versions of this shape
 * (`.nc-ic`, `.fr-ic`, `.n-av`, `.ft-thumb`, `.dh-mark`), each with its own
 * size and its own gray. This is the one to reach for now; the accent channel
 * gives it colour, which is most of what turns a list of identical gray
 * squares into something you can scan.
 *
 * Accessibility: purely decorative by default. The tile is `aria-hidden`
 * unless you give it a `role`/`aria-label`, because the meaning almost always
 * lives in the label sitting next to it.
 *
 * @example
 * ```tsx
 * <IconTile accent="violet"><ChartIcon /></IconTile>
 * <IconTile accentSeed="Invoices" size="lg" variant="solid">IN</IconTile>
 * <IconTile accent="green" round><Emoji emoji="🌱" label="" /></IconTile>
 * ```
 */
export const IconTile = forwardRef<HTMLSpanElement, IconTileProps>(function IconTile(
  {
    accent,
    accentSeed,
    size = 'md',
    variant = 'soft',
    round,
    asChild,
    className,
    children,
    role,
    ...rest
  },
  ref,
) {
  const hue = accent ?? (accentSeed ? accentFor(accentSeed) : 'gray');
  const labelled = Boolean(role || rest['aria-label'] || rest['aria-labelledby']);

  const props = {
    ref: ref as React.Ref<HTMLElement>,
    className: cn(
      'icon-tile',
      SIZE_CLASS[size],
      VARIANT_CLASS[variant],
      round && 'icon-tile-round',
      className,
    ),
    'data-slot': 'icon-tile',
    'data-accent': hue,
    role,
    'aria-hidden': labelled ? undefined : (true as const),
    ...rest,
  };

  if (asChild) {
    return <Slot {...props}>{children as React.ReactElement}</Slot>;
  }

  return <span {...props}>{children}</span>;
});
