import * as Tone from "tone";
import { ensureAudioContextReady } from "./AudioContextUtils";
import { audioPlaybackFallback } from "./AudioFallbackUtils";

// Tone.jsの状態管理クラス
class ToneStateManager {
  private static instance: ToneStateManager;
  private globalToneInitialized = false;
  private toneInitializationPromise: Promise<boolean> | null = null;
  private isInitializing = false;

  private constructor() {}

  static getInstance(): ToneStateManager {
    if (!ToneStateManager.instance) {
      ToneStateManager.instance = new ToneStateManager();
    }
    return ToneStateManager.instance;
  }

  get isInitialized(): boolean {
    return this.globalToneInitialized;
  }

  get isCurrentlyInitializing(): boolean {
    return this.isInitializing;
  }

  setInitialized(value: boolean): void {
    this.globalToneInitialized = value;
  }

  setInitializing(value: boolean): void {
    this.isInitializing = value;
  }

  setInitializationPromise(promise: Promise<boolean> | null): void {
    this.toneInitializationPromise = promise;
  }

  getInitializationPromise(): Promise<boolean> | null {
    return this.toneInitializationPromise;
  }
}

const toneStateManager = ToneStateManager.getInstance();

// Tone.jsの自動初期化を防ぐ
try {
  const context = Tone.getContext();
  if (context.state !== 'closed') {
    context.dispose();
  }
} catch (error) {
  console.log(
    "Failed to dispose Tone.js context. It may already be disposed or not initialized. Error details:",
    error,
    "\nThis is usually safe to ignore unless you experience audio issues. If problems persist, try reloading the page."
  );
}

// カテゴリに応じた音符を取得する関数
const getNoteForCategory = (categoryId: string, genre?: string, frequency?: number): string => {
  // 主食や日本風の場合は固定のドラム音
  if (categoryId === "staple" || genre === "japanese") {
    return "C2";
  }
  
  // その他の場合は周波数から音符を生成
  if (frequency) {
    try {
      return Tone.Frequency(frequency, "hz").toNote();
    } catch (freqError) {
      throw new Error(`Invalid frequency (${frequency}Hz) specified for note conversion`);
    }
  }
  
  // デフォルトの音符
  return "C4";
};

// 8bit風エフェクトチェーンを作成（遅延初期化）
export const create8bitEffects = async () => {
  // Tone.jsが初期化されているか確認
  if (!toneStateManager.isInitialized) {
    const initialized = await initializeTone();
    if (!initialized) {
      console.warn("Tone.js not initialized for creating effects");
      return null;
    }
  }

  // AudioContextが準備できているか確認
  const isReady = await ensureAudioContextReady();
  if (!isReady) {
    console.warn("AudioContext is not ready for creating effects");
    return null;
  }

  try {
    // ビットクラッシュエフェクト（8bit風のデジタル歪み）
    const bitCrusher = new Tone.BitCrusher(4); // 4bitにクラッシュ（8bit風）

    // ローパスフィルター（8bit風の音質制限）
    const lowpassFilter = new Tone.Filter({
      type: "lowpass",
      frequency: 2000,
    });

    // デジタルディストーション
    const distortion = new Tone.Distortion({
      distortion: 0.2,
      wet: 0.4,
    });

    // エフェクトチェーンを構築
    bitCrusher.chain(lowpassFilter, distortion, Tone.Destination);
    
    return bitCrusher;
  } catch (error) {
    console.error("Failed to create 8bit effects:", error);
    return null;
  }
};

