/**
 * 🤗 ライフサポートAIサービス
 * 知能指数に関係なく、誰でも幸せな人生を送れるようサポートするAIシステム
 */

export interface LifeStatus {
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

export interface LifeAdvice {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category:
    | 'basic_needs'
    | 'financial'
    | 'health'
    | 'social'
    | 'skills'
    | 'mental_health'
    | 'goals';
  title: string;
  description: string;
  stepByStepGuide: string[];
  resources: {
    name: string;
    url?: string;
    phoneNumber?: string;
    description: string;
  }[];
  estimatedTime: string;
  difficulty: 'very_easy' | 'easy' | 'medium' | 'hard';
  benefits: string[];
  encouragement: string;
}

export interface DailyActionPlan {
  date: string;
  morning: LifeAdvice[];
  afternoon: LifeAdvice[];
  evening: LifeAdvice[];
  motivation: string;
  celebration: string;
}

class LifeSupportAIService {
  private static instance: LifeSupportAIService | null = null;

  public static getInstance(): LifeSupportAIService {
    if (!LifeSupportAIService.instance) {
      LifeSupportAIService.instance = new LifeSupportAIService();
    }
    return LifeSupportAIService.instance;
  }

  /**
   * 🎯 今すぐやるべきことを分析・提案
   */
  public async getImmediateActions(status: LifeStatus): Promise<LifeAdvice[]> {
    const actions: LifeAdvice[] = [];

    // 基本的な生存ニーズを最優先でチェック
    if (status.hasHome === false) {
      actions.push(this.createHomelessSupport());
    }

    if (status.bankBalance !== undefined && status.bankBalance < 1000) {
      actions.push(this.createEmergencyFinancialAdvice());
    }

    if (status.healthStatus === 'poor') {
      actions.push(this.createHealthEmergencyAdvice());
    }

    // 毎日の基本的なケア
    actions.push(this.createDailyBasicCare());

    // 金銭管理
    if (status.bankBalance === undefined) {
      actions.push(this.createBankBalanceCheckAdvice());
    }

    // 社会保障・サポート
    if (!status.hasHealthInsurance) {
      actions.push(this.createHealthInsuranceAdvice());
    }

    // スキル向上
    if (!status.basicSkills?.canCook) {
      actions.push(this.createCookingSkillAdvice());
    }

    // メンタルヘルス
    if (status.depressionLevel === 'high' || status.anxietyLevel === 'high') {
      actions.push(this.createMentalHealthSupport());
    }

    return actions.sort(
      (a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority)
    );
  }

  /**
   * 🌅 今日の行動プランを作成
   */
  public async createDailyActionPlan(status: LifeStatus): Promise<DailyActionPlan> {
    const immediateActions = await this.getImmediateActions(status);
    const today = new Date().toISOString().split('T')[0];

    // 優先度と時間帯に基づいてアクションを配分
    const morning = immediateActions
      .filter(
        (a) =>
          ['urgent', 'high'].includes(a.priority) && ['basic_needs', 'health'].includes(a.category)
      )
      .slice(0, 2);

    const afternoon = immediateActions
      .filter((a) => ['financial', 'skills', 'social'].includes(a.category))
      .slice(0, 2);

    const evening = immediateActions
      .filter((a) => ['mental_health', 'goals'].includes(a.category))
      .slice(0, 2);

    return {
      date: today,
      morning,
      afternoon,
      evening,
      motivation: this.generateMotivation(status),
      celebration: this.generateCelebration(status),
    };
  }

