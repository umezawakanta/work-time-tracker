import { MealRecord } from './MealRecording';
import { MusicGenre, CategoryRatio } from './types';
import { foodCategories } from './types';
import { createInitialMeal, updateCategoryCount, resetMeal, getTotalItems } from './MealLogic';
import { PLAYBACK_DURATION, REPEAT_OPTIONS } from './constants';
import { initializeTone, toneStateManager } from './SoundEngine';
import { generateMusic, calculateBalanceScore } from './MusicGenerator';
import { generateMeiwaRhythm } from './MeiwaSoundGenerator';

export interface PlaybackState {
  isPlaying: boolean;
  isLooping: boolean;
  currentMeal: MealRecord;
  selectedGenre: string;
  repeatMode: number;
  userMessage: string;
}

export interface PlaybackCallbacks {
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setCurrentMeal: (meal: MealRecord | ((prev: MealRecord) => MealRecord)) => void;
  setUserMessage: (message: string) => void;
  showMessage: (message: string, duration?: number) => void;
  playSoundCallback: (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => Promise<void>;
  generateMeiwaRhythmCallback: (beatDuration: number, categoryRatios: CategoryRatio[]) => void;
  generateMusicCallback: (categoryRatios: CategoryRatio[], balanceScore: number, genre: MusicGenre) => Promise<void>;
}

export const usePlaybackManager = (
  state: PlaybackState,
  callbacks: PlaybackCallbacks
) => {
  const {
    isPlaying,
    isLooping,
    currentMeal,
    selectedGenre,
    repeatMode,
  } = state;

  const {
    setIsPlaying,
    setIsLooping,
    setCurrentMeal,
    showMessage,
    playSoundCallback,
    generateMeiwaRhythmCallback,
    generateMusicCallback,
  } = callbacks;

  // メイン再生関数
  const playMealBalance = async (musicGenres: MusicGenre[]) => {
    if (!toneStateManager.isInitialized) {
      const success = await initializeTone();
      if (!success) {
        showMessage("音声システムの初期化に失敗しました", 3000);
        return;
      }
      showMessage("音声システムを起動しました！", 2000);
    }

    if (isPlaying && !isLooping) {
      showMessage("再生中です...", 2000);
      return;
    }

    const totalItems = getTotalItems(currentMeal.categories);
    if (totalItems === 0) {
      showMessage("食事を記録してください", 3000);
      return;
    }

    setIsPlaying(true);
    const genre = musicGenres.find((g) => g.id === selectedGenre) || musicGenres[0];

    const categoryRatios = foodCategories.map((category) => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems,
    }));

    const balanceScore = calculateBalanceScore(categoryRatios);

    await generateMusicCallback(categoryRatios, balanceScore, genre);

    const message =
      balanceScore > 0.7
        ? "素晴らしいバランスです！🎵"
        : balanceScore > 0.4
        ? "まあまあのバランスです"
        : "バランスを改善しましょう";
    showMessage(message, 4000);

    if (repeatMode === REPEAT_OPTIONS.LOOP) {
      setIsLooping(true);
      const loop = async () => {
        await generateMusicCallback(categoryRatios, balanceScore, genre);
        setTimeout(loop, PLAYBACK_DURATION);
      };
      setTimeout(loop, PLAYBACK_DURATION);
    } else if (repeatMode > 0) {
      let count = 0;
      const repeat = async () => {
        if (++count < repeatMode) {
          await generateMusicCallback(categoryRatios, balanceScore, genre);
          setTimeout(repeat, PLAYBACK_DURATION);
        } else {
          setIsPlaying(false);
        }
      };
      setTimeout(repeat, PLAYBACK_DURATION);
    } else {
      setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
    }
  };

  // 停止関数
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLooping(false);
  };

  // カテゴリ数更新
  const handleUpdateCategoryCount = (categoryId: string, count: number) => {
    setCurrentMeal((prev) => updateCategoryCount(prev, categoryId, count));
  };

  // 食事リセット
  const handleResetMeal = () => {
    setCurrentMeal((prev) => resetMeal(prev));
  };

  return {
    playMealBalance,
    stopPlayback,
    handleUpdateCategoryCount,
    handleResetMeal,
  };
};
