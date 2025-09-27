import { MealRecord } from './MealRecording';
import { MusicGenre, CategoryRatio } from './types';
import { foodCategories } from './types';
import { createInitialMeal, updateCategoryCount, resetMeal, getTotalItems } from './MealLogic';
import { PLAYBACK_DURATION, REPEAT_OPTIONS } from './constants';
import { simpleAudioEngine, InstrumentType } from './SimpleAudioEngine';
import { generateMusic, calculateBalanceScore } from './SimpleAudioEngine';
import { analyzeDetailedNutrition, DetailedNutritionScore } from './NutritionAnalysis';
import { DynamicPatternGenerator } from './DynamicPatternGenerator';
import { GenreFeatureSystem } from './GenreFeatureSystem';

export interface PlaybackState {
  isPlaying: boolean;
  isLooping: boolean;
  currentMeal: MealRecord;
  selectedGenre: string;
  selectedInstrument: InstrumentType;
  repeatMode: number;
  userMessage: string;
  nutritionScore?: DetailedNutritionScore;
  recommendedGenres?: string[];
}

export interface PlaybackCallbacks {
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setCurrentMeal: (meal: MealRecord | ((prev: MealRecord) => MealRecord)) => void;
  setUserMessage: (message: string) => void;
  showMessage: (message: string, duration?: number) => void;
  playSoundCallback: (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => Promise<void>;
  generateMeiwaRhythmCallback: (beatDuration: number, categoryRatios: CategoryRatio[]) => Promise<void>;
  generateMusicCallback: (categoryRatios: CategoryRatio[], balanceScore: number, genre: MusicGenre) => Promise<void>;
  setNutritionScore?: (score: DetailedNutritionScore) => void;
  setRecommendedGenres?: (genres: string[]) => void;
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
    setNutritionScore,
    setRecommendedGenres,
  } = callbacks;

