// キャラクター管理ユーティリティ

import { 
  Character, 
  UserCharacterSettings, 
  CharacterAchievement, 
  DEFAULT_CHARACTER_SETTINGS,
  CHARACTER_RARITY 
} from '../types/character';
import { SAMPLE_CHARACTERS, CHARACTER_ACHIEVEMENTS, EXPERIENCE_TABLE } from '../constants/characters';

export class CharacterManager {
  private static instance: CharacterManager;
  private settings: UserCharacterSettings;
  private characters: Character[];
  private achievements: CharacterAchievement[];

  private constructor() {
    this.settings = this.loadSettings();
    this.characters = [...SAMPLE_CHARACTERS];
    this.achievements = [...CHARACTER_ACHIEVEMENTS];
  }

  public static getInstance(): CharacterManager {
    if (!CharacterManager.instance) {
      CharacterManager.instance = new CharacterManager();
    }
    return CharacterManager.instance;
  }

  // 設定の読み込み
  private loadSettings(): UserCharacterSettings {
    try {
      const saved = localStorage.getItem('characterSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CHARACTER_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load character settings:', error);
    }
    return { ...DEFAULT_CHARACTER_SETTINGS };
  }

  // 設定の保存
  public saveSettings(): void {
    try {
      localStorage.setItem('characterSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save character settings:', error);
    }
  }

  // 現在の設定を取得
  public getSettings(): UserCharacterSettings {
    return { ...this.settings };
  }

