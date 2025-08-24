/**
 * 🗣️ ASDコミュニケーション支援サービス
 * 抽象的な質問「最近どう？」を具体化し、適切な回答をサポート
 */

class EventEmitter {
  private events: { [key: string]: ((...args: any[]) => void)[] } = {};

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) this.events[event].splice(index, 1);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export interface QuestionBreakdown {
  id: string;
  originalQuestion: string;
  specificQuestions: string[];
  context: 'work' | 'casual' | 'family' | 'medical' | 'social';
  relationship: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family' | 'colleague';
  expectedResponseLength: 'brief' | 'moderate' | 'detailed';
  suggestedTopics: string[];
}

export interface ResponseTemplate {
  id: string;
  scenario: string;
  context: string;
  relationship: string;
  templates: {
    brief: string[];
    moderate: string[];
    detailed: string[];
  };
  followUpQuestions: string[];
}

export interface ConversationPractice {
  id: string;
  scenario: string;
  partnerType: string;
  questions: string[];
  suggestedResponses: string[];
  practiceScore: number;
  completedAt?: Date;
}

export interface PersonalContext {
  recentEvents: RecentEvent[];
  mood: 'excellent' | 'good' | 'neutral' | 'tired' | 'stressed' | 'overwhelmed';
  workStatus: string;
  hobbies: string[];
  currentProjects: string[];
  healthStatus: 'good' | 'minor_issues' | 'managing_condition' | 'prefer_not_to_say';
}

export interface RecentEvent {
  id: string;
  category: 'work' | 'personal' | 'hobby' | 'health' | 'social' | 'achievement';
  description: string;
  importance: 'low' | 'medium' | 'high';
  shareable: boolean;
  date: Date;
  emotion: 'positive' | 'neutral' | 'negative';
}

class CommunicationSupportService extends EventEmitter {
  private static instance: CommunicationSupportService;
  private personalContext: PersonalContext | null = null;

  private constructor() {
    super();
    this.loadPersonalContext();
  }

  public static getInstance(): CommunicationSupportService {
    if (!CommunicationSupportService.instance) {
      CommunicationSupportService.instance = new CommunicationSupportService();
    }
    return CommunicationSupportService.instance;
  }

