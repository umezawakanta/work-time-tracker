/**
 * AI活用による高度な音楽生成システム
 * Phase 5: AI活用 - より高度な音楽生成
 */

import { MusicGenre, CategoryRatio, InstrumentType } from './types';
import { DetailedNutritionScore } from './NutritionAnalysis';

export interface AIMusicPattern {
  id: string;
  type: 'melody' | 'rhythm' | 'harmony' | 'bassline';
  notes: number[];
  durations: number[];
  velocities: number[];
  complexity: number;
  emotion: string;
  genre: string;
}

export interface AIGenerationContext {
  nutritionScore: DetailedNutritionScore;
  userPreferences: UserPreferences;
  historicalData: HistoricalMusicData[];
  currentMood: string;
  timeOfDay: string;
  season: string;
}

export interface UserPreferences {
  preferredGenres: string[];
  complexityLevel: 'simple' | 'medium' | 'complex';
  tempoRange: { min: number; max: number };
  instrumentPreferences: InstrumentType[];
  emotionalTone: string[];
}

export interface HistoricalMusicData {
  date: string;
  mealData: CategoryRatio[];
  generatedMusic: AIMusicPattern[];
  userRating: number;
  feedback: string;
}

export interface AIGenerationResult {
  patterns: AIMusicPattern[];
  metadata: {
    confidence: number;
    reasoning: string;
    suggestions: string[];
    estimatedDuration: number;
  };
}

export class AIMusicGenerator {
  private static instance: AIMusicGenerator;
  private learningData: HistoricalMusicData[] = [];
  private userPreferences: UserPreferences | null = null;

  private constructor() {
    this.loadUserPreferences();
    this.loadHistoricalData();
  }

  public static getInstance(): AIMusicGenerator {
    if (!AIMusicGenerator.instance) {
      AIMusicGenerator.instance = new AIMusicGenerator();
    }
    return AIMusicGenerator.instance;
  }

  /**
   * AIを活用した高度な音楽生成
   */
  public async generateAdvancedMusic(
    categoryRatios: CategoryRatio[],
    nutritionScore: DetailedNutritionScore,
    genre: MusicGenre,
    context: AIGenerationContext
  ): Promise<AIGenerationResult> {
    try {
      // 1. 栄養データから感情・ムードを分析
      const emotionalAnalysis = this.analyzeNutritionalEmotion(nutritionScore, categoryRatios);
      
      // 2. ユーザーの履歴データから学習
      const learnedPatterns = this.analyzeHistoricalPreferences(context.historicalData);
      
      // 3. コンテキスト情報を統合
      const contextualFactors = this.analyzeContextualFactors(context);
      
      // 4. AIパターン生成
      const patterns = await this.generateAIPatterns(
        emotionalAnalysis,
        learnedPatterns,
        contextualFactors,
        genre,
        nutritionScore
      );

      // 5. パターンの最適化と調整
      const optimizedPatterns = this.optimizePatterns(patterns, nutritionScore, genre);

      // 6. メタデータの生成
      const metadata = this.generateMetadata(patterns, emotionalAnalysis, learnedPatterns);

      return {
        patterns: optimizedPatterns,
        metadata
      };
    } catch (error) {
      console.error('AI music generation error:', error);
      throw new Error('AI音楽生成に失敗しました');
    }
  }

  /**
   * 栄養データから感情・ムードを分析
   */
  private analyzeNutritionalEmotion(
    nutritionScore: DetailedNutritionScore,
    categoryRatios: CategoryRatio[]
  ): {
    primaryEmotion: string;
    secondaryEmotion: string;
    energyLevel: number;
    complexity: number;
    mood: string;
  } {
    const overallScore = nutritionScore.overallScore;
    const categoryScores = nutritionScore.categoryScores;
    
    // 栄養バランススコアに基づく感情分析
    let primaryEmotion = 'neutral';
    let secondaryEmotion = 'calm';
    let energyLevel = 0.5;
    let complexity = 0.5;
    let mood = 'balanced';

    if (overallScore >= 80) {
      primaryEmotion = 'joyful';
      secondaryEmotion = 'energetic';
      energyLevel = 0.8;
      complexity = 0.7;
      mood = 'uplifting';
    } else if (overallScore >= 60) {
      primaryEmotion = 'content';
      secondaryEmotion = 'peaceful';
      energyLevel = 0.6;
      complexity = 0.6;
      mood = 'satisfied';
    } else if (overallScore >= 40) {
      primaryEmotion = 'melancholic';
      secondaryEmotion = 'contemplative';
      energyLevel = 0.4;
      complexity = 0.5;
      mood = 'reflective';
    } else {
      primaryEmotion = 'somber';
      secondaryEmotion = 'introspective';
      energyLevel = 0.3;
      complexity = 0.4;
      mood = 'serious';
    }

    // カテゴリ別の感情調整
    if (categoryScores.staple > 0.7) {
      energyLevel += 0.1;
      mood = 'grounded';
    }
    if (categoryScores.protein > 0.7) {
      energyLevel += 0.15;
      primaryEmotion = 'powerful';
    }
    if (categoryScores.vegetable > 0.7) {
      secondaryEmotion = 'fresh';
      mood = 'vibrant';
    }

    return {
      primaryEmotion,
      secondaryEmotion,
      energyLevel: Math.min(1, energyLevel),
      complexity: Math.min(1, complexity),
      mood
    };
  }

