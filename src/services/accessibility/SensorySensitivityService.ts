import { toast } from '@/components/ui/use-toast';

export interface SensoryProfile {
  id: string;
  userId: string;
  name: string;
  preferences: SensoryPreferences;
  triggers: SensoryTrigger[];
  accommodations: SensoryAccommodation[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SensoryPreferences {
  visual: VisualPreferences;
  auditory: AuditoryPreferences;
  motion: MotionPreferences;
  interaction: InteractionPreferences;
  cognitive: CognitivePreferences;
}

export interface VisualPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  reducedTransparency: boolean;
  colorBlindnessFriendly: boolean;
  reducedBrightness: number; // 0-100
  fontScale: number; // 0.8-2.0
  reducedClutter: boolean;
  monochromeMode: boolean;
  customColorScheme?: CustomColorScheme;
}

export interface AuditoryPreferences {
  soundsEnabled: boolean;
  notificationSoundsLevel: number; // 0-100
  backgroundMusicLevel: number; // 0-100
  feedbackSoundsLevel: number; // 0-100
  audioDescriptions: boolean;
  speechRate: number; // 0.5-2.0
  preferredVoice: string;
}

export interface MotionPreferences {
  autoPlayVideos: boolean;
  parallaxEffects: boolean;
  animationDuration: number; // 0.1-2.0
  blinkingElements: boolean;
  hoverEffects: boolean;
  smoothScrolling: boolean;
}

export interface InteractionPreferences {
  clickDelay: number; // ms
  doubleClickTime: number; // ms
  hoverDelay: number; // ms
  focusIndicatorEnhanced: boolean;
  stickyFocus: boolean;
  largerClickTargets: boolean;
  reducedGestures: boolean;
}

export interface CognitivePreferences {
  simplifiedInterface: boolean;
  reducedMenus: boolean;
  stepByStepGuidance: boolean;
  memoryAids: boolean;
  timeExtensions: boolean;
  errorPrevention: boolean;
  confirmationPrompts: boolean;
}

export interface CustomColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  accent: string;
}

export interface SensoryTrigger {
  id: string;
  type: 'visual' | 'auditory' | 'motion' | 'cognitive';
  element: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  avoidanceStrategy: string;
}

export interface SensoryAccommodation {
  id: string;
  triggerType: string;
  modification: string;
  description: string;
  enabled: boolean;
  effectiveTime?: string;
}

export interface SensitivityAlert {
  id: string;
  type: 'warning' | 'trigger' | 'success';
  message: string;
  element?: string;
  duration: number;
  timestamp: string;
}

/**
 * 🧠 ニューロダイバーシティ推進者: 感覚過敏対応サービス
 * 視覚・聴覚・動作・認知的感覚過敏への配慮機能
 */
class SensorySensitivityService {
  private static instance: SensorySensitivityService | null = null;
  private profiles: Map<string, SensoryProfile> = new Map();
  private activeProfile: SensoryProfile | null = null;
  private observers: MutationObserver[] = [];
  private mediaQuery: MediaQueryList | null = null;
  private safeModeActive: boolean = false;

  private constructor() {
    this.initializeService();
    this.loadDefaultProfiles();
    this.setupSystemDetection();
    this.startContentMonitoring();
  }

  public static getInstance(): SensorySensitivityService {
    if (!SensorySensitivityService.instance) {
      SensorySensitivityService.instance = new SensorySensitivityService();
    }
    return SensorySensitivityService.instance;
  }

  /**
   * 🔧 サービス初期化
   */
  private initializeService(): void {
    this.injectSensitivityStyles();
    this.setupEventListeners();
    this.detectSystemPreferences();
    console.log('🧠 感覚過敏対応サービス初期化完了');
  }