  /**
   * 🏦 銀行口座残高確認のアドバイス
   */
  private createBankBalanceCheckAdvice(): LifeAdvice {
    return {
      id: 'bank-balance-check',
      priority: 'high',
      category: 'financial',
      title: '💰 銀行口座の残高を確認しましょう',
      description:
        'お金の管理の第一歩は、今いくら持っているかを知ることです。一緒に確認してみましょう。',
      stepByStepGuide: [
        '1. 銀行のキャッシュカードを用意します',
        '2. 近くのコンビニ（セブンイレブン、ローソン、ファミマ）のATMに行きます',
        '3. カードを入れて、「残高照会」を選択します',
        '4. 暗証番号（4桁の数字）を入力します',
        '5. 表示された金額をメモまたは写真に撮ります',
        '6. このサイトの「資産管理」ページに金額を登録します',
      ],
      resources: [
        {
          name: 'セブンイレブンATM検索',
          url: 'https://www.sej.co.jp/shop/',
          description: '最寄りのセブンイレブンを見つけられます',
        },
        {
          name: 'ローソンATM検索',
          url: 'https://www.lawson.co.jp/shop/',
          description: '最寄りのローソンを見つけられます',
        },
      ],
      estimatedTime: '15分',
      difficulty: 'very_easy',
      benefits: [
        '自分のお金の状況が分かります',
        '計画的にお金を使えるようになります',
        '安心感が得られます',
      ],
      encouragement: '大丈夫です！一歩ずつ進めば必ずできます。あなたは素晴らしいです！',
    };
  }

  /**
   * 🏠 ホームレス支援のアドバイス
   */
  private createHomelessSupport(): LifeAdvice {
    return {
      id: 'homeless-support',
      priority: 'urgent',
      category: 'basic_needs',
      title: '🏠 安全な場所を確保しましょう',
      description: '今すぐ安全で温かい場所を見つけることが最優先です。助けてくれる人たちがいます。',
      stepByStepGuide: [
        '1. 今すぐ最寄りの市役所・区役所に行ってください',
        '2. 「生活保護の相談をしたい」と受付で伝えてください',
        '3. 担当者が詳しく話を聞いてくれます',
        '4. 一時的な宿泊場所を紹介してもらえます',
        '5. 今後の生活支援について相談できます',
      ],
      resources: [
        {
          name: '全国の市役所検索',
          url: 'https://www.city.jp/',
          description: '最寄りの市役所を検索できます',
        },
        {
          name: '生活保護ホットライン',
          phoneNumber: '0120-919-024',
          description: '24時間相談可能な無料電話相談',
        },
        {
          name: 'ホームレス自立支援センター',
          phoneNumber: '03-3866-0945',
          description: '専門スタッフが支援してくれます',
        },
      ],
      estimatedTime: '2-3時間',
      difficulty: 'easy',
      benefits: [
        '安全で温かい場所で眠れます',
        '専門スタッフのサポートを受けられます',
        '今後の生活再建の第一歩になります',
      ],
      encouragement:
        'あなたは一人じゃありません。必ず助けてくれる人がいます。勇気を出して行動してください！',
    };
  }

  /**
   * 💊 健康緊急事態のアドバイス
   */
  private createHealthEmergencyAdvice(): LifeAdvice {
    return {
      id: 'health-emergency',
      priority: 'urgent',
      category: 'health',
      title: '🏥 すぐに病院に行きましょう',
      description: '体調が悪い時は我慢してはいけません。専門家に診てもらうことが大切です。',
      stepByStepGuide: [
        '1. 症状が重い場合は救急車（119番）を呼んでください',
        '2. 歩ける場合は近くの病院に行ってください',
        '3. 保険証がない場合でも診てもらえるので心配いりません',
        '4. 症状を詳しく説明してください',
        '5. 薬をもらったら必ず指示通りに飲んでください',
      ],
      resources: [
        {
          name: '救急車',
          phoneNumber: '119',
          description: '緊急時はためらわず呼んでください',
        },
        {
          name: '病院検索',
          url: 'https://www.hospital.ne.jp/',
          description: '近くの病院を検索できます',
        },
        {
          name: '健康相談ダイヤル',
          phoneNumber: '#8000',
          description: '夜間・休日の健康相談',
        },
      ],
      estimatedTime: '1-3時間',
      difficulty: 'easy',
      benefits: ['体調が改善します', '病気の早期発見・治療ができます', '安心して生活できます'],
      encouragement: '健康は何より大切です。遠慮せずに医療機関を利用してください！',
    };
  }

