import { MealRecord } from './MealRecording';
import { foodCategories } from './types';

// 栄養素の種類
export enum NutrientType {
  CARBOHYDRATE = 'carbohydrate',
  PROTEIN = 'protein',
  VITAMIN = 'vitamin',
  MINERAL = 'mineral',
  FIBER = 'fiber',
  FAT = 'fat'
}

// 栄養素の詳細情報
export interface NutrientInfo {
  type: NutrientType;
  name: string;
  weight: number; // 重み付け（0-1）
  color: string; // 視覚的表現用
  soundFrequency: number; // 音響表現用の基本周波数
}

// カテゴリ別栄養素マッピング
export const categoryNutrientMapping: { [key: string]: NutrientInfo[] } = {
  'staple': [
    { type: NutrientType.CARBOHYDRATE, name: '炭水化物', weight: 0.8, color: '#FFD700', soundFrequency: 220 },
    { type: NutrientType.FIBER, name: '食物繊維', weight: 0.3, color: '#8B4513', soundFrequency: 165 }
  ],
  'side': [
    { type: NutrientType.VITAMIN, name: 'ビタミン', weight: 0.6, color: '#32CD32', soundFrequency: 330 },
    { type: NutrientType.MINERAL, name: 'ミネラル', weight: 0.4, color: '#4169E1', soundFrequency: 440 },
    { type: NutrientType.FIBER, name: '食物繊維', weight: 0.7, color: '#8B4513', soundFrequency: 165 }
  ],
  'miso': [
    { type: NutrientType.PROTEIN, name: '植物性タンパク質', weight: 0.5, color: '#FF6347', soundFrequency: 277 },
    { type: NutrientType.MINERAL, name: 'ミネラル', weight: 0.6, color: '#4169E1', soundFrequency: 440 },
    { type: NutrientType.VITAMIN, name: 'ビタミンB群', weight: 0.4, color: '#32CD32', soundFrequency: 330 }
  ],
  'meat': [
    { type: NutrientType.PROTEIN, name: '動物性タンパク質', weight: 0.9, color: '#FF6347', soundFrequency: 277 },
    { type: NutrientType.FAT, name: '脂質', weight: 0.6, color: '#FFA500', soundFrequency: 185 },
    { type: NutrientType.MINERAL, name: '鉄分', weight: 0.7, color: '#4169E1', soundFrequency: 440 }
  ],
  'fish': [
    { type: NutrientType.PROTEIN, name: '魚類タンパク質', weight: 0.8, color: '#FF6347', soundFrequency: 277 },
    { type: NutrientType.FAT, name: 'オメガ3脂肪酸', weight: 0.8, color: '#FFA500', soundFrequency: 185 },
    { type: NutrientType.MINERAL, name: 'DHA・EPA', weight: 0.9, color: '#4169E1', soundFrequency: 440 }
  ],
  'vegetable': [
    { type: NutrientType.VITAMIN, name: 'ビタミンC', weight: 0.8, color: '#32CD32', soundFrequency: 330 },
    { type: NutrientType.MINERAL, name: 'カリウム', weight: 0.6, color: '#4169E1', soundFrequency: 440 },
    { type: NutrientType.FIBER, name: '食物繊維', weight: 0.9, color: '#8B4513', soundFrequency: 165 }
  ]
};

// 栄養バランススコアの詳細分析
export interface DetailedNutritionScore {
  overallScore: number; // 総合スコア (0-1)
  categoryScores: { [categoryId: string]: number }; // カテゴリ別スコア
  nutrientScores: { [nutrientType: string]: number }; // 栄養素別スコア
  balanceAnalysis: {
    strengths: string[]; // 強み
    weaknesses: string[]; // 改善点
    recommendations: string[]; // 推奨事項
  };
  correlationMatrix: { [key: string]: { [key: string]: number } }; // 相関関係マトリックス
}

