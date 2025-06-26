import { toast } from '@/components/ui/use-toast';

export interface DyslexiaSettings {
  readableFont: boolean;
  increasedLineSpacing: boolean;
  letterSpacing: boolean;
  reducedJustification: boolean;
  highlightFocus: boolean;
  readingRuler: boolean;
  wordHighlight: boolean;
  syllableBreaking: boolean;
  colorOverlay: string | null;
  textToSpeech: boolean;
  readingSpeed: number;
}

export interface ReadingAssistant {
  isActive: boolean;
  currentWord: number;
  wordsPerMinute: number;
  highlightColor: string;
  pauseOnPunctuation: boolean;
}

/**
 * 🧠 ニューロダイバーシティ推進者: ディスレクシア支援サービス
 * 読字障害・読み困難への配慮機能
 */
class DyslexiaSupportService {
  private static instance: DyslexiaSupportService | null = null;
  private settings: DyslexiaSettings;
  private readingAssistant: ReadingAssistant;
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.readingAssistant = {
      isActive: false,
      currentWord: 0,
      wordsPerMinute: 200,
      highlightColor: '#ffeb3b',
      pauseOnPunctuation: true,
    };
    this.initializeService();
  }

  public static getInstance(): DyslexiaSupportService {
    if (!DyslexiaSupportService.instance) {
      DyslexiaSupportService.instance = new DyslexiaSupportService();
    }
    return DyslexiaSupportService.instance;
  }

  private initializeService(): void {
    this.injectDyslexiaStyles();
    this.setupEventListeners();
    this.initializeSpeechSynthesis();
    this.applySettings(this.settings);
    console.log('🧠 ディスレクシア支援サービス初期化完了');
  }

  private getDefaultSettings(): DyslexiaSettings {
    return {
      readableFont: true,
      increasedLineSpacing: true,
      letterSpacing: true,
      reducedJustification: true,
      highlightFocus: true,
      readingRuler: false,
      wordHighlight: false,
      syllableBreaking: false,
      colorOverlay: null,
      textToSpeech: false,
      readingSpeed: 200,
    };
  }

  private injectDyslexiaStyles(): void {
    const style = document.createElement('style');
    style.id = 'dyslexia-support-styles';
    style.textContent = `
      /* ディスレクシア対応フォント */
      .dyslexia-friendly {
        font-family: 'OpenDyslexic', 'Arial', sans-serif !important;
        font-weight: normal !important;
      }
      
      /* 行間拡大 */
      .increased-line-spacing {
        line-height: 1.8 !important;
      }
      
      /* 文字間隔拡大 */
      .letter-spacing {
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      
      /* 両端揃え無効 */
      .no-justify {
        text-align: left !important;
      }
      
      /* フォーカスハイライト */
      .focus-highlight:focus,
      .focus-highlight .focused {
        background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%) !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
      }
      
      /* 読み上げルーラー */
      .reading-ruler {
        position: fixed;
        width: 100%;
        height: 2px;
        background: #ff5722;
        z-index: 10000;
        pointer-events: none;
        transition: top 0.2s ease;
      }
      
      /* 単語ハイライト */
      .word-highlight {
        background: var(--highlight-color, #ffeb3b) !important;
        padding: 1px 2px !important;
        border-radius: 2px !important;
        transition: background 0.3s ease !important;
      }
      
      /* 音節分割 */
      .syllable-break {
        position: relative;
      }
      
      .syllable-break::after {
        content: '•';
        color: #999;
        font-size: 0.7em;
        position: absolute;
        top: -2px;
      }
      
      /* カラーオーバーレイ */
      .color-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: multiply;
      }
      
      /* 読みやすさ向上 */
      .dyslexia-optimized p {
        max-width: 70ch !important;
        margin-bottom: 1.5em !important;
      }
      
      .dyslexia-optimized h1,
      .dyslexia-optimized h2,
      .dyslexia-optimized h3 {
        color: #333 !important;
        font-weight: bold !important;
        margin-top: 2em !important;
        margin-bottom: 1em !important;
      }
      
      /* テキスト選択表示改善 */
      .dyslexia-optimized ::selection {
        background: #b3d4fc !important;
        color: #000 !important;
      }
      
      /* スクロール位置維持 */
      .reading-mode {
        scroll-behavior: smooth !important;
      }
      
      /* 読み上げコントロール */
      .speech-controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
      }
      
      .speech-controls button {
        margin: 0 4px;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        background: #2196f3;
        color: white;
        cursor: pointer;
      }
      
      .speech-controls button:hover {
        background: #1976d2;
      }
      
      .speech-controls button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  applySettings(settings: DyslexiaSettings): void {
    this.settings = settings;
    const body = document.body;

    // 読みやすいフォント
    if (settings.readableFont) {
      body.classList.add('dyslexia-friendly');
    }

    // 行間拡大
    if (settings.increasedLineSpacing) {
      body.classList.add('increased-line-spacing');
    }

    // 文字間隔
    if (settings.letterSpacing) {
      body.classList.add('letter-spacing');
    }

    // 両端揃え無効
    if (settings.reducedJustification) {
      body.classList.add('no-justify');
    }

    // フォーカスハイライト
    if (settings.highlightFocus) {
      body.classList.add('focus-highlight');
      this.setupFocusTracking();
    }

    // 読み上げルーラー
    if (settings.readingRuler) {
      this.createReadingRuler();
    }

    // 単語ハイライト
    if (settings.wordHighlight) {
      this.enableWordHighlight();
    }

    // 音節分割
    if (settings.syllableBreaking) {
      this.applySyllableBreaking();
    }

    // カラーオーバーレイ
    if (settings.colorOverlay) {
      this.applyColorOverlay(settings.colorOverlay);
    }

    // 読み上げ
    if (settings.textToSpeech) {
      this.enableTextToSpeech();
    }

    body.classList.add('dyslexia-optimized', 'reading-mode');
    console.log('🧠 ディスレクシア設定を適用しました');
  }

  private setupFocusTracking(): void {
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        target.classList.add('focused');
      }
    });

    document.addEventListener('focusout', (e) => {
      const target = e.target as HTMLElement;
      target.classList.remove('focused');
    });
  }

  private createReadingRuler(): void {
    const ruler = document.createElement('div');
    ruler.className = 'reading-ruler';
    ruler.id = 'dyslexia-ruler';
    document.body.appendChild(ruler);

    document.addEventListener('mousemove', (e) => {
      ruler.style.top = `${e.clientY}px`;
    });

    // クリックで固定/解除
    document.addEventListener('click', (e) => {
      if (e.ctrlKey) {
        ruler.style.position = ruler.style.position === 'absolute' ? 'fixed' : 'absolute';
      }
    });
  }

  private enableWordHighlight(): void {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        this.highlightSelectedText(selection);
      }
    });

    // キーボードナビゲーション
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        this.highlightCurrentWord();
      }
    });
  }

  private highlightSelectedText(selection: Selection): void {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'word-highlight';
    span.style.background = this.readingAssistant.highlightColor;

    try {
      range.surroundContents(span);
    } catch (e) {
      // 複雑な選択の場合はスキップ
      console.log('単語ハイライトをスキップしました');
    }
  }

  private highlightCurrentWord(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.textContent) {
      const words = activeElement.textContent.split(/\s+/);
      // 現在の単語をハイライト（簡易実装）
      console.log('現在の単語をハイライト中');
    }
  }

  private applySyllableBreaking(): void {
    const textNodes = this.getTextNodes(document.body);
    textNodes.forEach((node) => {
      if (node.textContent && node.textContent.length > 6) {
        const syllables = this.breakIntoSyllables(node.textContent);
        if (syllables.length > 1) {
          const container = document.createElement('span');
          syllables.forEach((syllable, index) => {
            const span = document.createElement('span');
            span.textContent = syllable;
            if (index < syllables.length - 1) {
              span.classList.add('syllable-break');
            }
            container.appendChild(span);
          });
          node.parentNode?.replaceChild(container, node);
        }
      }
    });
  }

  private breakIntoSyllables(text: string): string[] {
    // 日本語の音節分割（簡易版）
    const hiragana = /[\u3040-\u309F]/;
    const katakana = /[\u30A0-\u30FF]/;

    if (hiragana.test(text) || katakana.test(text)) {
      return text.split('').map((char) => char);
    }

    // 英語の音節分割（簡易版）
    return text.split(/(?=[aeiou])/gi).filter((s) => s.length > 0);
  }

  private applyColorOverlay(color: string): void {
    let overlay = document.getElementById('dyslexia-overlay') as HTMLElement;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'dyslexia-overlay';
      overlay.className = 'color-overlay';
      document.body.appendChild(overlay);
    }
    overlay.style.background = color;
  }

  private enableTextToSpeech(): void {
    this.createSpeechControls();

    // テキスト選択時の読み上げ
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        this.speakText(selection.toString());
      }
    });

    // ページ全体読み上げ
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        this.speakPage();
      }
    });
  }

  private createSpeechControls(): void {
    const controls = document.createElement('div');
    controls.className = 'speech-controls';
    controls.innerHTML = `
      <button id="speak-page">📖 ページ読み上げ</button>
      <button id="pause-speech">⏸️ 一時停止</button>
      <button id="stop-speech">⏹️ 停止</button>
      <button id="speed-down">🐌 遅く</button>
      <button id="speed-up">🐰 速く</button>
    `;

    // イベントリスナー設定
    controls.querySelector('#speak-page')?.addEventListener('click', () => this.speakPage());
    controls.querySelector('#pause-speech')?.addEventListener('click', () => this.pauseSpeech());
    controls.querySelector('#stop-speech')?.addEventListener('click', () => this.stopSpeech());
    controls.querySelector('#speed-down')?.addEventListener('click', () => this.adjustSpeed(-0.2));
    controls.querySelector('#speed-up')?.addEventListener('click', () => this.adjustSpeed(0.2));

    document.body.appendChild(controls);
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  private speakText(text: string): void {
    if (!this.speechSynthesis) return;

    this.stopSpeech();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = this.settings.readingSpeed / 200;
    this.currentUtterance.lang = 'ja-JP';

    this.currentUtterance.onstart = () => {
      console.log('🗣️ 読み上げ開始');
    };

    this.currentUtterance.onend = () => {
      console.log('🗣️ 読み上げ終了');
    };

    this.speechSynthesis.speak(this.currentUtterance);
  }

  private speakPage(): void {
    const content = this.extractMainContent();
    this.speakText(content);
  }

  private extractMainContent(): string {
    // メインコンテンツを抽出
    const main = document.querySelector('main, [role="main"], .content');
    if (main) {
      return main.textContent || '';
    }

    // フォールバック：ページタイトルと最初の段落
    const title = document.title;
    const firstP = document.querySelector('p');
    return `${title}。${firstP?.textContent || ''}`;
  }

  private pauseSpeech(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.pause();
    }
  }

  private stopSpeech(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  private adjustSpeed(delta: number): void {
    this.settings.readingSpeed = Math.max(
      50,
      Math.min(400, this.settings.readingSpeed + delta * 100)
    );

    toast({
      title: '読み上げ速度変更',
      description: `読み上げ速度: ${this.settings.readingSpeed}語/分`,
      variant: 'default',
    });
  }

  private getTextNodes(element: Element): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    return textNodes;
  }

  private setupEventListeners(): void {
    // Escapeキーで読み上げ停止
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.stopSpeech();
      }
    });

    // ページ読み込み時の自動適用
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.applySettings(this.settings), 1000);
      });
    }
  }

  // 設定管理
  updateSettings(newSettings: Partial<DyslexiaSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings(this.settings);
    localStorage.setItem('dyslexia-settings', JSON.stringify(this.settings));
  }

  getSettings(): DyslexiaSettings {
    return { ...this.settings };
  }

  // カラーオーバーレイ設定
  setColorOverlay(color: string | null): void {
    this.settings.colorOverlay = color;
    if (color) {
      this.applyColorOverlay(color);
    } else {
      const overlay = document.getElementById('dyslexia-overlay');
      overlay?.remove();
    }
  }

  // 読み上げ制御
  isReading(): boolean {
    return this.speechSynthesis?.speaking || false;
  }

  // クリーンアップ
  cleanup(): void {
    this.stopSpeech();
    document.getElementById('dyslexia-ruler')?.remove();
    document.getElementById('dyslexia-overlay')?.remove();
    document.querySelector('.speech-controls')?.remove();
  }
}

export const dyslexiaSupportService = DyslexiaSupportService.getInstance();
