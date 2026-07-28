"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { EmojiPicker, useRecentEmoji } from '../primitives/EmojiPicker';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/Popover';
import { replaceShortcodes, type SkinToneId } from '../utils/emoji';

export interface ComposerAttachment {
  id: string;
  name: string;
  size?: string;
}

/** Imperative handle, for hosts that need to drive the editor. */
export interface ComposerHandle {
  focus: () => void;
  clear: () => void;
  /** Insert text at the caret, replacing any selection. */
  insert: (text: string) => void;
  /** The underlying textarea. A getter, so it's live rather than a snapshot. */
  readonly textarea: HTMLTextAreaElement | null;
}

/** Narrow an unknown handler result to a promise without assuming a real Promise. */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

export interface ComposerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onChange' | 'children'> {
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * Fires on send. Return `false` to keep the text in the box (a failed
   * optimistic send); anything else clears it.
   */
  onSend?: (value: string, attachments: ComposerAttachment[]) => void | boolean | Promise<unknown>;
  placeholder?: string;
  /** Disable the whole control. */
  disabled?: boolean;
  /** Max characters. Over the limit, send is blocked and the counter turns red. */
  maxLength?: number;
  /** Show the "Enter to send" hint. @default true */
  hint?: ReactNode;
  /**
   * `enter` — Enter sends, Shift+Enter newlines (chat default).
   * `modifier` — Cmd/Ctrl+Enter sends, Enter newlines (long-form default).
   * @default 'enter'
   */
  sendOn?: 'enter' | 'modifier';
  /** Expand `:shortcodes:` to glyphs on send. @default true */
  expandShortcodes?: boolean;
  /** Skin tone for the picker and shortcode expansion. */
  tone?: SkinToneId;
  /** Hide the emoji button. */
  hideEmoji?: boolean;
  /** Attachment chips shown above the tool row. */
  attachments?: ComposerAttachment[];
  onAttachmentRemove?: (id: string) => void;
  /** Fires when the attach button is pressed. Omit to hide the button. */
  onAttach?: () => void;
  /** Extra tool buttons, left of the spacer. */
  tools?: ReactNode;
  /** Extra actions, right of the spacer and before Send. */
  actions?: ReactNode;
  /** Reply/quote strip above the editor. */
  context?: ReactNode;
  /** Fires when the context strip's dismiss button is pressed. */
  onContextDismiss?: () => void;
  /** Drop the composer's own border — for use inside a bordered card. */
  bare?: boolean;
  /** Rows the editor starts at. @default 1 */
  rows?: number;
  /** Accessible label for the editor. @default 'Message' */
  label?: string;
}

/**
 * Composer — the message editor: autogrowing textarea, emoji picker, optional
 * attachments, and a send button.
 *
 * The textarea autogrows by resetting `height` to `auto` before reading
 * `scrollHeight` — without the reset, the box can only ever grow, so deleting
 * a paragraph leaves a tall empty editor. CSS caps it at `max-height` and the
 * overflow becomes a scroll.
 *
 * Emoji insertion goes through the caret rather than appending: picking 🎉
 * mid-sentence puts it where the cursor is and leaves the cursor after it,
 * which is the only behaviour that survives real use.
 *
 * @example
 * ```tsx
 * <Composer
 *   placeholder="Message #general"
 *   onSend={(text) => send(text)}
 *   onAttach={openFilePicker}
 * />
 * ```
 */