// 明和電機風の8bit音色を作成（エフェクト付き）
export const createMeiwaInstrument = async (categoryId: string) => {
  // Tone.jsが初期化されているか確認
  if (!toneStateManager.isInitialized) {
    const initialized = await initializeTone();
    if (!initialized) {
      console.warn("Tone.js not initialized for creating Meiwa instrument");
      return null;
    }
  }

  try {
    const effects = await create8bitEffects();
    if (!effects) {
      return null;
    }

    // カテゴリ別の明和電機風音色設定（エフェクト付き）
    switch (categoryId) {
      case "staple":
        // ドラム風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square" as const,
          },
          detune: -12, // 低音にデチューン
          envelope: { 
            attack: 0.001, 
            decay: 0.05, 
            sustain: 0.0, 
            release: 0.1 
          },
          filter: {
            type: "lowpass" as const,
            frequency: 400,
          },
        }).connect(effects);

      case "side":
        // ベース風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "sawtooth",
          },
          detune: -6,
          envelope: { 
            attack: 0.01, 
            decay: 0.1, 
            sustain: 0.3, 
            release: 0.2 
          },
          filter: {
            type: "lowpass",
            frequency: 600,
          },
        }).connect(effects);

      case "miso":
        // メロディー風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
          },
          detune: 0,
          envelope: { 
            attack: 0.001, 
            decay: 0.02, 
            sustain: 0.1, 
            release: 0.15 
          },
          filter: {
            type: "lowpass",
            frequency: 1200,
          },
        }).connect(effects);

      case "meat":
        // リード風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "sawtooth",
          },
          detune: 3,
          envelope: { 
            attack: 0.001, 
            decay: 0.03, 
            sustain: 0.2, 
            release: 0.1 
          },
          filter: {
            type: "lowpass",
            frequency: 800,
          },
        }).connect(effects);

      case "fish":
        // 高音域の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "triangle",
          },
          detune: 6,
          envelope: { 
            attack: 0.001, 
            decay: 0.01, 
            sustain: 0.05, 
            release: 0.08 
          },
          filter: {
            type: "lowpass",
            frequency: 2000,
          },
        }).connect(effects);

      case "vegetable":
        // ピアノ風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
          },
          detune: -3,
          envelope: { 
            attack: 0.001, 
            decay: 0.05, 
            sustain: 0.1, 
            release: 0.2 
          },
          filter: {
            type: "lowpass",
            frequency: 1000,
          },
        }).connect(effects);

      default:
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
          },
          detune: 0,
          envelope: { 
            attack: 0.001, 
            decay: 0.02, 
            sustain: 0.0, 
            release: 0.1 
          },
          filter: {
            type: "lowpass",
            frequency: 1000,
          },
        }).connect(effects);
    }
  } catch (error) {
    console.error("Failed to create Meiwa instrument:", error);
    return null;
  }
};

// Tone.jsの初期化（ユーザー操作時のみ）
export const initializeTone = async (): Promise<boolean> => {
  // 既に初期化済みの場合は成功を返す
  if (toneStateManager.isInitialized) {
    console.log("Tone.js is already initialized");
    return true;
  }

  // 既に初期化中の場合は同じPromiseを返す
  if (toneStateManager.getInitializationPromise()) {
    console.log("Tone.js initialization already in progress, waiting...");
    return toneStateManager.getInitializationPromise()!;
  }

  // 初期化中フラグを設定
  if (toneStateManager.isCurrentlyInitializing) {
    console.log("Tone.js is currently initializing, skipping duplicate request");
    return false;
  }

  console.log("Starting Tone.js initialization...");
  toneStateManager.setInitializing(true);

  const initializationPromise = (async () => {
    try {
      // まず既存のAudioContextの状態を確認
      const context = Tone.getContext();
      const currentState = context.state;
      console.log(`Current Tone.js context state: ${currentState}`);
      
      if (currentState === 'running') {
        console.log("Tone.js is already running");
        toneStateManager.setInitialized(true);
        return true;
      }

      // AudioContextを確実に準備
      console.log("Ensuring AudioContext is ready...");
      const audioReady = await ensureAudioContextReady();
      
      if (!audioReady) {
        throw new Error("AudioContext preparation failed");
      }

      // 最終確認
      const finalContext = Tone.getContext();
      const finalState = finalContext.state;
      const rawState = finalContext.rawContext ? finalContext.rawContext.state : 'unknown';
      
      console.log(`Final Tone.js state - Context: ${finalState}, Raw: ${rawState}`);
      
      if (finalState === 'running' || rawState === 'running') {
        // Transportも確実に開始
        try {
          if (Tone.Transport.state !== 'started') {
            console.log("Starting Tone.js Transport...");
            
            // AudioContextの状態を再確認
            const currentContext = Tone.getContext();
            const currentRawContext = currentContext.rawContext;
            
            if (currentRawContext && currentRawContext.state === 'closed') {
              console.warn("AudioContext is closed, cannot start Transport");
              throw new Error("AudioContext is closed");
            }
            
            if (currentRawContext && currentRawContext.state === 'suspended') {
              console.log("AudioContext is suspended, attempting to resume before starting Transport...");
              try {
                await currentRawContext.resume();
                console.log("AudioContext resumed successfully");
              } catch (resumeError) {
                console.warn("Failed to resume AudioContext:", resumeError);
                throw new Error("Failed to resume AudioContext");
              }
            }
            
            Tone.Transport.start();
            console.log("Tone.js Transport started successfully");
          }
        } catch (transportError) {
          console.warn("Failed to start Transport:", transportError);
          // Transportの開始に失敗してもTone.jsの初期化は成功とする
          // 後でTransportが必要になった時に再試行する
        }
        
        console.log("Tone.js initialized successfully");
        toneStateManager.setInitialized(true);
        return true;
      } else {
        throw new Error(`Tone.js initialization failed. Context: ${finalState}, Raw: ${rawState}`);
      }
      
    } catch (error) {
      console.error("Failed to initialize Tone.js:", error);
      
      // 音声初期化エラーを不具合報告フォームに送信
      const errorDetails = `
音声エンジンの初期化に失敗しました。

エラー詳細:
- エラーメッセージ: ${error instanceof Error ? error.message : "Unknown error"}
- エラータイプ: 音声初期化エラー
- 時刻: ${new Date().toISOString()}
- ユーザーエージェント: ${navigator.userAgent}
- AudioContext状態: ${Tone.getContext().state}
- ブラウザ: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}

このエラーは自動的に検出されました。
      `.trim();
      
      // グローバルな状態更新関数を呼び出すためのイベントを発火
      window.dispatchEvent(new CustomEvent('showErrorReport', {
        detail: {
          category: '音声エラー',
          content: errorDetails
        }
      }));
      
      toneStateManager.setInitialized(false);
      return false;
    } finally {
      toneStateManager.setInitializationPromise(null);
      toneStateManager.setInitializing(false);
    }
  })();

  toneStateManager.setInitializationPromise(initializationPromise);

  return initializationPromise;
};