  /**
   * 🧠 メンタルヘルスサポート
   */
  private createMentalHealthSupport(): LifeAdvice {
    return {
      id: 'mental-health',
      priority: 'high',
      category: 'mental_health',
      title: '🧠 心のケアをしましょう',
      description: '心が辛い時は一人で抱え込まず、専門家や信頼できる人に相談しましょう。',
      stepByStepGuide: [
        '1. 深呼吸を3回してください（鼻から吸って、口から吐く）',
        '2. 今日良かったことを1つ思い出してください',
        '3. 信頼できる人に電話またはメッセージを送ってください',
        '4. 心療内科または精神科の受診を検討してください',
        '5. 無料の相談窓口に電話してください',
      ],
      resources: [
        {
          name: 'いのちの電話',
          phoneNumber: '0570-783-556',
          description: '24時間無料で相談できます',
        },
        {
          name: 'こころの健康相談統一ダイヤル',
          phoneNumber: '0570-064-556',
          description: '精神保健福祉センターの相談',
        },
        {
          name: 'チャット相談',
          url: 'https://www.npo-bond.org/chat.html',
          description: '24時間チャットで相談できます',
        },
      ],
      estimatedTime: '30分-1時間',
      difficulty: 'easy',
      benefits: ['心が軽くなります', '専門的なアドバイスがもらえます', '孤独感が和らぎます'],
      encouragement: 'あなたの気持ちは大切です。助けを求めることは勇気のある行動です！',
    };
  }

  /**
   * 🍳 料理スキルのアドバイス
   */
  private createCookingSkillAdvice(): LifeAdvice {
    return {
      id: 'cooking-skill',
      priority: 'medium',
      category: 'skills',
      title: '🍳 簡単な料理を覚えましょう',
      description: '自分で料理ができると健康的で経済的です。まずは簡単なものから始めましょう。',
      stepByStepGuide: [
        '1. 卵かけご飯から始めてみましょう',
        '2. インスタントラーメンに卵を入れてみましょう',
        '3. 冷凍食品を温める練習をしましょう',
        '4. 簡単なサンドイッチを作ってみましょう',
        '5. YouTubeで簡単レシピを見てみましょう',
      ],
      resources: [
        {
          name: 'クックパッド',
          url: 'https://cookpad.com/',
          description: '簡単レシピがたくさんあります',
        },
        {
          name: 'YouTube料理チャンネル',
          url: 'https://www.youtube.com/',
          description: '動画で料理を学べます',
        },
      ],
      estimatedTime: '30分',
      difficulty: 'easy',
      benefits: ['食費を節約できます', '健康的な食事ができます', '自信につながります'],
      encouragement: '料理は楽しいものです！失敗しても大丈夫、練習すれば必ずできるようになります！',
    };
  }

  /**
   * 💤 毎日の基本ケア
   */
  private createDailyBasicCare(): LifeAdvice {
    return {
      id: 'daily-basic-care',
      priority: 'medium',
      category: 'basic_needs',
      title: '🌅 今日の基本的なケアをしましょう',
      description: '毎日の小さなケアが、幸せな人生の基礎になります。',
      stepByStepGuide: [
        '1. 顔を洗って歯を磨きましょう',
        '2. 清潔な服に着替えましょう',
        '3. 水分補給をしましょう（コップ1杯の水）',
        '4. 軽いストレッチをしましょう（5分）',
        '5. 今日の目標を1つ決めましょう',
      ],
      resources: [
        {
          name: 'NHK健康チャンネル',
          url: 'https://www.nhk.or.jp/kenko/',
          description: '健康的な生活習慣を学べます',
        },
      ],
      estimatedTime: '20分',
      difficulty: 'very_easy',
      benefits: ['気分がすっきりします', '健康を維持できます', '自己肯定感が上がります'],
      encouragement: '小さなことでも毎日続けることで、大きな変化を感じられます！',
    };
  }

