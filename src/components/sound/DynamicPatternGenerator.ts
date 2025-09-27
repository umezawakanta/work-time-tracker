import { MealRecord } from './MealRecording';
import { MusicGenre } from './types';
import { DetailedNutritionScore, analyzeDetailedNutrition } from './NutritionAnalysis';

// リズムパターンの種類
export enum RhythmPatternType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
  POLYRHYTHM = 'polyrhythm',
  SWING = 'swing',
  SYNCOPATED = 'syncopated'
}

// メロディーパターンの種類
export enum MelodyPatternType {
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
  WAVE = 'wave',
  PEAK = 'peak',
  PLATEAU = 'plateau'
}

// リズムパターン定義
export interface RhythmPattern {
  type: RhythmPatternType;
  name: string;
  beats: number[]; // ビートの強さ (0-1)
  durations: number[]; // 各ビートの長さ (秒)
  complexity: number; // 複雑さ (0-1)
  energy: number; // エネルギー (0-1)
}

// メロディーパターン定義
export interface MelodyPattern {
  type: MelodyPatternType;
  name: string;
  notes: number[]; // 周波数配列
  durations: number[]; // 各音符の長さ (秒)
  intervals: number[]; // 音程間隔
  complexity: number; // 複雑さ (0-1)
  emotion: 'happy' | 'calm' | 'energetic' | 'melancholic' | 'mysterious';
}

// 動的パターン生成設定
export interface PatternGenerationConfig {
  nutritionScore: DetailedNutritionScore;
  selectedGenre: MusicGenre;
  totalDuration: number; // 総再生時間 (秒)
  complexity: number; // 全体の複雑さ (0-1)
  energy: number; // 全体のエネルギー (0-1)
}

// リズムパターン生成器
export class RhythmPatternGenerator {
  private static patterns: { [key in RhythmPatternType]: RhythmPattern } = {
    [RhythmPatternType.SIMPLE]: {
      type: RhythmPatternType.SIMPLE,
      name: 'シンプル',
      beats: [1, 0.5, 0.7, 0.5],
      durations: [0.5, 0.5, 0.5, 0.5],
      complexity: 0.2,
      energy: 0.5
    },
    [RhythmPatternType.COMPLEX]: {
      type: RhythmPatternType.COMPLEX,
      name: '複雑',
      beats: [1, 0.3, 0.8, 0.2, 0.9, 0.4, 0.6, 0.7],
      durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
      complexity: 0.8,
      energy: 0.7
    },
    [RhythmPatternType.POLYRHYTHM]: {
      type: RhythmPatternType.POLYRHYTHM,
      name: 'ポリリズム',
      beats: [1, 0.5, 0.8, 0.3, 0.9, 0.4],
      durations: [0.33, 0.33, 0.33, 0.33, 0.33, 0.33],
      complexity: 0.9,
      energy: 0.8
    },
    [RhythmPatternType.SWING]: {
      type: RhythmPatternType.SWING,
      name: 'スウィング',
      beats: [1, 0.2, 0.8, 0.3],
      durations: [0.6, 0.4, 0.6, 0.4],
      complexity: 0.6,
      energy: 0.6
    },
    [RhythmPatternType.SYNCOPATED]: {
      type: RhythmPatternType.SYNCOPATED,
      name: 'シンコペーション',
      beats: [0.3, 1, 0.2, 0.8, 0.4, 0.9],
      durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
      complexity: 0.7,
      energy: 0.8
    }
  };

  // 栄養スコアに基づいてリズムパターンを生成
  static generateRhythmPattern(config: PatternGenerationConfig): RhythmPattern {
    const { nutritionScore, selectedGenre, complexity, energy } = config;
    
    // 栄養バランスに基づくパターン選択
    const overallScore = nutritionScore.overallScore;
    const categoryScores = nutritionScore.categoryScores;
    
    // スコアに基づいてパターンタイプを決定
    let patternType: RhythmPatternType;
    
    if (overallScore > 0.8) {
      // バランス良好 → 複雑でエネルギッシュなパターン
      patternType = Math.random() > 0.5 ? RhythmPatternType.COMPLEX : RhythmPatternType.POLYRHYTHM;
    } else if (overallScore > 0.6) {
      // 中程度のバランス → スウィングやシンコペーション
      patternType = Math.random() > 0.5 ? RhythmPatternType.SWING : RhythmPatternType.SYNCOPATED;
    } else {
      // バランス不良 → シンプルなパターン
      patternType = RhythmPatternType.SIMPLE;
    }

    // ジャンルに応じた調整
    const genreAdjustments = this.getGenreAdjustments(selectedGenre);
    
    // ベースパターンを取得
    const basePattern = this.patterns[patternType];
    
    // 動的調整
    const adjustedPattern = this.adjustPatternForNutrition(
      basePattern,
      categoryScores,
      complexity,
      energy,
      genreAdjustments
    );

    return adjustedPattern;
  }

