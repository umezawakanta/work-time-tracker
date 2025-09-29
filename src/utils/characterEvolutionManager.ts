// キャラクター進化管理ユーティリティ

import { Character, CharacterForm, CharacterEvolution, EvolutionEvent, CharacterStats } from '../types/character';
import { characterGrowthManager } from './characterGrowthManager';

class CharacterEvolutionManager {
  // デフォルトの進化フォーム定義
  private defaultForms: { [characterType: string]: CharacterForm[] } = {
    cute: [
      {
        id: 'cute-baby',
        name: 'ベビーキュート',
        description: '小さくて可愛らしい赤ちゃんの姿',
        level: 1,
        requirements: { level: 1 },
        appearance: {
          svg: '🐣',
          color: '#FFB6C1',
          size: 'small',
          specialEffects: ['sparkle']
        },
        animations: {
          idle: 'bounce',
          working: 'concentrate',
          celebrating: 'jump',
          sleeping: 'zzz',
          thinking: 'tilt',
          excited: 'wiggle'
        },
        personality: {
          traits: ['innocent', 'playful'],
          messages: {
            encouragement: ['がんばって！', 'いっしょにやろう！'],
            celebration: ['やったー！', 'すごいね！'],
            reminder: ['おつかれさま！', 'ちょっと休もう？'],
            greeting: ['こんにちは！', 'おはよう！'],
            farewell: ['またね！', 'ばいばい！']
          },
          voice: 'cheerful'
        },
        statBonuses: { creativity: 1 },
        specialAbilities: ['innocent_charm']
      },
      {
        id: 'cute-child',
        name: 'キュートキッズ',
        description: '元気いっぱいの子供の姿',
        level: 10,
        requirements: { level: 10, experience: 1000 },
        appearance: {
          svg: '🐰',
          color: '#FF69B4',
          size: 'medium',
          specialEffects: ['rainbow_trail']
        },
        animations: {
          idle: 'hop',
          working: 'focus',
          celebrating: 'spin',
          sleeping: 'snore',
          thinking: 'scratch_head',
          excited: 'bounce'
        },
        personality: {
          traits: ['energetic', 'curious'],
          messages: {
            encouragement: ['がんばろう！', 'きっとできるよ！'],
            celebration: ['わーい！', 'やったね！'],
            reminder: ['おつかれ！', 'ちょっと休憩しよう！'],
            greeting: ['やっほー！', 'こんにちは！'],
            farewell: ['またあとで！', 'さようなら！']
          },
          voice: 'energetic'
        },
        statBonuses: { strength: 2, creativity: 2 },
        specialAbilities: ['energy_boost', 'curiosity_enhancement']
      },
      {
        id: 'cute-teen',
        name: 'キュートティーン',
        description: '思春期の可愛らしい姿',
        level: 25,
        requirements: { level: 25, experience: 5000, badges: ['work_streak_7'] },
        appearance: {
          svg: '🐱',
          color: '#FF1493',
          size: 'medium',
          specialEffects: ['magical_aura', 'flower_petals']
        },
        animations: {
          idle: 'stretch',
          working: 'concentrate_deep',
          celebrating: 'dance',
          sleeping: 'peaceful_sleep',
          thinking: 'deep_thought',
          excited: 'happy_dance'
        },
        personality: {
          traits: ['confident', 'creative'],
          messages: {
            encouragement: ['あなたなら大丈夫！', '一緒に頑張りましょう！'],
            celebration: ['素晴らしい！', '最高です！'],
            reminder: ['お疲れ様でした！', 'ゆっくり休んでくださいね！'],
            greeting: ['こんにちは！', 'お疲れ様です！'],
            farewell: ['また明日！', 'お疲れ様でした！']
          },
          voice: 'calm'
        },
        statBonuses: { intelligence: 3, creativity: 3, social: 2 },
        specialAbilities: ['creative_inspiration', 'social_boost']
      },
      {
        id: 'cute-adult',
        name: 'キュートアダルト',
        description: '成熟した美しい姿',
        level: 50,
        requirements: { level: 50, experience: 15000, badges: ['work_streak_30'] },
        appearance: {
          svg: '🦄',
          color: '#DA70D6',
          size: 'large',
          specialEffects: ['prismatic_glow', 'stardust', 'rainbow_halo']
        },
        animations: {
          idle: 'elegant_pose',
          working: 'masterful_focus',
          celebrating: 'graceful_dance',
          sleeping: 'serene_rest',
          thinking: 'wise_contemplation',
          excited: 'joyful_prance'
        },
        personality: {
          traits: ['wise', 'elegant', 'inspiring'],
          messages: {
            encouragement: ['あなたの可能性は無限大です！', '一緒に最高の結果を目指しましょう！'],
            celebration: ['本当に素晴らしい成果です！', 'あなたの努力が実を結びましたね！'],
            reminder: ['お疲れ様でした。心も体も大切にしてくださいね。', '今日もよく頑張りました！'],
            greeting: ['こんにちは！今日も素晴らしい一日にしましょう！', 'お疲れ様です！'],
            farewell: ['また素晴らしい日をお過ごしください！', 'お疲れ様でした！']
          },
          voice: 'mysterious'
        },
        statBonuses: { strength: 5, intelligence: 5, creativity: 5, endurance: 5, social: 5 },
        specialAbilities: ['mastery_boost', 'inspiration_aura', 'wisdom_guidance']
      }
    ],
    cool: [
      {
        id: 'cool-baby',
        name: 'クールベビー',
        description: '小さくてもクールな赤ちゃん',
        level: 1,
        requirements: { level: 1 },
        appearance: {
          svg: '🐧',
          color: '#4169E1',
          size: 'small',
          specialEffects: ['ice_crystals']
        },
        animations: {
          idle: 'cool_pose',
          working: 'focused',
          celebrating: 'cool_jump',
          sleeping: 'peaceful',
          thinking: 'contemplative',
          excited: 'cool_bounce'
        },
        personality: {
          traits: ['calm', 'observant'],
          messages: {
            encouragement: ['クールに行こう', '落ち着いて'],
            celebration: ['ナイス', 'いい感じ'],
            reminder: ['休憩しよう', '無理しないで'],
            greeting: ['よお', 'こんにちは'],
            farewell: ['またな', 'ばい']
          },
          voice: 'calm'
        },
        statBonuses: { intelligence: 1 },
        specialAbilities: ['cool_focus']
      },
      {
        id: 'cool-teen',
        name: 'クールティーン',
        description: 'かっこいい思春期の姿',
        level: 25,
        requirements: { level: 25, experience: 5000 },
        appearance: {
          svg: '🐺',
          color: '#1E90FF',
          size: 'medium',
          specialEffects: ['electric_sparks', 'cool_wind']
        },
        animations: {
          idle: 'confident_pose',
          working: 'intense_focus',
          celebrating: 'cool_celebration',
          sleeping: 'restful_sleep',
          thinking: 'strategic_thought',
          excited: 'cool_excitement'
        },
        personality: {
          traits: ['confident', 'strategic'],
          messages: {
            encouragement: ['戦略的に行こう', 'クールにこなそう'],
            celebration: ['完璧だ', '素晴らしい'],
            reminder: ['効率的に休もう', '無駄を省こう'],
            greeting: ['よお、調子はどうだ？', 'こんにちは'],
            farewell: ['また明日', 'お疲れ']
          },
          voice: 'calm'
        },
        statBonuses: { intelligence: 3, strength: 2 },
        specialAbilities: ['strategic_planning', 'efficiency_boost']
      },
      {
        id: 'cool-master',
        name: 'クールマスター',
        description: '究極のクールな姿',
        level: 50,
        requirements: { level: 50, experience: 15000 },
        appearance: {
          svg: '🐉',
          color: '#0000FF',
          size: 'large',
          specialEffects: ['lightning_aura', 'storm_clouds', 'electric_field']
        },
        animations: {
          idle: 'masterful_pose',
          working: 'ultimate_focus',
          celebrating: 'epic_celebration',
          sleeping: 'deep_meditation',
          thinking: 'masterful_contemplation',
          excited: 'legendary_excitement'
        },
        personality: {
          traits: ['legendary', 'masterful', 'inspiring'],
          messages: {
            encouragement: ['究極のパフォーマンスを発揮しよう', 'マスターの域に達している'],
            celebration: ['伝説的な成果だ', '完璧すぎる'],
            reminder: ['マスターも休息は必要だ', '最高の状態を保とう'],
            greeting: ['よお、マスター', 'こんにちは、同志よ'],
            farewell: ['また最高のパフォーマンスで会おう', 'お疲れ、マスター']
          },
          voice: 'mysterious'
        },
        statBonuses: { strength: 8, intelligence: 8, endurance: 8 },
        specialAbilities: ['legendary_power', 'master_focus', 'ultimate_efficiency']
      }
    ]
  };

