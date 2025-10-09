import { useState } from 'react';
import type { Memo } from '../types';

export const useMemoEditing = () => {
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingTags, setEditingTags] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [editingContent, setEditingContent] = useState<string>('');

  // 編集を開始
  const startEditing = (memo: Memo) => {
    setEditingMemoId(memo.id);
    setEditingStatus(memo.status || 'pending');
    setEditingTags(memo.tags.join(', '));
    setEditingTitle(memo.title || '');
    setEditingContent(memo.content || '');
  };

  // 編集をキャンセル
  const cancelEditing = () => {
    setEditingMemoId(null);
    setEditingStatus('');
    setEditingTags('');
    setEditingTitle('');
    setEditingContent('');
  };

  // 編集を保存
  const saveEditing = () => {
    const editedMemo = {
      id: editingMemoId!,
      status: editingStatus,
      tags: editingTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      title: editingTitle,
      content: editingContent,
    };
    
    // 編集状態をリセット
    cancelEditing();
    
    return editedMemo;
  };

  // 編集中のメモかどうかを判定
  const isEditing = (memoId: string): boolean => {
    return editingMemoId === memoId;
  };

  // 編集可能かどうかを判定
  const canEdit = (memo: Memo, user: any): boolean => {
    if (!user) return false;
    return memo.author === user.email || memo.author === user.displayName;
  };

  // 編集状態をリセット
  const resetEditing = () => {
    setEditingMemoId(null);
    setEditingStatus('');
    setEditingTags('');
    setEditingTitle('');
    setEditingContent('');
  };

  // 編集内容を検証
  const validateEditing = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!editingTitle.trim()) {
      errors.push('タイトルは必須です');
    }
    
    if (!editingContent.trim()) {
      errors.push('内容は必須です');
    }
    
    if (editingTitle.length > 100) {
      errors.push('タイトルは100文字以内で入力してください');
    }
    
    if (editingContent.length > 5000) {
      errors.push('内容は5000文字以内で入力してください');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 編集内容を取得
  const getEditingData = () => {
    return {
      id: editingMemoId,
      status: editingStatus,
      tags: editingTags,
      title: editingTitle,
      content: editingContent,
    };
  };

  // 編集内容を設定
  const setEditingData = (data: {
    status?: string;
    tags?: string;
    title?: string;
    content?: string;
  }) => {
    if (data.status !== undefined) setEditingStatus(data.status);
    if (data.tags !== undefined) setEditingTags(data.tags);
    if (data.title !== undefined) setEditingTitle(data.title);
    if (data.content !== undefined) setEditingContent(data.content);
  };

  return {
    // 状態
    editingMemoId,
    editingStatus,
    setEditingStatus,
    editingTags,
    setEditingTags,
    editingTitle,
    setEditingTitle,
    editingContent,
    setEditingContent,
    
    // アクション
    startEditing,
    cancelEditing,
    saveEditing,
    resetEditing,
    
    // ユーティリティ
    isEditing,
    canEdit,
    validateEditing,
    getEditingData,
    setEditingData,
  };
};