  /**
   * 履歴データから学習パターンを分析
   */
  private analyzeHistoricalPreferences(historicalData: HistoricalMusicData[]): {
    preferredPatterns: AIMusicPattern[];
    averageRating: number;
    commonGenres: string[];
    complexityTrend: number;
  } {
    if (historicalData.length === 0) {
      return {
        preferredPatterns: [],
        averageRating: 0,
        commonGenres: [],
        complexityTrend: 0.5
      };
    }

    const highRatedData = historicalData.filter(data => data.userRating >= 4);
    const preferredPatterns = highRatedData.flatMap(data => data.generatedMusic);
    const averageRating = historicalData.reduce((sum, data) => sum + data.userRating, 0) / historicalData.length;
    
    const genreCounts = historicalData.reduce((acc, data) => {
      data.generatedMusic.forEach(pattern => {
        acc[pattern.genre] = (acc[pattern.genre] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const commonGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    const complexityTrend = historicalData.reduce((sum, data) => {
      const avgComplexity = data.generatedMusic.reduce((patternSum, pattern) => 
        patternSum + pattern.complexity, 0) / data.generatedMusic.length;
      return sum + avgComplexity;
    }, 0) / historicalData.length;

    return {
      preferredPatterns,
      averageRating,
      commonGenres,
      complexityTrend: Math.min(1, complexityTrend)
    };
  }

  /**
   * コンテキスト要因を分析
   */
  private analyzeContextualFactors(context: AIGenerationContext): {
    timeFactor: number;
    seasonFactor: number;
    moodFactor: number;
    overallContext: string;
  } {
    // 時間帯による調整
    let timeFactor = 0.5;
    switch (context.timeOfDay) {
      case 'morning':
        timeFactor = 0.7; // 朝は活発
        break;
      case 'afternoon':
        timeFactor = 0.6; // 午後は中程度
        break;
      case 'evening':
        timeFactor = 0.4; // 夕方は落ち着いた
        break;
      case 'night':
        timeFactor = 0.3; // 夜は静か
        break;
    }

    // 季節による調整
    let seasonFactor = 0.5;
    switch (context.season) {
      case 'spring':
        seasonFactor = 0.7; // 春は明るく
        break;
      case 'summer':
        seasonFactor = 0.8; // 夏は活発
        break;
      case 'autumn':
        seasonFactor = 0.4; // 秋は落ち着いた
        break;
      case 'winter':
        seasonFactor = 0.3; // 冬は静か
        break;
    }

    // 現在のムードによる調整
    let moodFactor = 0.5;
    switch (context.currentMood) {
      case 'happy':
        moodFactor = 0.8;
        break;
      case 'sad':
        moodFactor = 0.2;
        break;
      case 'excited':
        moodFactor = 0.9;
        break;
      case 'calm':
        moodFactor = 0.4;
        break;
      case 'focused':
        moodFactor = 0.6;
        break;
    }

    const overallContext = this.determineOverallContext(timeFactor, seasonFactor, moodFactor);

    return {
      timeFactor,
      seasonFactor,
      moodFactor,
      overallContext
    };
  }

  /**
   * AIパターンを生成
   */
  private async generateAIPatterns(
    emotionalAnalysis: any,
    learnedPatterns: any,
    contextualFactors: any,
    genre: MusicGenre,
    nutritionScore: DetailedNutritionScore
  ): Promise<AIMusicPattern[]> {
    const patterns: AIMusicPattern[] = [];

    // メロディーパターンの生成
    const melodyPattern = this.generateMelodyPattern(
      emotionalAnalysis,
      learnedPatterns,
      contextualFactors,
      genre
    );
    patterns.push(melodyPattern);

    // リズムパターンの生成
    const rhythmPattern = this.generateRhythmPattern(
      emotionalAnalysis,
      learnedPatterns,
      contextualFactors,
      genre
    );
    patterns.push(rhythmPattern);

    // ハーモニーパターンの生成
    const harmonyPattern = this.generateHarmonyPattern(
      emotionalAnalysis,
      learnedPatterns,
      contextualFactors,
      genre,
      melodyPattern
    );
    patterns.push(harmonyPattern);

    // ベースラインパターンの生成
    const basslinePattern = this.generateBasslinePattern(
      emotionalAnalysis,
      learnedPatterns,
      contextualFactors,
      genre,
      melodyPattern,
      harmonyPattern
    );
    patterns.push(basslinePattern);

    return patterns;
  }

  /**
   * メロディーパターンを生成
   */
  private generateMelodyPattern(
    emotionalAnalysis: any,
    learnedPatterns: any,
    contextualFactors: any,
    genre: MusicGenre
  ): AIMusicPattern {
    const baseNotes = this.getGenreBaseNotes(genre);
    const emotion = emotionalAnalysis.primaryEmotion;
    const energy = emotionalAnalysis.energyLevel;
    const complexity = emotionalAnalysis.complexity;

    // 感情に基づく音階の選択
    const scale = this.getEmotionalScale(emotion, genre);
    
    // エネルギーに基づく音符の密度
    const noteDensity = Math.floor(4 + energy * 8);
    
    // 複雑さに基づく装飾音の追加
    const ornamentation = complexity > 0.7 ? 0.3 : 0.1;

    const notes: number[] = [];
    const durations: number[] = [];
    const velocities: number[] = [];

    for (let i = 0; i < noteDensity; i++) {
      const noteIndex = Math.floor(Math.random() * scale.length);
      const baseNote = scale[noteIndex];
      
      // オクターブの調整
      const octave = 4 + Math.floor(energy * 2);
      const note = baseNote + (octave * 12);
      
      notes.push(note);
      
      // 持続時間の計算
      const baseDuration = 0.5 + (1 - energy) * 1.5;
      const duration = baseDuration + (Math.random() - 0.5) * 0.5;
      durations.push(duration);
      
      // ベロシティの計算
      const velocity = 60 + energy * 40 + (Math.random() - 0.5) * 20;
      velocities.push(Math.max(20, Math.min(127, velocity)));
    }

    return {
      id: `melody_${Date.now()}`,
      type: 'melody',
      notes,
      durations,
      velocities,
      complexity,
      emotion,
      genre: genre.id
    };
  }

  /**
   * リズムパターンを生成
   */
  private generateRhythmPattern(
    emotionalAnalysis: any,
    learnedPatterns: any,
    contextualFactors: any,
    genre: MusicGenre
  ): AIMusicPattern {
    const energy = emotionalAnalysis.energyLevel;
    const complexity = emotionalAnalysis.complexity;
    
    // エネルギーに基づくBPMの調整
    const baseBPM = genre.tempo;
    const adjustedBPM = baseBPM + (energy - 0.5) * 40;
    
    // 複雑さに基づくリズムパターンの生成
    const rhythmComplexity = Math.floor(2 + complexity * 6);
    const notes: number[] = [];
    const durations: number[] = [];
    const velocities: number[] = [];

    // 基本的なリズムパターン
    const baseRhythm = this.getGenreBaseRhythm(genre);
    
    for (let i = 0; i < rhythmComplexity; i++) {
      const rhythmNote = baseRhythm[i % baseRhythm.length];
      notes.push(rhythmNote);
      
      // 持続時間の計算
      const duration = (60 / adjustedBPM) * (1 + Math.random() * 0.5);
      durations.push(duration);
      
      // ベロシティの計算
      const velocity = 80 + energy * 30 + (Math.random() - 0.5) * 20;
      velocities.push(Math.max(40, Math.min(127, velocity)));
    }

    return {
      id: `rhythm_${Date.now()}`,
      type: 'rhythm',
      notes,
      durations,
      velocities,
      complexity,
      emotion: emotionalAnalysis.primaryEmotion,
      genre: genre.id
    };
  }

  /**
   * ハーモニーパターンを生成
   */
  private generateHarmonyPattern(
    emotionalAnalysis: any,
    learnedPatterns: any,
    contextualFactors: any,
    genre: MusicGenre,
    melodyPattern: AIMusicPattern
  ): AIMusicPattern {
    const emotion = emotionalAnalysis.primaryEmotion;
    const complexity = emotionalAnalysis.complexity;
    
    // メロディーに基づく和音の生成
    const chordProgression = this.getEmotionalChordProgression(emotion, genre);
    const notes: number[] = [];
    const durations: number[] = [];
    const velocities: number[] = [];

    chordProgression.forEach((chord, index) => {
      chord.forEach(note => {
        notes.push(note);
        durations.push(2.0); // 和音は長め
        velocities.push(60 + complexity * 30);
      });
    });

    return {
      id: `harmony_${Date.now()}`,
      type: 'harmony',
      notes,
      durations,
      velocities,
      complexity,
      emotion,
      genre: genre.id
    };
  }

  /**
   * ベースラインパターンを生成
   */
  private generateBasslinePattern(
    emotionalAnalysis: any,
    learnedPatterns: any,
    contextualFactors: any,
    genre: MusicGenre,
    melodyPattern: AIMusicPattern,
    harmonyPattern: AIMusicPattern
  ): AIMusicPattern {
    const energy = emotionalAnalysis.energyLevel;
    const complexity = emotionalAnalysis.complexity;
    
    // ベースラインの生成（低音域）
    const bassNotes = this.getBassNotes(genre);
    const notes: number[] = [];
    const durations: number[] = [];
    const velocities: number[] = [];

    const bassLength = Math.floor(4 + complexity * 4);
    
    for (let i = 0; i < bassLength; i++) {
      const noteIndex = i % bassNotes.length;
      const note = bassNotes[noteIndex] - 24; // 1オクターブ下げる
      notes.push(note);
      
      const duration = 1.0 + (1 - energy) * 1.0;
      durations.push(duration);
      
      const velocity = 70 + energy * 20;
      velocities.push(velocity);
    }

    return {
      id: `bassline_${Date.now()}`,
      type: 'bassline',
      notes,
      durations,
      velocities,
      complexity,
      emotion: emotionalAnalysis.primaryEmotion,
      genre: genre.id
    };
  }

  /**
   * パターンを最適化
   */
  private optimizePatterns(
    patterns: AIMusicPattern[],
    nutritionScore: DetailedNutritionScore,
    genre: MusicGenre
  ): AIMusicPattern[] {
    return patterns.map(pattern => {
      // 栄養スコアに基づく微調整
      const adjustmentFactor = nutritionScore.overallScore / 100;
      
      return {
        ...pattern,
        velocities: pattern.velocities.map(v => 
          Math.max(20, Math.min(127, v * adjustmentFactor))
        ),
        durations: pattern.durations.map(d => 
          d * (0.8 + adjustmentFactor * 0.4)
        )
      };
    });
  }

  /**
   * メタデータを生成
   */
  private generateMetadata(
    patterns: AIMusicPattern[],
    emotionalAnalysis: any,
    learnedPatterns: any
  ): any {
    const totalNotes = patterns.reduce((sum, pattern) => sum + pattern.notes.length, 0);
    const averageComplexity = patterns.reduce((sum, pattern) => sum + pattern.complexity, 0) / patterns.length;
    const estimatedDuration = patterns.reduce((sum, pattern) => 
      sum + pattern.durations.reduce((dSum, d) => dSum + d, 0), 0
    );

    return {
      confidence: Math.min(0.95, 0.6 + averageComplexity * 0.3),
      reasoning: `栄養バランススコア${emotionalAnalysis.overallScore}に基づき、${emotionalAnalysis.primaryEmotion}な感情で${averageComplexity.toFixed(2)}の複雑さの音楽を生成しました。`,
      suggestions: this.generateSuggestions(patterns, emotionalAnalysis),
      estimatedDuration: Math.round(estimatedDuration)
    };
  }

  /**
   * 提案を生成
   */
  private generateSuggestions(patterns: AIMusicPattern[], emotionalAnalysis: any): string[] {
    const suggestions: string[] = [];
    
    if (emotionalAnalysis.energyLevel > 0.7) {
      suggestions.push('高エネルギーな音楽です。運動や活動的な作業に最適です。');
    } else if (emotionalAnalysis.energyLevel < 0.4) {
      suggestions.push('落ち着いた音楽です。リラックスや瞑想に最適です。');
    }
    
    if (emotionalAnalysis.complexity > 0.7) {
      suggestions.push('複雑な構成の音楽です。集中力が必要な作業に適しています。');
    } else {
      suggestions.push('シンプルで覚えやすい音楽です。日常のBGMに最適です。');
    }
    
    return suggestions;
  }

  // ヘルパーメソッド群
  private getGenreBaseNotes(genre: MusicGenre): number[] {
    const baseNotes = [60, 62, 64, 65, 67, 69, 71]; // C major scale
    return baseNotes;
  }

  private getEmotionalScale(emotion: string, genre: MusicGenre): number[] {
    const scales: Record<string, number[]> = {
      'joyful': [60, 62, 64, 66, 67, 69, 71], // C major
      'melancholic': [60, 62, 63, 65, 67, 68, 70], // C natural minor
      'powerful': [60, 62, 64, 65, 67, 69, 71], // C major
      'peaceful': [60, 62, 64, 65, 67, 69, 71], // C major
      'somber': [60, 62, 63, 65, 67, 68, 70], // C natural minor
      'content': [60, 62, 64, 65, 67, 69, 71] // C major
    };
    return scales[emotion] || scales['content'];
  }

  private getGenreBaseRhythm(genre: MusicGenre): number[] {
    const rhythms: Record<string, number[]> = {
      'balanced': [60, 60, 60, 60],
      'meiwa': [60, 60, 60, 60],
      'rock': [60, 60, 60, 60],
      'techno': [60, 60, 60, 60],
      'classical': [60, 60, 60, 60],
      'japanese': [60, 60, 60, 60],
      'jazz': [60, 60, 60, 60],
      'ambient': [60, 60, 60, 60],
      'custom': [60, 60, 60, 60]
    };
    return rhythms[genre.id] || rhythms['balanced'];
  }

  private getEmotionalChordProgression(emotion: string, genre: MusicGenre): number[][] {
    const progressions: Record<string, number[][]> = {
      'joyful': [[60, 64, 67], [62, 65, 69], [64, 67, 71], [60, 64, 67]],
      'melancholic': [[60, 63, 67], [62, 65, 68], [63, 67, 70], [60, 63, 67]],
      'powerful': [[60, 64, 67], [60, 64, 67], [62, 65, 69], [60, 64, 67]],
      'peaceful': [[60, 64, 67], [62, 65, 69], [64, 67, 71], [67, 71, 74]],
      'somber': [[60, 63, 67], [60, 63, 67], [62, 65, 68], [60, 63, 67]],
      'content': [[60, 64, 67], [62, 65, 69], [64, 67, 71], [60, 64, 67]]
    };
    return progressions[emotion] || progressions['content'];
  }

  private getBassNotes(genre: MusicGenre): number[] {
    return [36, 38, 40, 41, 43, 45, 47]; // C2-C3
  }

  private determineOverallContext(timeFactor: number, seasonFactor: number, moodFactor: number): string {
    const average = (timeFactor + seasonFactor + moodFactor) / 3;
    if (average > 0.7) return 'energetic';
    if (average > 0.5) return 'balanced';
    if (average > 0.3) return 'calm';
    return 'serene';
  }

  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('aiMusicUserPreferences');
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  private loadHistoricalData(): void {
    try {
      const saved = localStorage.getItem('aiMusicHistoricalData');
      if (saved) {
        this.learningData = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load historical data:', error);
    }
  }

  public saveUserPreferences(preferences: UserPreferences): void {
    this.userPreferences = preferences;
    try {
      localStorage.setItem('aiMusicUserPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  public saveHistoricalData(data: HistoricalMusicData): void {
    this.learningData.push(data);
    // 最新100件のみ保持
    if (this.learningData.length > 100) {
      this.learningData = this.learningData.slice(-100);
    }
    try {
      localStorage.setItem('aiMusicHistoricalData', JSON.stringify(this.learningData));
    } catch (error) {
      console.warn('Failed to save historical data:', error);
    }
  }

  public getUserPreferences(): UserPreferences | null {
    return this.userPreferences;
  }

  public getHistoricalData(): HistoricalMusicData[] {
    return this.learningData;
  }
}
