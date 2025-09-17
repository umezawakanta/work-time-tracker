// 料理レシピの定数定義

import type { CookingPhase, CookingRecipe, CookingRecipes } from '../types';

// 料理レシピの定義
export const cookingRecipes: CookingRecipes = {
    'egg': {
        name: 'ゆでたまご',
        phases: [
            { name: '水を沸騰させる', duration: 8 * 60, description: '中火で水を沸騰させます' },
            { name: '半熟ゆで', duration: 6 * 60, description: '沸騰したお湯に卵を入れ、半熟にゆでます' },
            { name: '中半熟ゆで', duration: 8 * 60, description: '沸騰したお湯に卵を入れ、中半熟にゆでます' },
            { name: '固ゆで', duration: 10 * 60, description: '沸騰したお湯に卵を入れ、固ゆでにゆでます' }
        ]
    },
    'potato-salad': {
        name: 'ポテトサラダ用じゃがいも',
        phases: [
            { name: '水を沸騰させる', duration: 8 * 60, description: '中火で水を沸騰させます' },
            { name: 'じゃがいもをゆでる', duration: 15 * 60, description: '沸騰したお湯にじゃがいもを入れ、柔らかくなるまでゆでます' }
        ]
    },
    'ramen': {
        name: 'ラーメン用麺',
        phases: [
            { name: '水を沸騰させる', duration: 8 * 60, description: '強火で水を沸騰させます' },
            { name: '麺をゆでる', duration: 3 * 60, description: '沸騰したお湯に麺を入れ、アルデンテにゆでます' }
        ]
    },
    'pasta': {
        name: 'パスタ',
        phases: [
            { name: '水を沸騰させる', duration: 8 * 60, description: '強火で水を沸騰させます' },
            { name: 'パスタをゆでる', duration: 8 * 60, description: '沸騰したお湯にパスタを入れ、アルデンテにゆでます' }
        ]
    },
    'vegetables': {
        name: '野菜の下茹で',
        phases: [
            { name: '水を沸騰させる', duration: 8 * 60, description: '中火で水を沸騰させます' },
            { name: '野菜をゆでる', duration: 5 * 60, description: '沸騰したお湯に野菜を入れ、適度な硬さにゆでます' }
        ]
    }
};

// レシピの検証用関数
export const isValidRecipe = (recipeKey: string): boolean => {
    return recipeKey in cookingRecipes;
};

// レシピの取得用関数
export const getRecipeByKey = (recipeKey: string): CookingRecipe | undefined => {
    return cookingRecipes[recipeKey];
};

// 利用可能なレシピキーの一覧を取得
export const getAvailableRecipeKeys = (): string[] => {
    return Object.keys(cookingRecipes);
};

// レシピの総時間を計算
export const getRecipeTotalTime = (recipeKey: string): number => {
    const recipe = getRecipeByKey(recipeKey);
    if (!recipe) return 0;
    return recipe.phases.reduce((total: number, phase: CookingPhase) => total + phase.duration, 0);
};

// 卵の種類に応じたレシピの段階を取得
export const getEggRecipePhases = (eggType: 'soft' | 'medium' | 'hard'): CookingPhase[] => {
    const recipe = getRecipeByKey('egg');
    if (!recipe) return [];

    // 卵の種類に応じて適切な段階を選択
    switch (eggType) {
        case 'soft':
            return recipe.phases.slice(0, 2); // 水を沸騰させる + 半熟ゆで
        case 'medium':
            return recipe.phases.slice(0, 3); // 水を沸騰させる + 半熟ゆで + 中半熟ゆで
        case 'hard':
            return recipe.phases; // 全ての段階
        default:
            return recipe.phases;
    }
};