  // メイン再生関数（Phase 2対応版）
  const playMealBalance = async (musicGenres: MusicGenre[]) => {
    if (!simpleAudioEngine.isReady()) {
      const success = await simpleAudioEngine.initialize();
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

    // Phase 2: 詳細な栄養分析を実行
    const nutritionScore = analyzeDetailedNutrition(currentMeal);
    if (setNutritionScore) {
      setNutritionScore(nutritionScore);
    }

    // 推奨ジャンルを計算
    const recommendedGenres = GenreFeatureSystem.recommendGenre(nutritionScore);
    if (setRecommendedGenres) {
      setRecommendedGenres(recommendedGenres);
    }

    const categoryRatios = foodCategories.map((category) => ({
      id: category.id,
      name: category.name,
      category: category.id,
      volume: category.sound.volume,
      note: category.noteMapping,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems,
    }));

    const balanceScore = calculateBalanceScore(categoryRatios);

    // Phase 2: 動的パターン生成を使用した音楽生成
    await generateAdvancedMusicWithPatterns(
      categoryRatios, 
      balanceScore, 
      genre, 
      state.selectedInstrument,
      nutritionScore
    );

    // 詳細なフィードバックメッセージ
    const message = generateDetailedFeedback(nutritionScore, recommendedGenres);
    showMessage(message, 5000);

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
    // 音声エンジンの全ての音を停止
    simpleAudioEngine.stopAll();
    
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

  // Phase 2: 動的パターン生成を使用した高度な音楽生成
  const generateAdvancedMusicWithPatterns = async (
    categoryRatios: CategoryRatio[],
    balanceScore: number,
    genre: MusicGenre,
    instrumentType: InstrumentType,
    nutritionScore: DetailedNutritionScore
  ) => {
    try {
      // 動的パターンを生成
      const patterns = DynamicPatternGenerator.generatePatterns(currentMeal, genre, 8);
      
      // ジャンル特徴に基づいてパターンを調整
      const adjustedRhythm = GenreFeatureSystem.adjustRhythmForGenre(
        patterns.rhythm, 
        genre.id, 
        nutritionScore
      );
      const adjustedMelody = GenreFeatureSystem.adjustMelodyForGenre(
        patterns.melody, 
        genre.id, 
        nutritionScore
      );

      // 楽器編成を最適化
      const instrumentArrangement = GenreFeatureSystem.optimizeInstrumentArrangement(
        genre.id, 
        nutritionScore
      );

      // エフェクト設定を生成
      const effectSettings = GenreFeatureSystem.generateEffectSettings(genre.id, nutritionScore);

      // リズムパターンを再生
      await playRhythmPattern(adjustedRhythm, instrumentArrangement.primary[0]);
      
      // メロディーパターンを再生
      await playMelodyPattern(adjustedMelody, instrumentArrangement.primary[1] || instrumentArrangement.primary[0]);
      
      // バランススコアに基づいて追加の音を生成
      if (balanceScore > 0.5) {
        // 高スコアの場合は和音を追加
        const chordFrequencies = [261.63, 329.63, 392.00]; // C-E-G
        await simpleAudioEngine.playChord(chordFrequencies, 1.0, 0.3, instrumentType);
      }
      
      console.log(`Generated advanced music with ${instrumentType} instrument for ${genre.name} genre`);
      console.log(`Nutrition score: ${nutritionScore.overallScore.toFixed(2)}`);
      console.log(`Rhythm complexity: ${adjustedRhythm.complexity.toFixed(2)}`);
      console.log(`Melody emotion: ${adjustedMelody.emotion}`);
    } catch (error) {
      console.error("Failed to generate advanced music:", error);
      showMessage("高度な音楽生成に失敗しました", 3000);
    }
  };

  // リズムパターンを再生
  const playRhythmPattern = async (rhythmPattern: any, instrumentType: InstrumentType) => {
    for (let i = 0; i < rhythmPattern.beats.length; i++) {
      const beat = rhythmPattern.beats[i];
      const duration = rhythmPattern.durations[i];
      
      if (beat > 0.3) { // 閾値以上のビートのみ再生
        const frequency = 220 + (beat * 220); // ビート強度に応じた周波数
        await simpleAudioEngine.playTone(frequency, duration, beat * 0.5, instrumentType);
      }
    }
  };

  // メロディーパターンを再生
  const playMelodyPattern = async (melodyPattern: any, instrumentType: InstrumentType) => {
    for (let i = 0; i < melodyPattern.notes.length; i++) {
      const note = melodyPattern.notes[i];
      const duration = melodyPattern.durations[i];
      
      await simpleAudioEngine.playTone(note, duration, 0.4, instrumentType);
    }
  };

  // 詳細なフィードバックメッセージを生成
  const generateDetailedFeedback = (nutritionScore: DetailedNutritionScore, recommendedGenres: string[]): string => {
    const overallScore = nutritionScore.overallScore;
    const strengths = nutritionScore.balanceAnalysis.strengths;
    const weaknesses = nutritionScore.balanceAnalysis.weaknesses;
    
    let message = "";
    
    if (overallScore > 0.8) {
      message = "素晴らしいバランスです！🎵✨";
    } else if (overallScore > 0.6) {
      message = "良いバランスです！🎵";
    } else if (overallScore > 0.4) {
      message = "まあまあのバランスです";
    } else {
      message = "バランスを改善しましょう";
    }
    
    if (strengths.length > 0) {
      message += `\n強み: ${strengths.slice(0, 2).join(", ")}`;
    }
    
    if (recommendedGenres.length > 0) {
      const genreNames = recommendedGenres.map(id => {
        const genreMap: { [key: string]: string } = {
          'balance': 'バランス',
          'meiwa': '明和電機風',
          'rock': 'ロック',
          'techno': 'テクノ',
          'classical': 'クラシック',
          'japanese': '和楽器',
          'jazz': 'ジャズ',
          'ambient': 'アンビエント',
          'custom': 'カスタム'
        };
        return genreMap[id] || id;
      });
      message += `\n推奨ジャンル: ${genreNames.slice(0, 2).join(", ")}`;
    }
    
    return message;
  };

  // 従来の楽器別音楽生成関数（後方互換性のため保持）
  const generateMusicWithInstrument = async (
    categoryRatios: CategoryRatio[],
    balanceScore: number,
    genre: MusicGenre,
    instrumentType: InstrumentType
  ) => {
    try {
      // 楽器別のリズムパターンを生成
      await simpleAudioEngine.playInstrumentRhythm(categoryRatios, 0.5, instrumentType);
      
      // バランススコアに基づいて追加の音を生成
      if (balanceScore > 0.5) {
        // 高スコアの場合は和音を追加
        const chordFrequencies = [261.63, 329.63, 392.00]; // C-E-G
        await simpleAudioEngine.playChord(chordFrequencies, 1.0, 0.3, instrumentType);
      }
      
      console.log(`Generated music with ${instrumentType} instrument for ${genre.name} genre`);
    } catch (error) {
      console.error("Failed to generate music with instrument:", error);
      showMessage("音楽生成に失敗しました", 3000);
    }
  };

  return {
    playMealBalance,
    stopPlayback,
    handleUpdateCategoryCount,
    handleResetMeal,
  };
};