  /**
   * 📋 デフォルトプロファイル読み込み
   */
  private loadDefaultProfiles(): void {
    const defaultProfiles: SensoryProfile[] = [
      {
        id: 'safe-mode',
        userId: 'system',
        name: '🛡️ セーフモード（最小刺激）',
        preferences: {
          visual: {
            reducedMotion: true,
            highContrast: true,
            reducedTransparency: true,
            colorBlindnessFriendly: true,
            reducedBrightness: 70,
            fontScale: 1.2,
            reducedClutter: true,
            monochromeMode: false,
          },
          auditory: {
            soundsEnabled: false,
            notificationSoundsLevel: 0,
            backgroundMusicLevel: 0,
            feedbackSoundsLevel: 10,
            audioDescriptions: true,
            speechRate: 0.8,
            preferredVoice: 'system',
          },
          motion: {
            autoPlayVideos: false,
            parallaxEffects: false,
            animationDuration: 0.2,
            blinkingElements: false,
            hoverEffects: false,
            smoothScrolling: false,
          },
          interaction: {
            clickDelay: 100,
            doubleClickTime: 800,
            hoverDelay: 300,
            focusIndicatorEnhanced: true,
            stickyFocus: true,
            largerClickTargets: true,
            reducedGestures: true,
          },
          cognitive: {
            simplifiedInterface: true,
            reducedMenus: true,
            stepByStepGuidance: true,
            memoryAids: true,
            timeExtensions: true,
            errorPrevention: true,
            confirmationPrompts: true,
          },
        },
        triggers: [
          {
            id: 'flash-trigger',
            type: 'visual',
            element: 'flashing-content',
            description: '点滅するコンテンツ',
            severity: 'critical',
            symptoms: ['発作', '目眩', '頭痛'],
            avoidanceStrategy: '点滅を停止または削除',
          },
        ],
        accommodations: [
          {
            id: 'no-flash',
            triggerType: 'visual',
            modification: 'animation-play-state: paused',
            description: 'すべてのアニメーションを停止',
            enabled: true,
          },
        ],
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mild-sensitivity',
        userId: 'system',
        name: '🌸 軽度感覚過敏',
        preferences: {
          visual: {
            reducedMotion: false,
            highContrast: false,
            reducedTransparency: false,
            colorBlindnessFriendly: false,
            reducedBrightness: 85,
            fontScale: 1.1,
            reducedClutter: false,
            monochromeMode: false,
          },
          auditory: {
            soundsEnabled: true,
            notificationSoundsLevel: 30,
            backgroundMusicLevel: 20,
            feedbackSoundsLevel: 40,
            audioDescriptions: false,
            speechRate: 1.0,
            preferredVoice: 'system',
          },
          motion: {
            autoPlayVideos: false,
            parallaxEffects: true,
            animationDuration: 0.4,
            blinkingElements: false,
            hoverEffects: true,
            smoothScrolling: true,
          },
          interaction: {
            clickDelay: 50,
            doubleClickTime: 600,
            hoverDelay: 200,
            focusIndicatorEnhanced: true,
            stickyFocus: false,
            largerClickTargets: false,
            reducedGestures: false,
          },
          cognitive: {
            simplifiedInterface: false,
            reducedMenus: false,
            stepByStepGuidance: false,
            memoryAids: true,
            timeExtensions: false,
            errorPrevention: true,
            confirmationPrompts: false,
          },
        },
        triggers: [],
        accommodations: [],
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultProfiles.forEach((profile) => {
      this.profiles.set(profile.id, profile);
    });

    console.log('📋 デフォルト感覚プロファイルを読み込みました');
  }

  /**
   * 🎨 感覚配慮スタイル注入
   */
  private injectSensitivityStyles(): void {
    const styleId = 'sensory-sensitivity-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* 感覚過敏対応スタイル */
      .sensory-safe {
        --animation-duration: 0.1s !important;
        --transition-duration: 0.1s !important;
      }
      
      .sensory-safe * {
        animation-duration: var(--animation-duration) !important;
        transition-duration: var(--transition-duration) !important;
      }
      
      .sensory-safe .blink,
      .sensory-safe .flash,
      .sensory-safe .strobe {
        animation: none !important;
      }
      
      .high-contrast {
        filter: contrast(150%) !important;
      }
      
      .reduced-transparency {
        backdrop-filter: none !important;
        background: rgba(var(--background-rgb), 1) !important;
      }
      
      .large-targets button,
      .large-targets a,
      .large-targets input {
        min-height: 44px !important;
        min-width: 44px !important;
        padding: 12px !important;
      }
      
      .enhanced-focus :focus {
        outline: 3px solid #007acc !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 8px rgba(0, 122, 204, 0.5) !important;
      }
      
      .reduced-clutter .sidebar,
      .reduced-clutter .advertisement,
      .reduced-clutter .decoration {
        display: none !important;
      }
      
      .monochrome {
        filter: grayscale(100%) !important;
      }
      
      .low-brightness {
        filter: brightness(var(--brightness-level, 0.7)) !important;
      }
      
      .no-parallax {
        transform: none !important;
        background-attachment: scroll !important;
      }
      
      .simplified-ui .complex-menu,
      .simplified-ui .advanced-options {
        display: none !important;
      }
      
      .memory-aid {
        position: relative;
      }
      
      .memory-aid::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--tooltip-bg, #333);
        color: var(--tooltip-text, #fff);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
      }
      
      .memory-aid:hover::after,
      .memory-aid:focus::after {
        opacity: 1;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 🔍 システム設定検出
   */
  private detectSystemPreferences(): void {
    // prefers-reduced-motion
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (this.mediaQuery.matches) {
      this.enableSafeMode();
    }

    this.mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.enableSafeMode();
      }
    });

    // prefers-contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (contrastQuery.matches) {
      document.body.classList.add('high-contrast');
    }

    // prefers-color-scheme
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (colorSchemeQuery.matches) {
      this.adjustForDarkMode();
    }

    console.log('🔍 システム設定を検出しました');
  }

