"use client";

import { useState } from 'react';
import type { CommentItemData } from '../blocks/CommentsThread';

export function useComments(initialComments: CommentItemData[] = []) {
  const [comments, setComments] = useState<CommentItemData[]>(initialComments);

  const addComment = (content: string, author = { name: 'Current User' }) => {
    const newComment: CommentItemData = {
      id: `comment-${Date.now()}`,
      author,
      content,
      timestamp: 'Just now',
    };
    setComments((prev) => [...prev, newComment]);
  };

  return {
    comments,
    setComments,
    addComment,
  };
}
