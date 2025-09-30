// キャラクターの状態を管理するマネージャー

import { Character } from '../types/character';
import { Badge } from '../types/badge';

export interface CharacterState {
  characterId: string;
  level: number;
  experience: number;
  workCoins: number;
  badges: string[];
  mood: 'happy' | 'excited' | 'normal' | 'tired' | 'motivated';
  energy: number; // 0-100
  lastInteraction: Date;
  specialEffects: string[];
  customizations: {
    color?: string;
    accessories?: string[];
    animations?: string[];
  };
}

export interface CharacterProgress {
  characterId: string;
  totalExperience: number;
  totalWorkCoins: number;
  totalBadges: number;
  workStreak: number;
  lastWorkDate: Date;
  achievements: string[];
}

export class CharacterStateManager {
  private static instance: CharacterStateManager;
  private characterStates: Map<string, CharacterState> = new Map();
  private characterProgress: Map<string, CharacterProgress> = new Map();

  public static getInstance(): CharacterStateManager {
    if (!CharacterStateManager.instance) {
      CharacterStateManager.instance = new CharacterStateManager();
    }
    return CharacterStateManager.instance;
  }

  // キャラクター状態を初期化
  public initializeCharacter(characterId: string, baseCharacter?: Character): CharacterState {
    const defaultState: CharacterState = {
      characterId,
      level: baseCharacter?.level || 1,
      experience: baseCharacter?.experience || 0,
      workCoins: baseCharacter?.workCoins || 0,
      badges: baseCharacter?.badges || [],
      mood: 'normal',
      energy: 100,
      lastInteraction: new Date(),
      specialEffects: [],
      customizations: {}
    };

    this.characterStates.set(characterId, defaultState);
    this.initializeProgress(characterId);
    return defaultState;
  }

  // キャラクター進捗を初期化
  private initializeProgress(characterId: string): void {
    const progress: CharacterProgress = {
      characterId,
      totalExperience: 0,
      totalWorkCoins: 0,
      totalBadges: 0,
      workStreak: 0,
      lastWorkDate: new Date(),
      achievements: []
    };

    this.characterProgress.set(characterId, progress);
  }

  // 経験値を追加
  public addExperience(characterId: string, amount: number): CharacterState | null {
    const state = this.characterStates.get(characterId);
    if (!state) return null;

    state.experience += amount;
    state.lastInteraction = new Date();
    
    // レベルアップチェック
    const newLevel = this.calculateLevel(state.experience);
    if (newLevel > state.level) {
      state.level = newLevel;
      state.mood = 'excited';
      state.specialEffects.push('level_up_sparkles');
      this.triggerLevelUpEffects(characterId, newLevel);
    }

    this.characterStates.set(characterId, state);
    this.updateProgress(characterId, 'experience', amount);
    return state;
  }

  // ワークコインを追加
  public addWorkCoins(characterId: string, amount: number): CharacterState | null {
    const state = this.characterStates.get(characterId);
    if (!state) return null;

    state.workCoins += amount;
    state.lastInteraction = new Date();
    state.mood = 'happy';
    state.specialEffects.push('coin_collection');

    this.characterStates.set(characterId, state);
    this.updateProgress(characterId, 'workCoins', amount);
    return state;
  }

  // バッジを追加
  public addBadge(characterId: string, badgeId: string): CharacterState | null {
    const state = this.characterStates.get(characterId);
    if (!state) return null;

    if (!state.badges.includes(badgeId)) {
      state.badges.push(badgeId);
      state.mood = 'excited';
      state.specialEffects.push('badge_earned');
      this.triggerBadgeEffects(characterId, badgeId);
    }

    this.characterStates.set(characterId, state);
    this.updateProgress(characterId, 'badges', 1);
    return state;
  }