  /**
   * 🛡️ セーフモード有効化
   */
  enableSafeMode(): void {
    this.safeModeActive = true;
    const safeProfile = this.profiles.get('safe-mode');
    if (safeProfile) {
      this.applyProfile(safeProfile);
    }

    toast({
      title: 'セーフモード有効',
      description: '感覚過敏に配慮した安全な表示に変更しました',
      variant: 'default',
    });

    console.log('🛡️ セーフモードを有効化しました');
  }

  /**
   * 📱 プロファイル適用
   */
  applyProfile(profile: SensoryProfile): void {
    this.activeProfile = profile;
    this.applyVisualPreferences(profile.preferences.visual);
    this.applyAuditoryPreferences(profile.preferences.auditory);
    this.applyMotionPreferences(profile.preferences.motion);
    this.applyInteractionPreferences(profile.preferences.interaction);
    this.applyCognitivePreferences(profile.preferences.cognitive);

    // プロファイル状態を保存
    localStorage.setItem('sensory-profile', JSON.stringify(profile));

    console.log('📱 感覚プロファイルを適用しました:', profile.name);
  }

  /**
   * 👁️ 視覚設定適用
   */
  private applyVisualPreferences(visual: VisualPreferences): void {
    const body = document.body;

    // 動作軽減
    if (visual.reducedMotion) {
      body.classList.add('sensory-safe');
    } else {
      body.classList.remove('sensory-safe');
    }

    // 高コントラスト
    if (visual.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // 透明度軽減
    if (visual.reducedTransparency) {
      body.classList.add('reduced-transparency');
    }

    // 明度調整
    if (visual.reducedBrightness < 100) {
      body.classList.add('low-brightness');
      body.style.setProperty('--brightness-level', (visual.reducedBrightness / 100).toString());
    }

    // フォントサイズ
    if (visual.fontScale !== 1.0) {
      body.style.fontSize = `${visual.fontScale}em`;
    }

    // クリーンインターフェース
    if (visual.reducedClutter) {
      body.classList.add('reduced-clutter');
    }

    // モノクロモード
    if (visual.monochromeMode) {
      body.classList.add('monochrome');
    }

    // カスタムカラースキーム
    if (visual.customColorScheme) {
      this.applyCustomColorScheme(visual.customColorScheme);
    }
  }

  /**
   * 🔊 聴覚設定適用
   */
  private applyAuditoryPreferences(auditory: AuditoryPreferences): void {
    // 音声レベル設定
    const audioElements = document.querySelectorAll('audio, video');
    audioElements.forEach((element) => {
      const audioElement = element as HTMLAudioElement | HTMLVideoElement;
      if (!auditory.soundsEnabled) {
        audioElement.muted = true;
      } else {
        audioElement.volume = auditory.notificationSoundsLevel / 100;
      }
    });

    // 音声合成設定
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.rate = auditory.speechRate;
      utterance.voice =
        speechSynthesis.getVoices().find((v) => v.name === auditory.preferredVoice) || null;
    }
  }

