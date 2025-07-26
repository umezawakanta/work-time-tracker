import { EventEmitter } from 'events';

// アダプティブUI設定型
interface AdaptiveUIConfig {
  // 視覚的設定
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  lineHeight: number;
  letterSpacing: number;
  colorScheme: 'default' | 'high-contrast' | 'calm' | 'energizing' | 'monochrome';
  colorTemperature: 'cool' | 'neutral' | 'warm';

  // アニメーション設定
  animationLevel: 'none' | 'minimal' | 'normal' | 'enhanced';
  transitionSpeed: 'slow' | 'normal' | 'fast';
  motionSensitivity: 'low' | 'medium' | 'high';

  // レイアウト設定
  informationDensity: 'sparse' | 'balanced' | 'dense';
  navigationStyle: 'simple' | 'standard' | 'advanced';
  contentStructure: 'linear' | 'grouped' | 'hierarchical';

  // インタラクション設定
  interactionPattern: 'tap' | 'hover' | 'focus' | 'voice';
  feedbackLevel: 'minimal' | 'normal' | 'enhanced';
  confirmationRequirement: 'none' | 'important' | 'all';

  // 認知負荷設定
  cognitiveLoadLevel: 'minimal' | 'moderate' | 'complex';
  multitaskingSupport: boolean;
  contextSwitchingAid: boolean;

  // ADHD/ASD特化設定
  sensoryReduction: boolean;
  hyperfocusMode: boolean;
  distractionMinimization: boolean;
  executiveFunctionSupport: boolean;
  timeAwareness: boolean;

  // 環境適応
  ambientLightAdaptation: boolean;
  noiseAdaptation: boolean;
  timeOfDayAdaptation: boolean;
}

// 認知状態型
interface CognitiveState {
  attention: {
    level: number; // 1-10
    duration: number; // minutes
    stability: 'stable' | 'fluctuating' | 'declining';
  };
  workingMemory: {
    load: number; // 1-10
    capacity: number; // 1-10
    efficiency: number; // 1-10
  };
  executiveFunction: {
    planning: number; // 1-10
    inhibition: number; // 1-10
    flexibility: number; // 1-10
    monitoring: number; // 1-10
  };
  sensoryProcessing: {
    overload: number; // 1-10
    sensitivity: number; // 1-10
    preferences: {
      visual: 'low' | 'medium' | 'high';
      auditory: 'quiet' | 'ambient' | 'active';
      tactile: 'minimal' | 'moderate' | 'rich';
    };
  };
  emotionalState: {
    arousal: number; // 1-10
    valence: number; // 1-10 (negative to positive)
    regulation: number; // 1-10
  };
}

// UI適応ルール型
interface UIAdaptationRule {
  id: string;
  name: string;
  condition: {
    cognitiveState?: Partial<CognitiveState>;
    timeOfDay?: number[];
    energyLevel?: number;
    stressLevel?: number;
    taskType?: string[];
  };
  adaptation: Partial<AdaptiveUIConfig>;
  priority: number; // 1-10
  temporary: boolean; // 一時的な適応かどうか
  duration?: number; // minutes (temporaryがtrueの場合)
}

// UIエレメント型
interface UIElement {
  id: string;
  type: 'button' | 'input' | 'card' | 'navigation' | 'content' | 'notification';
  complexity: number; // 1-10
  interactionRequired: boolean;
  cognitiveLoad: number; // 1-10
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: string[];
}

