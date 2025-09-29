import React, { useEffect, useRef } from 'react';
import './CharacterParticles.css';

interface CharacterParticlesProps {
  isActive: boolean;
  type: 'celebration' | 'levelup' | 'achievement' | 'work' | 'idle';
  intensity?: 'low' | 'medium' | 'high';
}

const CharacterParticles: React.FC<CharacterParticlesProps> = ({
  isActive,
  type,
  intensity = 'medium'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const particleCount = intensity === 'low' ? 10 : intensity === 'medium' ? 20 : 30;
    
    // 既存のパーティクルをクリア
    container.innerHTML = '';

    // パーティクルを生成
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = `particle particle-${type}`;
      
      // ランダムな位置とアニメーション
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = startY + (Math.random() - 0.5) * 200;
      const duration = 1000 + Math.random() * 2000;
      const delay = Math.random() * 500;

      particle.style.left = `${startX}%`;
      particle.style.top = `${startY}%`;
      particle.style.animationDelay = `${delay}ms`;
      particle.style.animationDuration = `${duration}ms`;

      container.appendChild(particle);
    }

    // アニメーション終了後にパーティクルを削除
    const maxDuration = 3000;
    setTimeout(() => {
      if (container) {
        container.innerHTML = '';
      }
    }, maxDuration);

  }, [isActive, type, intensity]);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef} 
      className={`particle-container particle-${type}`}
    />
  );
};

export default CharacterParticles;
