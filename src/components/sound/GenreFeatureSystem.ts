import { MusicGenre } from './types';
import { InstrumentType, WaveformType } from './SimpleAudioEngine';
import { RhythmPattern, MelodyPattern } from './DynamicPatternGenerator';

// ジャンル別の特徴設定
export interface GenreFeatures {
  id: string;
  name: string;
  characteristics: {
    // 音響特徴
    primaryInstruments: InstrumentType[];
    secondaryInstruments: InstrumentType[];
    waveformPreferences: WaveformType[];
    
    // リズム特徴
    typicalBPM: number;
    rhythmComplexity: number;
    swingFactor: number;
    syncopationLevel: number;
    
    // メロディー特徴
    scaleType: 'major' | 'minor' | 'pentatonic' | 'chromatic' | 'blues' | 'dorian';
    octaveRange: number;
    melodyComplexity: number;
    ornamentation: number;
    
    // ハーモニー特徴
    chordComplexity: number;
    dissonanceLevel: number;
    modulationFrequency: number;
    
    // エフェクト特徴
    reverbLevel: number;
    delayLevel: number;
    distortionLevel: number;
    filterCutoff: number;
    
    // 動的調整
    dynamicRange: number;
    crescendoTendency: number;
    accentPattern: number[];
  };
  
  // 栄養バランスとの相関
  nutritionCorrelations: {
    [nutrientType: string]: {
      influence: number; // 影響度 (0-1)
      effect: 'positive' | 'negative' | 'neutral';
      description: string;
    };
  };
}

