import { LifeStatus as ImportedLifeStatus } from '../ai/LifeSupportAIService';
import {
  lifeSupportChatService,
  LifeSupportContext,
  AIResponse,
} from '../ai/LifeSupportChatService';

interface UserStatus {
  level: number;
  totalAssets: number;
  savingsRate: number;
  questCompleted: boolean;
  streakDays: number;
}

interface DragonQuestResponse {
  character: 'king' | 'sage' | 'merchant' | 'guard' | 'architect' | 'tester';
  type: 'advice' | 'mission' | 'celebration' | 'warning' | 'development' | 'technical';
  message: string;
  title: string;
  actions?: Array<{
    label: string;
    actionType: string;
  }>;
  metadata?: {
    confidence: number;
    source: string;
    timestamp: number;
    actionType: string;
  };
}

interface LifeStatus {
  // 基本情報
  name?: string;
  age?: number;
  hasJob?: boolean;
  hasHome?: boolean;

  // 金銭状況
  bankBalance?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  hasDebt?: boolean;

  // 健康・生活
  healthStatus?: 'good' | 'fair' | 'poor' | 'unknown';
  hasHealthInsurance?: boolean;
  sleepHours?: number;
  exerciseFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';

  // 社会関係
  hasFriends?: boolean;
  hasFamily?: boolean;
  socialSupport?: 'strong' | 'moderate' | 'weak' | 'none';

  // スキル・学習
  basicSkills?: {
    canReadWrite?: boolean;
    canUseMoney?: boolean;
    canCook?: boolean;
    canClean?: boolean;
    canUseInternet?: boolean;
  };

  // メンタルヘルス
  anxietyLevel?: 'low' | 'medium' | 'high';
  depressionLevel?: 'low' | 'medium' | 'high';
  stressLevel?: 'low' | 'medium' | 'high';
  selfEsteem?: 'high' | 'medium' | 'low';

  // 目標・希望
  lifeGoals?: string[];
  shortTermGoals?: string[];
  currentChallenges?: string[];
}

interface DeveloperStatus {
  siteCompletion: number;
  priorityTasksCount: number;
  criticalIssuesCount: number;
  testCoverage: number;
  deploymentReady: boolean;
  lastCommitDays: number;
  badgeProgress?: {
    enabled: boolean;
    overallBadgeProgress: number;
    totalBadges: number;
    completedBadges: number;
    relatedBadges: Array<{
      badgeId: string;
      badgeName: string;
      progress: number;
      category: string;
    }>;
  };
}

interface ChatMessage {
  id: string;
  character: 'king' | 'sage' | 'merchant' | 'guard' | 'architect' | 'tester';
  message: string;
  timestamp: Date;
  type: 'advice' | 'mission' | 'celebration' | 'warning' | 'development' | 'technical';
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: any;
  }>;
}

class DragonQuestAIService {
  private messageHistory: ChatMessage[] = [];
  private isDeveloperMode: boolean = false;

  // 開発者モードの切り替え
  setDeveloperMode(enabled: boolean): void {
    this.isDeveloperMode = enabled;
  }

  async getNextAdvice(
    status: UserStatus,
    developerStatus?: DeveloperStatus
  ): Promise<ChatMessage | null> {
    // 開発者モードの場合は開発タスクのアドバイスも考慮
    if (this.isDeveloperMode && developerStatus) {
      const devAdvice = this.generateDeveloperAdvice(developerStatus);
      if (devAdvice) {
        this.messageHistory.push(devAdvice);
        return devAdvice;
      }
    }

    const advice = this.generateContextualAdvice(status);
    if (advice) {
      this.messageHistory.push(advice);
      return advice;
    }
    return null;
  }