  // キャラクターの進化をチェック
  public checkEvolution(character: Character): CharacterForm | null {
    const characterType = character.type;
    const forms = this.defaultForms[characterType] || [];
    
    // 現在のフォームを取得
    const currentForm = this.getCurrentForm(character);
    if (!currentForm) return null;

    // 次の進化可能なフォームを探す
    const nextForm = forms.find(form => 
      form.level > currentForm.level &&
      this.checkEvolutionRequirements(character, form)
    );

    return nextForm || null;
  }

  // 進化を実行
  public evolveCharacter(character: Character, targetFormId: string): Character {
    const targetForm = this.getFormById(character.type, targetFormId);
    if (!targetForm) return character;

    const evolutionEvent: EvolutionEvent = {
      id: `evolution_${Date.now()}`,
      characterId: character.id,
      fromForm: character.currentForm,
      toForm: targetFormId,
      level: character.level,
      timestamp: new Date(),
      trigger: 'level'
    };

    const updatedCharacter: Character = {
      ...character,
      currentForm: targetFormId,
      availableForms: [...character.availableForms, targetFormId],
      evolution: {
        ...character.evolution,
        currentFormId: targetFormId,
        evolutionHistory: [...character.evolution.evolutionHistory, evolutionEvent]
      },
      // 進化によるステータスボーナスを適用
      stats: this.applyStatBonuses(character.stats, targetForm.statBonuses)
    };

    return updatedCharacter;
  }