// ジャンル別特徴定義
export const genreFeatureDefinitions: { [key: string]: GenreFeatures } = {
  'balance': {
    id: 'balance',
    name: 'バランス',
    characteristics: {
      primaryInstruments: [InstrumentType.PIANO, InstrumentType.SYNTH],
      secondaryInstruments: [InstrumentType.BASS],
      waveformPreferences: [WaveformType.SINE, WaveformType.SQUARE],
      typicalBPM: 120,
      rhythmComplexity: 0.5,
      swingFactor: 0.3,
      syncopationLevel: 0.4,
      scaleType: 'major',
      octaveRange: 2,
      melodyComplexity: 0.6,
      ornamentation: 0.4,
      chordComplexity: 0.5,
      dissonanceLevel: 0.2,
      modulationFrequency: 0.3,
      reverbLevel: 0.4,
      delayLevel: 0.2,
      distortionLevel: 0.1,
      filterCutoff: 0.7,
      dynamicRange: 0.6,
      crescendoTendency: 0.5,
      accentPattern: [1, 0.5, 0.7, 0.5]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.6, effect: 'positive', description: 'タンパク質が豊富だと安定したリズム' },
      'vitamin': { influence: 0.7, effect: 'positive', description: 'ビタミンが豊富だと明るいメロディー' },
      'mineral': { influence: 0.5, effect: 'positive', description: 'ミネラルが豊富だと深みのある音色' },
      'fiber': { influence: 0.4, effect: 'positive', description: '食物繊維が豊富だと滑らかな流れ' }
    }
  },
  
  'meiwa': {
    id: 'meiwa',
    name: '明和電機風',
    characteristics: {
      primaryInstruments: [InstrumentType.MEIWA, InstrumentType.SYNTH],
      secondaryInstruments: [InstrumentType.DRUM],
      waveformPreferences: [WaveformType.SQUARE, WaveformType.SAWTOOTH],
      typicalBPM: 120,
      rhythmComplexity: 0.8,
      swingFactor: 0.1,
      syncopationLevel: 0.9,
      scaleType: 'pentatonic',
      octaveRange: 3,
      melodyComplexity: 0.7,
      ornamentation: 0.8,
      chordComplexity: 0.3,
      dissonanceLevel: 0.6,
      modulationFrequency: 0.8,
      reverbLevel: 0.2,
      delayLevel: 0.6,
      distortionLevel: 0.7,
      filterCutoff: 0.4,
      dynamicRange: 0.8,
      crescendoTendency: 0.9,
      accentPattern: [1, 0.2, 0.9, 0.1, 0.8, 0.3]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.8, effect: 'positive', description: 'タンパク質が豊富だと激しいリズム' },
      'vitamin': { influence: 0.6, effect: 'positive', description: 'ビタミンが豊富だと明るい8bit音' },
      'mineral': { influence: 0.4, effect: 'neutral', description: 'ミネラルは中性的な影響' },
      'fiber': { influence: 0.3, effect: 'negative', description: '食物繊維が多いとシンプルになる' }
    }
  },
  
  'rock': {
    id: 'rock',
    name: 'ロック',
    characteristics: {
      primaryInstruments: [InstrumentType.GUITAR, InstrumentType.DRUM],
      secondaryInstruments: [InstrumentType.BASS, InstrumentType.SYNTH],
      waveformPreferences: [WaveformType.SAWTOOTH, WaveformType.SQUARE],
      typicalBPM: 140,
      rhythmComplexity: 0.7,
      swingFactor: 0.2,
      syncopationLevel: 0.6,
      scaleType: 'minor',
      octaveRange: 2,
      melodyComplexity: 0.8,
      ornamentation: 0.6,
      chordComplexity: 0.7,
      dissonanceLevel: 0.5,
      modulationFrequency: 0.4,
      reverbLevel: 0.6,
      delayLevel: 0.4,
      distortionLevel: 0.8,
      filterCutoff: 0.5,
      dynamicRange: 0.9,
      crescendoTendency: 0.8,
      accentPattern: [1, 0.3, 0.8, 0.2, 0.9, 0.4]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.9, effect: 'positive', description: 'タンパク質が豊富だとパワフルなサウンド' },
      'vitamin': { influence: 0.5, effect: 'positive', description: 'ビタミンが豊富だと明るいトーン' },
      'mineral': { influence: 0.6, effect: 'positive', description: 'ミネラルが豊富だと深い低音' },
      'fiber': { influence: 0.3, effect: 'negative', description: '食物繊維が多いとソフトになる' }
    }
  },
  
  'techno': {
    id: 'techno',
    name: 'テクノ',
    characteristics: {
      primaryInstruments: [InstrumentType.SYNTH, InstrumentType.DRUM],
      secondaryInstruments: [InstrumentType.BASS],
      waveformPreferences: [WaveformType.SQUARE, WaveformType.SAWTOOTH],
      typicalBPM: 128,
      rhythmComplexity: 0.9,
      swingFactor: 0.0,
      syncopationLevel: 0.8,
      scaleType: 'chromatic',
      octaveRange: 1,
      melodyComplexity: 0.6,
      ornamentation: 0.3,
      chordComplexity: 0.4,
      dissonanceLevel: 0.7,
      modulationFrequency: 0.9,
      reverbLevel: 0.3,
      delayLevel: 0.8,
      distortionLevel: 0.5,
      filterCutoff: 0.3,
      dynamicRange: 0.7,
      crescendoTendency: 0.6,
      accentPattern: [1, 0.1, 0.9, 0.1, 0.8, 0.2, 0.7, 0.1]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.7, effect: 'positive', description: 'タンパク質が豊富だと機械的なリズム' },
      'vitamin': { influence: 0.4, effect: 'neutral', description: 'ビタミンは中性的な影響' },
      'mineral': { influence: 0.5, effect: 'positive', description: 'ミネラルが豊富だと金属的な音色' },
      'fiber': { influence: 0.2, effect: 'negative', description: '食物繊維が多いと有機的になる' }
    }
  },
  
  'classical': {
    id: 'classical',
    name: 'クラシック',
    characteristics: {
      primaryInstruments: [InstrumentType.PIANO, InstrumentType.SYNTH],
      secondaryInstruments: [InstrumentType.BASS],
      waveformPreferences: [WaveformType.SINE, WaveformType.TRIANGLE],
      typicalBPM: 80,
      rhythmComplexity: 0.6,
      swingFactor: 0.5,
      syncopationLevel: 0.4,
      scaleType: 'major',
      octaveRange: 4,
      melodyComplexity: 0.9,
      ornamentation: 0.9,
      chordComplexity: 0.8,
      dissonanceLevel: 0.3,
      modulationFrequency: 0.2,
      reverbLevel: 0.8,
      delayLevel: 0.3,
      distortionLevel: 0.1,
      filterCutoff: 0.9,
      dynamicRange: 0.9,
      crescendoTendency: 0.7,
      accentPattern: [1, 0.6, 0.8, 0.5, 0.9, 0.7]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.5, effect: 'positive', description: 'タンパク質が豊富だと安定したハーモニー' },
      'vitamin': { influence: 0.8, effect: 'positive', description: 'ビタミンが豊富だと美しいメロディー' },
      'mineral': { influence: 0.7, effect: 'positive', description: 'ミネラルが豊富だと深い響き' },
      'fiber': { influence: 0.6, effect: 'positive', description: '食物繊維が豊富だと滑らかな流れ' }
    }
  },
  
  'japanese': {
    id: 'japanese',
    name: '和楽器',
    characteristics: {
      primaryInstruments: [InstrumentType.SYNTH, InstrumentType.PIANO],
      secondaryInstruments: [InstrumentType.BASS],
      waveformPreferences: [WaveformType.SINE, WaveformType.TRIANGLE],
      typicalBPM: 100,
      rhythmComplexity: 0.5,
      swingFactor: 0.4,
      syncopationLevel: 0.3,
      scaleType: 'pentatonic',
      octaveRange: 2,
      melodyComplexity: 0.7,
      ornamentation: 0.8,
      chordComplexity: 0.4,
      dissonanceLevel: 0.2,
      modulationFrequency: 0.3,
      reverbLevel: 0.7,
      delayLevel: 0.4,
      distortionLevel: 0.2,
      filterCutoff: 0.8,
      dynamicRange: 0.6,
      crescendoTendency: 0.5,
      accentPattern: [1, 0.7, 0.8, 0.6, 0.9, 0.5]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.4, effect: 'positive', description: 'タンパク質が豊富だと力強い音色' },
      'vitamin': { influence: 0.6, effect: 'positive', description: 'ビタミンが豊富だと清らかな音' },
      'mineral': { influence: 0.8, effect: 'positive', description: 'ミネラルが豊富だと深い響き' },
      'fiber': { influence: 0.7, effect: 'positive', description: '食物繊維が豊富だと自然な流れ' }
    }
  },
  
  'jazz': {
    id: 'jazz',
    name: 'ジャズ',
    characteristics: {
      primaryInstruments: [InstrumentType.PIANO, InstrumentType.BASS],
      secondaryInstruments: [InstrumentType.GUITAR, InstrumentType.DRUM],
      waveformPreferences: [WaveformType.SINE, WaveformType.SAWTOOTH],
      typicalBPM: 110,
      rhythmComplexity: 0.8,
      swingFactor: 0.9,
      syncopationLevel: 0.7,
      scaleType: 'blues',
      octaveRange: 3,
      melodyComplexity: 0.9,
      ornamentation: 0.9,
      chordComplexity: 0.9,
      dissonanceLevel: 0.6,
      modulationFrequency: 0.7,
      reverbLevel: 0.5,
      delayLevel: 0.3,
      distortionLevel: 0.3,
      filterCutoff: 0.6,
      dynamicRange: 0.8,
      crescendoTendency: 0.8,
      accentPattern: [1, 0.3, 0.8, 0.2, 0.9, 0.4, 0.7, 0.1]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.8, effect: 'positive', description: 'タンパク質が豊富だと複雑なハーモニー' },
      'vitamin': { influence: 0.7, effect: 'positive', description: 'ビタミンが豊富だと明るいインプロビゼーション' },
      'mineral': { influence: 0.6, effect: 'positive', description: 'ミネラルが豊富だと深いベースライン' },
      'fiber': { influence: 0.5, effect: 'positive', description: '食物繊維が豊富だと滑らかなフレーズ' }
    }
  },
  
  'ambient': {
    id: 'ambient',
    name: 'アンビエント',
    characteristics: {
      primaryInstruments: [InstrumentType.SYNTH, InstrumentType.PIANO],
      secondaryInstruments: [InstrumentType.BASS],
      waveformPreferences: [WaveformType.SINE, WaveformType.TRIANGLE],
      typicalBPM: 60,
      rhythmComplexity: 0.2,
      swingFactor: 0.1,
      syncopationLevel: 0.1,
      scaleType: 'minor',
      octaveRange: 1,
      melodyComplexity: 0.3,
      ornamentation: 0.2,
      chordComplexity: 0.6,
      dissonanceLevel: 0.3,
      modulationFrequency: 0.1,
      reverbLevel: 0.9,
      delayLevel: 0.7,
      distortionLevel: 0.1,
      filterCutoff: 0.5,
      dynamicRange: 0.3,
      crescendoTendency: 0.2,
      accentPattern: [1, 0.8, 0.9, 0.7, 0.8, 0.6]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.3, effect: 'neutral', description: 'タンパク質は中性的な影響' },
      'vitamin': { influence: 0.4, effect: 'positive', description: 'ビタミンが豊富だと微細な変化' },
      'mineral': { influence: 0.5, effect: 'positive', description: 'ミネラルが豊富だと深い響き' },
      'fiber': { influence: 0.8, effect: 'positive', description: '食物繊維が豊富だと自然な流れ' }
    }
  },
  
  'custom': {
    id: 'custom',
    name: 'カスタム',
    characteristics: {
      primaryInstruments: [InstrumentType.PIANO, InstrumentType.SYNTH],
      secondaryInstruments: [InstrumentType.BASS, InstrumentType.DRUM],
      waveformPreferences: [WaveformType.SINE, WaveformType.SQUARE],
      typicalBPM: 120,
      rhythmComplexity: 0.5,
      swingFactor: 0.3,
      syncopationLevel: 0.4,
      scaleType: 'major',
      octaveRange: 2,
      melodyComplexity: 0.6,
      ornamentation: 0.5,
      chordComplexity: 0.5,
      dissonanceLevel: 0.3,
      modulationFrequency: 0.4,
      reverbLevel: 0.5,
      delayLevel: 0.4,
      distortionLevel: 0.3,
      filterCutoff: 0.6,
      dynamicRange: 0.6,
      crescendoTendency: 0.5,
      accentPattern: [1, 0.5, 0.7, 0.5, 0.8, 0.6]
    },
    nutritionCorrelations: {
      'protein': { influence: 0.6, effect: 'positive', description: 'タンパク質が豊富だと安定したリズム' },
      'vitamin': { influence: 0.6, effect: 'positive', description: 'ビタミンが豊富だと明るいメロディー' },
      'mineral': { influence: 0.5, effect: 'positive', description: 'ミネラルが豊富だと深みのある音色' },
      'fiber': { influence: 0.5, effect: 'positive', description: '食物繊維が豊富だと滑らかな流れ' }
    }
  }
};

