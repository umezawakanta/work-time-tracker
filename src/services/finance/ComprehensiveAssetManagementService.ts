import { EventEmitter } from 'events';

// 口座情報型
interface Account {
  id: string;
  name: string;
  type: 'bank' | 'credit' | 'investment' | 'cash' | 'crypto' | 'loan' | 'insurance';
  subtype: string; // 普通預金、定期預金、投資信託等
  institution: string; // 金融機関名
  balance: number;
  currency: 'JPY' | 'USD' | 'EUR';

  // 連携情報
  isLinked: boolean;
  lastSynced?: Date;
  syncStatus: 'active' | 'error' | 'pending' | 'manual';

  // 設定
  includeInNetWorth: boolean;
  displayOrder: number;
  isActive: boolean;
  tags: string[];

  // メタデータ
  openDate?: Date;
  interestRate?: number;
  creditLimit?: number;
  minimumBalance?: number;
}

// 取引情報型
interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  amount: number; // 正数=収入、負数=支出
  description: string;

  // 分類情報
  category: string;
  subcategory: string;
  tags: string[];

  // 自動分類情報
  autoClassified: boolean;
  classificationConfidence: number; // 0-1
  merchantName?: string;
  location?: string;

  // 予算関連
  budgetCategory?: string;
  isRecurring: boolean;
  recurringRuleId?: string;

  // メタデータ
  memo?: string;
  attachments: string[];
  isVerified: boolean;

  // ADHD支援情報
  impulsePurchase?: boolean;
  emotionalState?: 'stressed' | 'happy' | 'anxious' | 'neutral';
  needsReview?: boolean;
}

// 予算型
interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;

  // 進捗情報
  spent: number;
  remaining: number;
  percentageUsed: number;

  // アラート設定
  alertThresholds: number[]; // [50, 80, 100] = 50%, 80%, 100%で通知
  alertsEnabled: boolean;

  // ADHD支援機能
  flexibleBudget: boolean; // 柔軟な予算（多少の超過許容）
  emergencyOverride: boolean; // 緊急時の予算オーバーライド

  // 分析
  historicalData: {
    period: string;
    budgeted: number;
    actual: number;
    variance: number;
  }[];
}

// 投資ポートフォリオ型
interface InvestmentPortfolio {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  realizedGain: number;

  holdings: {
    symbol: string;
    name: string;
    type: 'stock' | 'bond' | 'fund' | 'etf' | 'crypto' | 'reit';
    quantity: number;
    avgCost: number;
    currentPrice: number;
    marketValue: number;
    unrealizedGain: number;
    percentage: number; // ポートフォリオに占める割合

    // リスク情報
    riskLevel: 'low' | 'medium' | 'high';
    volatility: number;
    beta?: number;

    // 配当情報
    dividendYield?: number;
    lastDividend?: number;
    nextDividendDate?: Date;
  }[];

  // パフォーマンス
  performance: {
    period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
    return: number; // パーセンテージ
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }[];

  // 目標設定
  targetAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
    alternatives: number;
  };

  currentAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
    alternatives: number;
  };

  rebalanceRecommendations: {
    asset: string;
    action: 'buy' | 'sell';
    amount: number;
    reason: string;
  }[];
}

// 将来予測型
interface FinancialProjection {
  targetDate: Date;
  scenarios: {
    name: 'conservative' | 'moderate' | 'optimistic';
    probability: number;

    projections: {
      netWorth: number;
      liquidAssets: number;
      investmentValue: number;
      monthlyIncome: number;
      monthlyExpenses: number;
      savingsRate: number;
    };

    assumptions: {
      incomeGrowthRate: number;
      expenseInflationRate: number;
      investmentReturnRate: number;
      savingsRateChange: number;
    };

    milestones: {
      date: Date;
      description: string;
      amount: number;
      achieved: boolean;
    }[];
  }[];

  // リスク分析
  riskFactors: {
    factor: string;
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];

  // 推奨アクション
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: number;
    timeframe: string;
  }[];
}

