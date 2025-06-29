interface UserStatus {
  level: number;
  totalAssets: number;
  savingsRate: number;
  questCompleted: boolean;
  streakDays: number;
}

interface ChatMessage {
  id: string;
  character: 'king' | 'sage' | 'merchant' | 'guard';
  message: string;
  timestamp: Date;
  type: 'advice' | 'mission' | 'celebration' | 'warning';
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: any;
  }>;
}

class DragonQuestAIService {
  private messageHistory: ChatMessage[] = [];

  async getNextAdvice(status: UserStatus): Promise<ChatMessage | null> {
    const advice = this.generateContextualAdvice(status);
    if (advice) {
      this.messageHistory.push(advice);
      return advice;
    }
    return null;
  }

  async handleQuickAction(actionType: string, status: UserStatus): Promise<ChatMessage | null> {
    switch (actionType) {
      case 'advice':
        return this.generateAdviceMessage(status);
      case 'status':
        return this.generateStatusMessage(status);
      case 'mission':
        return this.generateMissionMessage(status);
      case 'reward':
        return this.generateRewardMessage(status);
      default:
        return null;
    }
  }

  private generateContextualAdvice(status: UserStatus): ChatMessage | null {
    // レベルアップ時の特別メッセージ
    if (this.shouldCelebrateLevelUp(status)) {
      return this.generateLevelUpMessage(status);
    }

    // クエスト完了時
    if (status.questCompleted) {
      return this.generateQuestCompletionMessage(status);
    }

    // 貯蓄率が低い場合の警告
    if (status.savingsRate < 20) {
      return this.generateSavingsWarning(status);
    }

    // 連続達成時の励まし
    if (status.streakDays >= 7) {
      return this.generateStreakCelebration(status);
    }

    // 通常のアドバイス
    return this.generateAdviceMessage(status);
  }

  private generateLevelUpMessage(status: UserStatus): ChatMessage {
    const messages = [
      `おめでとう、勇者よ！レベル${status.level}に到達したぞ！`,
      `見事じゃ！その調子で資産形成の道を歩み続けるのじゃ！`,
      `新たな力を手に入れた今こそ、より大きな目標に向かうのじゃ！`,
    ];

    return {
      id: this.generateId(),
      character: 'king',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'celebration',
      actions: [
        {
          label: '次の目標を教えて',
          action: () => console.log('Next goal requested'),
        },
      ],
    };
  }

  private generateQuestCompletionMessage(status: UserStatus): ChatMessage {
    const messages = [
      `素晴らしい！今月のクエストを見事達成したぞ！`,
      `この調子で貯蓄を続ければ、きっと大きな資産を築けるであろう！`,
      `勇者よ、継続こそが成功への鍵じゃ！来月も頑張るのじゃ！`,
    ];

    return {
      id: this.generateId(),
      character: 'sage',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'celebration',
    };
  }

  private generateSavingsWarning(status: UserStatus): ChatMessage {
    const messages = [
      `勇者よ、貯蓄率が${status.savingsRate.toFixed(1)}%と少し心配じゃな...`,
      `支出を見直して、もう少し貯蓄を増やしてみてはどうじゃ？`,
      `小さな節約の積み重ねが大きな資産につながるのじゃ！`,
    ];

    return {
      id: this.generateId(),
      character: 'sage',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'warning',
      actions: [
        {
          label: '支出を見直す',
          action: () => console.log('Review expenses'),
        },
        {
          label: '節約のコツを教えて',
          action: () => console.log('Saving tips requested'),
        },
      ],
    };
  }

  private generateStreakCelebration(status: UserStatus): ChatMessage {
    const messages = [
      `すごいぞ！${status.streakDays}日連続で目標達成とは！`,
      `この継続力こそが真の勇者の証じゃ！`,
      `習慣化された貯蓄が君の未来を明るくするであろう！`,
    ];

    return {
      id: this.generateId(),
      character: 'king',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'celebration',
    };
  }

  private generateAdviceMessage(status: UserStatus): ChatMessage {
    const character = this.selectCharacterByLevel(status.level);
    const messages = this.getAdviceByLevel(status);

    return {
      id: this.generateId(),
      character,
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'advice',
      actions: this.generateAdviceActions(status),
    };
  }

  private generateStatusMessage(status: UserStatus): ChatMessage {
    const assetString = this.formatAssets(status.totalAssets);
    const message =
      `現在の状況を報告するぞ！\n\n` +
      `レベル: ${status.level}\n` +
      `総資産: ${assetString}\n` +
      `貯蓄率: ${status.savingsRate.toFixed(1)}%\n` +
      `連続達成: ${status.streakDays}日\n\n` +
      `順調に成長しておるな！この調子で頑張るのじゃ！`;

    return {
      id: this.generateId(),
      character: 'guard',
      message,
      timestamp: new Date(),
      type: 'advice',
    };
  }