  /**
   * 「最近どう？」を具体的な質問に分解
   */
  public breakDownAbstractQuestion(
    question: string,
    context: QuestionBreakdown['context'],
    relationship: QuestionBreakdown['relationship']
  ): QuestionBreakdown {
    const breakdown: QuestionBreakdown = {
      id: `breakdown_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalQuestion: question,
      specificQuestions: this.generateSpecificQuestions(context, relationship),
      context,
      relationship,
      expectedResponseLength: this.determineResponseLength(relationship),
      suggestedTopics: this.getSuggestedTopics(context),
    };

    this.emit('questionAnalyzed', breakdown);
    return breakdown;
  }

  /**
   * パーソナライズされた回答テンプレートの生成
   */
  public generateResponseTemplates(
    context: string,
    relationship: string,
    includePesonalEvents: boolean = true
  ): ResponseTemplate {
    const templates = this.getBaseTemplates(context, relationship);

    if (includePesonalEvents && this.personalContext) {
      this.incorporatePersonalEvents(templates);
    }

    const responseTemplate: ResponseTemplate = {
      id: `template_${Date.now()}`,
      scenario: `${context}_${relationship}`,
      context,
      relationship,
      templates,
      followUpQuestions: this.generateFollowUpQuestions(context),
    };

    this.emit('templatesGenerated', responseTemplate);
    return responseTemplate;
  }

  /**
   * 個人状況の更新
   */
  public updatePersonalContext(context: Partial<PersonalContext>): void {
    this.personalContext = {
      ...this.personalContext,
      ...context,
    } as PersonalContext;

    this.savePersonalContext();
    this.emit('contextUpdated', this.personalContext);
  }

  /**
   * 最近の出来事の追加
   */
  public addRecentEvent(
    category: RecentEvent['category'],
    description: string,
    importance: RecentEvent['importance'],
    shareable: boolean = true,
    emotion: RecentEvent['emotion'] = 'neutral'
  ): RecentEvent {
    const event: RecentEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category,
      description,
      importance,
      shareable,
      date: new Date(),
      emotion,
    };

    if (!this.personalContext) {
      this.personalContext = {
        recentEvents: [],
        mood: 'neutral',
        workStatus: '',
        hobbies: [],
        currentProjects: [],
        healthStatus: 'good',
      };
    }

    this.personalContext.recentEvents.unshift(event);

    // 最新10件のみ保持
    if (this.personalContext.recentEvents.length > 10) {
      this.personalContext.recentEvents = this.personalContext.recentEvents.slice(0, 10);
    }

    this.savePersonalContext();
    this.emit('eventAdded', event);
    return event;
  }

  /**
   * 会話練習セッションの開始
   */
  public startConversationPractice(scenario: string, partnerType: string): ConversationPractice {
    const practice: ConversationPractice = {
      id: `practice_${Date.now()}`,
      scenario,
      partnerType,
      questions: this.generatePracticeQuestions(scenario),
      suggestedResponses: this.generatePracticeSuggestions(scenario, partnerType),
      practiceScore: 0,
    };

    this.emit('practiceStarted', practice);
    return practice;
  }

  /**
   * コンテキスト分析による最適回答の提案
   */
  public analyzeAndSuggestResponse(
    question: string,
    context: string,
    relationship: string,
    timeConstraint: 'immediate' | 'normal' | 'thoughtful' = 'normal'
  ): {
    analysis: string;
    suggestedResponse: string;
    alternatives: string[];
    explanation: string;
  } {
    const analysis = this.analyzeQuestionIntent(question, context, relationship);
    const response = this.selectOptimalResponse(analysis, timeConstraint);

    return {
      analysis: analysis.intent,
      suggestedResponse: response.main,
      alternatives: response.alternatives,
      explanation: response.explanation,
    };
  }

  /**
   * 緊急時の簡潔回答生成
   */
  public generateEmergencyResponse(relationship: string): {
    response: string;
    explanation: string;
    exitStrategy: string;
  } {
    const emergencyResponses = {
      stranger: {
        response: '元気です、ありがとうございます。',
        explanation: '短く礼儀正しく答えて会話を終了',
        exitStrategy: '笑顔で頷いてその場を離れる',
      },
      acquaintance: {
        response: 'まあまあです。おかげさまで。',
        explanation: '中立的で当たり障りのない回答',
        exitStrategy: '「それでは」と言って別の話題に移る',
      },
      colleague: {
        response: '忙しくしていますが、順調です。',
        explanation: '仕事関連のコンテキストで答える',
        exitStrategy: '「会議があるので」と言って退席',
      },
      friend: {
        response: 'いろいろありますが、元気にやってます。',
        explanation: '親しみやすく、でも詳細は避ける',
        exitStrategy: '「また今度詳しく話しましょう」と言う',
      },
    };

    return (
      emergencyResponses[relationship as keyof typeof emergencyResponses] ||
      emergencyResponses.stranger
    );
  }

  // プライベートメソッド

  private generateSpecificQuestions(
    context: QuestionBreakdown['context'],
    relationship: QuestionBreakdown['relationship']
  ): string[] {
    const questionSets = {
      work: [
        '仕事の調子はどうですか？',
        '最近何か新しいプロジェクトはありますか？',
        '職場で変わったことはありますか？',
        'お忙しくされていますか？',
      ],
      casual: [
        '体調はいかがですか？',
        '何か楽しいことはありましたか？',
        '最近ハマっていることはありますか？',
        '休日はどう過ごしていますか？',
      ],
      family: [
        '家族の皆さんはお元気ですか？',
        '最近家族で何かされましたか？',
        'お子さん（ご両親）の調子はいかがですか？',
        '家の方で変わったことはありますか？',
      ],
      medical: [
        '体調の方はいかがですか？',
        '治療の調子はどうですか？',
        '何か困ったことはありませんか？',
        '調子に変化はありますか？',
      ],
      social: [
        '最近友達とは会っていますか？',
        '何か新しい趣味は始めましたか？',
        'イベントや集まりには参加していますか？',
        '楽しいことはありましたか？',
      ],
    };

    return questionSets[context] || questionSets.casual;
  }

  private determineResponseLength(
    relationship: QuestionBreakdown['relationship']
  ): QuestionBreakdown['expectedResponseLength'] {
    if (relationship === 'stranger' || relationship === 'acquaintance') {
      return 'brief';
    } else if (relationship === 'colleague') {
      return 'moderate';
    } else {
      return 'detailed';
    }
  }

  private getSuggestedTopics(context: QuestionBreakdown['context']): string[] {
    const topicSets = {
      work: ['プロジェクト', '同僚', '業務内容', '研修', '目標'],
      casual: ['趣味', '健康', '天気', 'ニュース', 'エンターテイメント'],
      family: ['家族の近況', '子どもの成長', '家族旅行', '家の話', '親戚'],
      medical: ['体調', '治療経過', '医師との相談', '薬の効果', '生活改善'],
      social: ['友人', 'イベント', '新しい出会い', '共通の知人', '趣味仲間'],
    };

    return topicSets[context] || topicSets.casual;
  }

  private getBaseTemplates(context: string, relationship: string): ResponseTemplate['templates'] {
    // コンテキストと関係性に基づいた基本テンプレート
    return {
      brief: [
        'おかげさまで元気です',
        'まあまあです、ありがとうございます',
        '特に変わりなく過ごしています',
      ],
      moderate: [
        '元気にやっています。最近は[具体的な活動]をしていて、なかなか充実しています',
        'おかげさまで順調です。[最近の出来事]があって、忙しくしています',
        '体調も良く、[現在の状況]で過ごしています',
      ],
      detailed: [
        '最近は[詳細な近況]で、[感想や考え]という感じです。[相手への質問]はいかがですか？',
        '[複数の近況]があって、特に[重要な出来事]が印象的でした。[相手への関心]',
        '[現在の状況]を中心に過ごしていて、[将来の予定や希望]を考えています',
      ],
    };
  }

  private incorporatePersonalEvents(templates: ResponseTemplate['templates']): void {
    if (!this.personalContext?.recentEvents) return;

    const shareableEvents = this.personalContext.recentEvents
      .filter((event) => event.shareable && event.importance !== 'low')
      .slice(0, 3);

    shareableEvents.forEach((event) => {
      const eventText = this.formatEventForResponse(event);
      templates.moderate.push(`最近${eventText}がありました`);
      templates.detailed.push(
        `${eventText}という出来事があって、${this.getEmotionResponse(event.emotion)}`
      );
    });
  }

  private formatEventForResponse(event: RecentEvent): string {
    const categoryPrefixes = {
      work: '仕事で',
      personal: '個人的に',
      hobby: '趣味で',
      health: '健康面で',
      social: '友人との間で',
      achievement: '達成したことで',
    };

    return `${categoryPrefixes[event.category]}${event.description}`;
  }

  private getEmotionResponse(emotion: RecentEvent['emotion']): string {
    const responses = {
      positive: 'とても良い経験でした',
      neutral: '勉強になりました',
      negative: '大変でしたが乗り越えました',
    };

    return responses[emotion];
  }

  private generateFollowUpQuestions(context: string): string[] {
    const questionSets = {
      work: ['お仕事の方はいかがですか？', '最近お忙しいですか？'],
      casual: ['〇〇さんはどうですか？', '最近何かありましたか？'],
      family: ['ご家族の皆さんはお元気ですか？'],
      medical: ['〇〇さんの調子はいかがですか？'],
      social: ['〇〇さんは最近どうですか？'],
    };

    return questionSets[context as keyof typeof questionSets] || questionSets.casual;
  }

  private generatePracticeQuestions(scenario: string): string[] {
    return [
      '最近どう？',
      '元気？',
      '調子はどう？',
      '最近何してる？',
      '変わりない？',
      'どんな感じ？',
    ];
  }

  private generatePracticeSuggestions(scenario: string, partnerType: string): string[] {
    return [
      '元気だよ、ありがとう',
      'まあまあかな',
      '特に変わりなく',
      '忙しくしてる',
      'おかげさまで',
    ];
  }

  private analyzeQuestionIntent(
    question: string,
    context: string,
    relationship: string
  ): {
    intent: string;
    formality: 'casual' | 'formal';
    expectsDetails: boolean;
  } {
    const intent = question.includes('最近') ? '近況確認' : '一般的な挨拶';
    const formality =
      relationship === 'stranger' || relationship === 'colleague' ? 'formal' : 'casual';
    const expectsDetails = relationship === 'close_friend' || relationship === 'family';

    return { intent, formality, expectsDetails };
  }

  private selectOptimalResponse(
    analysis: any,
    timeConstraint: string
  ): {
    main: string;
    alternatives: string[];
    explanation: string;
  } {
    // 分析に基づいて最適な回答を選択
    return {
      main: 'おかげさまで元気です',
      alternatives: ['まあまあです', '特に変わりなく'],
      explanation: '短く礼儀正しい標準的な回答',
    };
  }

  // ストレージ関連
  private savePersonalContext(): void {
    if (this.personalContext) {
      localStorage.setItem('asd_communication_context', JSON.stringify(this.personalContext));
    }
  }

  private loadPersonalContext(): void {
    try {
      const stored = localStorage.getItem('asd_communication_context');
      if (stored) {
        this.personalContext = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load personal context:', error);
    }
  }
}

export const communicationSupportService = CommunicationSupportService.getInstance();
export default communicationSupportService;