  // ジャンル別の調整パラメータ
  private static getGenreAdjustments(genre: MusicGenre): {
    complexityMultiplier: number;
    energyMultiplier: number;
    swingFactor: number;
  } {
    const adjustments: { [key: string]: any } = {
      'balance': { complexityMultiplier: 1.0, energyMultiplier: 0.8, swingFactor: 0.3 },
      'meiwa': { complexityMultiplier: 1.2, energyMultiplier: 1.0, swingFactor: 0.1 },
      'rock': { complexityMultiplier: 1.1, energyMultiplier: 1.2, swingFactor: 0.2 },
      'techno': { complexityMultiplier: 1.3, energyMultiplier: 1.1, swingFactor: 0.0 },
      'classical': { complexityMultiplier: 0.8, energyMultiplier: 0.6, swingFactor: 0.5 },
      'japanese': { complexityMultiplier: 0.9, energyMultiplier: 0.7, swingFactor: 0.4 },
      'jazz': { complexityMultiplier: 1.1, energyMultiplier: 0.9, swingFactor: 0.8 },
      'ambient': { complexityMultiplier: 0.6, energyMultiplier: 0.4, swingFactor: 0.2 },
      'custom': { complexityMultiplier: 1.0, energyMultiplier: 1.0, swingFactor: 0.3 }
    };

    return adjustments[genre.id] || adjustments['balance'];
  }

  // 栄養スコアに基づくパターン調整
  private static adjustPatternForNutrition(
    basePattern: RhythmPattern,
    categoryScores: { [categoryId: string]: number },
    complexity: number,
    energy: number,
    genreAdjustments: any
  ): RhythmPattern {
    const adjustedBeats = [...basePattern.beats];
    const adjustedDurations = [...basePattern.durations];
    
    // カテゴリスコアに基づく調整
    const categoryWeights = {
      'staple': 0.2,    // 主食の影響
      'side': 0.3,      // 副菜の影響
      'miso': 0.1,      // 味噌の影響
      'meat': 0.2,      // 肉の影響
      'fish': 0.1,      // 魚の影響
      'vegetable': 0.1  // 野菜の影響
    };

    // 各ビートをカテゴリスコアで調整
    adjustedBeats.forEach((beat, index) => {
      let adjustment = 0;
      Object.keys(categoryWeights).forEach(categoryId => {
        const categoryScore = categoryScores[categoryId] || 0;
        const weight = categoryWeights[categoryId as keyof typeof categoryWeights];
        adjustment += categoryScore * weight;
      });
      
      // ジャンル調整を適用
      const genreComplexity = genreAdjustments.complexityMultiplier;
      const genreEnergy = genreAdjustments.energyMultiplier;
      
      adjustedBeats[index] = Math.max(0, Math.min(1, 
        beat * (0.5 + adjustment * 0.5) * genreEnergy * energy
      ));
    });

    // 複雑さに基づく調整
    const complexityFactor = complexity * genreAdjustments.complexityMultiplier;
    if (complexityFactor > 0.7) {
      // より複雑なリズムに調整
      adjustedDurations.forEach((duration, index) => {
        adjustedDurations[index] = duration * (0.8 + Math.random() * 0.4);
      });
    }

    return {
      ...basePattern,
      beats: adjustedBeats,
      durations: adjustedDurations,
      complexity: Math.min(1, basePattern.complexity * complexityFactor),
      energy: Math.min(1, basePattern.energy * energy * genreAdjustments.energyMultiplier)
    };
  }
}