  // エネルギーを更新
  public updateEnergy(characterId: string, amount: number): CharacterState | null {
    const state = this.characterStates.get(characterId);
    if (!state) return null;

    state.energy = Math.max(0, Math.min(100, state.energy + amount));
    state.lastInteraction = new Date();
    
    // エネルギーレベルに応じてムードを変更
    if (state.energy < 20) {
      state.mood = 'tired';
    } else if (state.energy > 80) {
      state.mood = 'motivated';
    } else {
      state.mood = 'normal';
    }

    this.characterStates.set(characterId, state);
    return state;
  }

  // 作業時間を記録
  public recordWorkTime(characterId: string, minutes: number): CharacterState | null {
    const state = this.characterStates.get(characterId);
    if (!state) return null;

    // 作業時間に応じて経験値とワークコインを追加
    const experienceGain = Math.floor(minutes / 10); // 10分で1経験値
    const coinGain = Math.floor(minutes / 5); // 5分で1コイン

    this.addExperience(characterId, experienceGain);
    this.addWorkCoins(characterId, coinGain);
    this.updateEnergy(characterId, -Math.floor(minutes / 30)); // 30分で1エネルギー消費

    // 作業ストリークを更新
    this.updateWorkStreak(characterId);

    return this.characterStates.get(characterId) || null;
  }

  // 作業ストリークを更新
  private updateWorkStreak(characterId: string): void {
    const progress = this.characterProgress.get(characterId);
    if (!progress) return;

    const today = new Date();
    const lastWork = progress.lastWorkDate;
    const daysDiff = Math.floor((today.getTime() - lastWork.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      progress.workStreak += 1;
    } else if (daysDiff > 1) {
      progress.workStreak = 1;
    }

    progress.lastWorkDate = today;
    this.characterProgress.set(characterId, progress);
  }

  // レベルを計算
  private calculateLevel(experience: number): number {
    return Math.floor(experience / 100) + 1; // 100経験値で1レベル
  }

  // レベルアップ効果をトリガー
  private triggerLevelUpEffects(characterId: string, newLevel: number): void {
    // レベルアップ時の特別な効果
    console.log(`Character ${characterId} leveled up to ${newLevel}!`);
    
    // 特定のレベルで特別な効果を追加
    if (newLevel % 5 === 0) {
      this.addSpecialEffect(characterId, 'level_milestone');
    }
  }

  // バッジ効果をトリガー
  private triggerBadgeEffects(characterId: string, badgeId: string): void {
    console.log(`Character ${characterId} earned badge ${badgeId}!`);
    
    // 特定のバッジで特別な効果を追加
    if (badgeId.includes('rare') || badgeId.includes('legendary')) {
      this.addSpecialEffect(characterId, 'rare_badge_glow');
    }
  }

  // 特別効果を追加
  private addSpecialEffect(characterId: string, effect: string): void {
    const state = this.characterStates.get(characterId);
    if (!state) return;

    state.specialEffects.push(effect);
    this.characterStates.set(characterId, state);
  }

  // 進捗を更新
  private updateProgress(characterId: string, type: 'experience' | 'workCoins' | 'badges', amount: number): void {
    const progress = this.characterProgress.get(characterId);
    if (!progress) return;

    switch (type) {
      case 'experience':
        progress.totalExperience += amount;
        break;
      case 'workCoins':
        progress.totalWorkCoins += amount;
        break;
      case 'badges':
        progress.totalBadges += amount;
        break;
    }

    this.characterProgress.set(characterId, progress);
  }

  // キャラクター状態を取得
  public getCharacterState(characterId: string): CharacterState | null {
    return this.characterStates.get(characterId) || null;
  }

  // キャラクター進捗を取得
  public getCharacterProgress(characterId: string): CharacterProgress | null {
    return this.characterProgress.get(characterId) || null;
  }

  // 全キャラクターの状態を取得
  public getAllCharacterStates(): Map<string, CharacterState> {
    return new Map(this.characterStates);
  }

  // キャラクター状態をリセット
  public resetCharacterState(characterId: string): void {
    this.characterStates.delete(characterId);
    this.characterProgress.delete(characterId);
  }

  // 全キャラクター状態をリセット
  public resetAllCharacterStates(): void {
    this.characterStates.clear();
    this.characterProgress.clear();
  }
}
