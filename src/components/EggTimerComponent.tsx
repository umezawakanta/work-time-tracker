import React, { useState, useEffect } from 'react';
import './EggTimerComponent.css';

interface EggTimerComponentProps {
  // 状態
  eggTimerActive: boolean;
  eggTimerPaused: boolean;
  eggTimerTime: number;
  eggTimerOriginalTime: number;
  eggTimerPhase: 'heating' | 'boiling' | 'cooking';
  eggTimerPhaseTime: number;
  eggTimerPhaseName: string;
  eggTimerSound: 'bell' | 'chime' | 'beep' | 'alarm';
  eggTimerType: 'soft' | 'medium' | 'hard';
  
  // セッター
  setEggTimerActive: (active: boolean) => void;
  setEggTimerPaused: (paused: boolean) => void;
  setEggTimerTime: (time: number) => void;
  setEggTimerOriginalTime: (time: number) => void;
  setEggTimerPhase: (phase: 'heating' | 'boiling' | 'cooking') => void;
  setEggTimerPhaseTime: (time: number) => void;
  setEggTimerPhaseName: (name: string) => void;
  setEggTimerSound: (sound: 'bell' | 'chime' | 'beep' | 'alarm') => void;
  setEggTimerType: (type: 'soft' | 'medium' | 'hard') => void;
  setEggTimerInterval: (interval: NodeJS.Timeout | null) => void;
  
  // 関数
  getEggTimerDuration: (type: 'soft' | 'medium' | 'hard') => number;
  getTotalCookingTime: (type: 'soft' | 'medium' | 'hard') => number;
  formatTime: (seconds: number) => string;
  playBellSound: (audioContext: AudioContext) => void;
  playChimeSound: (audioContext: AudioContext) => void;
  playBeepSound: (audioContext: AudioContext) => void;
  playAlarmSound: (audioContext: AudioContext) => void;
  timerSettings: {
    eggTimerSound: 'bell' | 'chime' | 'beep' | 'alarm';
    enableSounds: boolean;
  };
}

