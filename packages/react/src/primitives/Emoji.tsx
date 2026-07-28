"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import {
  applySkinTone,
  emojiByShortcode,
  emojiFromChar,
  tokenizeEmojiText,
  isEmojiOnly,
  type SkinToneId,
  type TokenizeEmojiOptions,
} from '../utils/emoji';

/* ════════════════════════════════════════════════════════════
   iOS artwork
   ════════════════════════════════════════════════════════════

   Native emoji only look like iOS *on* iOS. On Windows they render as
   Segoe UI Emoji (flat, outlined) and on most Linux as Noto — which is
   why a cross-platform product that cares about its own look ships the
   artwork instead of trusting the platform.

   The artwork here is Apple's, from `emoji-datasource-apple` — the same
   set emoji-mart uses. It is *not* a dependency of this package: the
   published tarball unpacks to 103 MB, which has no business inside a
   design system. Instead the images are addressed on the jsDelivr copy
   of that package, and `assetBase` lets you point at your own host.

   Filenames are the glyph's codepoints, lowercase hex, hyphen-joined —
   derivable from the character with no lookup table. Every one of the
   1,070 glyphs in `utils/emoji.ts` was verified to resolve against the
   real asset set, including ZWJ sequences (🧑‍💻 → 1f9d1-200d-1f4bb),
   regional-indicator flags, keycaps and skin-tone modifiers.

   Anything that fails to load — offline, blocked by CSP, self-hosted set
   missing a glyph — falls back to the native character, so the emoji is
   never simply absent.
*/

/** Which artwork to render. */
export type EmojiSet = 'apple' | 'native';

/** Only one resolution is published upstream; 64 px covers retina to 32 px. */
export const APPLE_EMOJI_CDN =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@16.0.0/img/apple/64';

export interface EmojiConfig {
  /** Artwork set. @default 'apple' */
  set: EmojiSet;
  /**
   * Directory holding `<codepoints>.png`, no trailing slash.
   * @default {@link APPLE_EMOJI_CDN}
   */
  assetBase: string;
  /** Default skin tone for shortcode-resolved glyphs. @default 'default' */
  tone: SkinToneId;
}

const DEFAULT_CONFIG: EmojiConfig = {
  set: 'apple',
  assetBase: APPLE_EMOJI_CDN,
  tone: 'default',
};

const EmojiConfigContext = createContext<EmojiConfig>(DEFAULT_CONFIG);

export interface EmojiProviderProps extends Partial<EmojiConfig> {
  children?: ReactNode;
}

/**
 * EmojiProvider — sets the artwork set, asset host and default skin tone for
 * every `Emoji`, `EmojiText`, `EmojiPicker` and conversation surface beneath it.
 *
 * Self-hosting (recommended for production — it removes the third-party
 * request and survives a CDN outage):
 *
 * ```bash
 * npm i emoji-datasource-apple
 * cp -r node_modules/emoji-datasource-apple/img/apple/64 public/emoji
 * ```
 * ```tsx
 * <EmojiProvider assetBase="/emoji">{app}</EmojiProvider>
 * ```
 *
 * Air-gapped or CSP-restricted builds can opt out of images entirely with
 * `<EmojiProvider set="native">`.
 */
export function EmojiProvider({ set, assetBase, tone, children }: EmojiProviderProps) {
  const parent = useContext(EmojiConfigContext);
  const value = useMemo<EmojiConfig>(
    () => ({
      set: set ?? parent.set,
      assetBase: assetBase ?? parent.assetBase,
      tone: tone ?? parent.tone,
    }),
    [set, assetBase, tone, parent],
  );
  return <EmojiConfigContext.Provider value={value}>{children}</EmojiConfigContext.Provider>;
}

/** Read the active emoji config. */
export function useEmojiConfig(): EmojiConfig {
  return useContext(EmojiConfigContext);
}

/**
 * The asset filename stem for a glyph: lowercase hex codepoints, hyphen-joined,
 * each padded to at least four digits.
 *
 * @example emojiUnified('👋🏽') // "1f44b-1f3fd"
 */
export function emojiUnified(char: string): string {
  return [...char]
    .map((c) => c.codePointAt(0)!.toString(16).padStart(4, '0'))
    .join('-');
}

/** Full image URL for a glyph in the Apple set. */
export function emojiAssetUrl(char: string, assetBase: string = APPLE_EMOJI_CDN): string {
  return `${assetBase.replace(/\/$/, '')}/${emojiUnified(char)}.png`;
}

export interface EmojiProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The glyph. Pass either this or `shortcode`. */
  emoji?: string;
  /** A `:shortcode:` to resolve instead of a literal glyph. */
  shortcode?: string;
  /** Rendered box size in px. @default inherits the surrounding font size */
  size?: number;
  /** Skin tone override. Falls back to the provider's tone. */
  tone?: SkinToneId;
  /** Artwork override. Falls back to the provider's set. */
  set?: EmojiSet;
  /**
   * Accessible name. Defaults to the glyph's own name when it's in the set.
   * Pass `''` for a purely decorative emoji sitting beside equivalent text.
   */
  label?: string;
  /** Render at the jumbo size used for emoji-only messages. */
  jumbo?: boolean;
}

