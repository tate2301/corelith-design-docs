"use client";

import {
  Fragment,
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Avatar } from '../primitives/Avatar';
import { Emoji, EmojiText } from '../primitives/Emoji';
import { EmojiPicker, useRecentEmoji } from '../primitives/EmojiPicker';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/Popover';
import { accentFor, type Accent } from '../tokens/accents';
import { countEmoji, isEmojiOnly } from '../utils/emoji';

/* ════════════════════════════════════════════════════════════
   Data shapes
   ════════════════════════════════════════════════════════════ */

export interface ConversationReaction {
  /** The glyph, e.g. "👍". */
  emoji: string;
  /** How many people reacted. */
  count: number;
  /** Whether the viewer is one of them. */
  reacted?: boolean;
  /** Names for the tooltip ("Alicia, Tyler and 3 others"). */
  by?: string[];
}

export interface ConversationAttachment {
  id?: string;
  name: string;
  /** Pre-formatted size, e.g. "1.4 MB". */
  size?: string;
  href?: string;
  /** Accent for the file tile. Derived from the extension when omitted. */
  accent?: Accent;
}

export type ConversationMessageStatus = 'sent' | 'pending' | 'failed';

export interface ConversationMessageData {
  id: string;
  /** Display name of the sender. */
  author: string;
  /** Avatar image. Falls back to accent-tinted initials. */
  avatarSrc?: string;
  /** Avatar accent. Derived from the author's name when omitted. */
  accent?: Accent;
  /**
   * Optional label chip beside the name ("Plant manager", "Bot").
   * Named `roleLabel` rather than `role` because the row spreads its rest
   * props onto a div, where `role` is the ARIA attribute.
   */
  roleLabel?: ReactNode;
  /** Message text. Emoji and `:shortcodes:` are rendered as artwork. */
  body?: string;
  /** Rich body. Supplied instead of `body` when you need custom nodes. */
  children?: ReactNode;
  /** Pre-formatted timestamp, e.g. "11:42". */
  time?: string;
  /** Sent by the viewer — right-aligns in the bubble variant. */
  own?: boolean;
  /** Delivery state. */
  status?: ConversationMessageStatus;
  /** Shown under the body when `status` is `'failed'`. */
  error?: ReactNode;
  reactions?: ConversationReaction[];
  attachments?: ConversationAttachment[];
  /** Marks the message as edited. */
  edited?: boolean;
}

/* ════════════════════════════════════════════════════════════
   Root
   ════════════════════════════════════════════════════════════ */

export type ConversationVariant = 'flat' | 'bubbles';

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `flat` — Slack/Attio style rows. Denser, better for a work thread.
   * `bubbles` — sender-aligned bubbles, for DM and support surfaces.
   * @default 'flat'
   */
  variant?: ConversationVariant;
}

/**
 * Conversation — the scroll container for a thread. Compose it with
 * `Conversation.List`, `Conversation.Message` and a `Composer`, or hand a
 * `messages` array to {@link ConversationRenderer} and let it do the grouping.
 */
const ConversationRoot = forwardRef<HTMLDivElement, ConversationProps>(function Conversation(
  { variant = 'flat', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('conversation', variant === 'bubbles' && 'conversation-bubbles', className)}
      data-slot="conversation"
      {...rest}
    >
      {children}
    </div>
  );
});

export interface ConversationHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned actions. */
  actions?: ReactNode;
  /** Leading slot — an avatar, an icon tile, an emoji. */
  leading?: ReactNode;
}

export const ConversationHeader = forwardRef<HTMLDivElement, ConversationHeaderProps>(
  function ConversationHeader({ title, subtitle, actions, leading, className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn('conv-head', className)} {...rest}>
        {leading}
        {title || subtitle ? (
          <div>
            {title ? <div className="conv-head-title">{title}</div> : null}
            {subtitle ? <div className="conv-head-sub">{subtitle}</div> : null}
          </div>
        ) : null}
        {children}
        <span className="spacer" />
        {actions}
      </div>
    );
  },
);

