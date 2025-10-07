import { useState, useCallback } from 'react';

// デフォルトのカテゴリ
const DEFAULT_CATEGORIES = [
  '技術', '学習', 'アイデア', 'メモ', '日記', '仕事', 'プライベート', 'その他'
];

export const useGenreManagement = () => {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [deletedDefaultCategories, setDeletedDefaultCategories] = useState<string[]>([]);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);

  // 利用可能なカテゴリを取得
  const getAvailableGenres = useCallback(() => {
    return DEFAULT_CATEGORIES.filter(cat => !deletedDefaultCategories.includes(cat))
      .concat(customCategories);
  }, [customCategories, deletedDefaultCategories]);

  // カスタムカテゴリを追加
  const handleAddGenre = useCallback((newGenre: string) => {
    if (newGenre.trim() && !customCategories.includes(newGenre.trim())) {
      setCustomCategories(prev => [...prev, newGenre.trim()]);
    }
  }, [customCategories]);

  // カスタムカテゴリを編集
  const handleEditGenre = useCallback((oldGenre: string, newGenre: string) => {
    if (newGenre.trim() && newGenre.trim() !== oldGenre) {
      setCustomCategories(prev => 
        prev.map(cat => cat === oldGenre ? newGenre.trim() : cat)
      );
    }
  }, []);

  // カスタムカテゴリを削除
  const handleDeleteGenre = useCallback((genre: string) => {
    setCustomCategories(prev => prev.filter(cat => cat !== genre));
  }, []);

  // デフォルトカテゴリを削除（非表示）
  const handleDeleteDefaultGenre = useCallback((genre: string) => {
    if (!deletedDefaultCategories.includes(genre)) {
      setDeletedDefaultCategories(prev => [...prev, genre]);
    }
  }, [deletedDefaultCategories]);

  // デフォルトカテゴリを復元
  const handleRestoreDefaultGenre = useCallback((genre: string) => {
    setDeletedDefaultCategories(prev => prev.filter(cat => cat !== genre));
  }, []);

  // ジャンル管理モーダルを開く
  const openGenreModal = useCallback(() => {
    setIsGenreModalOpen(true);
  }, []);

  // ジャンル管理モーダルを閉じる
  const closeGenreModal = useCallback(() => {
    setIsGenreModalOpen(false);
  }, []);

  // ジャンル管理を保存
  const saveGenreManagement = useCallback(() => {
    // ローカルストレージに保存
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
    localStorage.setItem('deletedDefaultCategories', JSON.stringify(deletedDefaultCategories));
    closeGenreModal();
  }, [customCategories, deletedDefaultCategories, closeGenreModal]);

  // ローカルストレージからジャンル管理データを読み込み
  const loadGenreManagement = useCallback(() => {
    const savedCustomCategories = localStorage.getItem('customCategories');
    const savedDeletedDefaultCategories = localStorage.getItem('deletedDefaultCategories');
    
    if (savedCustomCategories) {
      setCustomCategories(JSON.parse(savedCustomCategories));
    }
    if (savedDeletedDefaultCategories) {
      setDeletedDefaultCategories(JSON.parse(savedDeletedDefaultCategories));
    }
  }, []);

  return {
    customCategories,
    deletedDefaultCategories,
    isGenreModalOpen,
    getAvailableGenres,
    handleAddGenre,
    handleEditGenre,
    handleDeleteGenre,
    handleDeleteDefaultGenre,
    handleRestoreDefaultGenre,
    openGenreModal,
    closeGenreModal,
    saveGenreManagement,
    loadGenreManagement,
    DEFAULT_CATEGORIES
  };
};
