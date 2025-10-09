import { useState, useEffect } from 'react';
import type { Memo } from '../types';

interface MemoLikeState {
  isLiked: boolean;
  likeCount: number;
}

export const useMemoLikes = (publicMemos: Memo[]) => {
  const [memoLikes, setMemoLikes] = useState<{ [memoId: string]: MemoLikeState }>({});
  const [isInitializing, setIsInitializing] = useState(true);

  // いいね状態を初期化
  useEffect(() => {
    const initializeLikes = async () => {
      setIsInitializing(true);
      
      try {
        const likesData: { [memoId: string]: MemoLikeState } = {};
        
        for (const memo of publicMemos) {
          // ローカルストレージからいいね状態を取得
          const likedMemos = JSON.parse(localStorage.getItem('likedMemos') || '[]');
          const isLiked = likedMemos.includes(memo.id);
          
          // いいね数を取得（実際のAPI呼び出しの場合はここで取得）
          const likeCount = memo.likeCount || 0;
          
          likesData[memo.id] = {
            isLiked,
            likeCount
          };
        }
        
        setMemoLikes(likesData);
      } catch (error) {
        console.error('いいね状態の初期化エラー:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    if (publicMemos.length > 0) {
      initializeLikes();
    } else {
      setIsInitializing(false);
    }
  }, [publicMemos]);

  // いいねを切り替え
  const toggleLike = (memoId: string) => {
    setMemoLikes(prev => {
      const current = prev[memoId];
      if (!current) return prev;

      const newState = {
        ...prev,
        [memoId]: {
          isLiked: !current.isLiked,
          likeCount: current.isLiked ? current.likeCount - 1 : current.likeCount + 1
        }
      };

      // ローカルストレージを更新
      const likedMemos = JSON.parse(localStorage.getItem('likedMemos') || '[]');
      if (newState[memoId].isLiked) {
        if (!likedMemos.includes(memoId)) {
          likedMemos.push(memoId);
        }
      } else {
        const index = likedMemos.indexOf(memoId);
        if (index > -1) {
          likedMemos.splice(index, 1);
        }
      }
      localStorage.setItem('likedMemos', JSON.stringify(likedMemos));

      return newState;
    });
  };

  // いいね数を更新
  const updateLikeCount = (memoId: string, count: number) => {
    setMemoLikes(prev => ({
      ...prev,
      [memoId]: {
        ...prev[memoId],
        likeCount: count
      }
    }));
  };

  // 特定のメモのいいね状態を取得
  const getMemoLikeState = (memoId: string): MemoLikeState | null => {
    return memoLikes[memoId] || null;
  };

  // いいね済みのメモIDのリストを取得
  const getLikedMemoIds = (): string[] => {
    return Object.entries(memoLikes)
      .filter(([_, state]) => state.isLiked)
      .map(([memoId, _]) => memoId);
  };

  // 総いいね数を取得
  const getTotalLikes = (): number => {
    return Object.values(memoLikes).reduce((total, state) => total + state.likeCount, 0);
  };

  // いいね状態をリセット
  const resetLikes = () => {
    setMemoLikes({});
    setIsInitializing(true);
  };

  return {
    memoLikes,
    setMemoLikes,
    isInitializing,
    toggleLike,
    updateLikeCount,
    getMemoLikeState,
    getLikedMemoIds,
    getTotalLikes,
    resetLikes,
  };
};