export interface ConversationListProps extends HTMLAttributes<HTMLDivElement> {}

export const ConversationList = forwardRef<HTMLDivElement, ConversationListProps>(
  function ConversationList({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn('conv-list', className)} role="log" aria-live="polite" {...rest}>
        {children}
      </div>
    );
  },
);

export interface ConversationDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** The label, e.g. "Today" or "New messages". */
  label: ReactNode;
  /** Style as an unread marker rather than a date. */
  unread?: boolean;
}

export const ConversationDivider = forwardRef<HTMLDivElement, ConversationDividerProps>(
  function ConversationDivider({ label, unread, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn('conv-divider', unread && 'conv-divider-unread', className)}
        role="separator"
        {...rest}
      >
        <span className="conv-divider-label">{label}</span>
      </div>
    );
  },
);

/* ════════════════════════════════════════════════════════════
   Reactions
   ════════════════════════════════════════════════════════════ */

export interface ReactionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onToggle'> {
  reactions?: ConversationReaction[];
  /** Fires when a reaction pill is clicked — toggle it in your store. */
  onToggle?: (emoji: string) => void;
  /** Fires when a new emoji is picked from the add-reaction picker. */
  onAdd?: (emoji: string) => void;
  /** Hide the trailing add-reaction button. */
  hideAdd?: boolean;
}

/**
 * ReactionBar — emoji reaction pills plus an add-reaction picker.
 *
 * Accessibility: each pill is a real toggle button carrying `aria-pressed`, so
 * "have I reacted" is answerable without seeing the tint, and the count is in
 * the accessible name rather than only in the visual.
 */
