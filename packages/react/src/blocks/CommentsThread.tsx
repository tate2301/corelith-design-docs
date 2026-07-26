"use client";

import { useState, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Avatar } from '../primitives/Avatar';
import { TextArea } from '../primitives/TextArea';
import { Button } from '../primitives/Button';

export interface CommentItemData {
  id: string;
  author: { name: string; avatar?: string };
  content: ReactNode;
  timestamp: string;
}

export interface CommentsThreadProps extends HTMLAttributes<HTMLDivElement> {
  comments?: CommentItemData[];
  onAddComment?: (text: string) => void;
  currentUser?: { name: string; avatar?: string };
}

export const CommentsThread = forwardRef<HTMLDivElement, CommentsThreadProps>(function CommentsThread(
  { comments = [], onAddComment, currentUser, className, style, ...props },
  ref,
) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddComment?.(text);
    setText('');
  };

  return (
    <div
      ref={ref}
      className={cn('b-comments-thread', className)}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, ...style }}
      {...props}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              display: 'flex',
              gap: 12,
              padding: '12px 16px',
              backgroundColor: 'var(--surface, #ffffff)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: 10,
            }}
          >
            <Avatar name={comment.author.name} src={comment.author.avatar} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ font: '600 13px/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>
                  {comment.author.name}
                </span>
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-subtle)' }}>
                  {comment.timestamp}
                </span>
              </div>
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-body)', marginTop: 4 }}>
                {comment.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {onAddComment && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            paddingTop: 8,
          }}
        >
          <Avatar name={currentUser?.name || 'User'} src={currentUser?.avatar} size="sm" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
            />
            <div style={{ alignSelf: 'flex-end' }}>
              <Button size="sm" onClick={handleSubmit} disabled={!text.trim()}>
                Post comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