  // 設定を更新
  public updateSettings(updates: Partial<UserCharacterSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  // 利用可能なキャラクターを取得
  public getAvailableCharacters(): Character[] {
    return this.characters.filter(char => char.unlocked);
  }

  // 全キャラクターを取得
  public getAllCharacters(): Character[] {
    return [...this.characters];
  }

  // キャラクターを選択
  public selectCharacter(characterId: string): boolean {
    const character = this.characters.find(c => c.id === characterId);
    if (!character || !character.unlocked) {
      return false;
    }

    this.settings.selectedCharacterId = characterId;
    this.saveSettings();
    return true;
  }

  // 現在選択中のキャラクターを取得
  public getCurrentCharacter(): Character | null {
    const character = this.characters.find(c => c.id === this.settings.selectedCharacterId);
    return character || null;
  }

  // 経験値を追加
  public addExperience(amount: number, workHours: number = 0): {
    leveledUp: boolean;
    newLevel: number;
    achievements: CharacterAchievement[];
  } {
    const currentCharacter = this.getCurrentCharacter();
    if (!currentCharacter) {
      return { leveledUp: false, newLevel: 0, achievements: [] };
    }

    // 基本経験値計算
    let totalExp = amount;
    
    // 作業時間による経験値
    if (workHours > 0) {
      totalExp += workHours * EXPERIENCE_TABLE.workHour;
    }

    // レアリティ倍率を適用
    const rarityMultiplier = CHARACTER_RARITY[currentCharacter.rarity].experienceMultiplier;
    totalExp = Math.floor(totalExp * rarityMultiplier);

    // 連続作業日数ボーナス
    const consecutiveDays = this.getConsecutiveWorkDays();
    if (consecutiveDays > 1) {
      totalExp += consecutiveDays * EXPERIENCE_TABLE.consecutiveDayBonus;
    }

    // 経験値を追加
    currentCharacter.experience += totalExp;
    this.settings.totalExperience += totalExp;

    // レベルアップチェック
    const leveledUp = this.checkLevelUp(currentCharacter);
    const newLevel = currentCharacter.level;

    // アチーブメントチェック
    const newAchievements = this.checkAchievements();

    this.saveSettings();
    return { leveledUp, newLevel, achievements: newAchievements };
  }

  // 作業時間に基づく経験値追加（作業完了時に呼び出し）
  public addWorkExperience(workMinutes: number): {
    leveledUp: boolean;
    newLevel: number;
    achievements: CharacterAchievement[];
  } {
    const workHours = workMinutes / 60;
    return this.addExperience(0, workHours);
  }

  // 作業開始時の処理
  public onWorkStart(): void {
    this.settings.playTime += 0; // 作業開始時は時間を追加しない
    this.saveSettings();
  }

  // 作業完了時の処理
  public onWorkComplete(workMinutes: number): {
    leveledUp: boolean;
    newLevel: number;
    achievements: CharacterAchievement[];
  } {
    // プレイ時間を更新
    this.settings.playTime += workMinutes;
    
    // 経験値を追加
    const result = this.addWorkExperience(workMinutes);
    
    // 作業完了のアチーブメントをチェック
    this.checkWorkAchievements(workMinutes);
    
    return result;
  }

  // 作業関連のアチーブメントをチェック
  private checkWorkAchievements(workMinutes: number): void {
    const workHours = workMinutes / 60;
    
    // 作業時間のアチーブメントをチェック
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      if (achievement.condition.type === 'work_hours') {
        const totalWorkHours = this.settings.totalExperience / EXPERIENCE_TABLE.workHour;
        if (totalWorkHours >= achievement.condition.value) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }

  // アチーブメントを解除
  private unlockAchievement(achievement: CharacterAchievement): void {
    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    this.settings.achievements.push(achievement.id);
    
    // 報酬を適用
    this.applyAchievementReward(achievement);
  }

  // キャラクターのカスタマイズを更新
  public updateCharacterCustomization(characterId: string, customization: CharacterCustomization): void {
    const character = this.characters.find(c => c.id === characterId);
    if (character) {
      character.customization = customization;
      this.saveSettings();
    }
  }

  // キャラクターのカスタマイズを取得
  public getCharacterCustomization(characterId: string): CharacterCustomization | null {
    const character = this.characters.find(c => c.id === characterId);
    return character?.customization || null;
  }

  // レベルアップチェック
  private checkLevelUp(character: Character): boolean {
    const requiredExp = this.getRequiredExperience(character.level);
    if (character.experience >= requiredExp) {
      character.level++;
      character.experience -= requiredExp;
      
      // レベルアップ時の特別な処理
      this.onLevelUp(character);
      
      return true;
    }
    return false;
  }

  // レベルアップ時の特別な処理
  private onLevelUp(character: Character): void {
    // レベルアップ時に新しい外見オプションを解放
    this.unlockLevelUpRewards(character);
    
    // レベルアップのアチーブメントをチェック
    this.checkLevelUpAchievements(character.level);
  }

  // レベルアップ報酬を解放
  private unlockLevelUpRewards(character: Character): void {
    // レベルに応じて新しいアクセサリーや外見オプションを解放
    const level = character.level;
    
    if (level >= 5 && !character.customization.accessories.includes('crown')) {
      character.customization.accessories.push('crown');
    }
    
    if (level >= 10 && !character.customization.accessories.includes('wings')) {
      character.customization.accessories.push('wings');
    }
    
    if (level >= 15 && !character.customization.accessories.includes('halo')) {
      character.customization.accessories.push('halo');
    }
  }

  // レベルアップのアチーブメントをチェック
  private checkLevelUpAchievements(level: number): void {
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      if (achievement.condition.type === 'level_reach' && level >= achievement.condition.value) {
        this.unlockAchievement(achievement);
      }
    });
  }

  // 必要経験値を取得
  private getRequiredExperience(level: number): number {
    return Math.floor(100 * Math.pow(EXPERIENCE_TABLE.levelUpMultiplier, level - 1));
  }

