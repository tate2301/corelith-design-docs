import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../utils/cx';
import './CommentsThread.css';

export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  parentId: string | null;
  author: CommentAuthor;
  body: string;
  createdAt: string;
  resolved?: boolean;
  reactions?: Record<string, string[]>; // emoji → userIds
}

export interface MentionTarget {
  id: string;
  name: string;
}

export interface CommentsThreadProps {
  comments: Comment[];
  currentUser: CommentAuthor;
  /** Users who can be @mentioned. The composer opens an inline picker on `@`. */
  mentionable?: MentionTarget[];
  onAdd?: (text: string, parentId?: string | null) => void;
  onEdit?: (id: string, text: string) => void;
  onResolve?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
  /** Reveal resolved comments. Toggled by the built-in `Show resolved (N)` button. */
  showResolved?: boolean;
  onToggleShowResolved?: (next: boolean) => void;
  className?: string;
}

export const DEFAULT_REACTIONS = ['👍', '❤️', '😄', '🎉', '🤔', '👀'] as const;

/**
 * Flat-`Comment[]` threaded discussion. One nesting level — replies are
 * siblings of the comment they answer; deeper "replies of replies" degrade to
 * the same level with a `replying to X` prefix.
 */
/**
 * CommentsThread — threaded comments with reactions.
 *
 * @example
 * ```tsx
 * <CommentsThread />
 * ```
 */
export function CommentsThread({
  comments,
  currentUser,
  mentionable = [],
  onAdd,
  onEdit,
  onResolve,
  onReact,
  showResolved,
  onToggleShowResolved,
  className,
}: CommentsThreadProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, Comment>();
    comments.forEach((c) => m.set(c.id, c));
    return m;
  }, [comments]);

  const roots = useMemo(
    () => comments.filter((c) => c.parentId === null),
    [comments],
  );
  const repliesOf = useMemo(() => {
    const m = new Map<string, Comment[]>();
    for (const c of comments) {
      if (c.parentId) {
        const arr = m.get(c.parentId) ?? [];
        arr.push(c);
        m.set(c.parentId, arr);
      }
    }
    return m;
  }, [comments]);

  const resolvedCount = comments.filter((c) => c.resolved).length;

  return (
    <div className={cx('comments-thread', className)}>
      {roots
        .filter((c) => showResolved || !c.resolved)
        .map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            replies={(repliesOf.get(c.id) ?? []).filter(
              (r) => showResolved || !r.resolved,
            )}
            allById={byId}
            currentUser={currentUser}
            mentionable={mentionable}
            editingId={editingId}
            onStartEdit={(id) => setEditingId(id)}
            onCancelEdit={() => setEditingId(null)}
            onSaveEdit={(id, text) => {
              onEdit?.(id, text);
              setEditingId(null);
            }}
            onResolve={onResolve}
            onReact={onReact}
            onStartReply={(id) => setReplyTo(id)}
            replyOpenFor={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSubmitReply={(parentId, text) => {
              onAdd?.(text, parentId);
              setReplyTo(null);
            }}
          />
        ))}

      {resolvedCount > 0 && onToggleShowResolved ? (
        <button
          type="button"
          className="comments-show-resolved"
          onClick={() => onToggleShowResolved(!showResolved)}
        >
          {showResolved ? 'Hide resolved' : `Show resolved (${resolvedCount})`}
        </button>
      ) : null}

      <Composer
        currentUser={currentUser}
        mentionable={mentionable}
        onSubmit={(text) => onAdd?.(text, null)}
        placeholder="Write a comment…"
      />
    </div>
  );
}

// ── Comment row ────────────────────────────────────────────────
interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  allById: Map<string, Comment>;
  currentUser: CommentAuthor;
  mentionable: MentionTarget[];
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string) => void;
  onResolve?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
  onStartReply: (id: string) => void;
  replyOpenFor: string | null;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => void;
}

function CommentItem(props: CommentItemProps) {
  const {
    comment,
    replies,
    allById,
    currentUser,
    mentionable,
    editingId,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onResolve,
    onReact,
    onStartReply,
    replyOpenFor,
    onCancelReply,
    onSubmitReply,
  } = props;

  return (
    <article className={cx('comment', comment.resolved && 'is-resolved')} data-comment-id={comment.id}>
      <CommentRow
        comment={comment}
        currentUser={currentUser}
        mentionable={mentionable}
        editing={editingId === comment.id}
        onStartEdit={() => onStartEdit(comment.id)}
        onCancelEdit={onCancelEdit}
        onSaveEdit={(text) => onSaveEdit(comment.id, text)}
        onResolve={() => onResolve?.(comment.id)}
        onReact={(emoji) => onReact?.(comment.id, emoji)}
        onReply={() => onStartReply(comment.id)}
      />
      {replies.length > 0 ? (
        <div className="comment-replies">
          {replies.map((r) => {
            const parent = r.parentId ? allById.get(r.parentId) : null;
            return (
              <CommentRow
                key={r.id}
                comment={r}
                currentUser={currentUser}
                mentionable={mentionable}
                editing={editingId === r.id}
                onStartEdit={() => onStartEdit(r.id)}
                onCancelEdit={onCancelEdit}
                onSaveEdit={(text) => onSaveEdit(r.id, text)}
                onResolve={() => onResolve?.(r.id)}
                onReact={(emoji) => onReact?.(r.id, emoji)}
                onReply={() => onStartReply(comment.id /* anchor reply to top of thread */)}
                replyingToHint={parent && parent.id !== comment.id ? parent.author.name : undefined}
              />
            );
          })}
        </div>
      ) : null}
      {replyOpenFor === comment.id ? (
        <div className="comment-reply-box">
          <Composer
            currentUser={currentUser}
            mentionable={mentionable}
            onSubmit={(text) => onSubmitReply(comment.id, text)}
            onCancel={onCancelReply}
            placeholder={`Reply to ${comment.author.name}…`}
            autoFocus
          />
        </div>
      ) : null}
    </article>
  );
}