const EggTimerComponent: React.FC<EggTimerComponentProps> = ({
  eggTimerActive,
  eggTimerPaused,
  eggTimerTime,
  eggTimerOriginalTime,
  eggTimerPhase,
  eggTimerPhaseTime,
  eggTimerPhaseName,
  eggTimerSound,
  eggTimerType,
  setEggTimerActive,
  setEggTimerPaused,
  setEggTimerTime,
  setEggTimerOriginalTime,
  setEggTimerPhase,
  setEggTimerPhaseTime,
  setEggTimerPhaseName,
  setEggTimerSound,
  setEggTimerType,
  setEggTimerInterval,
  getEggTimerDuration,
  getTotalCookingTime,
  formatTime,
  playBellSound,
  playChimeSound,
  playBeepSound,
  playAlarmSound,
  timerSettings,
}) => {
  const [eggTimerInterval, setEggTimerIntervalLocal] = useState<NodeJS.Timeout | null>(null);

  // タイマーの開始
  const startEggTimer = () => {
    if (eggTimerActive && !eggTimerPaused) {
      return;
    }

    const totalTime = getTotalCookingTime(eggTimerType);
    setEggTimerOriginalTime(totalTime);
    setEggTimerTime(totalTime);
    setEggTimerActive(true);
    setEggTimerPaused(false);

    // 段階の初期化
    setEggTimerPhase('heating');
    setEggTimerPhaseTime(60); // 1分間の加熱
    setEggTimerPhaseName('加熱中');

    const interval = setInterval(() => {
      setEggTimerTime((prevTime) => {
        if (prevTime <= 1) {
          // タイマー終了
          clearInterval(interval);
          setEggTimerIntervalLocal(null);
          setEggTimerActive(false);
          setEggTimerPaused(false);
          playEggTimerSound();
          return 0;
        }

        // 段階の更新
        updateEggTimerPhase(prevTime - 1, totalTime);
        return prevTime - 1;
      });
    }, 1000);

    setEggTimerIntervalLocal(interval);
    setEggTimerInterval(interval);
  };

  // 段階の更新
  const updateEggTimerPhase = (remainingTime: number, totalTime: number) => {
    const elapsedTime = totalTime - remainingTime;
    
    if (elapsedTime < 60) {
      // 加熱段階（最初の1分）
      if (eggTimerPhase !== 'heating') {
        setEggTimerPhase('heating');
        setEggTimerPhaseTime(60 - elapsedTime);
        setEggTimerPhaseName('加熱中');
      } else {
        setEggTimerPhaseTime(60 - elapsedTime);
      }
    } else if (elapsedTime < 120) {
      // 沸騰段階（1分後から2分後まで）
      if (eggTimerPhase !== 'boiling') {
        setEggTimerPhase('boiling');
        setEggTimerPhaseTime(120 - elapsedTime);
        setEggTimerPhaseName('沸騰中');
      } else {
        setEggTimerPhaseTime(120 - elapsedTime);
      }
    } else if (eggTimerPhase !== 'cooking') {
      // 調理段階（2分後から）
      setEggTimerPhase('cooking');
      setEggTimerPhaseTime(remainingTime);
      setEggTimerPhaseName('調理中');
    } else {
      setEggTimerPhaseTime(remainingTime);
    }
  };

  // タイマーの一時停止
  const pauseEggTimer = () => {
    if (!eggTimerActive || eggTimerPaused) {
      return;
    }

    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerIntervalLocal(null);
      setEggTimerInterval(null);
    }
    setEggTimerPaused(true);
  };

  // タイマーの再開
  const resumeEggTimer = () => {
    if (!eggTimerActive || !eggTimerPaused) {
      return;
    }

    const interval = setInterval(() => {
      setEggTimerTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setEggTimerIntervalLocal(null);
          setEggTimerInterval(null);
          setEggTimerActive(false);
          setEggTimerPaused(false);
          playEggTimerSound();
          return 0;
        }

        updateEggTimerPhase(prevTime - 1, eggTimerOriginalTime);
        return prevTime - 1;
      });
    }, 1000);

    setEggTimerIntervalLocal(interval);
    setEggTimerInterval(interval);
    setEggTimerPaused(false);
  };

  // タイマーの停止
  const stopEggTimer = () => {
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerIntervalLocal(null);
      setEggTimerInterval(null);
    }
    setEggTimerActive(false);
    setEggTimerPaused(false);
  };

  // タイマーのリセット
  const resetEggTimer = () => {
    stopEggTimer();
    setEggTimerTime(getEggTimerDuration(eggTimerType));
  };

  // 音声再生
  const playEggTimerSound = async () => {
    if (!timerSettings.enableSounds) {
      return;
    }

    console.log("ゆでたまごタイマー音声再生開始:", eggTimerSound);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      setTimeout(() => {
        try {
          console.log("音声再生実行:", eggTimerSound);
          switch (eggTimerSound) {
            case "bell":
              playBellSound(audioContext);
              break;
            case "chime":
              playChimeSound(audioContext);
              break;
            case "beep":
              playBeepSound(audioContext);
              break;
            case "alarm":
              playAlarmSound(audioContext);
              break;
          }
        } catch (error) {
          console.error("音声再生エラー:", error);
        }
      }, 100);
    } catch (error) {
      console.error("AudioContext作成エラー:", error);
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (eggTimerInterval) {
        clearInterval(eggTimerInterval);
      }
    };
  }, [eggTimerInterval]);

  return (
    <div className="egg-timer-container">
      <div className="egg-timer-header">
        <h3>ゆでたまごタイマー</h3>
        <div className="egg-timer-type-selector">
          <label>
            <input
              type="radio"
              name="eggType"
              value="soft"
              checked={eggTimerType === 'soft'}
              onChange={(e) => setEggTimerType(e.target.value as 'soft' | 'medium' | 'hard')}
              disabled={eggTimerActive}
            />
            半熟 (6分)
          </label>
          <label>
            <input
              type="radio"
              name="eggType"
              value="medium"
              checked={eggTimerType === 'medium'}
              onChange={(e) => setEggTimerType(e.target.value as 'soft' | 'medium' | 'hard')}
              disabled={eggTimerActive}
            />
            半熟 (8分)
          </label>
          <label>
            <input
              type="radio"
              name="eggType"
              value="hard"
              checked={eggTimerType === 'hard'}
              onChange={(e) => setEggTimerType(e.target.value as 'soft' | 'medium' | 'hard')}
              disabled={eggTimerActive}
            />
            固茹で (10分)
          </label>
        </div>
      </div>

      <div className="egg-timer-display">
        <div className="timer-time">
          {formatTime(eggTimerTime)}
        </div>
        <div className="timer-phase">
          {eggTimerPhaseName}: {formatTime(eggTimerPhaseTime)}
        </div>
        <div className="timer-progress">
          <div 
            className="progress-bar"
            style={{
              '--progress': ((eggTimerOriginalTime - eggTimerTime) / eggTimerOriginalTime) * 100
            } as React.CSSProperties}
          />
        </div>
      </div>

      <div className="egg-timer-controls">
        {!eggTimerActive ? (
          <button 
            className="timer-button start-button"
            onClick={startEggTimer}
          >
            <i className="bi bi-play-fill"></i>
            開始
          </button>
        ) : eggTimerPaused ? (
          <button 
            className="timer-button resume-button"
            onClick={resumeEggTimer}
          >
            <i className="bi bi-play-fill"></i>
            再開
          </button>
        ) : (
          <button 
            className="timer-button pause-button"
            onClick={pauseEggTimer}
          >
            <i className="bi bi-pause-fill"></i>
            一時停止
          </button>
        )}
        
        <button 
          className="timer-button stop-button"
          onClick={stopEggTimer}
          disabled={!eggTimerActive}
        >
          <i className="bi bi-stop-fill"></i>
          停止
        </button>
        
        <button 
          className="timer-button reset-button"
          onClick={resetEggTimer}
        >
          <i className="bi bi-arrow-clockwise"></i>
          リセット
        </button>
      </div>

      <div className="egg-timer-settings">
        <label>
          音声設定:
          <select
            value={eggTimerSound}
            onChange={(e) => setEggTimerSound(e.target.value as 'bell' | 'chime' | 'beep' | 'alarm')}
            disabled={eggTimerActive}
          >
            <option value="bell">ベル</option>
            <option value="chime">チャイム</option>
            <option value="beep">ビープ</option>
            <option value="alarm">アラーム</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default EggTimerComponent;