// ジャンル特徴システム
export class GenreFeatureSystem {
  // ジャンルの特徴を取得
  static getGenreFeatures(genreId: string): GenreFeatures | null {
    return genreFeatureDefinitions[genreId] || null;
  }

  // 栄養バランスに基づいて最適なジャンルを推奨
  static recommendGenre(nutritionScore: any): string[] {
    const recommendations: { genreId: string; score: number }[] = [];
    
    Object.keys(genreFeatureDefinitions).forEach(genreId => {
      const features = genreFeatureDefinitions[genreId];
      let score = 0;
      
      // 栄養素スコアとジャンルの相関を計算
      Object.keys(features.nutritionCorrelations).forEach(nutrientType => {
        const correlation = features.nutritionCorrelations[nutrientType];
        const nutrientScore = nutritionScore.nutrientScores[nutrientType] || 0;
        
        if (correlation.effect === 'positive') {
          score += nutrientScore * correlation.influence;
        } else if (correlation.effect === 'negative') {
          score += (1 - nutrientScore) * correlation.influence;
        } else {
          score += 0.5 * correlation.influence;
        }
      });
      
      recommendations.push({ genreId, score });
    });
    
    // スコア順にソート
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(rec => rec.genreId);
  }

  // ジャンルに基づいて楽器編成を最適化
  static optimizeInstrumentArrangement(
    genreId: string,
    nutritionScore: any
  ): { primary: InstrumentType[]; secondary: InstrumentType[] } {
    const features = this.getGenreFeatures(genreId);
    if (!features) {
      return {
        primary: [InstrumentType.PIANO],
        secondary: [InstrumentType.BASS]
      };
    }

    // 栄養スコアに基づいて楽器の重み付けを調整
    const adjustedPrimary = [...features.characteristics.primaryInstruments];
    const adjustedSecondary = [...features.characteristics.secondaryInstruments];

    // タンパク質スコアが高い場合、リズム楽器を強化
    const proteinScore = nutritionScore.nutrientScores?.protein || 0;
    if (proteinScore > 0.7) {
      if (!adjustedPrimary.includes(InstrumentType.DRUM)) {
        adjustedPrimary.push(InstrumentType.DRUM);
      }
      if (!adjustedSecondary.includes(InstrumentType.BASS)) {
        adjustedSecondary.push(InstrumentType.BASS);
      }
    }

    // ビタミンスコアが高い場合、メロディー楽器を強化
    const vitaminScore = nutritionScore.nutrientScores?.vitamin || 0;
    if (vitaminScore > 0.7) {
      if (!adjustedPrimary.includes(InstrumentType.PIANO)) {
        adjustedPrimary.push(InstrumentType.PIANO);
      }
      if (!adjustedSecondary.includes(InstrumentType.SYNTH)) {
        adjustedSecondary.push(InstrumentType.SYNTH);
      }
    }

    return {
      primary: adjustedPrimary.slice(0, 2), // 最大2つ
      secondary: adjustedSecondary.slice(0, 2) // 最大2つ
    };
  }