/**
 * Emoji — a single glyph, rendered as iOS artwork by default.
 *
 * Accessibility: carries `role="img"` and an `aria-label` derived from the
 * glyph's name, so a screen reader announces "thumbs up" rather than spelling
 * a codepoint. The `<img>` itself is `alt=""` — the label lives on the wrapper
 * so it reads identically in both the image and native paths.
 *
 * @example
 * ```tsx
 * <Emoji emoji="👍" />
 * <Emoji shortcode="tada" size={20} />
 * <Emoji emoji="👋" tone="medium" label="Waving hello" />
 * ```
 */
export const Emoji = forwardRef<HTMLSpanElement, EmojiProps>(function Emoji(
  { emoji, shortcode, size, tone, set, label, jumbo, className, style, ...rest },
  ref,
) {
  const config = useEmojiConfig();
  // Falling back to the native glyph is per-instance state: one missing asset
  // shouldn't take down every emoji on the page.
  const [imageFailed, setImageFailed] = useState(false);

  const activeTone = tone ?? config.tone;
  const activeSet = set ?? config.set;

  const base = shortcode ? emojiByShortcode(shortcode)?.char : emoji;

  if (!base) return null;

  const glyph = applySkinTone(base, activeTone);
  const entry = emojiFromChar(glyph);
  const accessibleName = label ?? entry?.name ?? '';

  const sizeStyle = size != null ? { fontSize: size, width: size, height: size } : undefined;

  const shared = {
    ref,
    role: accessibleName ? ('img' as const) : undefined,
    'aria-label': accessibleName || undefined,
    'aria-hidden': accessibleName ? undefined : (true as const),
    'data-slot': 'emoji',
    'data-emoji': glyph,
    className: cn('emoji', jumbo && 'emoji-jumbo', className),
    style: { ...sizeStyle, ...style },
    ...rest,
  };

  if (activeSet === 'native' || imageFailed) {
    return <span {...shared}>{glyph}</span>;
  }

  return (
    <span {...shared} className={cn(shared.className, 'emoji-img')}>
      <img
        src={emojiAssetUrl(glyph, config.assetBase)}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={() => setImageFailed(true)}
      />
    </span>
  );
});

export interface EmojiTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The text to render. */
  children?: string;
  /** Skin tone for shortcode-resolved glyphs. */
  tone?: SkinToneId;
  /** Artwork override. */
  set?: EmojiSet;
  /** Expand `:shortcode:` sequences. @default true */
  shortcodes?: boolean;
  /**
   * Render at jumbo size when the text is nothing but emoji, up to this many
   * glyphs. `0` disables it. @default 3
   */
  jumboLimit?: number;
  /** Render as this element instead of a `<span>`. */
  as?: 'span' | 'div' | 'p';
}

/**
 * EmojiText — plain text with its emoji swapped for artwork.
 *
 * Text runs are emitted as-is (so they stay selectable, searchable and
 * copyable) and only the emoji become elements. A message that is *only*
 * emoji renders large, the way every chat client does it — a lone 🎉 is a
 * gesture, not a word.
 *
 * @example
 * ```tsx
 * <EmojiText>Shipped it :tada: nice work 👏</EmojiText>
 * ```
 */
export const EmojiText = forwardRef<HTMLSpanElement, EmojiTextProps>(function EmojiText(
  { children = '', tone, set, shortcodes = true, jumboLimit = 3, as = 'span', className, ...rest },
  ref,
) {
  const config = useEmojiConfig();
  const activeTone = tone ?? config.tone;

  const options: TokenizeEmojiOptions = { shortcodes, tone: activeTone };
  const tokens = useMemo(
    () => tokenizeEmojiText(children, options),
    // `options` is rebuilt each render; depend on its parts instead.
    [children, shortcodes, activeTone],
  );

  const emojiCount = tokens.filter((t) => t.type === 'emoji').length;
  const jumbo =
    jumboLimit > 0 && emojiCount > 0 && emojiCount <= jumboLimit && isEmojiOnly(children, options);

  const Comp = as;

  return (
    <Comp ref={ref as never} className={className} data-slot="emoji-text" {...rest}>
      {tokens.map((token, i) =>
        token.type === 'text' ? (
          token.value
        ) : (
          <Emoji
            key={i}
            emoji={token.value}
            set={set}
            tone={activeTone}
            jumbo={jumbo}
            // Inside a sentence the glyph is content, so it keeps its label.
            label={token.entry?.name}
          />
        ),
      )}
    </Comp>
  );
});
