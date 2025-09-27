import React, { useRef, useEffect, useState, useCallback } from 'react';
import { InstrumentType } from './SimpleAudioEngine';
import './AudioVisualizer.css';

interface AudioVisualizerProps {
  isPlaying: boolean;
  instrumentType: InstrumentType;
  currentMeal: any;
  selectedGenre: string;
  className?: string;
}

interface VisualizerData {
  frequency: number;
  amplitude: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'wave';
  position: { x: number; y: number };
  size: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  instrumentType,
  currentMeal,
  selectedGenre,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [visualizerData, setVisualizerData] = useState<VisualizerData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 楽器タイプに応じた色と形状の設定
  const getInstrumentVisualConfig = useCallback((instrument: InstrumentType) => {
    const configs = {
      [InstrumentType.PIANO]: {
        color: '#FFD700',
        shape: 'circle' as const,
        baseSize: 20
      },
      [InstrumentType.GUITAR]: {
        color: '#8B4513',
        shape: 'square' as const,
        baseSize: 25
      },
      [InstrumentType.DRUM]: {
        color: '#FF4500',
        shape: 'triangle' as const,
        baseSize: 30
      },
      [InstrumentType.BASS]: {
        color: '#4B0082',
        shape: 'wave' as const,
        baseSize: 35
      },
      [InstrumentType.SYNTH]: {
        color: '#00FFFF',
        shape: 'circle' as const,
        baseSize: 22
      },
      [InstrumentType.MEIWA]: {
        color: '#FF69B4',
        shape: 'square' as const,
        baseSize: 18
      }
    };
    return configs[instrument] || configs[InstrumentType.PIANO];
  }, []);

  // ジャンルに応じた視覚効果の設定
  const getGenreVisualConfig = useCallback((genre: string) => {
    const configs: { [key: string]: { pattern: string; speed: number; intensity: number } } = {
      'balanced': { pattern: 'smooth', speed: 1.0, intensity: 0.8 },
      'meiwa': { pattern: 'pixelated', speed: 1.5, intensity: 1.0 },
      'rock': { pattern: 'aggressive', speed: 2.0, intensity: 1.2 },
      'techno': { pattern: 'mechanical', speed: 1.8, intensity: 1.1 },
      'classical': { pattern: 'elegant', speed: 0.7, intensity: 0.6 },
      'japanese': { pattern: 'flowing', speed: 0.9, intensity: 0.7 },
      'jazz': { pattern: 'improvised', speed: 1.3, intensity: 0.9 },
      'ambient': { pattern: 'ethereal', speed: 0.5, intensity: 0.5 },
      'custom': { pattern: 'adaptive', speed: 1.0, intensity: 0.8 }
    };
    return configs[genre] || configs['balanced'];
  }, []);

  // 食事データに基づく視覚化データの生成
  const generateVisualizerData = useCallback(() => {
    const instrumentConfig = getInstrumentVisualConfig(instrumentType);
    const genreConfig = getGenreVisualConfig(selectedGenre);
    const data: VisualizerData[] = [];

    // 食事カテゴリに基づいて視覚要素を生成
    Object.entries(currentMeal.categories).forEach(([category, count]) => {
      const num = count as number;
      if (num > 0) {
        for (let i = 0; i < num; i++) {
          const angle = (i / Math.max(num, 1)) * Math.PI * 2;
          const radius = 50 + (i * 10);
          
          data.push({
            frequency: 200 + (i * 50),
            amplitude: 0.5 + (Math.random() * 0.5),
            color: instrumentConfig.color,
            shape: instrumentConfig.shape,
            position: {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            },
            size: instrumentConfig.baseSize + (Math.random() * 10)
          });
        }
      }
    });

    // ジャンルに応じた追加要素
    if (genreConfig.pattern === 'pixelated') {
      // 明和電機風：ピクセル化された効果
      for (let i = 0; i < 20; i++) {
        data.push({
          frequency: 100 + (i * 20),
          amplitude: Math.random(),
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          shape: 'square',
          position: {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200
          },
          size: 8 + Math.random() * 4
        });
      }
    }

    setVisualizerData(data);
  }, [currentMeal.categories, instrumentType, selectedGenre, getInstrumentVisualConfig, getGenreVisualConfig]);

  // オーディオコンテキストの初期化
  const initializeAudioContext = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Audio context initialization failed:', error);
    }
  }, []);

  // 描画関数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景グラデーション
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // オーディオデータの取得
    if (analyserRef.current && dataArrayRef.current && isPlaying) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    }

    // 視覚要素の描画
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    visualizerData.forEach((item, index) => {
      const x = centerX + item.position.x;
      const y = centerY + item.position.y;
      
      // アニメーション効果
      const animationOffset = Math.sin(time * 2 + index * 0.5) * 10;
      const scale = isPlaying ? 1 + (item.amplitude * 0.5) : 1;
      const alpha = isPlaying ? 0.8 : 0.3;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = item.color;
      ctx.translate(x + animationOffset, y + animationOffset);
      ctx.scale(scale, scale);

      // 形状に応じた描画
      switch (item.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, item.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -item.size / 2);
          ctx.lineTo(-item.size / 2, item.size / 2);
          ctx.lineTo(item.size / 2, item.size / 2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'wave':
          ctx.beginPath();
          for (let i = 0; i < item.size; i++) {
            const waveY = Math.sin((i / item.size) * Math.PI * 4 + time * 3) * 5;
            if (i === 0) {
              ctx.moveTo(i - item.size / 2, waveY);
            } else {
              ctx.lineTo(i - item.size / 2, waveY);
            }
          }
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 3;
          ctx.stroke();
          break;
      }

      ctx.restore();
    });

    // スペクトラム表示（再生中のみ）
    if (isPlaying && dataArrayRef.current) {
      const barWidth = canvas.width / dataArrayRef.current.length;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.3;
        const hue = (i / dataArrayRef.current.length) * 360;
        
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [isPlaying, visualizerData, isInitialized]);

  // エフェクトの開始
  useEffect(() => {
    if (isPlaying) {
      initializeAudioContext();
      generateVisualizerData();
    }
  }, [isPlaying, initializeAudioContext, generateVisualizerData]);

  // アニメーションループ
  useEffect(() => {
    if (isPlaying) {
      draw();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, draw]);

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`audio-visualizer ${className}`}>
      <canvas
        ref={canvasRef}
        className="visualizer-canvas"
        style={{
          width: '100%',
          height: '200px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      />
      <div className="visualizer-info">
        <div className="instrument-info">
          🎵 {instrumentType} | {selectedGenre}
        </div>
        <div className="meal-info">
          {Object.entries(currentMeal.categories)
            .filter(([_, count]) => (count as number) > 0)
            .map(([category, count]) => (
              <span key={category} className="category-tag">
                {category}: {count}
              </span>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
