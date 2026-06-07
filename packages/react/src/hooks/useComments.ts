import { useCallback, useState } from 'react';
import type { Comment, CommentAuthor } from '../components/CommentsThread/CommentsThread';

export interface UseCommentsResult {
  comments: Comment[];
  /** Append a top-level comment (or reply if `parentId` is set). */
  add: (text: string, author: CommentAuthor, parentId?: string | null) => Comment;
  /** Replace `body` of the matching comment. */
  edit: (id: string, body: string) => void;
  /** Toggle the resolved flag on a comment. */
  resolve: (id: string) => void;
  /** Toggle `userId` on the given emoji's reaction list. */
  react: (id: string, emoji: string, userId: string) => void;
  /** Convenience — equivalent to `add(text, author, parentId)`. */
  reply: (parentId: string, text: string, author: CommentAuthor) => Comment;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `c-${Date.now().toString(36)}-${counter}`;
}

/**
 * In-memory state manager for `CommentsThread`. Use it to wire the thread up
 * for prototypes and small features; back it with your real persistence layer
 * for production.
 */
export function useComments(initial: Comment[] = []): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>(initial);

  const add = useCallback(
    (text: string, author: CommentAuthor, parentId: string | null = null): Comment => {
      const c: Comment = {
        id: nextId(),
        parentId,
        author,
        body: text,
        createdAt: new Date().toISOString(),
        resolved: false,
        reactions: {},
      };
      setComments((prev) => [...prev, c]);
      return c;
    },
    [],
  );

  const edit = useCallback((id: string, body: string) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, body } : c)));
  }, []);

  const resolve = useCallback((id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)),
    );
  }, []);

  const react = useCallback((id: string, emoji: string, userId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const have = c.reactions?.[emoji] ?? [];
        const next = have.includes(userId)
          ? have.filter((u) => u !== userId)
          : [...have, userId];
        return { ...c, reactions: { ...c.reactions, [emoji]: next } };
      }),
    );
  }, []);

  const reply = useCallback(
    (parentId: string, text: string, author: CommentAuthor) => add(text, author, parentId),
    [add],
  );

  return { comments, add, edit, resolve, react, reply };
}