  // アチーブメントチェック
  private checkAchievements(): CharacterAchievement[] {
    const newAchievements: CharacterAchievement[] = [];
    
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let conditionMet = false;
      switch (achievement.condition.type) {
        case 'work_hours':
          conditionMet = this.settings.totalExperience >= achievement.condition.value * EXPERIENCE_TABLE.workHour;
          break;
        case 'consecutive_days':
          conditionMet = this.getConsecutiveWorkDays() >= achievement.condition.value;
          break;
        case 'level_reach':
          const currentChar = this.getCurrentCharacter();
          conditionMet = currentChar ? currentChar.level >= achievement.condition.value : false;
          break;
        case 'character_unlock':
          conditionMet = this.settings.unlockedCharacters.length >= achievement.condition.value;
          break;
        case 'custom':
          conditionMet = achievement.condition.customCondition ? achievement.condition.customCondition() : false;
          break;
      }

      if (conditionMet) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        this.settings.achievements.push(achievement.id);
        newAchievements.push(achievement);

        // 報酬を適用
        this.applyAchievementReward(achievement);
      }
    });

    return newAchievements;
  }

  // アチーブメント報酬を適用
  private applyAchievementReward(achievement: CharacterAchievement): void {
    const { reward } = achievement;

    // 経験値報酬
    if (reward.experience > 0) {
      this.addExperience(reward.experience);
    }

    // キャラクター解放
    if (reward.characterId) {
      this.unlockCharacter(reward.characterId);
    }

    // カスタマイズ報酬
    if (reward.customization) {
      this.settings.customizations = {
        ...this.settings.customizations,
        ...reward.customization
      };
    }
  }

  // キャラクターを解放
  public unlockCharacter(characterId: string): boolean {
    const character = this.characters.find(c => c.id === characterId);
    if (!character || character.unlocked) {
      return false;
    }

    character.unlocked = true;
    if (!this.settings.unlockedCharacters.includes(characterId)) {
      this.settings.unlockedCharacters.push(characterId);
    }

    this.saveSettings();
    return true;
  }

  // 連続作業日数を取得
  private getConsecutiveWorkDays(): number {
    // 実装は実際の作業記録に基づいて行う
    // ここでは仮の実装
    return 1;
  }

  // キャラクターをカスタマイズ
  public customizeCharacter(customizations: Partial<Character['customization']>): void {
    this.settings.customizations = {
      ...this.settings.customizations,
      ...customizations
    };
    this.saveSettings();
  }

  // プレイ時間を更新
  public updatePlayTime(minutes: number): void {
    this.settings.playTime += minutes;
    this.saveSettings();
  }

  // アチーブメント一覧を取得
  public getAchievements(): CharacterAchievement[] {
    return [...this.achievements];
  }

  // 解放済みアチーブメントを取得
  public getUnlockedAchievements(): CharacterAchievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  // コレクション情報を取得
  public getCollectionInfo() {
    const totalCharacters = this.characters.length;
    const unlockedCharacters = this.settings.unlockedCharacters.length;
    const completionRate = (unlockedCharacters / totalCharacters) * 100;

    return {
      totalCharacters,
      unlockedCharacters,
      completionRate,
      characters: this.characters.reduce((acc, char) => {
        acc[char.id] = {
          unlocked: char.unlocked,
          unlockedAt: char.unlocked ? new Date() : undefined,
          timesUsed: char.id === this.settings.selectedCharacterId ? 1 : 0,
          totalPlayTime: char.id === this.settings.selectedCharacterId ? this.settings.playTime : 0,
          favorite: false
        };
        return acc;
      }, {} as any)
    };
  }

  // キャラクターの統計情報を取得
  public getCharacterStats(characterId: string) {
    const character = this.characters.find(c => c.id === characterId);
    if (!character) return null;

    return {
      level: character.level,
      experience: character.experience,
      totalExperience: this.settings.totalExperience,
      playTime: this.settings.playTime,
      timesUsed: character.id === this.settings.selectedCharacterId ? 1 : 0,
      unlockedAt: character.unlocked ? new Date() : undefined,
      rarity: character.rarity,
      type: character.type
    };
  }

  // 設定をリセット
  public resetSettings(): void {
    this.settings = { ...DEFAULT_CHARACTER_SETTINGS };
    this.characters.forEach(char => {
      char.unlocked = char.id === 'default-cute-001';
      char.level = 1;
      char.experience = 0;
    });
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlockedAt = undefined;
    });
    this.saveSettings();
  }

  // データをエクスポート
  public exportData(): string {
    const exportData = {
      settings: this.settings,
      characters: this.characters,
      achievements: this.achievements,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  // データをインポート
  public importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.settings && parsed.characters && parsed.achievements) {
        this.settings = { ...DEFAULT_CHARACTER_SETTINGS, ...parsed.settings };
        this.characters = [...parsed.characters];
        this.achievements = [...parsed.achievements];
        this.saveSettings();
        return true;
      }
    } catch (error) {
      console.error('Failed to import character data:', error);
    }
    return false;
  }
}

// シングルトンインスタンスをエクスポート
export const characterManager = CharacterManager.getInstance();