  /**
   * 💸 緊急時の金銭アドバイス
   */
  private createEmergencyFinancialAdvice(): LifeAdvice {
    return {
      id: 'emergency-financial',
      priority: 'urgent',
      category: 'financial',
      title: '💸 緊急時の金銭サポートを受けましょう',
      description:
        'お金に困った時は、恥ずかしがらずに公的支援を受けましょう。それが制度の目的です。',
      stepByStepGuide: [
        '1. 市役所・区役所の福祉窓口に行ってください',
        '2. 「生活に困っている」と正直に伝えてください',
        '3. 生活保護、生活福祉資金貸付などの説明を聞いてください',
        '4. 必要な書類を準備してください',
        '5. フードバンクや炊き出しの情報を聞いてください',
      ],
      resources: [
        {
          name: '生活保護申請サポート',
          phoneNumber: '0120-919-024',
          description: '申請手続きをサポートしてくれます',
        },
        {
          name: 'セーフティネット支援対策等事業',
          url: 'https://www.mhlw.go.jp/',
          description: '厚生労働省の支援制度',
        },
      ],
      estimatedTime: '2-3時間',
      difficulty: 'medium',
      benefits: [
        '最低限の生活が保障されます',
        '専門スタッフのサポートを受けられます',
        '自立に向けた支援を受けられます',
      ],
      encouragement: '困った時に助けを求めるのは当然の権利です。恥ずかしがらずに行動してください！',
    };
  }

  /**
   * 🏥 健康保険のアドバイス
   */
  private createHealthInsuranceAdvice(): LifeAdvice {
    return {
      id: 'health-insurance',
      priority: 'high',
      category: 'basic_needs',
      title: '🏥 健康保険に加入しましょう',
      description: '健康保険があると医療費が安くなります。必ず加入しましょう。',
      stepByStepGuide: [
        '1. 市役所・区役所の国保窓口に行ってください',
        '2. 「国民健康保険に加入したい」と伝えてください',
        '3. 本人確認書類（免許証、マイナンバーカードなど）を持参してください',
        '4. 手続きを行い、保険証を受け取ってください',
        '5. 保険料について相談してください（減免制度もあります）',
      ],
      resources: [
        {
          name: '国民健康保険について',
          url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/kokuho/index.html',
          description: '厚生労働省の公式情報',
        },
      ],
      estimatedTime: '1時間',
      difficulty: 'easy',
      benefits: ['医療費が3割負担になります', '安心して病院にかかれます', '健康診断を受けられます'],
      encouragement: '健康保険は生活の安心の基盤です。必ず加入して安心を手に入れましょう！',
    };
  }

  /**
   * 🌟 モチベーション生成
   */
  private generateMotivation(status: LifeStatus): string {
    const motivations = [
      'あなたは今日も頑張っています。小さな一歩でも前進です！',
      '完璧である必要はありません。今できることから始めましょう。',
      'あなたの存在には価値があります。自分を大切にしてください。',
      '困った時は助けを求めても大丈夫です。それは強さの証拠です。',
      '今日という日は二度と来ません。大切にしましょう。',
    ];

    return motivations[Math.floor(Math.random() * motivations.length)];
  }

  /**
   * 🎉 祝福メッセージ生成
   */
  private generateCelebration(status: LifeStatus): string {
    const celebrations = [
      '今日もお疲れ様でした！あなたは本当によく頑張りました。',
      '小さなことでも達成できたら自分を褒めてあげてください。',
      'あなたの努力は必ず報われます。応援しています！',
      '今日一日生きていることが、もう十分素晴らしいことです。',
      'あなたの今日の頑張りに拍手を送ります！👏',
    ];

    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  /**
   * 優先度の重み計算
   */
  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'urgent':
        return 1;
      case 'high':
        return 2;
      case 'medium':
        return 3;
      case 'low':
        return 4;
      default:
        return 5;
    }
  }
}

export const lifeSupportAIService = LifeSupportAIService.getInstance();
