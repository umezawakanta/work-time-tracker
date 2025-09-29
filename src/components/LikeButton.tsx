// いいねボタンコンポーネント

import React, { useState, useEffect } from 'react';
import { likeRewardManager } from '../utils/likeRewardManager';

interface LikeButtonProps {
  memoId: string;
  authorId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  onLikeChange?: (likeCount: number, isLiked: boolean) => void;
  onRewardReceived?: (reward: any) => void;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  memoId,
  authorId,
  initialLikeCount,
  initialIsLiked,
  onLikeChange,
  onRewardReceived,
  className = ''
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // いいね状態を更新
  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/memos/${memoId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const newIsLiked = data.isLiked;
        const newLikeCount = data.likeCount;
        
        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);
        
        // アニメーション効果
        if (newIsLiked && !isLiked) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600);
        }

        // 親コンポーネントに変更を通知
        if (onLikeChange) {
          onLikeChange(newLikeCount, newIsLiked);
        }

        // いいね時の報酬処理（投稿者に報酬を付与）
        if (newIsLiked && data.authorId && data.authorId !== authorId) {
          try {
            const rewardResult = await likeRewardManager.processLikeReward(
              data.authorId,
              memoId,
              newLikeCount
            );

            // 報酬結果を親コンポーネントに通知
            if (onRewardReceived && (rewardResult.badges.length > 0 || rewardResult.experience > 0 || rewardResult.workCoins > 0)) {
              onRewardReceived(rewardResult);
            }
          } catch (error) {
            console.error('報酬処理でエラーが発生しました:', error);
          }
        }
      } else {
        console.error('いいね処理に失敗しました:', data.message);
      }
    } catch (error) {
      console.error('いいね処理でエラーが発生しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`like-button ${isLiked ? 'liked' : ''} ${isAnimating ? 'animating' : ''} ${className}`}
      aria-label={isLiked ? 'いいねを取り消す' : 'いいねする'}
    >
      <span className={`like-icon ${isLiked ? 'liked' : ''}`}>
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span className="like-count">{likeCount}</span>
      {isLoading && <span className="loading-spinner">⏳</span>}
    </button>
  );
};

export default LikeButton;
