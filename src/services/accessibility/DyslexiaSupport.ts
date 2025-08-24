import { toast } from '@/components/ui/use-toast';

export interface DyslexiaSettings {
  readableFont: boolean;
  increasedLineSpacing: boolean;
  letterSpacing: boolean;
  highlightFocus: boolean;
  textToSpeech: boolean;
  readingSpeed: number;
}

/**
 * 🧠 ニューロダイバーシティ推進者: ディスレクシア支援サービス
 */
class DyslexiaSupportService {
  private static instance: DyslexiaSupportService | null = null;
  private settings: DyslexiaSettings;
  private speechSynthesis: SpeechSynthesis | null = null;

  private constructor() {
    this.settings = {
      readableFont: true,
      increasedLineSpacing: true,
      letterSpacing: true,
      highlightFocus: true,
      textToSpeech: false,
      readingSpeed: 200,
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
    this.injectStyles();
    this.setupEventListeners();
    this.initializeSpeech();
    this.applySettings();
    console.log('🧠 ディスレクシア支援サービス初期化完了');
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .dyslexia-friendly {
        font-family: 'Arial', sans-serif !important;
        line-height: 1.8 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      
      .focus-highlight:focus {
        background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%) !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
      }
      
      .word-highlight {
        background: #ffeb3b !important;
        padding: 1px 2px !important;
        border-radius: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  private applySettings(): void {
    const body = document.body;

    if (this.settings.readableFont) {
      body.classList.add('dyslexia-friendly');
    }

    if (this.settings.highlightFocus) {
      body.classList.add('focus-highlight');
    }

    if (this.settings.textToSpeech) {
      this.enableTextToSpeech();
    }
  }

  private enableTextToSpeech(): void {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        this.speakText(selection.toString());
      }
    });
  }

  private speakText(text: string): void {
    if (!this.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.settings.readingSpeed / 200;
    utterance.lang = 'ja-JP';
    this.speechSynthesis.speak(utterance);
  }

  private initializeSpeech(): void {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.speechSynthesis) {
        this.speechSynthesis.cancel();
      }
    });
  }

  updateSettings(newSettings: Partial<DyslexiaSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  getSettings(): DyslexiaSettings {
    return { ...this.settings };
  }
}

export const dyslexiaSupportService = DyslexiaSupportService.getInstance();
