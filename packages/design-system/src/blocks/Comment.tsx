import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type CommentData = {
  /** Initials shown in the avatar (e.g. "SK"). */
  initials?: ReactNode;
  /** Optional avatar background/foreground override. Defaults to brand tint. */
  avatarColor?: { bg: string; fg: string };
  /** Author name. */
  author: ReactNode;
  /** Optional role/subtitle next to the name ("Plant manager"). */
  meta?: ReactNode;
  /** Right-aligned timestamp. */
  time?: ReactNode;
  /** The comment body. */
  body: ReactNode;
};

export interface CommentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    CommentData {
  /** Footer action row (Reply / Edit links, etc.). */
  actions?: ReactNode;
  /** Nested replies, rendered in an indented rail. */
  children?: ReactNode;
  /** When false, drop the bottom hairline. @default true */
  bordered?: boolean;
}

const DEFAULT_AVATAR = { bg: 'var(--brand-soft)', fg: 'var(--brand-strong)' };

/**
 * Comment — a single thread item: avatar · author · meta · time · body.
 * Maps to `.comment` in components.css. Nest replies via children.
 *
 * @example
 * ```tsx
 * <Comment
 *   initials="SK"
 *   author="Stanford Kuda"
 *   meta="Plant manager"
 *   time="2 h ago"
 *   body="Pour came in at 93.8 %, declared 95.0. Re-assaying."
 * />
 * ```
 */
export const Comment = forwardRef<HTMLDivElement, CommentProps>(function Comment(
  { initials, avatarColor, author, meta, time, body, actions, children, bordered = true, className, style, ...rest },
  ref,
) {
  const av = avatarColor ?? DEFAULT_AVATAR;
  return (
    <div
      ref={ref}
      className={cn('comment', className)}
      style={{ borderBottom: bordered ? '1px solid var(--border-subtle)' : undefined, ...style }}
      {...rest}
    >
      <div className="ca" aria-hidden="true" style={{ background: av.bg, color: av.fg }}>
        {initials}
      </div>
      <div>
        <div className="ch">
          <span className="who">{author}</span>
          {meta ? <span style={{ font: '12px/1 var(--font-sans)', color: 'var(--text-muted)' }}>{meta}</span> : null}
          {time != null ? <span className="when" style={{ marginLeft: 'auto' }}>{time}</span> : null}
        </div>
        <p className="body" style={{ margin: 0 }}>{body}</p>
        {actions ? <div className="actions">{actions}</div> : null}
        {children ? <div className="comment-replies" style={{ marginTop: 10 }}>{children}</div> : null}
      </div>
    </div>
  );
});

export interface CommentComposerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /** Initials for the composing user's avatar. */
  initials?: ReactNode;
  /** The textarea node (or any editor). Pass a controlled <textarea className="textarea" />. */
  children: ReactNode;
  /** Left-aligned tools (Mention, Attach). */
  tools?: ReactNode;
  /** Right-aligned actions (Cancel, Post). */
  actions?: ReactNode;
}

/**
 * CommentComposer — the new-comment editor at the foot of a thread.
 * Avatar + editor slot + a tool/action row. Maps to the composer in
 * `system/b-comment.html`.
 *
 * @example
 * ```tsx
 * <CommentComposer
 *   initials="MN"
 *   tools={<><Button variant="quiet" size="sm">Mention</Button></>}
 *   actions={<><Button variant="ghost" size="sm">Cancel</Button><Button variant="primary" size="sm">Post comment</Button></>}
 * >
 *   <textarea className="textarea" placeholder="Add a comment…" style={{ minHeight: 70 }} />
 * </CommentComposer>
 * ```
 */
export const CommentComposer = forwardRef<HTMLDivElement, CommentComposerProps>(function CommentComposer(
  { initials, children, tools, actions, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('comment-composer', className)}
      style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12, padding: '8px 0', ...style }}
      {...rest}
    >
      <div
        className="ca"
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--brand-soft)',
          color: 'var(--brand-strong)',
          display: 'grid',
          placeItems: 'center',
          font: '600 12px/1 var(--font-sans)',
        }}
      >
        {initials}
      </div>
      <div>
        {children}
        {(tools || actions) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            {tools}
            <span style={{ flex: 1 }} />
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
});
