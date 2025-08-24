import { toast } from '@/components/ui/use-toast';

export interface CognitiveLoadProfile {
  id: string;
  name: string;
  simplifyInterface: boolean;
  reduceChoices: boolean;
  progressIndicators: boolean;
  memorySupport: boolean;
  focusAssistance: boolean;
  taskBreakdown: boolean;
  visualCues: boolean;
  timeExtensions: boolean;
}

export interface CognitiveMetrics {
  taskComplexity: number;
  choiceOverload: number;
  memoryDemand: number;
  attentionSplit: number;
  cognitiveEffort: number;
}

/**
 * 🧠 ニューロダイバーシティ推進者: 認知負荷最適化サービス
 * 認知的負荷軽減と情報処理支援
 */
class CognitiveLoadOptimizationService {
  private static instance: CognitiveLoadOptimizationService | null = null;
  private activeProfile: CognitiveLoadProfile | null = null;
  private cognitiveTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeService();
    this.loadDefaultProfile();
  }

  public static getInstance(): CognitiveLoadOptimizationService {
    if (!CognitiveLoadOptimizationService.instance) {
      CognitiveLoadOptimizationService.instance = new CognitiveLoadOptimizationService();
    }
    return CognitiveLoadOptimizationService.instance;
  }

  private initializeService(): void {
    this.injectCognitiveStyles();
    this.setupCognitiveMonitoring();
    console.log('🧠 認知負荷最適化サービス初期化完了');
  }

  private loadDefaultProfile(): void {
    const defaultProfile: CognitiveLoadProfile = {
      id: 'cognitive-friendly',
      name: '🧠 認知負荷軽減',
      simplifyInterface: true,
      reduceChoices: true,
      progressIndicators: true,
      memorySupport: true,
      focusAssistance: true,
      taskBreakdown: true,
      visualCues: true,
      timeExtensions: true,
    };

    this.applyProfile(defaultProfile);
  }

  private injectCognitiveStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .cognitive-optimized {
        --max-choices: 5;
        --task-steps: 3;
        --focus-indicator: 3px solid #007acc;
      }
      
      .simplified-interface .secondary-actions,
      .simplified-interface .advanced-options {
        display: none !important;
      }
      
      .choice-reduced .menu-item:nth-child(n+6) {
        display: none !important;
      }
      
      .progress-enhanced .form-step::before {
        content: "ステップ " counter(step) " / " attr(data-total-steps);
        display: block;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .memory-support [data-hint] {
        position: relative;
      }
      
      .memory-support [data-hint]:hover::after {
        content: attr(data-hint);
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        top: 100%;
        left: 0;
        z-index: 1000;
      }
      
      .focus-assisted :focus {
        outline: var(--focus-indicator);
        box-shadow: 0 0 10px rgba(0, 122, 204, 0.3);
      }
      
      .task-breakdown .complex-task {
        border-left: 4px solid #4caf50;
        padding-left: 16px;
        margin: 8px 0;
      }
      
      .visual-cues .important {
        background: linear-gradient(90deg, #fff3cd 0%, transparent 100%);
        border-left: 4px solid #ffc107;
        padding-left: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  applyProfile(profile: CognitiveLoadProfile): void {
    this.activeProfile = profile;
    const body = document.body;

    if (profile.simplifyInterface) {
      body.classList.add('simplified-interface');
      this.simplifyInterface();
    }

    if (profile.reduceChoices) {
      body.classList.add('choice-reduced');
      this.reduceChoiceOverload();
    }

    if (profile.progressIndicators) {
      body.classList.add('progress-enhanced');
      this.addProgressIndicators();
    }

    if (profile.memorySupport) {
      body.classList.add('memory-support');
      this.addMemorySupport();
    }

    if (profile.focusAssistance) {
      body.classList.add('focus-assisted');
      this.enhanceFocus();
    }

    if (profile.taskBreakdown) {
      body.classList.add('task-breakdown');
      this.breakdownTasks();
    }

    if (profile.visualCues) {
      body.classList.add('visual-cues');
      this.addVisualCues();
    }

    console.log('🧠 認知負荷プロファイルを適用しました');
  }

  private simplifyInterface(): void {
    // 複雑な要素を隠す
    const complexElements = document.querySelectorAll(
      '.advanced-settings, .expert-mode, .detailed-options'
    );
    complexElements.forEach((el) => ((el as HTMLElement).style.display = 'none'));
  }

  private reduceChoiceOverload(): void {
    // 選択肢を制限
    const menus = document.querySelectorAll('.menu, .dropdown');
    menus.forEach((menu) => {
      const items = menu.querySelectorAll('.menu-item');
      if (items.length > 5) {
        const moreButton = document.createElement('button');
        moreButton.textContent = 'さらに表示...';
        moreButton.onclick = () => {
          items.forEach((item, index) => {
            if (index >= 5) (item as HTMLElement).style.display = 'block';
          });
          moreButton.remove();
        };
        menu.appendChild(moreButton);
      }
    });
  }

  private addProgressIndicators(): void {
    // フォームにプログレス追加
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      const fieldsets = form.querySelectorAll('fieldset, .form-section');
      if (fieldsets.length > 1) {
        const progress = document.createElement('div');
        progress.className = 'cognitive-progress';
        progress.innerHTML = `<progress value="1" max="${fieldsets.length}"></progress>`;
        form.insertBefore(progress, form.firstChild);
      }
    });
  }

  private addMemorySupport(): void {
    // メモリヒント追加
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label && !input.getAttribute('data-hint')) {
        input.setAttribute('data-hint', `入力項目: ${label.textContent}`);
      }
    });
  }

  private enhanceFocus(): void {
    // フォーカス管理強化
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusable = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const current = document.activeElement;
        const currentIndex = Array.from(focusable).indexOf(current as Element);

        if (e.shiftKey && currentIndex === 0) {
          e.preventDefault();
          (focusable[focusable.length - 1] as HTMLElement).focus();
        } else if (!e.shiftKey && currentIndex === focusable.length - 1) {
          e.preventDefault();
          (focusable[0] as HTMLElement).focus();
        }
      }
    });
  }

  private breakdownTasks(): void {
    // 複雑なタスクを分割
    const complexForms = document.querySelectorAll('form[data-complex="true"]');
    complexForms.forEach((form) => {
      const sections = form.querySelectorAll('.form-section');
      if (sections.length > 1) {
        this.createTaskWizard(form as HTMLFormElement, sections);
      }
    });
  }

  private addVisualCues(): void {
    // 重要な要素にビジュアルキュー追加
    const important = document.querySelectorAll('[data-important="true"], .required');
    important.forEach((el) => el.classList.add('important'));
  }

  private createTaskWizard(form: HTMLFormElement, sections: NodeListOf<Element>): void {
    const wizard = document.createElement('div');
    wizard.className = 'task-wizard';

    sections.forEach((section, index) => {
      (section as HTMLElement).style.display = index === 0 ? 'block' : 'none';
    });

    const navigation = document.createElement('div');
    navigation.innerHTML = `
      <button type="button" id="prev-step" disabled>前へ</button>
      <span>ステップ 1 / ${sections.length}</span>
      <button type="button" id="next-step">次へ</button>
    `;

    let currentStep = 0;

    navigation.querySelector('#next-step')?.addEventListener('click', () => {
      if (currentStep < sections.length - 1) {
        (sections[currentStep] as HTMLElement).style.display = 'none';
        currentStep++;
        (sections[currentStep] as HTMLElement).style.display = 'block';
        this.updateWizardNavigation(navigation, currentStep, sections.length);
      }
    });

    navigation.querySelector('#prev-step')?.addEventListener('click', () => {
      if (currentStep > 0) {
        (sections[currentStep] as HTMLElement).style.display = 'none';
        currentStep--;
        (sections[currentStep] as HTMLElement).style.display = 'block';
        this.updateWizardNavigation(navigation, currentStep, sections.length);
      }
    });

    form.appendChild(navigation);
  }

  private updateWizardNavigation(nav: HTMLElement, step: number, total: number): void {
    const prevBtn = nav.querySelector('#prev-step') as HTMLButtonElement;
    const nextBtn = nav.querySelector('#next-step') as HTMLButtonElement;
    const stepText = nav.querySelector('span');

    prevBtn.disabled = step === 0;
    nextBtn.disabled = step === total - 1;
    if (stepText) stepText.textContent = `ステップ ${step + 1} / ${total}`;
  }

  private setupCognitiveMonitoring(): void {
    // 認知負荷監視
    this.cognitiveTimer = setInterval(() => {
      const metrics = this.measureCognitiveLoad();
      if (metrics.cognitiveEffort > 80) {
        this.suggestBreak();
      }
    }, 300000); // 5分ごと
  }

  private measureCognitiveLoad(): CognitiveMetrics {
    const visibleElements = document.querySelectorAll(
      ':not([hidden]):not([style*="display: none"])'
    );
    const interactiveElements = document.querySelectorAll('button, input, select, a');
    const textLength = document.body.textContent?.length || 0;

    return {
      taskComplexity: Math.min(visibleElements.length / 50, 100),
      choiceOverload: Math.min(interactiveElements.length / 20, 100),
      memoryDemand: Math.min(textLength / 5000, 100),
      attentionSplit: Math.min(document.querySelectorAll('.modal, .popup').length * 25, 100),
      cognitiveEffort: 0, // 計算後設定
    };
  }

  private suggestBreak(): void {
    toast({
      title: '🧠 休憩をおすすめします',
      description: '認知的負荷が高くなっています。5分間休憩しませんか？',
      variant: 'default',
    });
  }

  getActiveProfile(): CognitiveLoadProfile | null {
    return this.activeProfile;
  }

  getCognitiveMetrics(): CognitiveMetrics {
    return this.measureCognitiveLoad();
  }

  enableTimeExtensions(): void {
    const timers = document.querySelectorAll('[data-timeout]');
    timers.forEach((timer) => {
      const timeout = parseInt(timer.getAttribute('data-timeout') || '0');
      timer.setAttribute('data-timeout', (timeout * 2).toString());
    });
  }
}

export const cognitiveLoadOptimizationService = CognitiveLoadOptimizationService.getInstance();