// メロディーパターン生成器
export class MelodyPatternGenerator {
  private static patterns: { [key in MelodyPatternType]: MelodyPattern } = {
    [MelodyPatternType.ASCENDING]: {
      type: MelodyPatternType.ASCENDING,
      name: '上昇',
      notes: [220, 247, 277, 311, 349, 392, 440, 494],
      durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      intervals: [0, 2, 2, 2, 2, 2, 2, 2],
      complexity: 0.3,
      emotion: 'happy'
    },
    [MelodyPatternType.DESCENDING]: {
      type: MelodyPatternType.DESCENDING,
      name: '下降',
      notes: [494, 440, 392, 349, 311, 277, 247, 220],
      durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      intervals: [0, -2, -2, -2, -2, -2, -2, -2],
      complexity: 0.3,
      emotion: 'melancholic'
    },
    [MelodyPatternType.WAVE]: {
      type: MelodyPatternType.WAVE,
      name: '波状',
      notes: [220, 277, 330, 277, 220, 185, 220, 277],
      durations: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
      intervals: [0, 3, 2, -2, -3, -2, 2, 3],
      complexity: 0.6,
      emotion: 'calm'
    },
    [MelodyPatternType.PEAK]: {
      type: MelodyPatternType.PEAK,
      name: 'ピーク',
      notes: [220, 277, 330, 440, 330, 277, 220, 185],
      durations: [0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3],
      intervals: [0, 3, 2, 4, -4, -2, -3, -2],
      complexity: 0.7,
      emotion: 'energetic'
    },
    [MelodyPatternType.PLATEAU]: {
      type: MelodyPatternType.PLATEAU,
      name: '高原',
      notes: [330, 330, 330, 330, 330, 330, 330, 330],
      durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      intervals: [0, 0, 0, 0, 0, 0, 0, 0],
      complexity: 0.1,
      emotion: 'mysterious'
    }
  };

  // 栄養スコアに基づいてメロディーパターンを生成
  static generateMelodyPattern(config: PatternGenerationConfig): MelodyPattern {
    const { nutritionScore, selectedGenre, complexity, energy } = config;
    
    // 栄養バランスに基づくパターン選択
    const overallScore = nutritionScore.overallScore;
    const nutrientScores = nutritionScore.nutrientScores;
    
    // スコアに基づいてパターンタイプを決定
    let patternType: MelodyPatternType;
    
    if (overallScore > 0.8) {
      // バランス良好 → 上昇やピークパターン
      patternType = Math.random() > 0.5 ? MelodyPatternType.ASCENDING : MelodyPatternType.PEAK;
    } else if (overallScore > 0.6) {
      // 中程度のバランス → 波状パターン
      patternType = MelodyPatternType.WAVE;
    } else if (overallScore > 0.4) {
      // やや不良 → 下降パターン
      patternType = MelodyPatternType.DESCENDING;
    } else {
      // バランス不良 → 高原パターン（単調）
      patternType = MelodyPatternType.PLATEAU;
    }

    // ジャンルに応じた調整
    const genreAdjustments = this.getGenreAdjustments(selectedGenre);
    
    // ベースパターンを取得
    const basePattern = this.patterns[patternType];
    
    // 動的調整
    const adjustedPattern = this.adjustPatternForNutrition(
      basePattern,
      nutritionScore,
      complexity,
      energy,
      genreAdjustments
    );

    return adjustedPattern;
  }

  // ジャンル別の調整パラメータ
  private static getGenreAdjustments(genre: MusicGenre): {
    scaleType: 'major' | 'minor' | 'pentatonic' | 'chromatic';
    octaveRange: number;
    emotionMultiplier: number;
  } {
    const adjustments: { [key: string]: any } = {
      'balance': { scaleType: 'major', octaveRange: 1, emotionMultiplier: 1.0 },
      'meiwa': { scaleType: 'pentatonic', octaveRange: 2, emotionMultiplier: 1.2 },
      'rock': { scaleType: 'minor', octaveRange: 2, emotionMultiplier: 1.3 },
      'techno': { scaleType: 'chromatic', octaveRange: 1, emotionMultiplier: 1.1 },
      'classical': { scaleType: 'major', octaveRange: 3, emotionMultiplier: 0.8 },
      'japanese': { scaleType: 'pentatonic', octaveRange: 1, emotionMultiplier: 0.9 },
      'jazz': { scaleType: 'chromatic', octaveRange: 2, emotionMultiplier: 1.1 },
      'ambient': { scaleType: 'minor', octaveRange: 1, emotionMultiplier: 0.6 },
      'custom': { scaleType: 'major', octaveRange: 1, emotionMultiplier: 1.0 }
    };

    return adjustments[genre.id] || adjustments['balance'];
  }

