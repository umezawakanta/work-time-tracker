// キャラクター成長管理ユーティリティ

import { Character, CharacterStats, CharacterAchievement } from '../types/character';
import { Badge } from '../types/badge';
import { badgeManager } from './badgeManager';

export interface GrowthEvent {
  type: 'levelup' | 'evolution' | 'statup' | 'badge';
  message: string;
  timestamp: Date;
  data?: any;
}

export interface CharacterGrowthResult {
  leveledUp: boolean;
  evolved: boolean;
  statIncreased: boolean;
  newLevel?: number;
  newGrowthStage?: string;
  newStats?: CharacterStats;
  events: GrowthEvent[];
}

class CharacterGrowthManager {
  // 成長段階の定義
  private growthStages = {
    baby: { minLevel: 1, maxLevel: 5, name: '赤ちゃん', emoji: '👶' },
    child: { minLevel: 6, maxLevel: 15, name: '子供', emoji: '🧒' },
    teen: { minLevel: 16, maxLevel: 30, name: 'ティーン', emoji: '👦' },
    adult: { minLevel: 31, maxLevel: 50, name: '大人', emoji: '👨' },
    master: { minLevel: 51, maxLevel: 100, name: 'マスター', emoji: '🧙' }
  };

  // レベルアップに必要な経験値
  private getRequiredExperience(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  // 成長段階を取得
  public getGrowthStage(level: number): 'baby' | 'child' | 'teen' | 'adult' | 'master' {
    for (const [stage, config] of Object.entries(this.growthStages)) {
      if (level >= config.minLevel && level <= config.maxLevel) {
        return stage as any;
      }
    }
    return 'master';
  }

  // 成長段階の情報を取得
  public getGrowthStageInfo(stage: string) {
    return this.growthStages[stage as keyof typeof this.growthStages] || this.growthStages.master;
  }

  // キャラクターの初期化
  public initializeCharacter(character: Character): Character {
    return {
      ...character,
      totalExperience: character.totalExperience || 0,
      badges: character.badges || [],
      growthStage: character.growthStage || this.getGrowthStage(character.level),
      evolutionLevel: character.evolutionLevel || 1,
      stats: character.stats || this.getInitialStats(character.type)
    };
  }

  // 初期ステータスを取得
  private getInitialStats(type: string): CharacterStats {
    const baseStats = {
      strength: 10,
      intelligence: 10,
      creativity: 10,
      endurance: 10,
      social: 10
    };

    // タイプ別の初期ステータス調整
    switch (type) {
      case 'cute':
        return { ...baseStats, social: 15, creativity: 12 };
      case 'cool':
        return { ...baseStats, strength: 15, endurance: 12 };
      case 'mysterious':
        return { ...baseStats, intelligence: 15, creativity: 12 };
      case 'energetic':
        return { ...baseStats, strength: 12, endurance: 15 };
      default:
        return baseStats;
    }
  }

  // 経験値を追加して成長を処理
  public addExperience(character: Character, experience: number, source: string = 'work'): CharacterGrowthResult {
    const events: GrowthEvent[] = [];
    let newCharacter = { ...character };
    let leveledUp = false;
    let evolved = false;
    let statIncreased = false;

    // 経験値を追加
    newCharacter.totalExperience += experience;
    newCharacter.experience += experience;

    // レベルアップチェック
    const requiredExp = this.getRequiredExperience(newCharacter.level);
    if (newCharacter.experience >= requiredExp) {
      newCharacter.level += 1;
      newCharacter.experience -= requiredExp;
      leveledUp = true;

      events.push({
        type: 'levelup',
        message: `${newCharacter.name}がレベル${newCharacter.level}に上がりました！`,
        timestamp: new Date(),
        data: { newLevel: newCharacter.level }
      });

      // 成長段階チェック
      const newGrowthStage = this.getGrowthStage(newCharacter.level);
      if (newGrowthStage !== newCharacter.growthStage) {
        newCharacter.growthStage = newGrowthStage;
        newCharacter.evolutionLevel += 1;
        evolved = true;

        events.push({
          type: 'evolution',
          message: `${newCharacter.name}が${this.getGrowthStageInfo(newGrowthStage).name}に進化しました！`,
          timestamp: new Date(),
          data: { newGrowthStage, evolutionLevel: newCharacter.evolutionLevel }
        });
      }

      // ステータス上昇
      const statIncrease = this.calculateStatIncrease(newCharacter.level, newCharacter.type);
      newCharacter.stats = this.increaseStats(newCharacter.stats, statIncrease);
      statIncreased = true;

      events.push({
        type: 'statup',
        message: `ステータスが上昇しました！`,
        timestamp: new Date(),
        data: { statIncrease, newStats: newCharacter.stats }
      });
    }

    return {
      leveledUp,
      evolved,
      statIncreased,
      newLevel: leveledUp ? newCharacter.level : undefined,
      newGrowthStage: evolved ? newCharacter.growthStage : undefined,
      newStats: statIncreased ? newCharacter.stats : undefined,
      events
    };
  }

  // ステータス上昇量を計算
  private calculateStatIncrease(level: number, type: string): Partial<CharacterStats> {
    const baseIncrease = Math.floor(level / 5) + 1; // レベル5ごとに基本値+1
    const increase = {
      strength: baseIncrease,
      intelligence: baseIncrease,
      creativity: baseIncrease,
      endurance: baseIncrease,
      social: baseIncrease
    };

    // タイプ別のボーナス
    switch (type) {
      case 'cute':
        increase.social += 1;
        increase.creativity += 1;
        break;
      case 'cool':
        increase.strength += 1;
        increase.endurance += 1;
        break;
      case 'mysterious':
        increase.intelligence += 1;
        increase.creativity += 1;
        break;
      case 'energetic':
        increase.strength += 1;
        increase.endurance += 1;
        break;
    }

    return increase;
  }

  // ステータスを上昇
  private increaseStats(currentStats: CharacterStats, increase: Partial<CharacterStats>): CharacterStats {
    return {
      strength: Math.min(currentStats.strength + (increase.strength || 0), 100),
      intelligence: Math.min(currentStats.intelligence + (increase.intelligence || 0), 100),
      creativity: Math.min(currentStats.creativity + (increase.creativity || 0), 100),
      endurance: Math.min(currentStats.endurance + (increase.endurance || 0), 100),
      social: Math.min(currentStats.social + (increase.social || 0), 100)
    };
  }

  // バッジを追加して成長を処理
  public addBadge(character: Character, badge: Badge): CharacterGrowthResult {
    const events: GrowthEvent[] = [];
    let newCharacter = { ...character };

    // バッジを追加
    if (!newCharacter.badges.includes(badge.id)) {
      newCharacter.badges.push(badge.id);

      events.push({
        type: 'badge',
        message: `「${badge.name}」バッジを獲得しました！`,
        timestamp: new Date(),
        data: { badge }
      });

      // バッジの経験値を追加
      const growthResult = this.addExperience(newCharacter, badge.xpReward, 'badge');
      newCharacter = { ...newCharacter, ...growthResult };
      events.push(...growthResult.events);
    }

    return {
      leveledUp: false,
      evolved: false,
      statIncreased: false,
      events
    };
  }

  // キャラクターの成長度を計算
  public getGrowthProgress(character: Character): {
    currentLevel: number;
    nextLevelExp: number;
    currentExp: number;
    progress: number;
    growthStage: string;
    evolutionLevel: number;
    totalStats: number;
    maxStats: number;
  } {
    const requiredExp = this.getRequiredExperience(character.level);
    const progress = (character.experience / requiredExp) * 100;
    const totalStats = Object.values(character.stats).reduce((sum, stat) => sum + stat, 0);
    const maxStats = 500; // 各ステータス最大100 × 5種類

    return {
      currentLevel: character.level,
      nextLevelExp: requiredExp,
      currentExp: character.experience,
      progress: Math.round(progress),
      growthStage: this.getGrowthStageInfo(character.growthStage).name,
      evolutionLevel: character.evolutionLevel,
      totalStats,
      maxStats
    };
  }

  // バッジの影響でステータスを調整
  public applyBadgeEffects(character: Character): Character {
    const userBadges = badgeManager.getUserBadges();
    let newCharacter = { ...character };

    // 特定のバッジによるステータスボーナス
    const badgeBonuses: { [key: string]: Partial<CharacterStats> } = {
      'work_streak_7': { strength: 2, endurance: 2 },
      'work_streak_30': { strength: 5, endurance: 5 },
      'time_master': { intelligence: 3, endurance: 3 },
      'diary_writer': { intelligence: 2, creativity: 2 },
      'goal_achiever': { strength: 3, intelligence: 3 },
      'perfect_day': { strength: 4, endurance: 4, intelligence: 2 }
    };

    // バッジボーナスを適用
    userBadges.forEach(badge => {
      const bonus = badgeBonuses[badge.id];
      if (bonus) {
        newCharacter.stats = this.increaseStats(newCharacter.stats, bonus);
      }
    });

    return newCharacter;
  }
}

export const characterGrowthManager = new CharacterGrowthManager();