  /**
   * 🌊 動作設定適用
   */
  private applyMotionPreferences(motion: MotionPreferences): void {
    const body = document.body;

    // 自動再生無効
    if (!motion.autoPlayVideos) {
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach((video) => {
        (video as HTMLVideoElement).removeAttribute('autoplay');
      });
    }

    // パララックス効果無効
    if (!motion.parallaxEffects) {
      body.classList.add('no-parallax');
    }

    // アニメーション時間調整
    body.style.setProperty('--animation-duration', `${motion.animationDuration}s`);

    // 点滅要素無効
    if (!motion.blinkingElements) {
      const style = document.createElement('style');
      style.textContent = '.blink, .flash, .strobe { animation: none !important; }';
      document.head.appendChild(style);
    }
  }

  /**
   * 🖱️ インタラクション設定適用
   */
  private applyInteractionPreferences(interaction: InteractionPreferences): void {
    const body = document.body;

    // 大きなクリックターゲット
    if (interaction.largerClickTargets) {
      body.classList.add('large-targets');
    }

    // 強化フォーカス
    if (interaction.focusIndicatorEnhanced) {
      body.classList.add('enhanced-focus');
    }

    // クリック遅延
    if (interaction.clickDelay > 0) {
      this.addClickDelay(interaction.clickDelay);
    }
  }

  /**
   * 🧠 認知設定適用
   */
  private applyCognitivePreferences(cognitive: CognitivePreferences): void {
    const body = document.body;

    // 簡素化インターフェース
    if (cognitive.simplifiedInterface) {
      body.classList.add('simplified-ui');
    }

    // メモリエイド
    if (cognitive.memoryAids) {
      this.addMemoryAids();
    }

    // エラー防止
    if (cognitive.errorPrevention) {
      this.enableErrorPrevention();
    }

    // 確認プロンプト
    if (cognitive.confirmationPrompts) {
      this.enableConfirmationPrompts();
    }
  }