// 音を再生（フォールバック機能付き）
export const playSound = async (
  categoryId: string,
  frequency: number,
  duration: number,
  volume: number,
  genre?: string,
  instrumentsRef?: { [key: string]: any },
  createInstrumentForGenre?: (categoryId: string, genre: string) => Promise<any>,
  getOrCreateInstrument?: (categoryId: string) => Promise<any>
) => {
  // フォールバック機能付きで音声再生を実行
  const success = await audioPlaybackFallback.playWithFallback(
    async () => {
      // Tone.jsが初期化されているか確認
      if (!toneStateManager.isInitialized) {
        const initialized = await initializeTone();
        if (!initialized) {
          throw new Error("Tone.js initialization failed");
        }
      }

      // AudioContextの状態を確認し、必要に応じて再開
      const isReady = await ensureAudioContextReady();
      if (!isReady) {
        throw new Error("AudioContext is not ready");
      }

      let instrument = null;
      
      if (genre && createInstrumentForGenre) {
        instrument = await createInstrumentForGenre(categoryId, genre);
      } else if (getOrCreateInstrument) {
        instrument = await getOrCreateInstrument(categoryId);
      }
      
      if (!instrument) {
        throw new Error("Failed to create instrument");
      }

      const volumeDb = Math.log10(Math.max(0.001, volume)) * 20;
      instrument.volume.value = volumeDb;

      const noteToPlay = getNoteForCategory(categoryId, genre, frequency);
      instrument.triggerAttackRelease(noteToPlay, duration + "s");
    },
    // フォールバック関数：シンプルなビープ音を再生
    () => {
      console.log(`Playing fallback beep for category ${categoryId}`);
      audioPlaybackFallback.playSimpleBeep(frequency, duration);
    }
  );

  if (!success) {
    console.error(`Failed to play sound for ${categoryId}, fallback also failed`);
    
    // 音声再生エラーを不具合報告フォームに送信
    const errorDetails = `
音声再生に失敗しました（フォールバック機能も失敗）。

エラー詳細:
- カテゴリID: ${categoryId}
- 周波数: ${frequency}Hz
- 再生時間: ${duration}秒
- 音量: ${volume}
- ジャンル: ${genre || '未指定'}
- エラータイプ: 音声再生エラー（フォールバック失敗）
- 時刻: ${new Date().toISOString()}
- ユーザーエージェント: ${navigator.userAgent}
- AudioContext状態: ${Tone.getContext().state}
- ブラウザ: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}

このエラーは自動的に検出されました。
    `.trim();
    
    // グローバルな状態更新関数を呼び出すためのイベントを発火
    window.dispatchEvent(new CustomEvent('showErrorReport', {
      detail: {
        category: '音声エラー',
        content: errorDetails
      }
    }));
  }
};

export { toneStateManager };