  private generateMissionMessage(status: UserStatus): ChatMessage {
    const missions = this.getMissionsByLevel(status);

    return {
      id: this.generateId(),
      character: 'king',
      message: this.getRandomMessage(missions),
      timestamp: new Date(),
      type: 'mission',
      actions: [
        {
          label: 'クエスト受諾',
          action: () => console.log('Mission accepted'),
        },
      ],
    };
  }

  private generateRewardMessage(status: UserStatus): ChatMessage {
    const rewardExp = Math.floor(status.level * 100);
    const message =
      `素晴らしい活躍ぞ！\n\n` +
      `現在の獲得報酬:\n` +
      `• 経験値: ${rewardExp} EXP\n` +
      `• 称号: ${this.getTitleByLevel(status.level)}\n` +
      `• 特典: 継続ボーナス\n\n` +
      `この調子で資産形成を続けるのじゃ！`;

    return {
      id: this.generateId(),
      character: 'merchant',
      message,
      timestamp: new Date(),
      type: 'celebration',
    };
  }

  private selectCharacterByLevel(level: number): ChatMessage['character'] {
    if (level >= 30) return 'king';
    if (level >= 20) return 'sage';
    if (level >= 10) return 'merchant';
    return 'guard';
  }

  private getAdviceByLevel(status: UserStatus): string[] {
    if (status.level >= 30) {
      return [
        `勇者よ！君はもはや資産形成のエキスパートじゃ！`,
        `投資の世界にも挑戦して、資産をさらに増やしてみてはどうじゃ？`,
        `分散投資で安定した成長を目指すのが良いであろう！`,
      ];
    } else if (status.level >= 20) {
      return [
        `家計管理も板についてきたな！次は投資も考えてみるのじゃ！`,
        `緊急費用として3-6ヶ月分の生活費を貯めることも大切じゃぞ！`,
        `長期的な目標を立てて、計画的に資産を増やしていくのじゃ！`,
      ];
    } else if (status.level >= 10) {
      return [
        `良いペースで貯蓄が進んでおるな！`,
        `家計簿をつけて支出の見える化を進めるのじゃ！`,
        `小さな無駄を見つけて節約していこう！`,
      ];
    } else {
      return [
        `資産形成の道のりは長いが、一歩ずつ進めば必ず成果が出るぞ！`,
        `まずは毎月の収支を把握することから始めるのじゃ！`,
        `目標を決めて、それに向かって頑張るのじゃ！`,
      ];
    }
  }

  private getMissionsByLevel(status: UserStatus): string[] {
    if (status.level >= 20) {
      return [
        `【投資クエスト】投資信託や株式投資にチャレンジしてみるのじゃ！`,
        `【資産分散クエスト】リスクを分散させた投資ポートフォリオを作ってみよう！`,
        `【長期計画クエスト】10年後、20年後の資産目標を設定するのじゃ！`,
      ];
    } else if (status.level >= 10) {
      return [
        `【節約マスタークエスト】今月の支出を前月より5%削減してみよう！`,
        `【緊急費用クエスト】緊急時のための資金を3ヶ月分貯めてみるのじゃ！`,
        `【自動貯蓄クエスト】給与からの自動貯蓄を設定してみよう！`,
      ];
    } else {
      return [
        `【家計管理クエスト】1ヶ月間、全ての支出を記録してみるのじゃ！`,
        `【目標設定クエスト】今年の貯蓄目標額を決めて宣言するのじゃ！`,
        `【習慣化クエスト】毎日の小さな節約を3つ見つけてみよう！`,
      ];
    }
  }

  private generateAdviceActions(status: UserStatus): Array<{ label: string; action: () => void }> {
    const actions = [
      {
        label: '詳しく教えて',
        action: () => console.log('More details requested'),
      },
    ];

    if (status.savingsRate < 30) {
      actions.push({
        label: '節約のコツ',
        action: () => console.log('Saving tips requested'),
      });
    }

    if (status.level >= 10) {
      actions.push({
        label: '投資について',
        action: () => console.log('Investment info requested'),
      });
    }

    return actions;
  }

  private shouldCelebrateLevelUp(status: UserStatus): boolean {
    // 実際の実装では、前回のレベルと比較して判定
    return false; // 簡略化のため常にfalse
  }

  private formatAssets(amount: number): string {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}億円`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万円`;
    return `${amount.toLocaleString()}円`;
  }

  private getTitleByLevel(level: number): string {
    if (level >= 50) return '伝説の資産形成マスター';
    if (level >= 40) return '資産形成の王者';
    if (level >= 30) return '投資のチャンピオン';
    if (level >= 20) return '節約の戦士';
    if (level >= 10) return '家計管理の騎士';
    return '資産形成の見習い';
  }

  private getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const dragonQuestAIService = new DragonQuestAIService();
