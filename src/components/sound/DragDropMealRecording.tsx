import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MealRecord } from './MealRecording';
import { foodCategories } from './types';
import './DragDropMealRecording.css';

interface DragDropMealRecordingProps {
  currentMeal: MealRecord;
  onUpdateCategoryCount: (categoryId: string, count: number) => void;
  onResetMeal: () => void;
  disabled: boolean;
}

interface DragItem {
  categoryId: string;
  categoryName: string;
  emoji: string;
  color: string;
}

const DragDropMealRecording: React.FC<DragDropMealRecordingProps> = ({
  currentMeal,
  onUpdateCategoryCount,
  onResetMeal,
  disabled
}) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ドラッグ可能なアイテムの定義
  const dragItems: DragItem[] = [
    { categoryId: 'staple', categoryName: '主食', emoji: '🍚', color: '#FFD700' },
    { categoryId: 'side', categoryName: '副菜', emoji: '🥗', color: '#90EE90' },
    { categoryId: 'miso', categoryName: '味噌', emoji: '🍲', color: '#DEB887' },
    { categoryId: 'meat', categoryName: '肉', emoji: '🥩', color: '#FF6347' },
    { categoryId: 'fish', categoryName: '魚', emoji: '🐟', color: '#87CEEB' },
    { categoryId: 'vegetable', categoryName: '野菜', emoji: '🥕', color: '#98FB98' }
  ];

  // ドラッグ開始
  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    if (disabled) return;
    
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', item.categoryId);
    
    // ドラッグ中の視覚的フィードバック
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg) scale(1.1)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, [disabled]);

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverCategory(null);
    setShowPreview(false);
  }, []);

  // ドロップゾーンに入った時
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (draggedItem) {
      setDragOverCategory(draggedItem.categoryId);
      setShowPreview(true);
      setPreviewCount((currentMeal.categories[draggedItem.categoryId] || 0) + 1);
    }
  }, [draggedItem, currentMeal.categories]);

  // ドロップゾーンから出た時
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragOverCategory(null);
      setShowPreview(false);
    }
  }, []);

  // ドロップ処理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (disabled || !draggedItem) return;
    
    const currentCount = currentMeal.categories[draggedItem.categoryId] || 0;
    onUpdateCategoryCount(draggedItem.categoryId, currentCount + 1);
    
    // 成功アニメーション
    setShowPreview(false);
    setDragOverCategory(null);
    
    // 一時的な成功表示
    const successElement = document.createElement('div');
    successElement.textContent = `+1 ${draggedItem.categoryName}`;
    successElement.className = 'drop-success';
    successElement.style.position = 'fixed';
    successElement.style.top = '50%';
    successElement.style.left = '50%';
    successElement.style.transform = 'translate(-50%, -50%)';
    successElement.style.background = draggedItem.color;
    successElement.style.color = 'white';
    successElement.style.padding = '10px 20px';
    successElement.style.borderRadius = '20px';
    successElement.style.fontSize = '18px';
    successElement.style.fontWeight = 'bold';
    successElement.style.zIndex = '1000';
    successElement.style.pointerEvents = 'none';
    
    document.body.appendChild(successElement);
    
    setTimeout(() => {
      successElement.style.transition = 'all 0.5s ease-out';
      successElement.style.transform = 'translate(-50%, -150%)';
      successElement.style.opacity = '0';
      
      setTimeout(() => {
        document.body.removeChild(successElement);
      }, 500);
    }, 100);
  }, [disabled, draggedItem, currentMeal.categories, onUpdateCategoryCount]);

  // カテゴリの数値調整
  const handleCountChange = useCallback((categoryId: string, delta: number) => {
    if (disabled) return;
    
    const currentCount = currentMeal.categories[categoryId] || 0;
    const newCount = Math.max(0, currentCount + delta);
    onUpdateCategoryCount(categoryId, newCount);
  }, [disabled, currentMeal.categories, onUpdateCategoryCount]);

  // リアルタイムプレビュー用の効果
  useEffect(() => {
    if (showPreview && draggedItem) {
      const interval = setInterval(() => {
        setPreviewCount(prev => prev + 1);
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [showPreview, draggedItem]);

  return (
    <div className="drag-drop-meal-recording">
      <div className="meal-recording-header">
        <h3>🍽️ 食事記録（ドラッグ&ドロップ）</h3>
        <button 
          onClick={onResetMeal} 
          disabled={disabled}
          className="reset-button"
        >
          🔄 リセット
        </button>
      </div>

      {/* ドラッグ可能なアイテム */}
      <div className="drag-items-container">
        <h4>ドラッグして食事を記録</h4>
        <div className="drag-items">
          {dragItems.map((item) => (
            <div
              key={item.categoryId}
              className={`drag-item ${draggedItem?.categoryId === item.categoryId ? 'dragging' : ''}`}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              style={{ 
                backgroundColor: item.color,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'grab'
              }}
            >
              <span className="drag-item-emoji">{item.emoji}</span>
              <span className="drag-item-name">{item.categoryName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ドロップゾーン */}
      <div 
        ref={dropZoneRef}
        className={`drop-zone ${dragOverCategory ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <div className="drop-zone-icon">📋</div>
          <div className="drop-zone-text">
            {dragOverCategory ? 
              `ここに${dragItems.find(item => item.categoryId === dragOverCategory)?.categoryName}をドロップ` :
              'ここに食べ物をドロップして記録'
            }
          </div>
        </div>

        {/* リアルタイムプレビュー */}
        {showPreview && draggedItem && (
          <div className="preview-overlay">
            <div 
              className="preview-item"
              style={{ backgroundColor: draggedItem.color }}
            >
              <span className="preview-emoji">{draggedItem.emoji}</span>
              <span className="preview-count">+{previewCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* 現在の記録状況 */}
      <div className="current-records">
        <h4>現在の記録</h4>
        <div className="record-items">
          {dragItems.map((item) => {
            const count = currentMeal.categories[item.categoryId] || 0;
            return (
              <div key={item.categoryId} className="record-item">
                <div className="record-info">
                  <span className="record-emoji">{item.emoji}</span>
                  <span className="record-name">{item.categoryName}</span>
                </div>
                <div className="record-controls">
                  <button
                    onClick={() => handleCountChange(item.categoryId, -1)}
                    disabled={disabled || count <= 0}
                    className="count-button minus"
                  >
                    −
                  </button>
                  <span className="count-display">{count}</span>
                  <button
                    onClick={() => handleCountChange(item.categoryId, 1)}
                    disabled={disabled}
                    className="count-button plus"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 合計表示 */}
      <div className="total-summary">
        <div className="total-items">
          合計: {Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0)} 品目
        </div>
        <div className="balance-indicator">
          {Object.values(currentMeal.categories).every(count => count === 0) ? 
            '食事を記録してください' :
            Object.values(currentMeal.categories).some(count => count > 0) ?
            'バランスの良い食事を心がけましょう' : ''
          }
        </div>
      </div>
    </div>
  );
};

export default DragDropMealRecording;