interface CommentRowProps {
  comment: Comment;
  currentUser: CommentAuthor;
  mentionable: MentionTarget[];
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (text: string) => void;
  onResolve: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  replyingToHint?: string;
}

function CommentRow({
  comment,
  currentUser,
  mentionable,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onResolve,
  onReact,
  onReply,
  replyingToHint,
}: CommentRowProps) {
  const isMine = comment.author.id === currentUser.id;
  const initials = comment.author.name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={cx('comment-row', editing && 'comment-editing')}>
      <div className="comment-head">
        <span className="ca" aria-hidden="true">{initials}</span>
        <div className="comment-meta">
          <span className="who">{comment.author.name}</span>
          <span className="when">{comment.createdAt}</span>
          {comment.resolved ? <span className="comment-resolved-pill">Resolved</span> : null}
        </div>
      </div>
      {replyingToHint ? (
        <div className="comment-replying-to">replying to {replyingToHint}</div>
      ) : null}
      <div className="comment-body">
        {editing ? (
          <Composer
            initial={comment.body}
            currentUser={currentUser}
            mentionable={mentionable}
            onSubmit={onSaveEdit}
            onCancel={onCancelEdit}
            placeholder="Edit comment…"
            autoFocus
            submitLabel="Save"
          />
        ) : (
          <RenderedBody body={comment.body} />
        )}
      </div>
      {!editing ? (
        <>
          <div className="comment-react-row">
            {DEFAULT_REACTIONS.map((emoji) => {
              const users = comment.reactions?.[emoji] ?? [];
              const mine = users.includes(currentUser.id);
              return (
                <button
                  key={emoji}
                  type="button"
                  className={cx('comment-react', mine && 'is-mine')}
                  onClick={() => onReact(emoji)}
                  aria-label={`React ${emoji}`}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {users.length > 0 ? <span className="count">{users.length}</span> : null}
                </button>
              );
            })}
          </div>
          <div className="comment-actions">
            <button type="button" onClick={onReply}>Reply</button>
            {isMine ? <button type="button" onClick={onStartEdit}>Edit</button> : null}
            <button type="button" onClick={onResolve}>
              {comment.resolved ? 'Reopen' : 'Resolve'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function RenderedBody({ body }: { body: string }) {
  // Highlight @mentions inline. We render plaintext for everything else.
  const parts = body.split(/(@[\w-]+)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('@') ? (
          <span key={i} className="mention">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

// ── Composer with @mention autocomplete ────────────────────────
interface ComposerProps {
  currentUser: CommentAuthor;
  mentionable: MentionTarget[];
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  initial?: string;
  autoFocus?: boolean;
  submitLabel?: string;
}

function Composer({
  mentionable,
  onSubmit,
  onCancel,
  placeholder,
  initial = '',
  autoFocus,
  submitLabel = 'Comment',
}: ComposerProps) {
  const [text, setText] = useState(initial);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const id = useId();

  const matches = useMemo(() => {
    if (!mentionOpen) return [];
    const q = mentionQuery.toLowerCase();
    return mentionable
      .filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
      .slice(0, 6);
  }, [mentionOpen, mentionQuery, mentionable]);

  const updateMentionState = (next: string, cursor: number) => {
    // Find the last `@` before the cursor, and require that everything between
    // it and the cursor is a single word (no spaces, no newlines).
    const before = next.slice(0, cursor);
    const at = before.lastIndexOf('@');
    if (at < 0) {
      setMentionOpen(false);
      return;
    }
    const token = before.slice(at + 1);
    if (/^[\w-]*$/.test(token)) {
      setMentionOpen(true);
      setMentionQuery(token);
    } else {
      setMentionOpen(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setText(next);
    updateMentionState(next, e.target.selectionStart ?? next.length);
  };

  const insertMention = (m: MentionTarget) => {
    const el = textareaRef.current;
    const cursor = el?.selectionStart ?? text.length;
    const before = text.slice(0, cursor);
    const after = text.slice(cursor);
    const at = before.lastIndexOf('@');
    if (at < 0) {
      setMentionOpen(false);
      return;
    }
    const nextText = `${before.slice(0, at)}@${m.id} ${after}`;
    setText(nextText);
    setMentionOpen(false);
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      if (mentionOpen) {
        setMentionOpen(false);
        return;
      }
      onCancel?.();
      return;
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="comment-composer">
      <textarea
        ref={textareaRef}
        id={id}
        className="comment-composer-input"
        rows={2}
        value={text}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      {mentionOpen && matches.length > 0 ? (
        <ul className="mention-popover" role="listbox" aria-label="Mention a teammate">
          {matches.map((m) => (
            <li key={m.id} role="option">
              <button
                type="button"
                className="mention-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(m);
                }}
              >
                <span className="mention-name">{m.name}</span>
                <span className="mention-id">@{m.id}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="comment-composer-actions">
        {onCancel ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={submit}
          disabled={!text.trim()}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
