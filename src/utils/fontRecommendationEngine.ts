// フォント推奨エンジン

import { FontOption, FontSettings } from '../constants/fonts';

export interface UserPreferences {
  ageGroup?: 'child' | 'teen' | 'adult' | 'senior';
  useCase?: 'work' | 'study' | 'creative' | 'reading' | 'gaming';
  visualPreference?: 'minimal' | 'decorative' | 'handwritten' | 'modern' | 'classic';
  accessibilityNeeds?: 'high-contrast' | 'large-text' | 'dyslexia-friendly' | 'none';
  language?: 'japanese' | 'english' | 'mixed';
}

export interface RecommendationContext {
  currentSettings: FontSettings;
  userPreferences: UserPreferences;
  usageHistory: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  deviceType?: 'desktop' | 'tablet' | 'mobile';
}

export interface FontRecommendation {
  font: FontOption;
  score: number;
  reasons: string[];
  category: 'japanese' | 'english' | 'child-friendly';
}

class FontRecommendationEngine {
  private readonly SCORE_WEIGHTS = {
    accessibility: 0.3,
    readability: 0.25,
    visualPreference: 0.2,
    useCase: 0.15,
    ageGroup: 0.1
  };

  // ユーザーの好みに基づいてフォントを推奨
  recommendFonts(
    availableFonts: FontOption[],
    context: RecommendationContext,
    maxRecommendations: number = 5
  ): FontRecommendation[] {
    const recommendations: FontRecommendation[] = [];

    // カテゴリ別にフォントを分類
    const japaneseFonts = availableFonts.filter(font => font.category === 'japanese');
    const englishFonts = availableFonts.filter(font => font.category === 'english');
    const childFriendlyFonts = availableFonts.filter(font => font.category === 'child-friendly');

    // 各カテゴリから推奨フォントを選択
    if (context.userPreferences.language === 'japanese' || context.userPreferences.language === 'mixed') {
      recommendations.push(...this.recommendFontsByCategory(japaneseFonts, context, 'japanese'));
    }
    
    if (context.userPreferences.language === 'english' || context.userPreferences.language === 'mixed') {
      recommendations.push(...this.recommendFontsByCategory(englishFonts, context, 'english'));
    }

    if (context.userPreferences.ageGroup === 'child') {
      recommendations.push(...this.recommendFontsByCategory(childFriendlyFonts, context, 'child-friendly'));
    }

    // スコア順にソートして上位を返す
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);
  }

  private recommendFontsByCategory(
    fonts: FontOption[],
    context: RecommendationContext,
    category: 'japanese' | 'english' | 'child-friendly'
  ): FontRecommendation[] {
    return fonts.map(font => {
      const score = this.calculateFontScore(font, context);
      const reasons = this.generateRecommendationReasons(font, context);
      
      return {
        font,
        score,
        reasons,
        category
      };
    }).filter(rec => rec.score > 0.3); // 最低スコア以上のもののみ
  }

  private calculateFontScore(font: FontOption, context: RecommendationContext): number {
    let score = 0;

    // アクセシビリティスコア
    score += this.calculateAccessibilityScore(font, context) * this.SCORE_WEIGHTS.accessibility;

    // 読みやすさスコア
    score += this.calculateReadabilityScore(font, context) * this.SCORE_WEIGHTS.readability;

    // 視覚的嗜好スコア
    score += this.calculateVisualPreferenceScore(font, context) * this.SCORE_WEIGHTS.visualPreference;

    // 使用ケーススコア
    score += this.calculateUseCaseScore(font, context) * this.SCORE_WEIGHTS.useCase;

    // 年齢グループスコア
    score += this.calculateAgeGroupScore(font, context) * this.SCORE_WEIGHTS.ageGroup;

    return Math.min(score, 1.0); // 最大1.0に制限
  }

  private calculateAccessibilityScore(font: FontOption, context: RecommendationContext): number {
    let score = 0.5; // ベーススコア

    if (context.userPreferences.accessibilityNeeds === 'dyslexia-friendly') {
      if (font.tags?.includes('dyslexia-friendly') || font.readability === 'high') {
        score += 0.4;
      }
    }

    if (context.userPreferences.accessibilityNeeds === 'high-contrast') {
      if (font.tags?.includes('high-contrast') || font.readability === 'high') {
        score += 0.3;
      }
    }

    if (context.userPreferences.accessibilityNeeds === 'large-text') {
      if (font.tags?.includes('large-text') || font.readability === 'high') {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  private calculateReadabilityScore(font: FontOption, context: RecommendationContext): number {
    const readabilityMap = { 'high': 1.0, 'medium': 0.7, 'low': 0.4 };
    const baseScore = readabilityMap[font.readability || 'medium'] || 0.5;

    // 使用ケースに応じた調整
    if (context.userPreferences.useCase === 'reading') {
      return Math.min(baseScore + 0.2, 1.0);
    }

    if (context.userPreferences.useCase === 'work') {
      return Math.min(baseScore + 0.1, 1.0);
    }

    return baseScore;
  }

  private calculateVisualPreferenceScore(font: FontOption, context: RecommendationContext): number {
    if (!context.userPreferences.visualPreference) return 0.5;

    const preference = context.userPreferences.visualPreference;
    let score = 0.5;

    switch (preference) {
      case 'minimal':
        if (font.tags?.includes('minimal') || font.subcategory === 'modern') {
          score += 0.4;
        }
        break;
      case 'decorative':
        if (font.tags?.includes('decorative') || font.subcategory === 'cute') {
          score += 0.4;
        }
        break;
      case 'handwritten':
        if (font.tags?.includes('handwritten') || font.subcategory === 'handwriting') {
          score += 0.4;
        }
        break;
      case 'modern':
        if (font.subcategory === 'modern' || font.tags?.includes('modern')) {
          score += 0.4;
        }
        break;
      case 'classic':
        if (font.subcategory === 'classic' || font.tags?.includes('classic')) {
          score += 0.4;
        }
        break;
    }

    return Math.min(score, 1.0);
  }

  private calculateUseCaseScore(font: FontOption, context: RecommendationContext): number {
    if (!context.userPreferences.useCase) return 0.5;

    const useCase = context.userPreferences.useCase;
    let score = 0.5;

    switch (useCase) {
      case 'work':
        if (font.tags?.includes('professional') || font.readability === 'high') {
          score += 0.3;
        }
        break;
      case 'study':
        if (font.tags?.includes('educational') || font.readability === 'high') {
          score += 0.3;
        }
        break;
      case 'creative':
        if (font.tags?.includes('creative') || font.subcategory === 'decorative') {
          score += 0.3;
        }
        break;
      case 'reading':
        if (font.readability === 'high' || font.tags?.includes('reading-friendly')) {
          score += 0.3;
        }
        break;
      case 'gaming':
        if (font.tags?.includes('gaming') || font.subcategory === 'modern') {
          score += 0.3;
        }
        break;
    }

    return Math.min(score, 1.0);
  }

  private calculateAgeGroupScore(font: FontOption, context: RecommendationContext): number {
    if (!context.userPreferences.ageGroup) return 0.5;

    const ageGroup = context.userPreferences.ageGroup;
    const fontAgeGroup = font.ageGroup;

    if (fontAgeGroup === ageGroup) {
      return 1.0;
    }

    if (fontAgeGroup === 'all') {
      return 0.8;
    }

    // 年齢グループの近さに基づくスコア
    const ageGroupOrder = ['child', 'teen', 'adult', 'senior'];
    const userIndex = ageGroupOrder.indexOf(ageGroup);
    const fontIndex = ageGroupOrder.indexOf(fontAgeGroup || 'adult');
    const distance = Math.abs(userIndex - fontIndex);

    return Math.max(0.3, 1.0 - (distance * 0.2));
  }

  private generateRecommendationReasons(font: FontOption, context: RecommendationContext): string[] {
    const reasons: string[] = [];

    // アクセシビリティ関連
    if (context.userPreferences.accessibilityNeeds === 'dyslexia-friendly' && 
        (font.tags?.includes('dyslexia-friendly') || font.readability === 'high')) {
      reasons.push('読み書き困難に配慮したデザイン');
    }

    if (context.userPreferences.accessibilityNeeds === 'high-contrast' && 
        font.tags?.includes('high-contrast')) {
      reasons.push('高コントラストで視認性が良い');
    }

    // 読みやすさ関連
    if (font.readability === 'high') {
      reasons.push('読みやすさに優れている');
    }

    // 視覚的嗜好関連
    if (context.userPreferences.visualPreference === 'minimal' && 
        (font.tags?.includes('minimal') || font.subcategory === 'modern')) {
      reasons.push('ミニマルで洗練されたデザイン');
    }

    if (context.userPreferences.visualPreference === 'cute' && 
        (font.tags?.includes('cute') || font.subcategory === 'cute')) {
      reasons.push('可愛らしいデザイン');
    }

    // 使用ケース関連
    if (context.userPreferences.useCase === 'work' && 
        font.tags?.includes('professional')) {
      reasons.push('ビジネス用途に適している');
    }

    if (context.userPreferences.useCase === 'study' && 
        font.tags?.includes('educational')) {
      reasons.push('学習に適したデザイン');
    }

    // 年齢グループ関連
    if (context.userPreferences.ageGroup === 'child' && 
        font.ageGroup === 'child') {
      reasons.push('こども向けに最適化されている');
    }

    // デフォルトの理由
    if (reasons.length === 0) {
      reasons.push('バランスの取れたデザイン');
    }

    return reasons;
  }

  // 使用履歴に基づく推奨
  recommendBasedOnHistory(
    availableFonts: FontOption[],
    usageHistory: string[],
    maxRecommendations: number = 3
  ): FontRecommendation[] {
    const fontUsageCount = new Map<string, number>();
    
    usageHistory.forEach(fontValue => {
      fontUsageCount.set(fontValue, (fontUsageCount.get(fontValue) || 0) + 1);
    });

    const sortedFonts = Array.from(fontUsageCount.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([fontValue]) => fontValue);

    return sortedFonts
      .slice(0, maxRecommendations)
      .map(fontValue => {
        const font = availableFonts.find(f => f.value === fontValue);
        if (!font) return null;
        
        return {
          font,
          score: 0.8, // 履歴ベースの推奨は高スコア
          reasons: ['よく使用されているフォント'],
          category: font.category as 'japanese' | 'english' | 'child-friendly'
        };
      })
      .filter((rec): rec is FontRecommendation => rec !== null);
  }

  // 時間帯に基づく推奨
  recommendForTimeOfDay(
    availableFonts: FontOption[],
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
    maxRecommendations: number = 3
  ): FontRecommendation[] {
    const timePreferences = {
      morning: { tags: ['energetic', 'clear'], readability: 'high' },
      afternoon: { tags: ['professional', 'balanced'], readability: 'medium' },
      evening: { tags: ['relaxed', 'warm'], readability: 'medium' },
      night: { tags: ['soft', 'low-contrast'], readability: 'high' }
    };

    const preferences = timePreferences[timeOfDay];
    
    return availableFonts
      .filter(font => 
        preferences.tags.some(tag => font.tags?.includes(tag)) ||
        font.readability === preferences.readability
      )
      .slice(0, maxRecommendations)
      .map(font => ({
        font,
        score: 0.7,
        reasons: [`${timeOfDay}の時間帯に適している`],
        category: font.category as 'japanese' | 'english' | 'child-friendly'
      }));
  }
}

// シングルトンインスタンス
export const fontRecommendationEngine = new FontRecommendationEngine();
