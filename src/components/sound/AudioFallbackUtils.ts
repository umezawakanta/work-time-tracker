import * as Tone from "tone";

/**
 * 音声システムのフォールバック機能を提供するユーティリティ
 */

// フォールバック音声の設定
interface FallbackAudioConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackVolume: number;
}

const DEFAULT_FALLBACK_CONFIG: FallbackAudioConfig = {
  enabled: true,
  maxRetries: 3,
  retryDelay: 1000,
  fallbackVolume: 0.3
};

/**
 * 音声システムの状態を監視し、問題を検出する
 */
export class AudioSystemMonitor {
  private static instance: AudioSystemMonitor;
  private config: FallbackAudioConfig;
  private retryCount: number = 0;
  private lastError: Error | null = null;
  private isMonitoring: boolean = false;

  private constructor(config: Partial<FallbackAudioConfig> = {}) {
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config };
  }

  static getInstance(config?: Partial<FallbackAudioConfig>): AudioSystemMonitor {
    if (!AudioSystemMonitor.instance) {
      AudioSystemMonitor.instance = new AudioSystemMonitor(config);
    }
    return AudioSystemMonitor.instance;
  }

  /**
   * 音声システムの状態をチェック
   */
  checkAudioSystemHealth(): {
    isHealthy: boolean;
    state: string;
    error?: string;
  } {
    try {
      const contextState = Tone.context.state;
      const rawState = Tone.context.rawContext ? Tone.context.rawContext.state : 'unknown';
      
      const isHealthy = contextState === 'running' || rawState === 'running';
      
      return {
        isHealthy,
        state: contextState,
        error: isHealthy ? undefined : `Context: ${contextState}, Raw: ${rawState}`
      };
    } catch (error) {
      return {
        isHealthy: false,
        state: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 音声システムの復旧を試行
   */
  async attemptRecovery(): Promise<boolean> {
    if (this.retryCount >= this.config.maxRetries) {
      console.warn(`Audio system recovery failed after ${this.config.maxRetries} attempts`);
      return false;
    }

    this.retryCount++;
    console.log(`Attempting audio system recovery (attempt ${this.retryCount}/${this.config.maxRetries})`);

    try {
      // 既存のコンテキストを破棄
      if (Tone.context.state !== 'closed') {
        Tone.context.dispose();
      }

      // 新しいAudioContextを作成
      const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // コンテキストを開始
      if (newContext.state === 'suspended') {
        await newContext.resume();
      }

      // Tone.jsに新しいコンテキストを設定
      Tone.setContext(newContext);
      await Tone.start();

      // 状態を確認
      const health = this.checkAudioSystemHealth();
      if (health.isHealthy) {
        console.log("Audio system recovery successful");
        this.retryCount = 0;
        this.lastError = null;
        return true;
      } else {
        throw new Error(health.error || 'Recovery failed');
      }
    } catch (error) {
      this.lastError = error instanceof Error ? error : new Error('Unknown recovery error');
      console.error(`Audio system recovery attempt ${this.retryCount} failed:`, this.lastError);
      
      // 次の試行まで待機
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      return false;
    }
  }

  /**
   * 監視を開始
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log("Starting audio system monitoring");

    const monitor = () => {
      if (!this.isMonitoring) {
        return;
      }

      const health = this.checkAudioSystemHealth();
      if (!health.isHealthy) {
        console.warn("Audio system health check failed:", health.error);
        this.attemptRecovery();
      }

      setTimeout(monitor, intervalMs);
    };

    monitor();
  }

  /**
   * 監視を停止
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log("Stopped audio system monitoring");
  }

  /**
   * リトライカウントをリセット
   */
  resetRetryCount(): void {
    this.retryCount = 0;
    this.lastError = null;
  }

  /**
   * 現在の状態を取得
   */
  getStatus(): {
    retryCount: number;
    lastError: string | null;
    isMonitoring: boolean;
    config: FallbackAudioConfig;
  } {
    return {
      retryCount: this.retryCount,
      lastError: this.lastError?.message || null,
      isMonitoring: this.isMonitoring,
      config: this.config
    };
  }
}

/**
 * 音声再生のフォールバック機能
 */
export class AudioPlaybackFallback {
  private monitor: AudioSystemMonitor;

  constructor(monitor?: AudioSystemMonitor) {
    this.monitor = monitor || AudioSystemMonitor.getInstance();
  }

  /**
   * 音声再生を試行（フォールバック付き）
   */
  async playWithFallback(
    playFunction: () => Promise<void>,
    fallbackFunction?: () => void
  ): Promise<boolean> {
    try {
      // 音声システムの状態をチェック
      const health = this.monitor.checkAudioSystemHealth();
      if (!health.isHealthy) {
        console.warn("Audio system is not healthy, attempting recovery...");
        const recovered = await this.monitor.attemptRecovery();
        if (!recovered) {
          throw new Error("Audio system recovery failed");
        }
      }

      // 音声再生を試行
      await playFunction();
      return true;
    } catch (error) {
      console.error("Audio playback failed:", error);
      
      // フォールバック機能を実行
      if (fallbackFunction) {
        try {
          fallbackFunction();
          console.log("Fallback audio playback executed");
        } catch (fallbackError) {
          console.error("Fallback audio playback also failed:", fallbackError);
        }
      }

      return false;
    }
  }

  /**
   * シンプルなビープ音を再生（フォールバック用）
   */
  playSimpleBeep(frequency: number = 440, duration: number = 0.1): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      console.log(`Played fallback beep at ${frequency}Hz for ${duration}s`);
    } catch (error) {
      console.error("Failed to play fallback beep:", error);
    }
  }
}

// デフォルトのインスタンスをエクスポート
export const audioSystemMonitor = AudioSystemMonitor.getInstance();
export const audioPlaybackFallback = new AudioPlaybackFallback(audioSystemMonitor);