// レポート型
interface FinancialReport {
  id: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;

  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    averageDailyExpense: number;

    // 比較データ
    previousPeriod: {
      income: number;
      expenses: number;
      savings: number;
      incomeChange: number;
      expenseChange: number;
    };
  };

  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
    avgTransactionAmount: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];

  insights: {
    type: 'spending-spike' | 'savings-opportunity' | 'budget-variance' | 'unusual-pattern';
    description: string;
    impact: number;
    recommendation: string;
  }[];

  // ADHD特化インサイト
  adhdInsights: {
    impulsePurchases: {
      total: number;
      averageAmount: number;
      frequentTriggers: string[];
      preventionStrategies: string[];
    };

    stressSpending: {
      correlationWithStress: number;
      averageStressSpending: number;
      healthierAlternatives: string[];
    };

    forgottenSubscriptions: {
      count: number;
      totalAmount: number;
      recommendations: string[];
    };
  };
}

class ComprehensiveAssetManagementService extends EventEmitter {
  private accounts: Map<string, Account> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private portfolios: Map<string, InvestmentPortfolio> = new Map();
  private categories: Map<string, any> = new Map();

  // 自動分類AI
  private classificationRules: Map<string, any> = new Map();
  private learningData: any[] = [];

  // 市場データ（模擬）
  private marketData: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeService();
  }

  /**
   * サービス初期化
   */
  private async initializeService(): Promise<void> {
    try {
      await this.loadData();
      this.initializeCategories();
      this.initializeClassificationRules();
      this.startMarketDataUpdates();

      console.log('💰 包括的資産管理サービス初期化完了');
      this.emit('service-initialized');
    } catch (error) {
      console.error('資産管理サービス初期化エラー:', error);
    }
  }

  /**
   * データ読み込み
   */
  private async loadData(): Promise<void> {
    // ローカルストレージからデータを読み込み
    const stored = {
      accounts: localStorage.getItem('asset-management-accounts'),
      transactions: localStorage.getItem('asset-management-transactions'),
      budgets: localStorage.getItem('asset-management-budgets'),
      portfolios: localStorage.getItem('asset-management-portfolios'),
    };

    if (stored.accounts) {
      const accounts = JSON.parse(stored.accounts);
      accounts.forEach((account: Account) => {
        this.accounts.set(account.id, account);
      });
    }

    if (stored.transactions) {
      const transactions = JSON.parse(stored.transactions);
      transactions.forEach((transaction: Transaction) => {
        transaction.date = new Date(transaction.date);
        this.transactions.set(transaction.id, transaction);
      });
    }

    if (stored.budgets) {
      const budgets = JSON.parse(stored.budgets);
      budgets.forEach((budget: Budget) => {
        budget.startDate = new Date(budget.startDate);
        budget.endDate = new Date(budget.endDate);
        this.budgets.set(budget.id, budget);
      });
    }

    if (stored.portfolios) {
      const portfolios = JSON.parse(stored.portfolios);
      portfolios.forEach((portfolio: InvestmentPortfolio) => {
        this.portfolios.set(portfolio.id, portfolio);
      });
    }

    // デモデータがない場合は作成
    if (this.accounts.size === 0) {
      this.createDemoData();
    }
  }

  /**
   * カテゴリ初期化
   */
  private initializeCategories(): void {
    const defaultCategories = {
      食費: {
        subcategories: ['食材', '外食', 'コンビニ', 'お弁当', 'デリバリー'],
        budget: true,
        essential: true,
      },
      住居費: {
        subcategories: ['家賃', '住宅ローン', '管理費', '光熱費', '通信費'],
        budget: true,
        essential: true,
      },
      交通費: {
        subcategories: ['電車', 'バス', 'タクシー', 'ガソリン', '駐車場'],
        budget: true,
        essential: false,
      },
      娯楽費: {
        subcategories: ['映画', 'ゲーム', '本', '旅行', 'スポーツ'],
        budget: true,
        essential: false,
      },
      衣類: {
        subcategories: ['服', '靴', 'アクセサリー', 'クリーニング'],
        budget: true,
        essential: false,
      },
      医療費: {
        subcategories: ['病院', '薬局', '健康保険', 'サプリメント'],
        budget: true,
        essential: true,
      },
      教育費: {
        subcategories: ['学費', '書籍', 'セミナー', 'オンライン講座'],
        budget: true,
        essential: false,
      },
      投資: {
        subcategories: ['株式', '投資信託', '債券', '仮想通貨'],
        budget: false,
        essential: false,
      },
      収入: {
        subcategories: ['給与', 'ボーナス', '副業', '投資収益', 'その他'],
        budget: false,
        essential: false,
      },
    };

    Object.entries(defaultCategories).forEach(([category, config]) => {
      this.categories.set(category, config);
    });
  }

  /**
   * 自動分類ルール初期化
   */
  private initializeClassificationRules(): void {
    const rules = [
      {
        pattern: /コンビニ|セブン|ローソン|ファミマ/i,
        category: '食費',
        subcategory: 'コンビニ',
        confidence: 0.9,
      },
      {
        pattern: /スーパー|イオン|西友|ライフ/i,
        category: '食費',
        subcategory: '食材',
        confidence: 0.9,
      },
      {
        pattern: /電気|ガス|水道|NTT|ソフトバンク|au/i,
        category: '住居費',
        subcategory: '光熱費',
        confidence: 0.95,
      },
      {
        pattern: /JR|私鉄|メトロ|都営|バス/i,
        category: '交通費',
        subcategory: '電車',
        confidence: 0.9,
      },
      {
        pattern: /Amazon|楽天|ヤフー|メルカリ/i,
        category: '娯楽費',
        subcategory: 'ネットショッピング',
        confidence: 0.7,
      },
      {
        pattern: /病院|クリニック|薬局|ドラッグ/i,
        category: '医療費',
        subcategory: '病院',
        confidence: 0.9,
      },
    ];

    rules.forEach((rule, index) => {
      this.classificationRules.set(index.toString(), rule);
    });
  }

  /**
   * 市場データ更新開始
   */
  private startMarketDataUpdates(): void {
    // 模擬的な市場データ更新
    setInterval(
      () => {
        this.updateMarketData();
      },
      5 * 60 * 1000
    ); // 5分ごと
  }

  /**
   * 口座追加
   */
  public async addAccount(accountData: Partial<Account>): Promise<string> {
    const accountId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const account: Account = {
      id: accountId,
      name: accountData.name || '新しい口座',
      type: accountData.type || 'bank',
      subtype: accountData.subtype || '',
      institution: accountData.institution || '',
      balance: accountData.balance || 0,
      currency: accountData.currency || 'JPY',
      isLinked: accountData.isLinked || false,
      syncStatus: accountData.syncStatus || 'manual',
      includeInNetWorth: accountData.includeInNetWorth ?? true,
      displayOrder: accountData.displayOrder || this.accounts.size,
      isActive: accountData.isActive ?? true,
      tags: accountData.tags || [],
      ...accountData,
    };

    this.accounts.set(accountId, account);
    this.saveData();

    this.emit('account-added', account);
    console.log('口座追加:', account.name);

    return accountId;
  }

  /**
   * 取引記録追加
   */
  public async addTransaction(transactionData: Partial<Transaction>): Promise<string> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 自動分類実行
    const classification = this.classifyTransaction(transactionData.description || '');

    const transaction: Transaction = {
      id: transactionId,
      accountId: transactionData.accountId || '',
      date: transactionData.date || new Date(),
      amount: transactionData.amount || 0,
      description: transactionData.description || '',
      category: transactionData.category || classification.category,
      subcategory: transactionData.subcategory || classification.subcategory,
      tags: transactionData.tags || [],
      autoClassified: !transactionData.category, // カテゴリが手動設定されていない場合
      classificationConfidence: classification.confidence,
      isRecurring: transactionData.isRecurring || false,
      attachments: transactionData.attachments || [],
      isVerified: transactionData.isVerified || false,
      ...transactionData,
    };

    this.transactions.set(transactionId, transaction);

    // 口座残高更新
    if (transaction.accountId) {
      // Account balance update would be implemented here
      console.log('Account balance update needed:', transaction.accountId, transaction.amount);
    }

    // 予算更新
    this.updateBudgetProgress(transaction);

    // ADHD支援：衝動購入検出
    this.detectImpulsePurchase(transaction);

    this.saveData();
    this.emit('transaction-added', transaction);

    return transactionId;
  }

  /**
   * 取引自動分類
   */
  private classifyTransaction(description: string): {
    category: string;
    subcategory: string;
    confidence: number;
  } {
    let bestMatch = {
      category: 'その他',
      subcategory: 'その他',
      confidence: 0.1,
    };

    for (const [, rule] of this.classificationRules) {
      if (rule.pattern.test(description)) {
        if (rule.confidence > bestMatch.confidence) {
          bestMatch = {
            category: rule.category,
            subcategory: rule.subcategory,
            confidence: rule.confidence,
          };
        }
      }
    }

    // 機械学習による分類改善（簡易版）
    this.improveClassification(description, bestMatch);

    return bestMatch;
  }

  /**
   * 機械学習による分類改善
   */
  private improveClassification(description: string, classification: any): void {
    // ユーザーの修正データから学習
    this.learningData.push({
      description,
      classification,
      timestamp: new Date(),
    });

    // 学習データが一定数たまったら分析
    if (this.learningData.length > 50) {
      this.updateClassificationRules();
    }
  }

  /**
   * 分類ルール更新
   */
  private updateClassificationRules(): void {
    // 簡易的な頻度分析
    const patterns = new Map<string, { category: string; count: number }>();

    this.learningData.forEach((data) => {
      const words = data.description.toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 2) {
          const key = word;
          const existing = patterns.get(key) || {
            category: data.classification.category,
            count: 0,
          };
          existing.count++;
          patterns.set(key, existing);
        }
      });
    });

    // 新しいルールを生成
    patterns.forEach((value, key) => {
      if (value.count >= 3) {
        // 3回以上出現したパターン
        const ruleId = `learned_${key}`;
        this.classificationRules.set(ruleId, {
          pattern: new RegExp(key, 'i'),
          category: value.category,
          subcategory: 'その他',
          confidence: Math.min(0.8, value.count / 10),
        });
      }
    });
  }

  /**
   * 予算作成
   */
  public async createBudget(budgetData: Partial<Budget>): Promise<string> {
    const budgetId = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const budget: Budget = {
      id: budgetId,
      name: budgetData.name || '新しい予算',
      category: budgetData.category || '',
      amount: budgetData.amount || 0,
      period: budgetData.period || 'monthly',
      startDate: budgetData.startDate || new Date(),
      endDate: budgetData.endDate || new Date(),
      spent: 0,
      remaining: budgetData.amount || 0,
      percentageUsed: 0,
      alertThresholds: budgetData.alertThresholds || [50, 80, 100],
      alertsEnabled: budgetData.alertsEnabled ?? true,
      flexibleBudget: budgetData.flexibleBudget || false,
      emergencyOverride: budgetData.emergencyOverride || false,
      historicalData: [],
      ...budgetData,
    };

    this.budgets.set(budgetId, budget);
    this.saveData();

    this.emit('budget-created', budget);
    return budgetId;
  }

  /**
   * 予算進捗更新
   */
  private updateBudgetProgress(transaction: Transaction): void {
    // 該当する予算を見つけて更新
    for (const [, budget] of this.budgets) {
      if (budget.category === transaction.category && transaction.amount < 0) {
        budget.spent += Math.abs(transaction.amount);
        budget.remaining = Math.max(0, budget.amount - budget.spent);
        budget.percentageUsed = (budget.spent / budget.amount) * 100;

        // アラートチェック
        this.checkBudgetAlerts(budget);
      }
    }
  }

  /**
   * 予算アラートチェック
   */
  private checkBudgetAlerts(budget: Budget): void {
    if (!budget.alertsEnabled) return;

    budget.alertThresholds.forEach((threshold) => {
      if (budget.percentageUsed >= threshold && budget.percentageUsed < threshold + 5) {
        this.emit('budget-alert', {
          budgetId: budget.id,
          budgetName: budget.name,
          threshold,
          currentUsage: budget.percentageUsed,
          remaining: budget.remaining,
        });
      }
    });
  }

  /**
   * 衝動購入検出
   */
  private detectImpulsePurchase(transaction: Transaction): void {
    // ADHD支援：衝動購入パターンの検出
    const suspiciousPatterns = [
      transaction.amount < -5000, // 高額支出
      transaction.description.includes('Amazon') && transaction.amount < -1000,
      transaction.date.getHours() >= 22 || transaction.date.getHours() <= 6, // 深夜・早朝
    ];

    const suspicionScore = suspiciousPatterns.filter(Boolean).length;

    if (suspicionScore >= 2) {
      transaction.impulsePurchase = true;
      transaction.needsReview = true;

      this.emit('impulse-purchase-detected', {
        transactionId: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        suspicionScore,
      });
    }
  }

  /**
   * 投資ポートフォリオ分析
   */
  public async analyzePortfolio(portfolioId: string): Promise<any> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) throw new Error('ポートフォリオが見つかりません');

    // リバランス推奨の計算
    const rebalanceRecommendations = this.calculateRebalanceRecommendations(portfolio);

    // リスク分析
    const riskAnalysis = this.calculatePortfolioRisk(portfolio);

    // パフォーマンス分析
    const performance = { totalReturn: 0, annualizedReturn: 0, volatility: 0 }; // Simplified implementation

    return {
      rebalanceRecommendations,
      riskAnalysis,
      performance,
      diversificationScore: 7.5, // Simplified implementation
      suggestions: ['分散投資を検討してください', '定期的なリバランスをお勧めします'], // Simplified implementation
    };
  }

  /**
   * リバランス推奨計算
   */
  private calculateRebalanceRecommendations(portfolio: InvestmentPortfolio): string[] {
    const recommendations: string[] = [];
    const { targetAllocation, currentAllocation } = portfolio;

    Object.entries(targetAllocation).forEach(([asset, target]) => {
      const current = (currentAllocation as any)[asset];
      const difference = target - current;

      if (Math.abs(difference) > 5) {
        // 5%以上の差がある場合
        const action = difference > 0 ? '購入' : '売却';
        const amount = Math.abs((difference * portfolio.totalValue) / 100);
        recommendations.push(
          `${asset}: ${action}推奨 ${amount.toLocaleString()}円 (目標比率${target}%に対して現在${current.toFixed(1)}%)`
        );
      }
    });

    return recommendations;
  }

  /**
   * ポートフォリオリスク計算
   */
  private calculatePortfolioRisk(portfolio: InvestmentPortfolio): any {
    const weightedVolatility = portfolio.holdings.reduce((sum, holding) => {
      return sum + (holding.percentage / 100) * holding.volatility;
    }, 0);

    return {
      overallRisk: weightedVolatility > 20 ? 'high' : weightedVolatility > 10 ? 'medium' : 'low',
      volatility: weightedVolatility,
      riskFactors: portfolio.holdings
        .filter((h) => h.riskLevel === 'high')
        .map((h) => ({ name: h.name, percentage: h.percentage })),
    };
  }

  /**
   * 将来予測生成
   */
  public async generateFinancialProjection(
    targetDate: Date,
    currentAge: number,
    retirementAge: number = 65
  ): Promise<FinancialProjection> {
    const yearsToTarget =
      (targetDate.getTime() - new Date().getTime()) / (365 * 24 * 60 * 60 * 1000);

    // 現在の財務状況取得
    const currentNetWorth = this.calculateNetWorth();
    const monthlyIncome = this.calculateAverageMonthlyIncome();
    const monthlyExpenses = this.calculateAverageMonthlyExpenses();
    const currentSavingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;

    const scenarios = [
      {
        name: 'conservative' as const,
        probability: 0.3,
        projections: this.calculateProjection(yearsToTarget, currentNetWorth, {
          incomeGrowthRate: 0.02, // 2%
          expenseInflationRate: 0.03, // 3%
          investmentReturnRate: 0.04, // 4%
          savingsRateChange: 0,
        }),
        assumptions: {
          incomeGrowthRate: 0.02,
          expenseInflationRate: 0.03,
          investmentReturnRate: 0.04,
          savingsRateChange: 0,
        },
        milestones: this.generateMilestones(yearsToTarget, 'conservative'),
      },
      {
        name: 'moderate' as const,
        probability: 0.5,
        projections: this.calculateProjection(yearsToTarget, currentNetWorth, {
          incomeGrowthRate: 0.03,
          expenseInflationRate: 0.025,
          investmentReturnRate: 0.06,
          savingsRateChange: 0.02,
        }),
        assumptions: {
          incomeGrowthRate: 0.03,
          expenseInflationRate: 0.025,
          investmentReturnRate: 0.06,
          savingsRateChange: 0.02,
        },
        milestones: this.generateMilestones(yearsToTarget, 'moderate'),
      },
      {
        name: 'optimistic' as const,
        probability: 0.2,
        projections: this.calculateProjection(yearsToTarget, currentNetWorth, {
          incomeGrowthRate: 0.05,
          expenseInflationRate: 0.02,
          investmentReturnRate: 0.08,
          savingsRateChange: 0.05,
        }),
        assumptions: {
          incomeGrowthRate: 0.05,
          expenseInflationRate: 0.02,
          investmentReturnRate: 0.08,
          savingsRateChange: 0.05,
        },
        milestones: this.generateMilestones(yearsToTarget, 'optimistic'),
      },
    ];

    return {
      targetDate,
      scenarios,
      riskFactors: [
        {
          factor: '経済危機',
          impact: 'high',
          mitigation: '多様化された投資ポートフォリオの維持',
        },
        {
          factor: '健康問題',
          impact: 'medium',
          mitigation: '緊急資金の確保と医療保険の充実',
        },
        {
          factor: '転職・収入減',
          impact: 'medium',
          mitigation: 'スキルアップと複数収入源の確保',
        },
      ],
      recommendations: [
        {
          priority: 'high',
          action: '緊急資金を月支出の6ヶ月分まで増額',
          expectedImpact: 50000,
          timeframe: '6ヶ月',
        },
        {
          priority: 'medium',
          action: '投資比率を現在の30%から40%に増加',
          expectedImpact: 200000,
          timeframe: '1年',
        },
      ],
    };
  }

  /**
   * ユーティリティメソッド群
   */
  private calculateNetWorth(): number {
    let netWorth = 0;
    for (const [, account] of this.accounts) {
      if (account.includeInNetWorth && account.isActive) {
        netWorth += account.type === 'loan' ? -account.balance : account.balance;
      }
    }
    return netWorth;
  }

  private calculateAverageMonthlyIncome(): number {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const incomeTransactions = Array.from(this.transactions.values()).filter(
      (t) => t.date >= oneMonthAgo && t.amount > 0
    );

    return incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateAverageMonthlyExpenses(): number {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const expenseTransactions = Array.from(this.transactions.values()).filter(
      (t) => t.date >= oneMonthAgo && t.amount < 0
    );

    return Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));
  }

  private calculateProjection(years: number, currentNetWorth: number, assumptions: any): any {
    const monthlyIncome = this.calculateAverageMonthlyIncome();
    const monthlyExpenses = this.calculateAverageMonthlyExpenses();

    let projectedIncome = monthlyIncome;
    let projectedExpenses = monthlyExpenses;
    let projectedNetWorth = currentNetWorth;

    for (let year = 1; year <= years; year++) {
      projectedIncome *= 1 + assumptions.incomeGrowthRate;
      projectedExpenses *= 1 + assumptions.expenseInflationRate;

      const annualSavings = (projectedIncome - projectedExpenses) * 12;
      projectedNetWorth =
        projectedNetWorth * (1 + assumptions.investmentReturnRate) + annualSavings;
    }

    return {
      netWorth: projectedNetWorth,
      liquidAssets: projectedNetWorth * 0.3, // 仮定
      investmentValue: projectedNetWorth * 0.6, // 仮定
      monthlyIncome: projectedIncome,
      monthlyExpenses: projectedExpenses,
      savingsRate: ((projectedIncome - projectedExpenses) / projectedIncome) * 100,
    };
  }

  private generateMilestones(years: number, scenario: string): any[] {
    const milestones = [
      { years: 1, description: '緊急資金確保', baseAmount: 300000 },
      { years: 3, description: '投資ポートフォリオ構築', baseAmount: 1000000 },
      { years: 5, description: '中期目標達成', baseAmount: 3000000 },
      { years: 10, description: '住宅購入資金', baseAmount: 10000000 },
    ];

    const multiplier = scenario === 'conservative' ? 0.8 : scenario === 'optimistic' ? 1.2 : 1.0;

    return milestones
      .filter((m) => m.years <= years)
      .map((m) => ({
        date: new Date(Date.now() + m.years * 365 * 24 * 60 * 60 * 1000),
        description: m.description,
        amount: m.baseAmount * multiplier,
        achieved: false,
      }));
  }

  /**
   * データ永続化
   */
  private saveData(): void {
    try {
      localStorage.setItem(
        'asset-management-accounts',
        JSON.stringify(Array.from(this.accounts.values()))
      );
      localStorage.setItem(
        'asset-management-transactions',
        JSON.stringify(Array.from(this.transactions.values()))
      );
      localStorage.setItem(
        'asset-management-budgets',
        JSON.stringify(Array.from(this.budgets.values()))
      );
      localStorage.setItem(
        'asset-management-portfolios',
        JSON.stringify(Array.from(this.portfolios.values()))
      );
    } catch (error) {
      console.error('データ保存エラー:', error);
    }
  }

  /**
   * デモデータ作成
   */
  private createDemoData(): void {
    // デモ口座作成
    this.addAccount({
      name: 'メイン口座（UFJ銀行）',
      type: 'bank',
      subtype: '普通預金',
      institution: '三菱UFJ銀行',
      balance: 450000,
      includeInNetWorth: true,
    });

    this.addAccount({
      name: 'クレジットカード',
      type: 'credit',
      subtype: 'VISA',
      institution: '楽天カード',
      balance: -23000,
      creditLimit: 500000,
      includeInNetWorth: true,
    });

    // デモ取引作成
    const demoTransactions = [
      { description: 'コンビニ セブンイレブン', amount: -800, category: '食費' },
      { description: 'スーパー イオン', amount: -3200, category: '食費' },
      { description: 'JR東日本', amount: -340, category: '交通費' },
      { description: '給与', amount: 280000, category: '収入' },
      { description: 'Amazon', amount: -1500, category: '娯楽費' },
    ];

    demoTransactions.forEach((txn) => {
      this.addTransaction({
        accountId: Array.from(this.accounts.keys())[0],
        ...txn,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    });

    // デモ予算作成
    this.createBudget({
      name: '食費予算',
      category: '食費',
      amount: 50000,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });
  }

  /**
   * 市場データ更新（模擬）
   */
  private updateMarketData(): void {
    // 模擬的な株価更新
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NFLX'];
    symbols.forEach((symbol) => {
      const currentPrice = this.marketData.get(symbol)?.price || 100;
      const volatility = 0.02; // 2%の変動
      const change = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = currentPrice * (1 + change);

      this.marketData.set(symbol, {
        symbol,
        price: newPrice,
        change: change * 100,
        timestamp: new Date(),
      });
    });

    this.emit('market-data-updated', Array.from(this.marketData.values()));
  }

  /**
   * パブリックAPI
   */
  public getAccounts(): Account[] {
    return Array.from(this.accounts.values()).filter((a) => a.isActive);
  }

  public getTransactions(limit?: number): Transaction[] {
    const transactions = Array.from(this.transactions.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    return limit ? transactions.slice(0, limit) : transactions;
  }

  public getBudgets(): Budget[] {
    return Array.from(this.budgets.values());
  }

  public getPortfolios(): InvestmentPortfolio[] {
    return Array.from(this.portfolios.values());
  }

  public getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  public async generateMonthlyReport(): Promise<FinancialReport> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = this.getTransactions().filter(
      (t) => t.date >= startOfMonth && t.date <= endOfMonth
    );

    const totalIncome = monthlyTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(
      monthlyTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
    );

    // カテゴリ別分析
    const categoryBreakdown = this.analyzeCategoryBreakdown(monthlyTransactions);

    // ADHD特化インサイト
    const adhdInsights = this.generateADHDInsights(monthlyTransactions);

    return {
      id: `report_${Date.now()}`,
      type: 'monthly',
      period: { start: startOfMonth, end: endOfMonth },
      generatedAt: new Date(),
      summary: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        savingsRate: ((totalIncome - totalExpenses) / totalIncome) * 100,
        averageDailyExpense: totalExpenses / now.getDate(),
        previousPeriod: {
          income: 0, // TODO: 前月データと比較
          expenses: 0,
          savings: 0,
          incomeChange: 0,
          expenseChange: 0,
        },
      },
      categoryBreakdown,
      insights: [],
      adhdInsights,
    };
  }

  private analyzeCategoryBreakdown(transactions: Transaction[]): any[] {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
        existing.amount += Math.abs(t.amount);
        existing.count++;
        categoryMap.set(t.category, existing);
      });

    const totalExpenses = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: (data.amount / totalExpenses) * 100,
      transactionCount: data.count,
      avgTransactionAmount: data.amount / data.count,
      trend: 'stable', // TODO: 前月比較
    }));
  }

  private generateADHDInsights(transactions: Transaction[]): any {
    const impulsePurchases = transactions.filter((t) => t.impulsePurchase);
    const stressSpendingTransactions = transactions.filter((t) => t.emotionalState === 'stressed');

    return {
      impulsePurchases: {
        total: impulsePurchases.length,
        averageAmount:
          impulsePurchases.length > 0
            ? impulsePurchases.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
              impulsePurchases.length
            : 0,
        frequentTriggers: ['深夜時間帯', 'オンラインショッピング', 'ストレス状態'],
        preventionStrategies: [
          '24時間待機ルールの導入',
          '予算アラートの設定',
          'ストレス時の代替行動計画',
        ],
      },
      stressSpending: {
        correlationWithStress: 0.7, // TODO: 実際の相関計算
        averageStressSpending:
          stressSpendingTransactions.length > 0
            ? stressSpendingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
              stressSpendingTransactions.length
            : 0,
        healthierAlternatives: ['散歩', '深呼吸', '友人との通話', '音楽鑑賞'],
      },
      forgottenSubscriptions: {
        count: 2, // TODO: 実際の検出
        totalAmount: 3000,
        recommendations: ['定期的なサブスクリプション見直し', '自動アラート設定'],
      },
    };
  }

  public stop(): void {
    this.removeAllListeners();
    console.log('🛑 包括的資産管理サービス停止');
  }
}

// シングルトンインスタンス
const comprehensiveAssetManagementService = new ComprehensiveAssetManagementService();

export default comprehensiveAssetManagementService;
export { ComprehensiveAssetManagementService };
export type {
  Account,
  Transaction,
  Budget,
  InvestmentPortfolio,
  FinancialProjection,
  FinancialReport,
};