  // 現在のフォームを取得
  public getCurrentForm(character: Character): CharacterForm | null {
    return this.getFormById(character.type, character.currentForm);
  }

  // フォームIDでフォームを取得
  private getFormById(characterType: string, formId: string): CharacterForm | null {
    const forms = this.defaultForms[characterType] || [];
    return forms.find(form => form.id === formId) || null;
  }

  // 進化条件をチェック
  private checkEvolutionRequirements(character: Character, form: CharacterForm): boolean {
    const { requirements } = form;
    
    // レベル条件
    if (requirements.level && character.level < requirements.level) {
      return false;
    }

    // 経験値条件
    if (requirements.experience && character.totalExperience < requirements.experience) {
      return false;
    }

    // バッジ条件
    if (requirements.badges) {
      const hasRequiredBadges = requirements.badges.every(badgeId => 
        character.badges.includes(badgeId)
      );
      if (!hasRequiredBadges) return false;
    }

    // ステータス条件
    if (requirements.stats) {
      const hasRequiredStats = Object.entries(requirements.stats).every(([stat, value]) => 
        character.stats[stat as keyof CharacterStats] >= value!
      );
      if (!hasRequiredStats) return false;
    }

    return true;
  }

  // ステータスボーナスを適用
  private applyStatBonuses(stats: CharacterStats, bonuses?: Partial<CharacterStats>): CharacterStats {
    if (!bonuses) return stats;

    return {
      strength: stats.strength + (bonuses.strength || 0),
      intelligence: stats.intelligence + (bonuses.intelligence || 0),
      creativity: stats.creativity + (bonuses.creativity || 0),
      endurance: stats.endurance + (bonuses.endurance || 0),
      social: stats.social + (bonuses.social || 0)
    };
  }

  // 利用可能なフォーム一覧を取得
  public getAvailableForms(character: Character): CharacterForm[] {
    const characterType = character.type;
    const forms = this.defaultForms[characterType] || [];
    
    return forms.filter(form => 
      character.availableForms.includes(form.id) ||
      this.checkEvolutionRequirements(character, form)
    );
  }

  // 進化履歴を取得
  public getEvolutionHistory(character: Character): EvolutionEvent[] {
    return character.evolution.evolutionHistory;
  }

  // 進化可能かどうかをチェック
  public canEvolve(character: Character): boolean {
    return this.checkEvolution(character) !== null;
  }

  // 進化アニメーション用のデータを取得
  public getEvolutionAnimationData(character: Character, targetForm: CharacterForm) {
    const currentForm = this.getCurrentForm(character);
    
    return {
      fromForm: currentForm,
      toForm: targetForm,
      evolutionType: this.getEvolutionType(currentForm, targetForm),
      duration: 3000, // 3秒
      effects: ['sparkles', 'glow', 'transformation']
    };
  }

  // 進化タイプを判定
  private getEvolutionType(fromForm: CharacterForm | null, toForm: CharacterForm): string {
    if (!fromForm) return 'initial';
    
    const levelDiff = toForm.level - fromForm.level;
    if (levelDiff >= 20) return 'legendary';
    if (levelDiff >= 10) return 'epic';
    if (levelDiff >= 5) return 'rare';
    return 'common';
  }
}

export const characterEvolutionManager = new CharacterEvolutionManager();
