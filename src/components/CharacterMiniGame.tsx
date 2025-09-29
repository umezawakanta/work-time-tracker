import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../types/character';
import './CharacterMiniGame.css';

interface CharacterMiniGameProps {
  character: Character | null;
  onGameComplete: (score: number, rewards: { experience: number; items: string[] }) => void;
  onClose: () => void;
}

type GameState = 'ready' | 'playing' | 'paused' | 'completed';

const CharacterMiniGame: React.FC<CharacterMiniGameProps> = ({
  character,
  onGameComplete,
  onClose
}) => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; type: 'normal' | 'bonus' | 'special' }>>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const targetIdRef = useRef(0);

  // ゲーム開始
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setCombo(0);
    setMaxCombo(0);
    setGameStartTime(Date.now());
    startGameLoop();
  };

  // ゲームループ
  const startGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    gameLoopRef.current = setInterval(() => {
      if (gameState === 'playing') {
        // 時間を減らす
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });

        // 新しいターゲットを生成
        generateTarget();
      }
    }, 1000);
  };

  // ターゲット生成
  const generateTarget = () => {
    if (!gameAreaRef.current) return;

    const gameArea = gameAreaRef.current;
    const rect = gameArea.getBoundingClientRect();
    const maxX = rect.width - 60;
    const maxY = rect.height - 60;

    const newTarget = {
      id: targetIdRef.current++,
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      type: Math.random() < 0.1 ? 'bonus' : Math.random() < 0.05 ? 'special' : 'normal'
    };

    setTargets(prev => [...prev, newTarget]);

    // ターゲットを3秒後に削除
    setTimeout(() => {
      setTargets(prev => prev.filter(target => target.id !== newTarget.id));
      setCombo(0); // ミスでコンボリセット
    }, 3000);
  };

  // ターゲットクリック
  const handleTargetClick = (targetId: number, targetType: 'normal' | 'bonus' | 'special') => {
    if (gameState !== 'playing') return;

    // ターゲットを削除
    setTargets(prev => prev.filter(target => target.id !== targetId));

    // スコア計算
    let points = 0;
    let comboMultiplier = 1;

    switch (targetType) {
      case 'normal':
        points = 10;
        break;
      case 'bonus':
        points = 25;
        break;
      case 'special':
        points = 50;
        break;
    }

    // コンボボーナス
    const newCombo = combo + 1;
    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));
    
    if (newCombo > 1) {
      comboMultiplier = Math.min(newCombo * 0.5, 3); // 最大3倍
    }

    const finalScore = Math.floor(points * comboMultiplier);
    setScore(prev => prev + finalScore);
  };

  // ゲーム終了
  const endGame = () => {
    setGameState('completed');
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    // 報酬計算
    const experience = Math.floor(score / 10);
    const items: string[] = [];
    
    if (score >= 500) items.push('golden_coin');
    if (maxCombo >= 10) items.push('combo_master');
    if (timeLeft > 20) items.push('speed_demon');

    onGameComplete(score, { experience, items });
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  if (!character) {
    return (
      <div className="mini-game">
        <div className="no-character">
          <p>キャラクターを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mini-game">
      <div className="game-header">
        <h3>🎮 {character.name}と一緒にゲーム！</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      {gameState === 'ready' && (
        <div className="game-ready">
          <div className="character-avatar">
            <span className="character-emoji">
              {character.type === 'cute' && '🐱'}
              {character.type === 'cool' && '🦁'}
              {character.type === 'mysterious' && '🦄'}
              {character.type === 'energetic' && '🐶'}
            </span>
          </div>
          <h4>タップゲーム</h4>
          <p>30秒間でできるだけ多くのターゲットをタップしよう！</p>
          <div className="game-instructions">
            <div className="instruction">
              <span className="target normal">●</span>
              <span>通常ターゲット: 10点</span>
            </div>
            <div className="instruction">
              <span className="target bonus">★</span>
              <span>ボーナスターゲット: 25点</span>
            </div>
            <div className="instruction">
              <span className="target special">💎</span>
              <span>スペシャルターゲット: 50点</span>
            </div>
            <div className="instruction">
              <span>コンボでボーナス点がもらえるよ！</span>
            </div>
          </div>
          <button className="start-button" onClick={startGame}>
            ゲーム開始！
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game-playing">
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">スコア</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">時間</span>
              <span className="stat-value">{timeLeft}</span>
            </div>
            <div className="stat">
              <span className="stat-label">コンボ</span>
              <span className="stat-value">{combo}</span>
            </div>
          </div>
          
          <div className="game-area" ref={gameAreaRef}>
            {targets.map(target => (
              <button
                key={target.id}
                className={`game-target ${target.type}`}
                style={{
                  left: `${target.x}px`,
                  top: `${target.y}px`
                }}
                onClick={() => handleTargetClick(target.id, target.type)}
              >
                {target.type === 'normal' && '●'}
                {target.type === 'bonus' && '★'}
                {target.type === 'special' && '💎'}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'completed' && (
        <div className="game-completed">
          <div className="character-avatar celebrating">
            <span className="character-emoji">
              {character.type === 'cute' && '🐱'}
              {character.type === 'cool' && '🦁'}
              {character.type === 'mysterious' && '🦄'}
              {character.type === 'energetic' && '🐶'}
            </span>
          </div>
          <h4>お疲れ様！</h4>
          <div className="final-stats">
            <div className="final-stat">
              <span className="final-stat-label">最終スコア</span>
              <span className="final-stat-value">{score}</span>
            </div>
            <div className="final-stat">
              <span className="final-stat-label">最大コンボ</span>
              <span className="final-stat-value">{maxCombo}</span>
            </div>
          </div>
          <div className="game-actions">
            <button className="play-again-button" onClick={startGame}>
              もう一度プレイ
            </button>
            <button className="close-game-button" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterMiniGame;