export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer(
  {
    value: valueProp,
    defaultValue = '',
    onChange,
    onSend,
    placeholder = 'Write a message',
    disabled,
    maxLength,
    hint,
    sendOn = 'enter',
    expandShortcodes = true,
    tone,
    hideEmoji,
    attachments = [],
    onAttachmentRemove,
    onAttach,
    tools,
    actions,
    context,
    onContextDismiss,
    bare,
    rows = 1,
    label = 'Message',
    className,
    ...rest
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { recent, push } = useRecentEmoji();

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolled;

  const commit = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  // ── Autogrow ──────────────────────────────────────────────
  // Layout effect so the height is correct in the same frame the text changes;
  // a passive effect here shows a one-frame flash of the wrong height.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const insert = useCallback(
    (text: string) => {
      const el = textareaRef.current;
      if (!el) {
        commit(value + text);
        return;
      }
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;
      const next = value.slice(0, start) + text + value.slice(end);
      commit(next);
      // The value lands on the next render, so the caret has to be restored
      // after it — otherwise React resets it to the end of the field.
      requestAnimationFrame(() => {
        const node = textareaRef.current;
        if (!node) return;
        const caret = start + text.length;
        node.focus();
        node.setSelectionRange(caret, caret);
      });
    },
    [commit, value],
  );

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      clear: () => commit(''),
      insert,
      get textarea() {
        return textareaRef.current;
      },
    }),
    [commit, insert],
  );

  const overLimit = maxLength != null && value.length > maxLength;
  const canSend = !disabled && !overLimit && (value.trim().length > 0 || attachments.length > 0);

  const send = () => {
    if (!canSend) return;
    const payload = expandShortcodes ? replaceShortcodes(value, tone ?? 'default') : value;
    const result = onSend?.(payload, attachments);

    // `false` is the explicit "keep it" signal; anything else means sent.
    //
    // A synchronous handler clears in the same tick as the keypress. Awaiting
    // unconditionally would defer the clear by a microtask, which shows a
    // frame of the just-sent text still sitting in the box — the exact flicker
    // an optimistic send is supposed to avoid.
    if (isThenable(result)) {
      void result.then((settled) => {
        if (settled !== false) commit('');
      });
      return;
    }
    if (result !== false) commit('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    const withModifier = event.metaKey || event.ctrlKey;

    if (sendOn === 'enter') {
      if (event.shiftKey) return;
      event.preventDefault();
      send();
      return;
    }

    if (withModifier) {
      event.preventDefault();
      send();
    }
  };

  const defaultHint =
    sendOn === 'enter' ? 'Enter to send · Shift + Enter for a new line' : 'Cmd + Enter to send';

  return (
    <div
      className={cn('composer', bare && 'composer-bare', overLimit && 'composer-invalid', className)}
      aria-disabled={disabled || undefined}
      data-slot="composer"
      {...rest}
    >
      {context ? (
        <div className="composer-context">
          <span className="composer-context-body">{context}</span>
          {onContextDismiss ? (
            <button type="button" aria-label="Dismiss reply context" onClick={onContextDismiss}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        className="composer-editor"
        rows={rows}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={overLimit || undefined}
        onChange={(e) => commit(e.target.value)}
        onKeyDown={onKeyDown}
      />

      {attachments.length > 0 ? (
        <div className="composer-attachments">
          {attachments.map((a) => (
            <span key={a.id} className="composer-attachment">
              <span className="composer-attachment-name">{a.name}</span>
              {onAttachmentRemove ? (
                <button type="button" aria-label={`Remove ${a.name}`} onClick={() => onAttachmentRemove(a.id)}>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      <div className="composer-tools">
        {hideEmoji ? null : (
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger>
              <button
                type="button"
                className="composer-tool"
                aria-label="Insert emoji"
                disabled={disabled}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 0 0 7 0" strokeLinecap="round" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent unstyled side="top" align="start" sideOffset={8} aria-label="Emoji">
              <EmojiPicker
                recent={recent}
                tone={tone}
                onSelect={(glyph) => {
                  push(glyph);
                  insert(glyph);
                  setEmojiOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        )}

        {onAttach ? (
          <button
            type="button"
            className="composer-tool"
            aria-label="Attach a file"
            disabled={disabled}
            onClick={onAttach}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M21.4 11.05 12.25 20.2a5.5 5.5 0 0 1-7.78-7.78l9.2-9.19a3.67 3.67 0 0 1 5.18 5.18l-9.2 9.2a1.83 1.83 0 0 1-2.59-2.6l8.5-8.49" />
            </svg>
          </button>
        ) : null}

        {tools}
        <span className="spacer" />

        {maxLength != null ? (
          <span className={cn('composer-count', overLimit && 'composer-count-over')}>
            {value.length}/{maxLength}
          </span>
        ) : null}

        {hint === false || hint === null ? null : (
          <span className="composer-hint">{hint ?? defaultHint}</span>
        )}

        {actions}

        <button
          type="button"
          className="composer-send"
          aria-label="Send message"
          disabled={!canSend}
          onClick={send}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
});