  /**
   * 🎨 カスタムカラースキーム適用
   */
  private applyCustomColorScheme(scheme: CustomColorScheme): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', scheme.primary);
    root.style.setProperty('--color-secondary', scheme.secondary);
    root.style.setProperty('--color-background', scheme.background);
    root.style.setProperty('--color-surface', scheme.surface);
    root.style.setProperty('--color-text', scheme.text);
    root.style.setProperty('--color-border', scheme.border);
    root.style.setProperty('--color-accent', scheme.accent);
  }

  /**
   * ⏱️ クリック遅延追加
   */
  private addClickDelay(delay: number): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        e.preventDefault();
        setTimeout(() => {
          target.click();
        }, delay);
      }
    });
  }

  /**
   * 💭 メモリエイド追加
   */
  private addMemoryAids(): void {
    const interactiveElements = document.querySelectorAll('button, a, input, select');
    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (!htmlElement.hasAttribute('data-tooltip')) {
        const tooltip = this.generateTooltip(htmlElement);
        if (tooltip) {
          htmlElement.setAttribute('data-tooltip', tooltip);
          htmlElement.classList.add('memory-aid');
        }
      }
    });
  }

  /**
   * 🛡️ エラー防止有効化
   */
  private enableErrorPrevention(): void {
    // フォーム送信前の確認
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input[required]');
        let hasErrors = false;

        inputs.forEach((input) => {
          if (!(input as HTMLInputElement).value.trim()) {
            hasErrors = true;
            input.classList.add('error');
          }
        });

        if (hasErrors) {
          e.preventDefault();
          toast({
            title: '入力確認',
            description: '必須項目をすべて入力してください',
            variant: 'destructive',
          });
        }
      });
    });
  }

  /**
   * ❓ 確認プロンプト有効化
   */
  private enableConfirmationPrompts(): void {
    const dangerousActions = document.querySelectorAll('[data-dangerous], .delete, .remove');
    dangerousActions.forEach((element) => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const confirmed = confirm('この操作を実行してもよろしいですか？');
        if (confirmed) {
          (e.target as HTMLElement).click();
        }
      });
    });
  }

  /**
   * 💡 ツールチップ生成
   */
  private generateTooltip(element: HTMLElement): string | null {
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }
    if (element.getAttribute('title')) {
      return element.getAttribute('title');
    }
    if (element.textContent?.trim()) {
      return element.textContent.trim();
    }
    return null;
  }

  /**
   * 🌙 ダークモード調整
   */
  private adjustForDarkMode(): void {
    document.body.classList.add('dark-mode-sensory');
  }

  /**
   * 👂 イベントリスナー設定
   */
  private setupEventListeners(): void {
    // 緊急停止（Escape 3回）
    let escapeCount = 0;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        escapeCount++;
        if (escapeCount >= 3) {
          this.emergencyStop();
          escapeCount = 0;
        }
        setTimeout(() => (escapeCount = 0), 2000);
      }
    });
  }

  /**
   * 🚨 緊急停止
   */
  private emergencyStop(): void {
    // すべてのアニメーションと音声を停止
    document.querySelectorAll('*').forEach((element) => {
      (element as HTMLElement).style.animationPlayState = 'paused';
    });

    document.querySelectorAll('audio, video').forEach((element) => {
      (element as HTMLMediaElement).pause();
      (element as HTMLMediaElement).muted = true;
    });

    this.enableSafeMode();

    toast({
      title: '🚨 緊急停止',
      description: 'すべての刺激要素を停止しました',
      variant: 'destructive',
    });
  }

  /**
   * 📊 コンテンツ監視開始
   */
  private startContentMonitoring(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.analyzeNewContent(node as HTMLElement);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.observers.push(observer);
  }

  /**
   * 🔍 新コンテンツ分析
   */
  private analyzeNewContent(element: HTMLElement): void {
    // 危険な要素の検出
    const dangerousSelectors = [
      '[class*="flash"]',
      '[class*="blink"]',
      '[class*="strobe"]',
      'video[autoplay]',
      'audio[autoplay]',
    ];

    dangerousSelectors.forEach((selector) => {
      const matches = element.querySelectorAll(selector);
      if (matches.length > 0) {
        this.handleDangerousContent(matches);
      }
    });

    // アクセシビリティ適用
    if (this.activeProfile) {
      this.applyProfileToElement(element, this.activeProfile);
    }
  }

  /**
   * ⚠️ 危険コンテンツ処理
   */
  private handleDangerousContent(elements: NodeListOf<Element>): void {
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;

      // アニメーション停止
      htmlElement.style.animationPlayState = 'paused';

      // 自動再生停止
      if (htmlElement.tagName === 'VIDEO' || htmlElement.tagName === 'AUDIO') {
        (htmlElement as HTMLMediaElement).removeAttribute('autoplay');
        (htmlElement as HTMLMediaElement).pause();
      }

      // 警告表示
      this.showSensitivityWarning(htmlElement);
    });
  }

  /**
   * ⚠️ 感覚過敏警告表示
   */
  private showSensitivityWarning(element: HTMLElement): void {
    const warning = document.createElement('div');
    warning.className = 'sensory-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">感覚過敏に注意が必要なコンテンツです</span>
        <button class="warning-show">表示する</button>
        <button class="warning-hide">非表示</button>
      </div>
    `;

    warning.querySelector('.warning-show')?.addEventListener('click', () => {
      element.style.display = 'block';
      warning.remove();
    });

    warning.querySelector('.warning-hide')?.addEventListener('click', () => {
      element.style.display = 'none';
      warning.remove();
    });

    element.style.display = 'none';
    element.parentNode?.insertBefore(warning, element);
  }

  /**
   * 🎯 要素へのプロファイル適用
   */
  private applyProfileToElement(element: HTMLElement, profile: SensoryProfile): void {
    const { visual, motion, interaction } = profile.preferences;

    if (visual.reducedMotion) {
      element.style.animationDuration = '0.1s';
      element.style.transitionDuration = '0.1s';
    }

    if (interaction.largerClickTargets && this.isInteractive(element)) {
      element.style.minHeight = '44px';
      element.style.minWidth = '44px';
    }

    if (visual.reducedClutter && this.isDecorative(element)) {
      element.style.display = 'none';
    }
  }

  /**
   * 🖱️ インタラクティブ要素判定
   */
  private isInteractive(element: HTMLElement): boolean {
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    return (
      interactiveTags.includes(element.tagName) ||
      element.hasAttribute('onclick') ||
      element.getAttribute('role') === 'button'
    );
  }

  /**
   * 🎨 装飾要素判定
   */
  private isDecorative(element: HTMLElement): boolean {
    const decorativeClasses = ['decoration', 'ornament', 'accent', 'divider'];
    return (
      decorativeClasses.some((cls) => element.classList.contains(cls)) ||
      element.getAttribute('role') === 'presentation'
    );
  }

  // システム検出
  private setupSystemDetection(): void {
    // 色覚異常検出
    if (this.detectColorBlindness()) {
      this.enableColorBlindnessSupport();
    }

    // 運動障害検出
    if (this.detectMotorImpairment()) {
      this.enableMotorSupport();
    }
  }

  private detectColorBlindness(): boolean {
    // 簡易色覚検査（実装時はより精密な検査を使用）
    return false; // プレースホルダー
  }

  private detectMotorImpairment(): boolean {
    // マウス移動パターンから運動障害を推測
    return false; // プレースホルダー
  }

  private enableColorBlindnessSupport(): void {
    document.body.classList.add('color-blind-friendly');
  }

  private enableMotorSupport(): void {
    document.body.classList.add('motor-friendly');
  }

  // ゲッター
  getActiveProfile(): SensoryProfile | null {
    return this.activeProfile;
  }

  getProfiles(): SensoryProfile[] {
    return Array.from(this.profiles.values());
  }

  isSafeModeActive(): boolean {
    return this.safeModeActive;
  }

  // プロファイル管理
  async createProfile(
    profile: Omit<SensoryProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newProfile: SensoryProfile = {
      ...profile,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(id, newProfile);
    return id;
  }

  async updateProfile(id: string, updates: Partial<SensoryProfile>): Promise<void> {
    const profile = this.profiles.get(id);
    if (profile) {
      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.profiles.set(id, updatedProfile);
    }
  }

  async deleteProfile(id: string): Promise<void> {
    this.profiles.delete(id);
  }
}

export const sensorySensitivityService = SensorySensitivityService.getInstance();
