import React, { useState, useEffect } from 'react';

interface CustomTimerProps {
  showCustomTimer: boolean;
  setShowCustomTimer: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  setMessage: (message: string) => void;
}

const CustomTimer: React.FC<CustomTimerProps> = ({
  showCustomTimer,
  setShowCustomTimer,
  closeOtherFeatures,
  setMessage
}) => {
  const [customTimerTime, setCustomTimerTime] = useState(0);
  const [customTimerActive, setCustomTimerActive] = useState(false);
  const [customTimerPaused, setCustomTimerPaused] = useState(false);
  const [customTimerName, setCustomTimerName] = useState('');
  const [customTimerMinutes, setCustomTimerMinutes] = useState(0);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);
  const [customTimerSound, setCustomTimerSound] = useState<'bell' | 'chime' | 'beep' | 'alarm'>('bell');

  // カスタムタイマーの時間を更新
  useEffect(() => {
    if (customTimerActive && !customTimerPaused) {
      const interval = setInterval(() => {
        setCustomTimerTime(prev => {
          if (prev <= 1) {
            setCustomTimerActive(false);
            setCustomTimerPaused(false);
            playCustomTimerSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [customTimerActive, customTimerPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCustomTimer = () => {
    if (customTimerTime === 0) {
      const totalSeconds = customTimerMinutes * 60 + customTimerSeconds;
      if (totalSeconds === 0) {
        setMessage('時間を設定してください');
        return;
      }
      setCustomTimerTime(totalSeconds);
    }
    setCustomTimerActive(true);
    setCustomTimerPaused(false);
  };

  const pauseCustomTimer = () => {
    setCustomTimerPaused(true);
  };

  const stopCustomTimer = () => {
    setCustomTimerActive(false);
    setCustomTimerPaused(false);
  };

  const resetCustomTimer = () => {
    setCustomTimerTime(0);
    setCustomTimerActive(false);
    setCustomTimerPaused(false);
  };

  const playCustomTimerSound = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      switch (customTimerSound) {
        case 'bell':
          playBellSound(audioContext);
          break;
        case 'chime':
          playChimeSound(audioContext);
          break;
        case 'beep':
          playBeepSound(audioContext);
          break;
        case 'alarm':
          playAlarmSound(audioContext);
          break;
      }
    } catch (error) {
      console.error('音声再生エラー:', error);
      setMessage('音声の再生に失敗しました');
    }
  };

  const playBellSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const playChimeSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const playBeepSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const playAlarmSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return (
    <div className="custom-timer-section">
      <div className="subsection-header">
        <h3>🎯 カスタムタイマー</h3>
        <div className="subsection-controls">
          {showCustomTimer ? (
            <button 
              onClick={() => setShowCustomTimer(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button 
              onClick={() => {
                closeOtherFeatures('custom-timer');
                setShowCustomTimer(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>
      
      {showCustomTimer && (
        <div className="subsection-content">
          <div className="timer-display">
            <div className="timer-time">
              {formatTime(customTimerTime)}
            </div>
            <div className="timer-status">
              {customTimerActive ? 
                (customTimerName ? `${customTimerName} 実行中` : 'タイマー実行中') : 
                'タイマー停止中'
              }
            </div>
          </div>

          {!customTimerActive && (
            <div className="timer-setup">
              <div className="form-group">
                <label htmlFor="customTimerName">タイマー名</label>
                <input
                  type="text"
                  id="customTimerName"
                  value={customTimerName}
                  onChange={(e) => setCustomTimerName(e.target.value)}
                  placeholder="例: 集中作業"
                />
              </div>
              
              <div className="time-inputs">
                <div className="form-group">
                  <label htmlFor="customTimerMinutes">分</label>
                  <input
                    type="number"
                    id="customTimerMinutes"
                    value={customTimerMinutes}
                    onChange={(e) => setCustomTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max="999"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customTimerSeconds">秒</label>
                  <input
                    type="number"
                    id="customTimerSeconds"
                    value={customTimerSeconds}
                    onChange={(e) => setCustomTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    min="0"
                    max="59"
                  />
                </div>
              </div>

              <div className="sound-selector">
                <label>通知音</label>
                <div className="sound-options">
                  {(['bell', 'chime', 'beep', 'alarm'] as const).map(sound => (
                    <label key={sound} className="sound-option">
                      <input
                        type="radio"
                        name="customTimerSound"
                        value={sound}
                        checked={customTimerSound === sound}
                        onChange={(e) => setCustomTimerSound(e.target.value as any)}
                      />
                      <span>{sound === 'bell' ? '🔔 ベル' : sound === 'chime' ? '🎵 チャイム' : sound === 'beep' ? '📢 ビープ' : '🚨 アラーム'}</span>
                    </label>
                  ))}
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await playCustomTimerSound();
                    } catch (error) {
                      console.error('音声テストエラー:', error);
                      setMessage('音声の再生に失敗しました。ブラウザの設定を確認してください。');
                    }
                  }} 
                  className="test-sound-btn"
                >
                  🔊 音を試す
                </button>
              </div>
            </div>
          )}

          <div className="timer-buttons">
            {!customTimerActive ? (
              <button onClick={startCustomTimer} className="timer-start-btn">
                ▶️ スタート
              </button>
            ) : customTimerPaused ? (
              <>
                <button onClick={startCustomTimer} className="timer-start-btn">
                  ▶️ 再開
                </button>
                <button onClick={stopCustomTimer} className="timer-stop-btn">
                  ⏹️ ストップ
                </button>
                <button onClick={resetCustomTimer} className="timer-reset-btn">
                  🔄 リセット
                </button>
              </>
            ) : (
              <>
                <button onClick={pauseCustomTimer} className="timer-pause-btn">
                  ⏸️ 一時停止
                </button>
                <button onClick={stopCustomTimer} className="timer-stop-btn">
                  ⏹️ ストップ
                </button>
                <button onClick={resetCustomTimer} className="timer-reset-btn">
                  🔄 リセット
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimer;