  // 栄養スコアに基づくパターン調整
  private static adjustPatternForNutrition(
    basePattern: MelodyPattern,
    nutritionScore: DetailedNutritionScore,
    complexity: number,
    energy: number,
    genreAdjustments: any
  ): MelodyPattern {
    const adjustedNotes = [...basePattern.notes];
    const adjustedDurations = [...basePattern.durations];
    const adjustedIntervals = [...basePattern.intervals];
    
    // 栄養素スコアに基づく調整
    const nutrientScores = nutritionScore.nutrientScores;
    
    // 各音符を栄養スコアで調整
    adjustedNotes.forEach((note, index) => {
      let adjustment = 0;
      
      // 主要栄養素の影響
      const proteinScore = nutrientScores['protein'] || 0;
      const vitaminScore = nutrientScores['vitamin'] || 0;
      const mineralScore = nutrientScores['mineral'] || 0;
      
      adjustment = (proteinScore * 0.4 + vitaminScore * 0.3 + mineralScore * 0.3);
      
      // オクターブ範囲内で調整
      const octaveMultiplier = 1 + (adjustment - 0.5) * genreAdjustments.octaveRange;
      adjustedNotes[index] = note * octaveMultiplier;
    });

    // 複雑さに基づく調整
    const complexityFactor = complexity * genreAdjustments.emotionMultiplier;
    if (complexityFactor > 0.7) {
      // より複雑なメロディーに調整
      adjustedIntervals.forEach((interval, index) => {
        adjustedIntervals[index] = interval + (Math.random() - 0.5) * 2;
      });
    }

    // エネルギーに基づく調整
    const energyFactor = energy * genreAdjustments.emotionMultiplier;
    adjustedDurations.forEach((duration, index) => {
      adjustedDurations[index] = duration * (0.5 + energyFactor * 0.5);
    });

    return {
      ...basePattern,
      notes: adjustedNotes,
      durations: adjustedDurations,
      intervals: adjustedIntervals,
      complexity: Math.min(1, basePattern.complexity * complexityFactor),
      emotion: this.determineEmotion(nutritionScore, energyFactor)
    };
  }

  // 栄養スコアに基づく感情決定
  private static determineEmotion(
    nutritionScore: DetailedNutritionScore,
    energyFactor: number
  ): 'happy' | 'calm' | 'energetic' | 'melancholic' | 'mysterious' {
    const overallScore = nutritionScore.overallScore;
    
    if (overallScore > 0.8 && energyFactor > 0.7) return 'energetic';
    if (overallScore > 0.8) return 'happy';
    if (overallScore > 0.6) return 'calm';
    if (overallScore > 0.4) return 'melancholic';
    return 'mysterious';
  }
}

// 統合パターン生成器
export class DynamicPatternGenerator {
  // 食事記録に基づいて動的パターンを生成
  static generatePatterns(
    meal: MealRecord,
    selectedGenre: MusicGenre,
    totalDuration: number = 8
  ): { rhythm: RhythmPattern; melody: MelodyPattern } {
    // 栄養分析を実行
    const nutritionScore = analyzeDetailedNutrition(meal);
    
    // 設定を作成
    const config: PatternGenerationConfig = {
      nutritionScore,
      selectedGenre,
      totalDuration,
      complexity: this.calculateComplexity(nutritionScore),
      energy: this.calculateEnergy(nutritionScore)
    };

    // パターンを生成
    const rhythm = RhythmPatternGenerator.generateRhythmPattern(config);
    const melody = MelodyPatternGenerator.generateMelodyPattern(config);

    return { rhythm, melody };
  }

  // 複雑さを計算
  private static calculateComplexity(nutritionScore: DetailedNutritionScore): number {
    const overallScore = nutritionScore.overallScore;
    const categoryVariance = this.calculateVariance(Object.values(nutritionScore.categoryScores));
    
    // バランスが良いほど複雑、分散が大きいほど複雑
    return Math.min(1, overallScore * 0.7 + categoryVariance * 0.3);
  }

  // エネルギーを計算
  private static calculateEnergy(nutritionScore: DetailedNutritionScore): number {
    const overallScore = nutritionScore.overallScore;
    const proteinScore = nutritionScore.nutrientScores['protein'] || 0;
    const vitaminScore = nutritionScore.nutrientScores['vitamin'] || 0;
    
    // タンパク質とビタミンが多いほどエネルギッシュ
    return Math.min(1, overallScore * 0.6 + proteinScore * 0.2 + vitaminScore * 0.2);
  }

  // 分散を計算
  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }
}