  // ジャンルに基づいてエフェクト設定を生成
  static generateEffectSettings(genreId: string, nutritionScore: any): {
    reverb: number;
    delay: number;
    distortion: number;
    filterCutoff: number;
  } {
    const features = this.getGenreFeatures(genreId);
    if (!features) {
      return { reverb: 0.5, delay: 0.3, distortion: 0.2, filterCutoff: 0.6 };
    }

    const baseSettings = features.characteristics;
    
    // 栄養スコアに基づいて調整
    const overallScore = nutritionScore.overallScore || 0.5;
    const proteinScore = nutritionScore.nutrientScores?.protein || 0.5;
    const vitaminScore = nutritionScore.nutrientScores?.vitamin || 0.5;

    return {
      reverb: baseSettings.reverbLevel * (0.8 + overallScore * 0.4),
      delay: baseSettings.delayLevel * (0.8 + proteinScore * 0.4),
      distortion: baseSettings.distortionLevel * (0.8 + vitaminScore * 0.4),
      filterCutoff: baseSettings.filterCutoff * (0.9 + overallScore * 0.2)
    };
  }

  // ジャンルに基づいてリズムパターンを調整
  static adjustRhythmForGenre(
    rhythmPattern: RhythmPattern,
    genreId: string,
    nutritionScore: any
  ): RhythmPattern {
    const features = this.getGenreFeatures(genreId);
    if (!features) {
      return rhythmPattern;
    }

    const adjustedBeats = [...rhythmPattern.beats];
    const adjustedDurations = [...rhythmPattern.durations];

    // ジャンルのリズム特徴を適用
    const swingFactor = features.characteristics.swingFactor;
    const syncopationLevel = features.characteristics.syncopationLevel;

    // スウィング調整
    if (swingFactor > 0.5) {
      adjustedDurations.forEach((duration, index) => {
        if (index % 2 === 0) {
          adjustedDurations[index] = duration * (1 + swingFactor * 0.3);
        } else {
          adjustedDurations[index] = duration * (1 - swingFactor * 0.2);
        }
      });
    }

    // シンコペーション調整
    if (syncopationLevel > 0.5) {
      adjustedBeats.forEach((beat, index) => {
        if (index % 3 === 1) { // 2拍目と5拍目を強調
          adjustedBeats[index] = beat * (1 + syncopationLevel * 0.5);
        }
      });
    }

    return {
      ...rhythmPattern,
      beats: adjustedBeats,
      durations: adjustedDurations
    };
  }

