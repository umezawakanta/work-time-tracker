import React from 'react';
import SoundControls from './SoundControls';
import MealRecording from './MealRecording';
import ScoreDisplay from './ScoreDisplay';
import GenreSelector from './GenreSelector';
import InstrumentSelector from './InstrumentSelector';
import { musicGenres } from './MusicGenres';
import { foodCategories } from './types';
import { MealRecord } from './MealRecording';
import { ScoreData } from './ScoreDisplay';
import { MusicGenre } from './GenreSelector';
import { InstrumentType } from './SimpleAudioEngine';

interface SoundAppLayoutProps {
  // 状態
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedInstrument: InstrumentType;
  setSelectedInstrument: (instrument: InstrumentType) => void;
  currentMeal: MealRecord;
  onUpdateCategoryCount: (categoryId: string, count: number) => void;
  onResetMeal: () => void;
  isPlaying: boolean;
  isLooping: boolean;
  toneStateManager: any;
  onPlay: () => void;
  onStop: () => void;
  disabled: boolean;
  onInitialize?: () => Promise<void>;
  currentScore: ScoreData | null;
  showScore: boolean;
  onToggleScore: () => void;
  onExportScore: () => void;
  viewMode: 'input' | 'score';
  setViewMode: (mode: 'input' | 'score') => void;
  userMessage: string;
}

const SoundAppLayout: React.FC<SoundAppLayoutProps> = ({
  selectedGenre,
  setSelectedGenre,
  selectedInstrument,
  setSelectedInstrument,
  currentMeal,
  onUpdateCategoryCount,
  onResetMeal,
  isPlaying,
  isLooping,
  toneStateManager,
  onPlay,
  onStop,
  disabled,
  onInitialize,
  currentScore,
  showScore,
  onToggleScore,
  onExportScore,
  viewMode,
  setViewMode,
  userMessage,
}) => {
  return (
    <div className="sound-app-content">
      <div className="app-description">
        <p>食事のバランスを音と楽譜で表現します 🎼</p>
        {!toneStateManager.isInitialized && (
          <p className="tone-init-hint">初回は音ボタンをクリックしてください</p>
        )}
      </div>

      {/* 楽譜表示エリア */}
      <ScoreDisplay
        currentScore={currentScore}
        showScore={showScore}
        onToggleScore={onToggleScore}
        onExportScore={onExportScore}
      />

      {/* ビューモード切り替え */}
      <div className="view-mode-tabs">
        <button
          className={viewMode === "input" ? "active" : ""}
          onClick={() => setViewMode("input")}
        >
          入力
        </button>
        <button
          className={viewMode === "score" ? "active" : ""}
          onClick={() => setViewMode("score")}
        >
          楽譜設定
        </button>
      </div>

      {/* 入力ビュー */}
      {viewMode === "input" && (
        <>
          <GenreSelector
            musicGenres={musicGenres}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
          />

          <InstrumentSelector
            selectedInstrument={selectedInstrument}
            onInstrumentChange={setSelectedInstrument}
            disabled={disabled}
          />

          <MealRecording
            foodCategories={foodCategories}
            currentMeal={currentMeal}
            onUpdateCategoryCount={onUpdateCategoryCount}
            onResetMeal={onResetMeal}
          />

          <SoundControls
            isPlaying={isPlaying}
            isLooping={isLooping}
            toneStateManager={toneStateManager}
            onPlay={onPlay}
            onStop={onStop}
            disabled={disabled}
            onInitialize={onInitialize}
          />
        </>
      )}

      {/* 楽譜設定ビュー */}
      {viewMode === "score" && (
        <div className="score-settings">
          <h3>🎼 楽譜設定</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="score-display-checkbox">楽譜表示</label>
              <input
                id="score-display-checkbox"
                type="checkbox"
                checked={showScore}
                onChange={onToggleScore}
                aria-label="楽譜の表示切り替え"
              />
            </div>
            <div className="setting-item">
              <label htmlFor="note-color-select">音符の色分け</label>
              <select id="note-color-select" aria-label="音符の色分け設定">
                <option>カテゴリー別</option>
                <option>楽器別</option>
                <option>なし</option>
              </select>
            </div>
            <div className="setting-item">
              <label htmlFor="score-size-range">楽譜のサイズ</label>
              <input
                id="score-size-range"
                type="range"
                min="50"
                max="150"
                defaultValue="100"
                aria-label="楽譜のサイズ調整"
              />
            </div>
          </div>
        </div>
      )}

      {userMessage && (
        <div className="user-message user-message-box">{userMessage}</div>
      )}
    </div>
  );
};

export default SoundAppLayout;