export const ReactionBar = forwardRef<HTMLDivElement, ReactionBarProps>(function ReactionBar(
  { reactions = [], onToggle, onAdd, hideAdd, className, ...rest },
  ref,
) {
  const [open, setOpen] = useState(false);
  const { recent, push } = useRecentEmoji();

  if (reactions.length === 0 && hideAdd) return null;

  return (
    <div ref={ref} className={cn('conv-reactions', className)} {...rest}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          className="reaction"
          aria-pressed={Boolean(r.reacted)}
          title={r.by?.length ? r.by.join(', ') : undefined}
          aria-label={`${r.emoji} ${r.count} ${r.count === 1 ? 'reaction' : 'reactions'}`}
          onClick={() => onToggle?.(r.emoji)}
        >
          <Emoji emoji={r.emoji} label="" className="reaction-glyph" />
          <span>{r.count}</span>
        </button>
      ))}

      {hideAdd ? null : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <button type="button" className="reaction reaction-add" aria-label="Add reaction">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 0 0 7 0" strokeLinecap="round" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent unstyled side="top" align="start" sideOffset={6} aria-label="Add reaction">
            <EmojiPicker
              recent={recent}
              hideFooter
              onSelect={(glyph) => {
                push(glyph);
                onAdd?.(glyph);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   Message
   ════════════════════════════════════════════════════════════ */

/** File-extension → accent, so an attachment tray isn't a wall of gray. */
const EXTENSION_ACCENT: Record<string, Accent> = {
  csv: 'green',
  xlsx: 'green',
  xls: 'green',
  pdf: 'red',
  doc: 'blue',
  docx: 'blue',
  png: 'violet',
  jpg: 'violet',
  jpeg: 'violet',
  gif: 'violet',
  svg: 'violet',
  zip: 'amber',
  mp4: 'pink',
  mov: 'pink',
};

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

export interface ConversationMessageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'>,
    ConversationMessageData {
  /**
   * Continuation of the previous message by the same author — hides the avatar
   * and header, keeping only the body in the text column.
   */
  grouped?: boolean;
  /** Hover action buttons rendered in the floating bar. */
  actions?: ReactNode;
  onReactionToggle?: (emoji: string, messageId: string) => void;
  onReactionAdd?: (emoji: string, messageId: string) => void;
  /** Hide the add-reaction affordance on this message. */
  hideAddReaction?: boolean;
  /** Max glyphs for a message to still render jumbo. `0` disables. @default 3 */
  jumboLimit?: number;
}

/**
 * ConversationMessage — one row of a thread: avatar, author, time, body,
 * attachments and reactions.
 *
 * Colour comes from the accent channel: the avatar and role chip are tinted by
 * `accent`, which defaults to a hash of the author's name. Two people in a
 * thread therefore never share a colour by accident, and the same person keeps
 * the same colour across sessions and clients without anything being stored.
 *
 * @example
 * ```tsx
 * <ConversationMessage
 *   id="m1"
 *   author="Alicia Reed"
 *   time="11:42"
 *   body="Pour came in at 93.8 % :chart_decreasing: re-assaying now"
 *   reactions={[{ emoji: '👍', count: 3, reacted: true }]}
 * />
 * ```
 */
export const ConversationMessage = forwardRef<HTMLDivElement, ConversationMessageProps>(
  function ConversationMessage(
    {
      id,
      author,
      avatarSrc,
      accent,
      roleLabel,
      body,
      children,
      time,
      own,
      status = 'sent',
      error,
      reactions,
      attachments,
      edited,
      grouped,
      actions,
      onReactionToggle,
      onReactionAdd,
      hideAddReaction,
      jumboLimit = 3,
      className,
      ...rest
    },
    ref,
  ) {
    const hue = accent ?? accentFor(author);

    // A body that is nothing but a handful of emoji renders large and unboxed.
    const jumbo = useMemo(() => {
      if (!body || jumboLimit <= 0) return false;
      return isEmojiOnly(body) && countEmoji(body) <= jumboLimit;
    }, [body, jumboLimit]);

    return (
      <div
        ref={ref}
        className={cn(
          'conv-msg',
          grouped && 'conv-msg-grouped',
          own && 'conv-msg-own',
          status === 'pending' && 'conv-msg-pending',
          status === 'failed' && 'conv-msg-failed',
          className,
        )}
        data-accent={hue}
        data-slot="conversation-message"
        data-message-id={id}
        {...rest}
      >
        <div className="conv-msg-gutter">
          {grouped ? (
            <span className="conv-msg-gutter-time" aria-hidden="true">
              {time}
            </span>
          ) : (
            <Avatar src={avatarSrc} name={author} accent={hue} size="sm" style={{ width: 32, height: 32, fontSize: 12 }} />
          )}
        </div>

        <div className="conv-msg-main">
          {grouped ? null : (
            <div className="conv-msg-head">
              <span className="conv-msg-author">{author}</span>
              {roleLabel ? <span className="conv-msg-role">{roleLabel}</span> : null}
              {time ? <span className="conv-msg-time">{time}</span> : null}
              {edited ? <span className="conv-msg-time">(edited)</span> : null}
            </div>
          )}

          {children ? (
            <div className="conv-msg-body">{children}</div>
          ) : body ? (
            <EmojiText as="div" className="conv-msg-body" jumboLimit={jumbo ? jumboLimit : 0}>
              {body}
            </EmojiText>
          ) : null}

          {attachments?.length ? (
            <div className="conv-attachments">
              {attachments.map((a, i) => {
                const Tag = a.href ? 'a' : 'div';
                const hueForFile = a.accent ?? EXTENSION_ACCENT[extensionOf(a.name)] ?? 'gray';
                return (
                  <Tag
                    key={a.id ?? `${a.name}-${i}`}
                    className="conv-attachment"
                    data-accent={hueForFile}
                    {...(a.href ? { href: a.href } : {})}
                  >
                    <span className="icon-tile icon-tile-sm" aria-hidden="true">
                      {extensionOf(a.name).slice(0, 3).toUpperCase() || '•'}
                    </span>
                    <span className="conv-attachment-name">{a.name}</span>
                    {a.size ? <span className="conv-attachment-size">{a.size}</span> : null}
                  </Tag>
                );
              })}
            </div>
          ) : null}

          {status === 'failed' && error ? <div className="conv-msg-error">{error}</div> : null}

          {reactions?.length || !hideAddReaction ? (
            <ReactionBar
              reactions={reactions}
              hideAdd={hideAddReaction}
              onToggle={(emoji) => onReactionToggle?.(emoji, id)}
              onAdd={(emoji) => onReactionAdd?.(emoji, id)}
            />
          ) : null}
        </div>

        {actions ? <div className="conv-msg-actions">{actions}</div> : null}
      </div>
    );
  },
);

/* ── Typing indicator ─────────────────────────────────────── */

export interface ConversationTypingProps extends HTMLAttributes<HTMLDivElement> {
  /** Who is typing. */
  names?: string[];
}

export const ConversationTyping = forwardRef<HTMLDivElement, ConversationTypingProps>(
  function ConversationTyping({ names = [], className, children, ...rest }, ref) {
    const label =
      children ??
      (names.length === 0
        ? 'Someone is typing'
        : names.length === 1
          ? `${names[0]} is typing`
          : names.length === 2
            ? `${names[0]} and ${names[1]} are typing`
            : `${names[0]} and ${names.length - 1} others are typing`);

    return (
      <div ref={ref} className={cn('conv-typing', className)} aria-live="polite" {...rest}>
        <span className="conv-typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>{label}</span>
      </div>
    );
  },
);

/* ════════════════════════════════════════════════════════════
   Renderer
   ════════════════════════════════════════════════════════════ */

/**
 * The message fields the row understands.
 *
 * The renderer copies these across explicitly rather than spreading the whole
 * object: callers routinely hang their own fields on a message (a raw payload,
 * a channel id, the value their `dayLabel` reads), and a blind spread would
 * forward every one of them to a `<div>` — which React warns about and, for
 * anything that happens to match a DOM attribute name, silently renders.
 */
const MESSAGE_KEYS = [
  'id',
  'author',
  'avatarSrc',
  'accent',
  'roleLabel',
  'body',
  'children',
  'time',
  'own',
  'status',
  'error',
  'reactions',
  'attachments',
  'edited',
] as const satisfies readonly (keyof ConversationMessageData)[];

function pickMessageProps(message: ConversationMessageData): ConversationMessageData {
  // `id` and `author` are required, so seed with them and copy the optional
  // rest — this keeps the return type honest instead of casting a bag of
  // unknowns back into the shape.
  const out: ConversationMessageData = { id: message.id, author: message.author };
  for (const key of MESSAGE_KEYS) {
    const value = message[key];
    if (value !== undefined) Object.assign(out, { [key]: value });
  }
  return out;
}

export interface ConversationRendererProps extends Omit<ConversationProps, 'children'> {
  /**
   * The thread. Extra fields beyond {@link ConversationMessageData} are fine —
   * they're used by your `dayLabel`/`shouldGroup` callbacks and never reach
   * the DOM.
   */
  messages: ConversationMessageData[];
  /**
   * Group a message with the one above it. Default: same author, and the two
   * carry the same `dayLabel`.
   */
  shouldGroup?: (message: ConversationMessageData, previous: ConversationMessageData) => boolean;
  /**
   * Day label for a message — when it changes between two messages, a divider
   * is inserted. Return `undefined` for no dividers at all.
   */
  dayLabel?: (message: ConversationMessageData) => string | undefined;
  /** Index at which to insert an unread divider. */
  unreadAt?: number;
  /** Label for the unread divider. @default 'New messages' */
  unreadLabel?: string;
  onReactionToggle?: (emoji: string, messageId: string) => void;
  onReactionAdd?: (emoji: string, messageId: string) => void;
  /** Per-message hover actions. */
  messageActions?: (message: ConversationMessageData) => ReactNode;
  /** Rendered above the list — typically `<ConversationHeader>`. */
  header?: ReactNode;
  /** Rendered below the list — typically a `<Composer>`. */
  footer?: ReactNode;
  /** Names currently typing. Renders the indicator when non-empty. */
  typing?: string[];
  /** Shown in place of the list when there are no messages. */
  emptyState?: ReactNode;
}

/**
 * ConversationRenderer — hand it an array of messages and it renders the whole
 * thread: day dividers, author grouping, accent-derived avatars, emoji bodies,
 * attachments, reactions and a typing indicator.
 *
 * Grouping is the thing worth not writing twice. Consecutive messages from one
 * author collapse into a single visual block, with the timestamp moving into
 * the gutter on hover — so a five-message burst reads as one turn instead of
 * five stacked headers.
 *
 * @example
 * ```tsx
 * <ConversationRenderer
 *   messages={messages}
 *   dayLabel={(m) => m.dayLabel}
 *   header={<ConversationHeader title="Chris <> Modal" subtitle="4 participants" />}
 *   footer={<Composer onSend={send} />}
 *   onReactionToggle={toggle}
 * />
 * ```
 */
export const ConversationRenderer = forwardRef<HTMLDivElement, ConversationRendererProps>(
  function ConversationRenderer(
    {
      messages,
      shouldGroup,
      dayLabel,
      unreadAt,
      unreadLabel = 'New messages',
      onReactionToggle,
      onReactionAdd,
      messageActions,
      header,
      footer,
      typing,
      emptyState,
      ...rest
    },
    ref,
  ) {
    const group =
      shouldGroup ??
      ((message: ConversationMessageData, previous: ConversationMessageData) =>
        message.author === previous.author &&
        message.own === previous.own &&
        (!dayLabel || dayLabel(message) === dayLabel(previous)));

    return (
      <ConversationRoot ref={ref} {...rest}>
        {header}
        <ConversationList>
          {messages.length === 0 && emptyState ? (
            emptyState
          ) : (
            messages.map((message, i) => {
              const previous = i > 0 ? messages[i - 1] : undefined;
              const day = dayLabel?.(message);
              const previousDay = previous ? dayLabel?.(previous) : undefined;
              const showDay = day !== undefined && day !== previousDay;
              const showUnread = unreadAt === i;
              // A divider always breaks a group — a message under a "Today"
              // rule needs its own header or it looks orphaned.
              const grouped =
                Boolean(previous) && !showDay && !showUnread && group(message, previous!);

              return (
                // A Fragment, not a wrapper element: `.conv-msg + .conv-msg`
                // spacing depends on the rows being real DOM siblings.
                <Fragment key={message.id}>
                  {showDay ? <ConversationDivider label={day} /> : null}
                  {showUnread ? <ConversationDivider label={unreadLabel} unread /> : null}
                  <ConversationMessage
                    {...pickMessageProps(message)}
                    grouped={grouped}
                    actions={messageActions?.(message)}
                    onReactionToggle={onReactionToggle}
                    onReactionAdd={onReactionAdd}
                  />
                </Fragment>
              );
            })
          )}
          {typing?.length ? <ConversationTyping names={typing} /> : null}
        </ConversationList>
        {footer}
      </ConversationRoot>
    );
  },
);

/* ── Compound export ──────────────────────────────────────── */

export type ConversationComponent = typeof ConversationRoot & {
  Header: typeof ConversationHeader;
  List: typeof ConversationList;
  Message: typeof ConversationMessage;
  Divider: typeof ConversationDivider;
  Typing: typeof ConversationTyping;
  Reactions: typeof ReactionBar;
  Renderer: typeof ConversationRenderer;
};

export const Conversation: ConversationComponent = Object.assign(ConversationRoot, {
  Header: ConversationHeader,
  List: ConversationList,
  Message: ConversationMessage,
  Divider: ConversationDivider,
  Typing: ConversationTyping,
  Reactions: ReactionBar,
  Renderer: ConversationRenderer,
});