  // ジャンルに基づいてメロディーパターンを調整
  static adjustMelodyForGenre(
    melodyPattern: MelodyPattern,
    genreId: string,
    nutritionScore: any
  ): MelodyPattern {
    const features = this.getGenreFeatures(genreId);
    if (!features) {
      return melodyPattern;
    }

    const adjustedNotes = [...melodyPattern.notes];
    const adjustedIntervals = [...melodyPattern.intervals];

    // スケールタイプに基づく調整
    const scaleType = features.characteristics.scaleType;
    const octaveRange = features.characteristics.octaveRange;

    // オクターブ範囲の調整
    const noteRange = Math.max(...adjustedNotes) - Math.min(...adjustedNotes);
    const targetRange = 220 * Math.pow(2, octaveRange); // 220Hz * 2^octaveRange
    
    if (noteRange > 0) {
      const scaleFactor = targetRange / noteRange;
      adjustedNotes.forEach((note, index) => {
        adjustedNotes[index] = note * scaleFactor;
      });
    }

    // 装飾音の追加
    const ornamentation = features.characteristics.ornamentation;
    if (ornamentation > 0.5) {
      adjustedIntervals.forEach((interval, index) => {
        if (Math.random() < ornamentation * 0.3) {
          adjustedIntervals[index] = interval + (Math.random() - 0.5) * 2;
        }
      });
    }

    return {
      ...melodyPattern,
      notes: adjustedNotes,
      intervals: adjustedIntervals
    };
  }
}