class AdaptiveUIService extends EventEmitter {
  private currentConfig: AdaptiveUIConfig;
  private baseConfig: AdaptiveUIConfig;
  private cognitiveState: CognitiveState | null = null;
  private adaptationRules: UIAdaptationRule[] = [];
  private activeAdaptations: string[] = [];
  private userPreferences: Partial<AdaptiveUIConfig> = {};
  private isActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.baseConfig = this.getDefaultConfig();
    this.currentConfig = { ...this.baseConfig };
    this.initializeService();
  }

  /**
   * デフォルト設定取得
   */
  private getDefaultConfig(): AdaptiveUIConfig {
    return {
      fontSize: 'medium',
      lineHeight: 1.5,
      letterSpacing: 0,
      colorScheme: 'default',
      colorTemperature: 'neutral',
      animationLevel: 'normal',
      transitionSpeed: 'normal',
      motionSensitivity: 'medium',
      informationDensity: 'balanced',
      navigationStyle: 'standard',
      contentStructure: 'grouped',
      interactionPattern: 'tap',
      feedbackLevel: 'normal',
      confirmationRequirement: 'important',
      cognitiveLoadLevel: 'moderate',
      multitaskingSupport: true,
      contextSwitchingAid: false,
      sensoryReduction: false,
      hyperfocusMode: false,
      distractionMinimization: false,
      executiveFunctionSupport: false,
      timeAwareness: false,
      ambientLightAdaptation: false,
      noiseAdaptation: false,
      timeOfDayAdaptation: true,
    };
  }

  /**
   * サービス初期化
   */
  private async initializeService(): Promise<void> {
    try {
      await this.loadUserPreferences();
      await this.loadCognitiveProfile();
      this.initializeAdaptationRules();
      this.startMonitoring();
      this.isActive = true;

      console.log('🎨 アダプティブUIサービス開始');
      this.emit('service-initialized', this.currentConfig);
    } catch (error) {
      console.error('アダプティブUIサービス初期化エラー:', error);
    }
  }

  /**
   * ユーザー設定読み込み
   */
  private async loadUserPreferences(): Promise<void> {
    const stored = localStorage.getItem('adaptive-ui-preferences');
    if (stored) {
      this.userPreferences = JSON.parse(stored);
      this.currentConfig = { ...this.baseConfig, ...this.userPreferences };
    }
  }

  /**
   * 認知プロファイル読み込み
   */
  private async loadCognitiveProfile(): Promise<void> {
    const storedProfile = localStorage.getItem('cognitive-assessment-profile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);

      // 認知プロファイルから初期設定を調整
      this.adjustConfigFromProfile(profile);
    }
  }

  /**
   * 認知プロファイルに基づく設定調整
   */
  private adjustConfigFromProfile(profile: any): void {
    const adjustments: Partial<AdaptiveUIConfig> = {};

    // ワーキングメモリが低い場合
    if (profile.workingMemory < 85) {
      adjustments.informationDensity = 'sparse';
      adjustments.cognitiveLoadLevel = 'minimal';
      adjustments.multitaskingSupport = false;
    }

    // 注意制御が低い場合
    if (profile.attentionalControl < 80) {
      adjustments.distractionMinimization = true;
      adjustments.animationLevel = 'minimal';
      adjustments.navigationStyle = 'simple';
    }

    // 感覚処理が低い場合
    if (profile.sensoryProcessing < 75) {
      adjustments.sensoryReduction = true;
      adjustments.colorScheme = 'calm';
      adjustments.animationLevel = 'none';
      adjustments.motionSensitivity = 'low';
    }

    // 実行機能が低い場合
    if (profile.executiveFunction < 85) {
      adjustments.executiveFunctionSupport = true;
      adjustments.confirmationRequirement = 'all';
      adjustments.contextSwitchingAid = true;
      adjustments.timeAwareness = true;
    }

    // 処理速度が低い場合
    if (profile.processingSpeed < 90) {
      adjustments.transitionSpeed = 'slow';
      adjustments.feedbackLevel = 'enhanced';
      adjustments.fontSize = 'large';
    }

    this.currentConfig = { ...this.currentConfig, ...adjustments };
    this.emit('config-updated', this.currentConfig);
  }

  /**
   * 適応ルール初期化
   */
  private initializeAdaptationRules(): void {
    this.adaptationRules = [
      {
        id: 'high-cognitive-load',
        name: '高認知負荷時の簡素化',
        condition: {
          cognitiveState: {
            workingMemory: { load: 8, capacity: 6, efficiency: 0.75 },
          },
        },
        adaptation: {
          informationDensity: 'sparse',
          animationLevel: 'none',
          confirmationRequirement: 'all',
          distractionMinimization: true,
        },
        priority: 9,
        temporary: true,
        duration: 30,
      },
      {
        id: 'attention-decline',
        name: '注意力低下時の支援',
        condition: {
          cognitiveState: {
            attention: { level: 4, duration: 15, stability: 'declining' },
          },
        },
        adaptation: {
          feedbackLevel: 'enhanced',
          colorScheme: 'high-contrast',
          fontSize: 'large',
          navigationStyle: 'simple',
        },
        priority: 8,
        temporary: true,
        duration: 15,
      },
      {
        id: 'sensory-overload',
        name: '感覚過負荷時の軽減',
        condition: {
          cognitiveState: {
            sensoryProcessing: { overload: 7 },
          },
        },
        adaptation: {
          sensoryReduction: true,
          colorScheme: 'monochrome',
          animationLevel: 'none',
          motionSensitivity: 'low',
        },
        priority: 10,
        temporary: true,
        duration: 45,
      },
      {
        id: 'hyperfocus-detected',
        name: 'ハイパーフォーカス時の最適化',
        condition: {
          cognitiveState: {
            attention: { level: 9, duration: 60 },
          },
        },
        adaptation: {
          hyperfocusMode: true,
          distractionMinimization: true,
          timeAwareness: true,
          informationDensity: 'dense',
        },
        priority: 7,
        temporary: false,
      },
      {
        id: 'morning-optimization',
        name: '朝の最適化',
        condition: {
          timeOfDay: [6, 7, 8, 9, 10],
        },
        adaptation: {
          colorTemperature: 'cool',
          animationLevel: 'enhanced',
          feedbackLevel: 'normal',
        },
        priority: 3,
        temporary: false,
      },
      {
        id: 'evening-calm',
        name: '夜の落ち着き設定',
        condition: {
          timeOfDay: [20, 21, 22, 23],
        },
        adaptation: {
          colorScheme: 'calm',
          colorTemperature: 'warm',
          animationLevel: 'minimal',
          sensoryReduction: true,
        },
        priority: 4,
        temporary: false,
      },
      {
        id: 'stress-response',
        name: 'ストレス応答',
        condition: {
          stressLevel: 7,
        },
        adaptation: {
          colorScheme: 'calm',
          animationLevel: 'none',
          confirmationRequirement: 'none',
          executiveFunctionSupport: true,
        },
        priority: 9,
        temporary: true,
        duration: 20,
      },
    ];
  }

  /**
   * 監視開始
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.evaluateAdaptations();
    }, 30000); // 30秒ごと

    // 時間帯に基づく定期的な調整
    setInterval(() => {
      this.applyTimeBasedAdaptations();
    }, 300000); // 5分ごと
  }

  /**
   * 適応評価
   */
  private evaluateAdaptations(): void {
    if (!this.cognitiveState) return;

    const applicableRules = this.adaptationRules.filter((rule) => this.isRuleApplicable(rule));

    // 優先度順にソート
    applicableRules.sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      if (!this.activeAdaptations.includes(rule.id)) {
        this.applyAdaptation(rule);
      }
    }

    // 不要になった適応を削除
    this.removeInactiveAdaptations();
  }

  /**
   * ルール適用可能性判定
   */
  private isRuleApplicable(rule: UIAdaptationRule): boolean {
    const { condition } = rule;

    // 認知状態チェック
    if (condition.cognitiveState && this.cognitiveState) {
      if (!this.matchesCognitiveCondition(condition.cognitiveState, this.cognitiveState)) {
        return false;
      }
    }

    // 時間帯チェック
    if (condition.timeOfDay) {
      const currentHour = new Date().getHours();
      if (!condition.timeOfDay.includes(currentHour)) {
        return false;
      }
    }

    // エネルギーレベルチェック
    if (condition.energyLevel !== undefined) {
      const currentEnergy = this.getCurrentEnergyLevel();
      if (currentEnergy < condition.energyLevel) {
        return false;
      }
    }

    // ストレスレベルチェック
    if (condition.stressLevel !== undefined) {
      const currentStress = this.getCurrentStressLevel();
      if (currentStress < condition.stressLevel) {
        return false;
      }
    }

    return true;
  }

  /**
   * 認知状態条件マッチング
   */
  private matchesCognitiveCondition(
    condition: Partial<CognitiveState>,
    current: CognitiveState
  ): boolean {
    if (condition.attention) {
      if (condition.attention.level && current.attention.level < condition.attention.level) {
        return false;
      }
      if (
        condition.attention.duration &&
        current.attention.duration < condition.attention.duration
      ) {
        return false;
      }
      if (
        condition.attention.stability &&
        current.attention.stability !== condition.attention.stability
      ) {
        return false;
      }
    }

    if (condition.workingMemory) {
      if (
        condition.workingMemory.load &&
        current.workingMemory.load < condition.workingMemory.load
      ) {
        return false;
      }
    }

    if (condition.sensoryProcessing) {
      if (
        condition.sensoryProcessing.overload &&
        current.sensoryProcessing.overload < condition.sensoryProcessing.overload
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * 適応適用
   */
  private applyAdaptation(rule: UIAdaptationRule): void {
    console.log(`🎨 UI適応適用: ${rule.name}`);

    const previousConfig = { ...this.currentConfig };
    this.currentConfig = { ...this.currentConfig, ...rule.adaptation };

    this.activeAdaptations.push(rule.id);

    if (rule.temporary && rule.duration) {
      setTimeout(() => {
        this.removeAdaptation(rule.id);
      }, rule.duration * 60000);
    }

    this.emit('adaptation-applied', {
      ruleId: rule.id,
      ruleName: rule.name,
      previousConfig,
      newConfig: this.currentConfig,
      changes: rule.adaptation,
    });

    // CSSカスタムプロパティの更新
    this.updateCSSProperties();
  }

  /**
   * 適応削除
   */
  private removeAdaptation(ruleId: string): void {
    const index = this.activeAdaptations.indexOf(ruleId);
    if (index > -1) {
      this.activeAdaptations.splice(index, 1);

      // 設定を再計算
      this.recalculateConfig();

      console.log(`🎨 UI適応削除: ${ruleId}`);
      this.emit('adaptation-removed', { ruleId });
    }
  }

  /**
   * 非アクティブ適応削除
   */
  private removeInactiveAdaptations(): void {
    const activeRuleIds = this.adaptationRules
      .filter((rule) => this.isRuleApplicable(rule))
      .map((rule) => rule.id);

    const toRemove = this.activeAdaptations.filter((id) => !activeRuleIds.includes(id));

    for (const ruleId of toRemove) {
      this.removeAdaptation(ruleId);
    }
  }

  /**
   * 設定再計算
   */
  private recalculateConfig(): void {
    let newConfig = { ...this.baseConfig, ...this.userPreferences };

    // アクティブな適応を適用
    const activeRules = this.adaptationRules.filter((rule) =>
      this.activeAdaptations.includes(rule.id)
    );

    // 優先度順にソート
    activeRules.sort((a, b) => a.priority - b.priority);

    for (const rule of activeRules) {
      newConfig = { ...newConfig, ...rule.adaptation };
    }

    this.currentConfig = newConfig;
    this.updateCSSProperties();
    this.emit('config-recalculated', this.currentConfig);
  }

  /**
   * CSSプロパティ更新
   */
  private updateCSSProperties(): void {
    const root = document.documentElement;

    // フォントサイズ
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px',
    };
    root.style.setProperty('--adaptive-font-size', fontSizeMap[this.currentConfig.fontSize]);

    // 行高
    root.style.setProperty('--adaptive-line-height', this.currentConfig.lineHeight.toString());

    // 文字間隔
    root.style.setProperty('--adaptive-letter-spacing', `${this.currentConfig.letterSpacing}em`);

    // アニメーション速度
    const animationDurationMap = {
      none: '0s',
      minimal: '0.1s',
      normal: '0.3s',
      enhanced: '0.5s',
    };
    root.style.setProperty(
      '--adaptive-animation-duration',
      animationDurationMap[this.currentConfig.animationLevel]
    );

    // 色温度
    const colorFilterMap = {
      cool: 'hue-rotate(10deg) saturate(1.1)',
      neutral: 'none',
      warm: 'hue-rotate(-10deg) saturate(0.9) brightness(1.1)',
    };
    root.style.setProperty(
      '--adaptive-color-filter',
      colorFilterMap[this.currentConfig.colorTemperature]
    );

    // 情報密度
    const spacingMap = {
      sparse: '2rem',
      balanced: '1rem',
      dense: '0.5rem',
    };
    root.style.setProperty('--adaptive-spacing', spacingMap[this.currentConfig.informationDensity]);

    // CSS classes for body
    document.body.classList.remove(
      'ui-minimal-motion',
      'ui-high-contrast',
      'ui-calm',
      'ui-monochrome',
      'ui-sensory-reduced',
      'ui-hyperfocus',
      'ui-distraction-min'
    );

    if (this.currentConfig.animationLevel === 'none') {
      document.body.classList.add('ui-minimal-motion');
    }

    if (this.currentConfig.colorScheme === 'high-contrast') {
      document.body.classList.add('ui-high-contrast');
    }

    if (this.currentConfig.colorScheme === 'calm') {
      document.body.classList.add('ui-calm');
    }

    if (this.currentConfig.colorScheme === 'monochrome') {
      document.body.classList.add('ui-monochrome');
    }

    if (this.currentConfig.sensoryReduction) {
      document.body.classList.add('ui-sensory-reduced');
    }

    if (this.currentConfig.hyperfocusMode) {
      document.body.classList.add('ui-hyperfocus');
    }

    if (this.currentConfig.distractionMinimization) {
      document.body.classList.add('ui-distraction-min');
    }
  }

  /**
   * 時間ベース適応
   */
  private applyTimeBasedAdaptations(): void {
    if (!this.currentConfig.timeOfDayAdaptation) return;

    const currentHour = new Date().getHours();

    // 夜間モード
    if (currentHour >= 20 || currentHour <= 6) {
      this.applyNightMode();
    } else {
      this.removeBnightMode();
    }
  }

  /**
   * 夜間モード適用
   */
  private applyNightMode(): void {
    if (!this.activeAdaptations.includes('night-mode')) {
      const nightRule: UIAdaptationRule = {
        id: 'night-mode',
        name: '夜間モード',
        condition: {},
        adaptation: {
          colorScheme: 'calm',
          colorTemperature: 'warm',
          animationLevel: 'minimal',
        },
        priority: 2,
        temporary: false,
      };

      this.applyAdaptation(nightRule);
    }
  }

  /**
   * 夜間モード削除
   */
  private removeBnightMode(): void {
    this.removeAdaptation('night-mode');
  }

  /**
   * 現在のエネルギーレベル取得
   */
  private getCurrentEnergyLevel(): number {
    // 簡易実装（実際はより詳細な監視が必要）
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 11) return 8;
    if (hour >= 14 && hour <= 16) return 4;
    return 6;
  }

  /**
   * 現在のストレスレベル取得
   */
  private getCurrentStressLevel(): number {
    // 簡易実装（実際はより詳細な監視が必要）
    return 5;
  }

  /**
   * 認知状態更新
   */
  public updateCognitiveState(state: Partial<CognitiveState>): void {
    this.cognitiveState = {
      ...this.cognitiveState,
      ...state,
    } as CognitiveState;

    this.evaluateAdaptations();
    this.emit('cognitive-state-updated', this.cognitiveState);
  }

  /**
   * ユーザー設定更新
   */
  public updateUserPreferences(preferences: Partial<AdaptiveUIConfig>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    localStorage.setItem('adaptive-ui-preferences', JSON.stringify(this.userPreferences));

    this.recalculateConfig();
    this.emit('preferences-updated', this.userPreferences);
  }

  /**
   * 緊急モード有効化
   */
  public enableEmergencyMode(): void {
    const emergencyRule: UIAdaptationRule = {
      id: 'emergency-mode',
      name: '緊急モード',
      condition: {},
      adaptation: {
        animationLevel: 'none',
        colorScheme: 'high-contrast',
        fontSize: 'large',
        informationDensity: 'sparse',
        confirmationRequirement: 'none',
        distractionMinimization: true,
        executiveFunctionSupport: true,
      },
      priority: 10,
      temporary: false,
    };

    this.applyAdaptation(emergencyRule);
    this.emit('emergency-mode-enabled');
  }

  /**
   * 緊急モード無効化
   */
  public disableEmergencyMode(): void {
    this.removeAdaptation('emergency-mode');
    this.emit('emergency-mode-disabled');
  }

  /**
   * 現在の設定取得
   */
  public getCurrentConfig(): AdaptiveUIConfig {
    return { ...this.currentConfig };
  }

  /**
   * アクティブ適応取得
   */
  public getActiveAdaptations(): string[] {
    return [...this.activeAdaptations];
  }

  /**
   * サービス停止
   */
  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isActive = false;
    this.removeAllListeners();
    console.log('🛑 アダプティブUIサービス停止');
  }
}

// シングルトンインスタンス
const adaptiveUIService = new AdaptiveUIService();

export default adaptiveUIService;
export { AdaptiveUIService };
export type { AdaptiveUIConfig, CognitiveState, UIAdaptationRule, UIElement };
