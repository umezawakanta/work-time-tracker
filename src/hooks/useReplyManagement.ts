import { useState, useCallback } from 'react';
import type { Reply } from '../types';

export const useReplyManagement = () => {
  const [replyingToMemo, setReplyingToMemo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState<string>('');

  // 返信を開始
  const startReply = useCallback((memoId: string) => {
    setReplyingToMemo(memoId);
    setReplyContent('');
  }, []);

  // 返信をキャンセル
  const cancelReply = useCallback(() => {
    setReplyingToMemo(null);
    setReplyContent('');
  }, []);

  // 返信内容を更新
  const updateReplyContent = useCallback((content: string) => {
    setReplyContent(content);
  }, []);

  // 返信を送信
  const submitReply = useCallback(async (
    memoId: string, 
    content: string, 
    onReply: (memoId: string, content: string) => Promise<void>
  ) => {
    if (content.trim()) {
      await onReply(memoId, content.trim());
      setReplyingToMemo(null);
      setReplyContent('');
    }
  }, []);

  // 返信の編集を開始
  const startEditReply = useCallback((replyId: string, currentContent: string) => {
    setEditingReply(replyId);
    setEditReplyContent(currentContent);
  }, []);

  // 返信の編集をキャンセル
  const cancelEditReply = useCallback(() => {
    setEditingReply(null);
    setEditReplyContent('');
  }, []);

  // 編集中の返信内容を更新
  const updateEditReplyContent = useCallback((content: string) => {
    setEditReplyContent(content);
  }, []);

  // 返信の編集を保存
  const saveEditReply = useCallback(async (
    replyId: string,
    content: string,
    onUpdateReply: (replyId: string, content: string) => Promise<void>
  ) => {
    if (content.trim()) {
      await onUpdateReply(replyId, content.trim());
      setEditingReply(null);
      setEditReplyContent('');
    }
  }, []);

  // 返信がいいねされているかチェック
  const isReplyLiked = useCallback((reply: Reply, currentUserId: string): boolean => {
    return reply.likes && reply.likes.includes(currentUserId);
  }, []);

  // 返信のいいね数を取得
  const getReplyLikeCount = useCallback((reply: Reply): number => {
    return reply.likes ? reply.likes.length : 0;
  }, []);

  return {
    replyingToMemo,
    replyContent,
    editingReply,
    editReplyContent,
    startReply,
    cancelReply,
    updateReplyContent,
    submitReply,
    startEditReply,
    cancelEditReply,
    updateEditReplyContent,
    saveEditReply,
    isReplyLiked,
    getReplyLikeCount
  };
};
