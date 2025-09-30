// キャラクター間の相互作用を管理するマネージャー

import { CharacterInteraction, CharacterReaction, CHARACTER_INTERACTIONS, CHARACTER_REACTIONS } from '../types/characterRole';
import { Character } from '../types/character';
import { Badge } from '../types/badge';

export interface CharacterInteractionEvent {
  type: 'level_up' | 'badge_earned' | 'work_coin_earned' | 'time_tracked' | 'memo_created';
  value?: number;
  character?: Character;
  badge?: Badge;
  workCoins?: number;
  timeMinutes?: number;
}

export interface CharacterInteractionResult {
  interactions: CharacterInteraction[];
  reactions: CharacterReaction[];
  messages: string[];
  animations: string[];
}

export class CharacterInteractionManager {
  private static instance: CharacterInteractionManager;
  private interactionHistory: CharacterInteractionEvent[] = [];
  private lastInteractionTime: number = 0;
  private readonly INTERACTION_COOLDOWN = 5000; // 5秒のクールダウン

  public static getInstance(): CharacterInteractionManager {
    if (!CharacterInteractionManager.instance) {
      CharacterInteractionManager.instance = new CharacterInteractionManager();
    }
    return CharacterInteractionManager.instance;
  }

  // イベントを処理して相互作用を生成
  public processEvent(event: CharacterInteractionEvent): CharacterInteractionResult {
    const now = Date.now();
    
    // クールダウンチェック
    if (now - this.lastInteractionTime < this.INTERACTION_COOLDOWN) {
      return {
        interactions: [],
        reactions: [],
        messages: [],
        animations: []
      };
    }

    this.interactionHistory.push(event);
    this.lastInteractionTime = now;

    const interactions = this.findTriggeredInteractions(event);
    const reactions = this.findTriggeredReactions(event);
    const messages = this.generateMessages(interactions, reactions);
    const animations = this.generateAnimations(interactions, reactions);

    return {
      interactions,
      reactions,
      messages,
      animations
    };
  }

  // トリガーされた相互作用を検索
  private findTriggeredInteractions(event: CharacterInteractionEvent): CharacterInteraction[] {
    return CHARACTER_INTERACTIONS.filter(interaction => {
      const condition = interaction.triggerCondition;
      
      switch (condition.type) {
        case 'level_up':
          return event.type === 'level_up';
        case 'badge_earned':
          return event.type === 'badge_earned';
        case 'work_coin_earned':
          return event.type === 'work_coin_earned';
        case 'time_tracked':
          return event.type === 'time_tracked' && 
                 (!condition.value || (event.timeMinutes && event.timeMinutes >= condition.value));
        case 'memo_created':
          return event.type === 'memo_created';
        default:
          return false;
      }
    });
  }

  // トリガーされた反応を検索
  private findTriggeredReactions(event: CharacterInteractionEvent): CharacterReaction[] {
    return CHARACTER_REACTIONS.filter(reaction => {
      const trigger = reaction.trigger;
      
      switch (trigger.type) {
        case 'user_achievement':
          return this.checkAchievementCondition(trigger.condition, event);
        case 'system_event':
          return this.checkSystemEventCondition(trigger.condition, event);
        case 'time_based':
          return this.checkTimeBasedCondition(trigger.condition, event);
        default:
          return false;
      }
    });
  }

  // アチーブメント条件をチェック
  private checkAchievementCondition(condition: any, event: CharacterInteractionEvent): boolean {
    switch (condition.type) {
      case 'level_up':
        return event.type === 'level_up';
      case 'badge_earned':
        return event.type === 'badge_earned';
      case 'time_tracked':
        return event.type === 'time_tracked' && 
               (!condition.value || (event.timeMinutes && event.timeMinutes >= condition.value));
      default:
        return false;
    }
  }

  // システムイベント条件をチェック
  private checkSystemEventCondition(condition: any, event: CharacterInteractionEvent): boolean {
    switch (condition.type) {
      case 'work_streak':
        // 実際の実装では、連続作業日数をチェック
        return event.type === 'time_tracked' && condition.value;
      default:
        return false;
    }
  }

  // 時間ベース条件をチェック
  private checkTimeBasedCondition(condition: any, event: CharacterInteractionEvent): boolean {
    // 時間ベースの条件（例：特定の時間帯、定期的なイベント）
    return false; // 実装は必要に応じて
  }

  // メッセージを生成
  private generateMessages(interactions: CharacterInteraction[], reactions: CharacterReaction[]): string[] {
    const messages: string[] = [];
    
    interactions.forEach(interaction => {
      messages.push(interaction.message);
    });
    
    reactions.forEach(reaction => {
      if (reaction.message) {
        messages.push(reaction.message);
      }
    });
    
    return messages;
  }

  // アニメーションを生成
  private generateAnimations(interactions: CharacterInteraction[], reactions: CharacterReaction[]): string[] {
    const animations: string[] = [];
    
    interactions.forEach(interaction => {
      animations.push(interaction.animation);
    });
    
    reactions.forEach(reaction => {
      animations.push(reaction.animation);
    });
    
    return animations;
  }

  // キャラクターの状態を更新
  public updateCharacterState(characterId: string, newState: any): void {
    // キャラクターの状態を更新するロジック
    console.log(`Updating character ${characterId} state:`, newState);
  }

  // 相互作用履歴を取得
  public getInteractionHistory(): CharacterInteractionEvent[] {
    return [...this.interactionHistory];
  }

  // 特定のキャラクターの相互作用を取得
  public getCharacterInteractions(characterId: string): CharacterInteraction[] {
    return CHARACTER_INTERACTIONS.filter(
      interaction => interaction.fromCharacter === characterId || interaction.toCharacter === characterId
    );
  }

  // 特定のキャラクターの反応を取得
  public getCharacterReactions(characterId: string): CharacterReaction[] {
    return CHARACTER_REACTIONS.filter(reaction => reaction.characterId === characterId);
  }

  // クールダウンをリセット
  public resetCooldown(): void {
    this.lastInteractionTime = 0;
  }
}