  async handleQuickAction(
    actionType: string,
    status: UserStatus,
    developerStatus?: DeveloperStatus
  ): Promise<ChatMessage | null> {
    console.log(`🤖 AIサービス: ${actionType} アクション処理開始`);
    console.log('📋 開発者ステータス受信:', developerStatus);

    try {
      switch (actionType) {
        case 'advice':
          console.log('💡 アドバイスメッセージ生成中...');
          return this.generateAdviceMessage(status);
        case 'status':
          console.log('📊 ステータスメッセージ生成中...');
          return this.generateStatusMessage(status);
        case 'mission':
          console.log('🎯 ミッションメッセージ生成中...');
          return this.generateMissionMessage(status);
        case 'reward':
          console.log('🎁 報酬メッセージ生成中...');
          return this.generateRewardMessage(status);
        case 'dev-status':
          console.log('🔧 開発ステータスメッセージ生成中...');
          if (!developerStatus) {
            console.error('❌ 開発者ステータスが未定義です');
            return {
              id: this.generateId(),
              character: 'sage',
              message:
                '申し訳ない！開発者ステータスの取得に失敗したようじゃ。\n\n開発者モードが正しく有効になっているか確認してくれ。',
              timestamp: new Date(),
              type: 'warning',
            };
          }
          console.log('✅ 開発者ステータス確認OK、メッセージ生成開始');
          return this.generateDevStatusMessage(developerStatus);
        case 'dev-tasks':
          console.log('📝 開発タスクメッセージ生成中...');
          if (!developerStatus) {
            console.error('❌ 開発者ステータスが未定義です (dev-tasks)');
            return null;
          }
          return this.generateDevTasksMessage(developerStatus);
        case 'dev-tips':
          console.log('💡 開発のコツメッセージ生成中...');
          return this.generateDevTipsMessage();
        case 'site-completion':
          console.log('🚀 サイト完成度メッセージ生成中...');
          return developerStatus ? this.generateSiteCompletionMessage(developerStatus) : null;
        case 'badge-status':
          console.log('🏆 バッジステータスメッセージ生成中...');
          return developerStatus ? this.generateBadgeStatusMessage(developerStatus) : null;
        case 'badge-recommendations':
          console.log('💎 バッジ推奨メッセージ生成中...');
          return developerStatus ? this.generateBadgeRecommendationsMessage(developerStatus) : null;
        case 'life-support':
          console.log('🤗 ライフサポートアドバイス生成中...');
          return this.convertDragonQuestResponseToChatMessage(
            await DragonQuestAIService.generateLifeSupportAdvice({})
          );
        case 'daily-plan':
          console.log('🌅 今日の行動プラン生成中...');
          return this.convertDragonQuestResponseToChatMessage(
            await DragonQuestAIService.generateDailyActionPlan({})
          );
        case 'emergency-help':
          console.log('🚨 緊急時サポート生成中...');
          return this.convertDragonQuestResponseToChatMessage(
            await DragonQuestAIService.generateEmergencyHelp({})
          );
        case 'basic-needs':
          console.log('🏠 基本ニーズ確認生成中...');
          return this.convertDragonQuestResponseToChatMessage(
            await DragonQuestAIService.generateBasicNeedsCheck({})
          );
        case 'mental-health':
          console.log('🧠 メンタルヘルスサポート生成中...');
          return this.convertDragonQuestResponseToChatMessage(
            await DragonQuestAIService.generateMentalHealthSupport({})
          );
        case 'skill-building':
          console.log('🎯 スキル構築アドバイス生成中...');
          return this.convertDragonQuestResponseToChatMessage(
            await DragonQuestAIService.generateSkillBuildingAdvice({})
          );
        default:
          console.warn(`⚠️ 未知のアクションタイプ: ${actionType}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ ${actionType} メッセージ生成エラー:`, error);
      return {
        id: this.generateId(),
        character: 'sage',
        message: `申し訳ない！「${actionType}」の処理中にエラーが発生したようじゃ。\n\nエラー詳細: ${error instanceof Error ? error.message : 'Unknown error'}\n\n開発者コンソールで詳細を確認できるぞ。`,
        timestamp: new Date(),
        type: 'warning',
        actions: [
          {
            label: '再試行',
            action: () => console.log('Retry requested'),
          },
        ],
      };
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

  /**
   * DragonQuestResponseをChatMessageに変換
   */
  private convertDragonQuestResponseToChatMessage(
    dragonResponse: DragonQuestResponse
  ): ChatMessage {
    return {
      id: this.generateId(),
      character: dragonResponse.character,
      message: dragonResponse.message,
      timestamp: new Date(),
      type: dragonResponse.type,
      actions:
        dragonResponse.actions?.map((action) => ({
          label: action.label,
          action: () => console.log(`Action: ${action.actionType}`),
          icon: undefined,
        })) || [],
    };
  }

  // 🔧 開発者向けメソッド

  /**
   * 開発者向けのアドバイス生成
   */
  private generateDeveloperAdvice(developerStatus: DeveloperStatus): ChatMessage | null {
    // 緊急度の高い順にチェック
    if (developerStatus.criticalIssuesCount > 0) {
      return this.generateCriticalIssueWarning(developerStatus);
    }

    // バッジ関連のアドバイス（新機能）
    if (
      developerStatus.badgeProgress?.enabled &&
      developerStatus.badgeProgress.overallBadgeProgress < 30
    ) {
      return this.generateBadgeProgressAdvice(developerStatus);
    }

    if (developerStatus.siteCompletion < 70) {
      return this.generateCompletionMotivation(developerStatus);
    }

    if (developerStatus.testCoverage < 60) {
      return this.generateTestingAdvice(developerStatus);
    }

    if (developerStatus.priorityTasksCount > 3) {
      return this.generateTaskPriorityAdvice(developerStatus);
    }

    // バッジ完成間近のアドバイス
    if (developerStatus.badgeProgress?.enabled) {
      const nearCompletionAdvice = this.generateNearCompletionBadgeAdvice(developerStatus);
      if (nearCompletionAdvice) return nearCompletionAdvice;
    }

    if (developerStatus.lastCommitDays > 2) {
      return this.generateCommitReminder(developerStatus);
    }

    return null;
  }

  /**
   * 致命的な問題の警告
   */
  private generateCriticalIssueWarning(developerStatus: DeveloperStatus): ChatMessage {
    const messages = [
      `勇者よ！緊急事態じゃ！${developerStatus.criticalIssuesCount}個の致命的な問題が発生しているぞ！`,
      `すぐに対処しないと、サイト全体に影響が出てしまうかもしれん！`,
      `まずは最重要な問題から解決するのじゃ！`,
    ];

    return {
      id: this.generateId(),
      character: 'architect',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'warning',
      actions: [
        {
          label: '問題を確認',
          action: () => console.log('Check critical issues'),
        },
        {
          label: '修正を開始',
          action: () => console.log('Start fixing'),
        },
      ],
    };
  }

  /**
   * 完成度向上の励まし
   */
  private generateCompletionMotivation(developerStatus: DeveloperStatus): ChatMessage {
    const messages = [
      `現在のサイト完成度は${developerStatus.siteCompletion}%じゃな！`,
      `着実に進歩しているが、まだやるべきことがあるぞ！`,
      `優先度の高いタスクから取り組んで、完成度を上げていこう！`,
    ];

    return {
      id: this.generateId(),
      character: 'king',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: '優先タスクを確認',
          action: () => console.log('Check priority tasks'),
        },
        {
          label: '進捗を更新',
          action: () => console.log('Update progress'),
        },
      ],
    };
  }

  /**
   * テストカバレッジ向上のアドバイス
   */
  private generateTestingAdvice(developerStatus: DeveloperStatus): ChatMessage {
    const messages = [
      `テストカバレッジが${developerStatus.testCoverage}%じゃな...`,
      `品質向上のため、もう少しテストを充実させた方が良いぞ！`,
      `バグのない安定したサイトにするため、テストは欠かせんのじゃ！`,
    ];

    return {
      id: this.generateId(),
      character: 'tester',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'technical',
      actions: [
        {
          label: 'テスト作成',
          action: () => console.log('Create tests'),
        },
        {
          label: 'カバレッジ確認',
          action: () => console.log('Check coverage'),
        },
      ],
    };
  }

  /**
   * タスク優先度のアドバイス
   */
  private generateTaskPriorityAdvice(developerStatus: DeveloperStatus): ChatMessage {
    const messages = [
      `${developerStatus.priorityTasksCount}個の優先タスクが溜まっているぞ！`,
      `一つずつ着実に片付けていこう！`,
      `重要なものから順番に取り組むのが賢明じゃ！`,
    ];

    return {
      id: this.generateId(),
      character: 'sage',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: 'タスク一覧を見る',
          action: () => console.log('View task list'),
        },
        {
          label: '今日やることを決める',
          action: () => console.log('Plan today'),
        },
      ],
    };
  }

  /**
   * コミット促進メッセージ
   */
  private generateCommitReminder(developerStatus: DeveloperStatus): ChatMessage {
    const messages = [
      `最後のコミットから${developerStatus.lastCommitDays}日経っているぞ！`,
      `進捗をこまめに保存することが大切じゃ！`,
      `小さな変更でも定期的にコミットするのじゃ！`,
    ];

    return {
      id: this.generateId(),
      character: 'guard',
      message: this.getRandomMessage(messages),
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: '変更をコミット',
          action: () => console.log('Commit changes'),
        },
      ],
    };
  }

  /**
   * 開発ステータスメッセージ
   */
  private generateDevStatusMessage(developerStatus: DeveloperStatus): ChatMessage {
    try {
      console.log('🏗️ 開発ステータスメッセージ生成開始...');
      console.log('📊 受信した開発者ステータス:', {
        siteCompletion: developerStatus.siteCompletion,
        priorityTasksCount: developerStatus.priorityTasksCount,
        testCoverage: developerStatus.testCoverage,
        deploymentReady: developerStatus.deploymentReady,
        lastCommitDays: developerStatus.lastCommitDays,
        badgeProgress: developerStatus.badgeProgress ? 'あり' : 'なし',
      });

      let message =
        `開発状況を報告するぞ！\n\n` +
        `サイト完成度: ${developerStatus.siteCompletion}%\n` +
        `優先タスク: ${developerStatus.priorityTasksCount}個\n` +
        `テストカバレッジ: ${developerStatus.testCoverage}%\n` +
        `デプロイ準備: ${developerStatus.deploymentReady ? '完了' : '未完了'}\n` +
        `最終コミット: ${developerStatus.lastCommitDays}日前\n\n` +
        `${developerStatus.siteCompletion >= 80 ? '素晴らしい進捗じゃ！' : 'もう少しで完成じゃな！'}`;

      // バッジ情報がある場合は追加
      if (developerStatus.badgeProgress?.enabled) {
        const badgeInfo = `\n🏆 バッジ進捗: ${developerStatus.badgeProgress.completedBadges}/${developerStatus.badgeProgress.totalBadges}個 (${developerStatus.badgeProgress.overallBadgeProgress}%)`;
        message = message + badgeInfo;
      }

      const result = {
        id: this.generateId(),
        character: 'architect' as const,
        message,
        timestamp: new Date(),
        type: 'development' as const,
        actions: [
          {
            label: '詳細を確認',
            action: () => console.log('開発詳細確認'),
          },
          {
            label: 'タスクを見る',
            action: () => console.log('タスク一覧確認'),
          },
        ],
      };

      console.log('✅ 開発ステータスメッセージ生成完了:', result);
      return result;
    } catch (error) {
      console.error('❌ 開発ステータスメッセージ生成エラー:', error);

      // エラー時のフォールバックメッセージ
      return {
        id: this.generateId(),
        character: 'sage',
        message: `申し訳ない！開発状況の取得中にエラーが発生したようじゃ。\n\nエラー: ${error instanceof Error ? error.message : 'Unknown error'}\n\n少し時間をおいて再試行してくれ。`,
        timestamp: new Date(),
        type: 'warning',
        actions: [
          {
            label: '再試行',
            action: () => console.log('開発ステータス再試行'),
          },
        ],
      };
    }
  }

  /**
   * 開発タスクメッセージ
   */
  private generateDevTasksMessage(developerStatus: DeveloperStatus): ChatMessage {
    const taskAdvice = [
      '今日取り組むべきタスクを教えよう！',
      'まずは優先度の高いものから片付けるのじゃ！',
      '小さなタスクから始めて、勢いをつけていこう！',
    ];

    const recommendations = [];
    if (developerStatus.criticalIssuesCount > 0) {
      recommendations.push(`🚨 緊急: ${developerStatus.criticalIssuesCount}個の致命的問題`);
    }
    if (developerStatus.testCoverage < 70) {
      recommendations.push('🧪 テストカバレッジの向上');
    }
    if (!developerStatus.deploymentReady) {
      recommendations.push('🚀 デプロイメント準備');
    }

    const message =
      `${this.getRandomMessage(taskAdvice)}\n\n` +
      `今日の推奨タスク:\n${recommendations.map((r) => `• ${r}`).join('\n')}\n\n` +
      '一つずつ確実にクリアしていこう！';

    return {
      id: this.generateId(),
      character: 'sage',
      message,
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: 'タスクを開始',
          action: () => console.log('Start task'),
        },
        {
          label: '進捗を記録',
          action: () => console.log('Record progress'),
        },
      ],
    };
  }

  /**
   * 開発のコツメッセージ
   */
  private generateDevTipsMessage(): ChatMessage {
    const tips = [
      '💡 小さなタスクに分割して、達成感を積み重ねよう！',
      '🔄 定期的なリファクタリングで技術的負債を減らそう！',
      '📝 コメントとドキュメントを忘れずに書こう！',
      '🧪 テストファーストで品質の高いコードにしよう！',
      '⚡ パフォーマンスを意識した実装を心がけよう！',
      '🔒 セキュリティの観点も忘れずにチェックしよう！',
      '📱 レスポンシブデザインでどのデバイスでも快適に！',
      '♿ アクセシビリティに配慮して、誰でも使えるサイトに！',
    ];

    return {
      id: this.generateId(),
      character: 'architect',
      message: `開発のコツを教えよう！\n\n${this.getRandomMessage(tips)}\n\n継続的な改善が成功の鍵じゃ！`,
      timestamp: new Date(),
      type: 'technical',
      actions: [
        {
          label: '他のコツも見る',
          action: () => console.log('More tips'),
        },
        {
          label: '実践してみる',
          action: () => console.log('Try it'),
        },
      ],
    };
  }

  /**
   * 🏆 バッジ進捗アドバイス
   */
  private generateBadgeProgressAdvice(developerStatus: DeveloperStatus): ChatMessage {
    const badgeProgress = developerStatus.badgeProgress!;
    const messages = [
      `バッジの獲得が進んでいないようじゃな... 現在${badgeProgress.overallBadgeProgress}%の進捗じゃ。`,
      `開発タスクを完了することで、関連するバッジが自動的に進捗するぞ！`,
      `スキルを証明するバッジを獲得して、成長を可視化しよう！`,
    ];

    const topBadges = badgeProgress.relatedBadges
      .filter((badge) => badge.progress > 0 && badge.progress < 100)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 2);

    let badgeInfo = '';
    if (topBadges.length > 0) {
      badgeInfo = `\n\n進捗中のバッジ:\n${topBadges
        .map((badge) => `• ${badge.badgeName}: ${badge.progress.toFixed(1)}%`)
        .join('\n')}`;
    }

    return {
      id: this.generateId(),
      character: 'sage',
      message: this.getRandomMessage(messages) + badgeInfo,
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: 'バッジ一覧を見る',
          action: () => console.log('View badges'),
        },
        {
          label: '関連タスクを確認',
          action: () => console.log('Check related tasks'),
        },
      ],
    };
  }

  /**
   * 🎯 完成間近バッジのアドバイス
   */
  private generateNearCompletionBadgeAdvice(developerStatus: DeveloperStatus): ChatMessage | null {
    const badgeProgress = developerStatus.badgeProgress!;
    const nearCompletionBadges = badgeProgress.relatedBadges
      .filter((badge) => badge.progress >= 80 && badge.progress < 100)
      .sort((a, b) => b.progress - a.progress);

    if (nearCompletionBadges.length === 0) return null;

    const topBadge = nearCompletionBadges[0];
    const remainingProgress = 100 - topBadge.progress;

    const messages = [
      `素晴らしい！「${topBadge.badgeName}」バッジがもうすぐ完成じゃ！`,
      `あと${remainingProgress.toFixed(1)}%で「${topBadge.badgeName}」が獲得できるぞ！`,
      `最後の仕上げじゃ！「${topBadge.badgeName}」完成まであと少し！`,
    ];

    return {
      id: this.generateId(),
      character: 'king',
      message:
        this.getRandomMessage(messages) +
        `\n\nカテゴリ: ${topBadge.category}\n進捗: ${topBadge.progress.toFixed(1)}%`,
      timestamp: new Date(),
      type: 'celebration',
      actions: [
        {
          label: '完成を目指す',
          action: () => console.log('Focus on badge completion'),
        },
        {
          label: '他の近いバッジも見る',
          action: () => console.log('View other near completion badges'),
        },
      ],
    };
  }

  /**
   * サイト完成度メッセージ
   */
  private generateSiteCompletionMessage(developerStatus: DeveloperStatus): ChatMessage {
    let message = '';
    let character: ChatMessage['character'] = 'king';

    if (developerStatus.siteCompletion >= 90) {
      message = `素晴らしい！サイト完成度${developerStatus.siteCompletion}%とは、もうほぼ完成じゃ！\n\n最後の仕上げを頑張るのじゃ！リリースまであと少しぞ！`;
      character = 'king';
    } else if (developerStatus.siteCompletion >= 70) {
      message = `良いペースじゃ！完成度${developerStatus.siteCompletion}%まで来たな！\n\n残りの機能も着実に実装していこう！`;
      character = 'sage';
    } else if (developerStatus.siteCompletion >= 50) {
      message = `順調に進んでいるな！完成度${developerStatus.siteCompletion}%まで到達した！\n\nこの調子で開発を続けるのじゃ！`;
      character = 'merchant';
    } else {
      message = `開発はまだ始まったばかりじゃが、${developerStatus.siteCompletion}%の進捗は立派じゃ！\n\n一歩ずつ着実に進めていこう！`;
      character = 'guard';
    }

    return {
      id: this.generateId(),
      character,
      message,
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: '次の目標を設定',
          action: () => console.log('Set next goal'),
        },
        {
          label: '進捗を共有',
          action: () => console.log('Share progress'),
        },
      ],
    };
  }

  /**
   * 🏆 バッジステータスメッセージ
   */
  private generateBadgeStatusMessage(developerStatus: DeveloperStatus): ChatMessage {
    const badgeProgress = developerStatus.badgeProgress;

    if (!badgeProgress?.enabled) {
      return {
        id: this.generateId(),
        character: 'sage',
        message:
          'バッジシステムが無効になっているようじゃな。\n\n設定で有効にすれば、スキルの成長を可視化できるぞ！',
        timestamp: new Date(),
        type: 'development',
        actions: [
          {
            label: 'バッジを有効にする',
            action: () => console.log('Enable badges'),
          },
        ],
      };
    }

    const { overallBadgeProgress, totalBadges, completedBadges, relatedBadges } = badgeProgress;
    const completionRate = totalBadges > 0 ? (completedBadges / totalBadges) * 100 : 0;

    const inProgressBadges = relatedBadges.filter(
      (badge) => badge.progress > 0 && badge.progress < 100
    );
    const topCategories = Array.from(new Set(relatedBadges.map((b) => b.category)))
      .map((category) => ({
        category,
        count: relatedBadges.filter((b) => b.category === category).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const message =
      `バッジステータス報告じゃ！\n\n` +
      `🏆 獲得済み: ${completedBadges}/${totalBadges}個 (${completionRate.toFixed(1)}%)\n` +
      `📈 全体進捗: ${overallBadgeProgress}%\n` +
      `⚡ 進行中: ${inProgressBadges.length}個\n\n` +
      `主なカテゴリ:\n${topCategories.map((c) => `• ${c.category}: ${c.count}個`).join('\n')}\n\n` +
      `${overallBadgeProgress >= 70 ? '素晴らしい成長ぶりじゃ！' : 'コツコツと成長を続けよう！'}`;

    return {
      id: this.generateId(),
      character: 'architect',
      message,
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: '詳細を見る',
          action: () => console.log('View badge details'),
        },
        {
          label: '進捗を更新',
          action: () => console.log('Update progress'),
        },
      ],
    };
  }

  /**
   * 💡 バッジ推奨メッセージ
   */
  private generateBadgeRecommendationsMessage(developerStatus: DeveloperStatus): ChatMessage {
    const badgeProgress = developerStatus.badgeProgress;

    if (!badgeProgress?.enabled || badgeProgress.relatedBadges.length === 0) {
      return {
        id: this.generateId(),
        character: 'sage',
        message:
          'まずは開発タスクを進めて、バッジ獲得の基盤を作ろう！\n\nタスクを完了することで関連バッジが自動的に進捗するぞ！',
        timestamp: new Date(),
        type: 'development',
        actions: [
          {
            label: 'タスクを確認',
            action: () => console.log('Check tasks'),
          },
        ],
      };
    }

    const { relatedBadges } = badgeProgress;

    // 推奨バッジの選択ロジック
    const recommendedBadges = relatedBadges
      .filter((badge) => badge.progress >= 10 && badge.progress < 80) // 10-80%の範囲
      .sort((a, b) => b.progress - a.progress) // 進捗率が高い順
      .slice(0, 3);

    // 新しくチャレンジできるバッジ
    const newBadges = relatedBadges.filter((badge) => badge.progress === 0).slice(0, 2);

    let message = '今週のバッジ推奨プランを教えよう！\n\n';

    if (recommendedBadges.length > 0) {
      message += `🎯 継続推奨バッジ:\n`;
      recommendedBadges.forEach((badge) => {
        message += `• ${badge.badgeName} (${badge.progress.toFixed(1)}%) - あと少しじゃ！\n`;
      });
      message += '\n';
    }

    if (newBadges.length > 0) {
      message += `🆕 新チャレンジ:\n`;
      newBadges.forEach((badge) => {
        message += `• ${badge.badgeName} (${badge.category}) - 新しいスキルに挑戦！\n`;
      });
      message += '\n';
    }

    message += 'バランス良くスキルを伸ばしていこう！';

    return {
      id: this.generateId(),
      character: 'king',
      message,
      timestamp: new Date(),
      type: 'development',
      actions: [
        {
          label: '計画を立てる',
          action: () => console.log('Make plan'),
        },
        {
          label: '今すぐ始める',
          action: () => console.log('Start now'),
        },
      ],
    };
  }

  /**
   * AI応答生成のメインメソッド
   */
  static async generateResponse(
    actionType: string,
    context?: {
      userStatus?: {
        level?: number;
        totalAssets?: number;
        savingsRate?: number;
        questCompleted?: boolean;
        streakDays?: number;
      };
      lifeStatus?: LifeStatus;
    }
  ): Promise<DragonQuestResponse> {
    console.log(`🐉 Generating AI response for: ${actionType}`);

    try {
      // LifeSupportChatServiceのコンテキストに変換
      const aiContext: LifeSupportContext = {
        userStatus: context?.userStatus,
        lifeStatus: context?.lifeStatus
          ? {
              bankBalance: context.lifeStatus.bankBalance,
              hasJob: context.lifeStatus.hasJob,
              hasHome: context.lifeStatus.hasHome,
              healthStatus: context.lifeStatus.healthStatus,
              hasHealthInsurance: context.lifeStatus.hasHealthInsurance,
              anxietyLevel: context.lifeStatus.anxietyLevel,
              depressionLevel: context.lifeStatus.depressionLevel,
              socialSupport: context.lifeStatus.socialSupport,
            }
          : undefined,
        urgencyLevel: actionType === 'emergency-help' ? 'emergency' : 'normal',
      };

      // AI APIを呼び出してレスポンスを生成
      const aiResponse: AIResponse = await lifeSupportChatService.generateResponse(
        actionType,
        aiContext
      );

      // DragonQuestResponseに変換
      return this.convertAIResponseToDragonQuest(aiResponse, actionType);
    } catch (error) {
      console.error('AI response generation failed:', error);
      // フォールバックとして固定レスポンスを使用
      return this.generateFallbackResponse(actionType);
    }
  }

  /**
   * AI応答をDragonQuestレスポンスに変換
   */
  private static convertAIResponseToDragonQuest(
    aiResponse: AIResponse,
    actionType: string
  ): DragonQuestResponse {
    // キャラクターマッピング
    const characterMapping: Record<
      string,
      'king' | 'sage' | 'merchant' | 'guard' | 'architect' | 'tester'
    > = {
      king: 'king',
      sage: 'sage',
      merchant: 'merchant',
      guard: 'guard',
      architect: 'sage', // architect -> sage
      tester: 'sage', // tester -> sage
    };

    // タイプマッピング
    const typeMapping: Record<
      string,
      'advice' | 'mission' | 'celebration' | 'warning' | 'development' | 'technical'
    > = {
      advice: 'advice',
      mission: 'mission',
      celebration: 'celebration',
      warning: 'warning',
      development: 'development',
      technical: 'technical',
    };

    const character = characterMapping[aiResponse.character] || 'sage';
    const type = typeMapping[aiResponse.type] || 'advice';

    return {
      character,
      type,
      message: aiResponse.message,
      title: this.generateTitleForResponse(type, character),
      actions: aiResponse.actions || [],
      metadata: {
        confidence: aiResponse.confidence,
        source: aiResponse.source,
        timestamp: Date.now(),
        actionType,
      },
    };
  }

  /**
   * レスポンスタイトルの生成
   */
  private static generateTitleForResponse(
    type: 'advice' | 'mission' | 'celebration' | 'warning' | 'development' | 'technical',
    character: 'king' | 'sage' | 'merchant' | 'guard' | 'architect' | 'tester'
  ): string {
    const titles: Record<string, Record<string, string>> = {
      advice: {
        king: '👑 王様からのアドバイス',
        sage: '🧙‍♂️ 賢者の知恵',
        merchant: '💰 商人の実用アドバイス',
        guard: '🛡️ 衛兵の安全指導',
      },
      mission: {
        king: '👑 王様からの重要任務',
        sage: '🧙‍♂️ 賢者の導き',
        merchant: '💰 商人の取引提案',
        guard: '🛡️ 衛兵の警護任務',
      },
      celebration: {
        king: '👑 王様からの祝福',
        sage: '🧙‍♂️ 賢者の賞賛',
        merchant: '💰 商人の成功祝い',
        guard: '🛡️ 衛兵の栄誉',
      },
      warning: {
        king: '👑 王様からの警告',
        sage: '🧙‍♂️ 賢者の警告',
        merchant: '💰 商人の注意喚起',
        guard: '🛡️ 衛兵の緊急警報',
      },
      development: {
        king: '👑 王様の開発指令',
        sage: '🧙‍♂️ 賢者の技術指導',
        merchant: '💰 商人の事業計画',
        guard: '🛡️ 衛兵の作戦立案',
      },
      technical: {
        king: '👑 王様の技術諮問',
        sage: '🧙‍♂️ 賢者の技術解説',
        merchant: '💰 商人の技術投資',
        guard: '🛡️ 衛兵の技術訓練',
      },
    };

    return titles[type]?.[character] || '🤖 AIアシスタント';
  }

  /**
   * フォールバック応答の生成（AI API呼び出しに失敗した場合）
   */
  private static generateFallbackResponse(actionType: string): DragonQuestResponse {
    const fallbackResponses: Record<string, DragonQuestResponse> = {
      'life-support': {
        character: 'sage',
        type: 'advice',
        title: '🧙‍♂️ 賢者の知恵',
        message: `🤗 こんにちは！私は人生をサポートする賢者です。

まずは基本的なことから確認してみましょう：
1. 💰 銀行口座の残高を確認する
2. 🏠 安全な住む場所があるか確認する  
3. 🏥 健康保険に加入しているか確認する
4. 🍳 簡単な料理ができるか確認する

一つずつ、あなたのペースで進んでいきましょう！誰でも幸せに生きる権利があります。`,
        actions: [
          { label: '詳しく教えて', actionType: 'advice' },
          { label: '今日の計画', actionType: 'daily-plan' },
        ],
        metadata: {
          confidence: 0.5,
          source: 'fallback',
          timestamp: Date.now(),
          actionType,
        },
      },

      'daily-plan': {
        character: 'king',
        type: 'mission',
        title: '👑 王様からの重要任務',
        message: `🌅 今日の行動プランを一緒に立てましょう！

【朝の任務】
- 顔を洗って歯を磨く（5分）
- 水を一杯飲む（1分）

【昼の任務】  
- 銀行口座の残高を確認する（15分）
- このサイトに記録する（5分）

【夜の任務】
- 今日頑張ったことを思い出す（5分）
- 深呼吸を3回する（3分）

小さな一歩でも、着実に前進することが重要です！`,
        actions: [
          { label: 'できました！', actionType: 'celebration' },
          { label: 'もっと詳しく', actionType: 'advice' },
        ],
        metadata: {
          confidence: 0.5,
          source: 'fallback',
          timestamp: Date.now(),
          actionType,
        },
      },

      'emergency-help': {
        character: 'guard',
        type: 'warning',
        title: '🛡️ 衛兵の緊急警報',
        message: `🚨 緊急時のサポート情報です！

【生命に危険】🚑 119番 / 🚓 110番
【住居なし】🏛️ 市役所で「生活保護相談」
【お金なし】🏛️ 市役所の福祉窓口  
【心が辛い】📞 いのちの電話: 0570-783-556

あなたは一人じゃありません。必ず助けてくれる人がいます！
困った時は遠慮せずに助けを求めてください。`,
        actions: [
          { label: '市役所の場所', actionType: 'basic-needs' },
          { label: '心のケア', actionType: 'mental-health' },
        ],
        metadata: {
          confidence: 0.8,
          source: 'fallback',
          timestamp: Date.now(),
          actionType,
        },
      },

      'basic-needs': {
        character: 'sage',
        type: 'advice',
        title: '🧙‍♂️ 賢者の知恵',
        message: `🏠 基本的な生活ニーズを一緒に確認しましょう：

【住居】安全に眠れる場所はありますか？
【食事】毎日食べ物を確保できていますか？
【お金】生活費は足りていますか？
【健康】病気や怪我の心配はありませんか？
【スキル】基本的な生活スキルに困っていませんか？

一つでも「いいえ」があれば、一緒に解決策を考えましょう。`,
        actions: [
          { label: '住居について', actionType: 'advice' },
          { label: 'お金について', actionType: 'advice' },
          { label: 'スキルを学ぶ', actionType: 'skill-building' },
        ],
        metadata: {
          confidence: 0.6,
          source: 'fallback',
          timestamp: Date.now(),
          actionType,
        },
      },
    };

    return fallbackResponses[actionType] || fallbackResponses['life-support'];
  }

  // ... existing methods (generateLifeSupportAdvice, etc.) を削除または非推奨に
  // 以下は後方互換性のため残しておく

  /**
   * @deprecated Use generateResponse instead
   */
  static async generateLifeSupportAdvice(status: LifeStatus): Promise<DragonQuestResponse> {
    console.warn('generateLifeSupportAdvice is deprecated. Use generateResponse instead.');
    return this.generateResponse('life-support', { lifeStatus: status });
  }

  /**
   * @deprecated Use generateResponse instead
   */
  static async generateDailyActionPlan(status: LifeStatus): Promise<DragonQuestResponse> {
    console.warn('generateDailyActionPlan is deprecated. Use generateResponse instead.');
    return this.generateResponse('daily-plan', { lifeStatus: status });
  }

  /**
   * @deprecated Use generateResponse instead
   */
  static async generateEmergencyHelp(status: LifeStatus): Promise<DragonQuestResponse> {
    console.warn('generateEmergencyHelp is deprecated. Use generateResponse instead.');
    return this.generateResponse('emergency-help', { lifeStatus: status });
  }

  /**
   * @deprecated Use generateResponse instead
   */
  static async generateBasicNeedsCheck(status: LifeStatus): Promise<DragonQuestResponse> {
    console.warn('generateBasicNeedsCheck is deprecated. Use generateResponse instead.');
    return this.generateResponse('basic-needs', { lifeStatus: status });
  }

  /**
   * @deprecated Use generateResponse instead
   */
  static async generateMentalHealthSupport(status: LifeStatus): Promise<DragonQuestResponse> {
    console.warn('generateMentalHealthSupport is deprecated. Use generateResponse instead.');
    return this.generateResponse('mental-health', { lifeStatus: status });
  }

  /**
   * @deprecated Use generateResponse instead
   */
  static async generateSkillBuildingAdvice(status: LifeStatus): Promise<DragonQuestResponse> {
    console.warn('generateSkillBuildingAdvice is deprecated. Use generateResponse instead.');
    return this.generateResponse('skill-building', { lifeStatus: status });
  }
}

export { DragonQuestAIService };
export const dragonQuestAIService = new DragonQuestAIService();
