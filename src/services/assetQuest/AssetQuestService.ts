interface AssetQuestData {
  hero: {
    level: number;
    experience: number;
    experienceToNext: number;
    title: string;
    avatar: string;
    totalAssets: number;
  };
  currentMonth: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    target: number;
    daysRemaining: number;
  };
  questProgress: {
    monthlyQuestCompleted: boolean;
    streakDays: number;
    totalQuestsCompleted: number;
    currentReward: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
  }>;
}

class AssetQuestService {
  private questData: AssetQuestData | null = null;

  async getQuestData(): Promise<AssetQuestData> {
    // 実際の実装では、データベースからデータを取得
    if (!this.questData) {
      this.questData = this.generateSampleData();
    }
    return this.questData;
  }

  async updateMonthlyProgress(expenses: number): Promise<void> {
    if (!this.questData) return;

    const income = this.questData.currentMonth.income;
    const savings = income - expenses;
    const savingsRate = (savings / income) * 100;

    this.questData.currentMonth.expenses = expenses;
    this.questData.currentMonth.savings = savings;
    this.questData.currentMonth.savingsRate = savingsRate;

    // 目標達成チェック
    if (savings >= this.questData.currentMonth.target) {
      this.questData.questProgress.monthlyQuestCompleted = true;
      this.addExperience(this.questData.questProgress.currentReward);
    }
  }

  private addExperience(exp: number): void {
    if (!this.questData) return;

    this.questData.hero.experience += exp;

    // レベルアップチェック
    while (this.questData.hero.experience >= this.questData.hero.experienceToNext) {
      this.questData.hero.experience -= this.questData.hero.experienceToNext;
      this.questData.hero.level += 1;
      this.questData.hero.experienceToNext = this.calculateExpToNext(this.questData.hero.level);
      this.questData.hero.title = this.generateTitle(this.questData.hero.level);
    }
  }

  private calculateExpToNext(level: number): number {
    return Math.floor(1000 * Math.pow(1.2, level - 1));
  }

  private generateTitle(level: number): string {
    if (level >= 50) return '伝説の資産形成マスター';
    if (level >= 40) return '資産形成の王者';
    if (level >= 30) return '投資のチャンピオン';
    if (level >= 20) return '節約の戦士';
    if (level >= 10) return '家計管理の騎士';
    return '資産形成の見習い';
  }

  private generateSampleData(): AssetQuestData {
    return {
      hero: {
        level: 15,
        experience: 8500,
        experienceToNext: 2500,
        title: '家計管理の騎士',
        avatar: '🛡️',
        totalAssets: 2850000,
      },
      currentMonth: {
        income: 350000,
        expenses: 200000,
        savings: 150000,
        savingsRate: 42.9,
        target: 140000,
        daysRemaining: 15,
      },
      questProgress: {
        monthlyQuestCompleted: true,
        streakDays: 12,
        totalQuestsCompleted: 8,
        currentReward: 1000,
      },
      achievements: [
        {
          id: 'first-save',
          name: '初回貯蓄達成',
          description: '初めて月次貯蓄目標を達成',
          icon: '💰',
          unlocked: true,
          progress: 100,
        },
        {
          id: 'streak-week',
          name: '一週間継続',
          description: '7日間連続で予算内に収める',
          icon: '🔥',
          unlocked: true,
          progress: 100,
        },
        {
          id: 'million-assets',
          name: '資産100万達成',
          description: '総資産が100万円を突破',
          icon: '🏆',
          unlocked: true,
          progress: 100,
        },
        {
          id: 'investment-start',
          name: '投資デビュー',
          description: '初回投資を実行',
          icon: '📈',
          unlocked: false,
          progress: 75,
        },
      ],
    };
  }
}

export const assetQuestService = new AssetQuestService();