// 栄養バランスの詳細分析を実行
export function analyzeDetailedNutrition(meal: MealRecord): DetailedNutritionScore {
  const totalItems = Object.values(meal.categories).reduce((sum, count) => sum + count, 0);
  
  if (totalItems === 0) {
    return {
      overallScore: 0,
      categoryScores: {},
      nutrientScores: {},
      balanceAnalysis: {
        strengths: [],
        weaknesses: ['食事が記録されていません'],
        recommendations: ['食事を記録してください']
      },
      correlationMatrix: {}
    };
  }

  // カテゴリ別スコア計算
  const categoryScores: { [categoryId: string]: number } = {};
  const idealRatios = {
    'staple': 0.4,    // 主食 40%
    'side': 0.3,      // 副菜 30%
    'miso': 0.1,      // 味噌 10%
    'meat': 0.1,      // 肉 10%
    'fish': 0.05,     // 魚 5%
    'vegetable': 0.05 // 野菜 5%
  };

  Object.keys(idealRatios).forEach(categoryId => {
    const actualRatio = (meal.categories[categoryId] || 0) / totalItems;
    const idealRatio = idealRatios[categoryId as keyof typeof idealRatios];
    const score = Math.max(0, 1 - Math.abs(actualRatio - idealRatio) / idealRatio);
    categoryScores[categoryId] = score;
  });

  // 栄養素別スコア計算
  const nutrientScores: { [nutrientType: string]: number } = {};
  const nutrientTotals: { [nutrientType: string]: number } = {};

  // 各栄養素の総量を計算
  Object.keys(categoryNutrientMapping).forEach(categoryId => {
    const categoryCount = meal.categories[categoryId] || 0;
    const nutrients = categoryNutrientMapping[categoryId];
    
    nutrients.forEach(nutrient => {
      const contribution = categoryCount * nutrient.weight;
      nutrientTotals[nutrient.type] = (nutrientTotals[nutrient.type] || 0) + contribution;
    });
  });

  // 栄養素スコアを正規化（0-1）
  const maxNutrientValue = Math.max(...Object.values(nutrientTotals));
  Object.keys(nutrientTotals).forEach(nutrientType => {
    nutrientScores[nutrientType] = maxNutrientValue > 0 ? nutrientTotals[nutrientType] / maxNutrientValue : 0;
  });

  // 総合スコア計算（重み付け平均）
  const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;

  // バランス分析
  const balanceAnalysis = analyzeBalance(categoryScores, nutrientScores);

  // 相関関係マトリックス計算
  const correlationMatrix = calculateCorrelationMatrix(meal.categories);

  return {
    overallScore,
    categoryScores,
    nutrientScores,
    balanceAnalysis,
    correlationMatrix
  };
}

// バランス分析
function analyzeBalance(
  categoryScores: { [categoryId: string]: number },
  nutrientScores: { [nutrientType: string]: number }
): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // カテゴリ別分析
  const categoryNames = {
    'staple': '主食',
    'side': '副菜',
    'miso': '味噌',
    'meat': '肉',
    'fish': '魚',
    'vegetable': '野菜'
  };

  Object.keys(categoryScores).forEach(categoryId => {
    const score = categoryScores[categoryId];
    const name = categoryNames[categoryId as keyof typeof categoryNames];
    
    if (score > 0.8) {
      strengths.push(`${name}のバランスが良好です`);
    } else if (score < 0.4) {
      weaknesses.push(`${name}の摂取が不足しています`);
      recommendations.push(`${name}を増やしてみましょう`);
    }
  });

  // 栄養素別分析
  const nutrientNames = {
    [NutrientType.CARBOHYDRATE]: '炭水化物',
    [NutrientType.PROTEIN]: 'タンパク質',
    [NutrientType.VITAMIN]: 'ビタミン',
    [NutrientType.MINERAL]: 'ミネラル',
    [NutrientType.FIBER]: '食物繊維',
    [NutrientType.FAT]: '脂質'
  };

  Object.keys(nutrientScores).forEach(nutrientType => {
    const score = nutrientScores[nutrientType];
    const name = nutrientNames[nutrientType as keyof typeof nutrientNames];
    
    if (score > 0.7) {
      strengths.push(`${name}が豊富です`);
    } else if (score < 0.3) {
      weaknesses.push(`${name}が不足しています`);
      recommendations.push(`${name}を含む食品を追加しましょう`);
    }
  });

  return { strengths, weaknesses, recommendations };
}

// 相関関係マトリックス計算
function calculateCorrelationMatrix(categories: { [key: string]: number }): { [key: string]: { [key: string]: number } } {
  const matrix: { [key: string]: { [key: string]: number } } = {};
  const categoryIds = Object.keys(categories);
  
  categoryIds.forEach(cat1 => {
    matrix[cat1] = {};
    categoryIds.forEach(cat2 => {
      if (cat1 === cat2) {
        matrix[cat1][cat2] = 1.0;
      } else {
        // 簡易的な相関計算（実際の統計計算はより複雑）
        const val1 = categories[cat1] || 0;
        const val2 = categories[cat2] || 0;
        const correlation = val1 > 0 && val2 > 0 ? 0.7 : val1 === 0 && val2 === 0 ? 0.3 : -0.2;
        matrix[cat1][cat2] = Math.max(-1, Math.min(1, correlation));
      }
    });
  });
  
  return matrix;
}

// 栄養素情報を取得
export function getNutrientInfo(nutrientType: NutrientType): NutrientInfo | null {
  for (const nutrients of Object.values(categoryNutrientMapping)) {
    const found = nutrients.find(n => n.type === nutrientType);
    if (found) {
      return found;
    }
  }
  return null;
}

// カテゴリの栄養素情報を取得
export function getCategoryNutrients(categoryId: string): NutrientInfo[] {
  return categoryNutrientMapping[categoryId] || [];
}
