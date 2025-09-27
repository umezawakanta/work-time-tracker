// シンプルなWeb Audio APIベースの音声エンジン
class SimpleAudioEngine {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private gainNode: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeTimeouts: NodeJS.Timeout[] = [];

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized && this.audioContext?.state === 'running') {
        return true;
      }

      // 既存のコンテキストをクリーンアップ
      if (this.audioContext) {
        await this.audioContext.close();
      }

      // 新しいAudioContextを作成
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // GainNodeを作成（音量制御用）
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      // コンテキストがsuspendedの場合はresume
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log("SimpleAudioEngine initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize SimpleAudioEngine:", error);
      return false;
    }
  }

  async playTone(frequency: number, duration: number, volume: number = 0.5): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) {
      console.warn("AudioEngine not initialized");
      return;
    }

    try {
      // オシレーターを作成
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // 音色を設定（8bit風の矩形波）
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // 音量エンベロープを設定
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      // 接続
      oscillator.connect(gainNode);
      gainNode.connect(this.gainNode);

      // アクティブなオシレーターリストに追加
      this.activeOscillators.push(oscillator);

      // 再生
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      // 停止時にリストから削除
      oscillator.addEventListener('ended', () => {
        const index = this.activeOscillators.indexOf(oscillator);
        if (index > -1) {
          this.activeOscillators.splice(index, 1);
        }
      });

      console.log(`Playing tone: ${frequency}Hz for ${duration}s at volume ${volume}`);
    } catch (error) {
      console.error("Failed to play tone:", error);
    }
  }

  async playMeiwaRhythm(categoryRatios: any[], beatDuration: number): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioEngine not initialized");
      return;
    }

    // 既存のタイムアウトをクリア
    this.clearAllTimeouts();

    // 明和電機風のシンプルなリズムパターン
    const patterns = [
      { time: 0, frequency: 220, duration: 0.1, volume: 0.8 }, // A3
      { time: 0.25, frequency: 220, duration: 0.1, volume: 0.6 },
      { time: 0.5, frequency: 330, duration: 0.1, volume: 0.4 }, // E4
      { time: 0.75, frequency: 220, duration: 0.1, volume: 0.7 },
      { time: 1.0, frequency: 392, duration: 0.1, volume: 0.5 }, // G4
      { time: 1.25, frequency: 220, duration: 0.1, volume: 0.6 },
      { time: 1.5, frequency: 330, duration: 0.1, volume: 0.3 },
      { time: 1.75, frequency: 220, duration: 0.1, volume: 0.8 },
    ];

    for (const pattern of patterns) {
      const timeoutId = setTimeout(() => {
        this.playTone(pattern.frequency, pattern.duration, pattern.volume);
      }, pattern.time * beatDuration * 1000);
      
      this.activeTimeouts.push(timeoutId);
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.audioContext?.state === 'running';
  }

  getState(): string {
    return this.audioContext?.state || 'not initialized';
  }

  // 全ての音を停止
  stopAll(): void {
    console.log("Stopping all audio...");
    
    // アクティブなオシレーターを停止
    this.activeOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (error) {
        // 既に停止している場合は無視
        console.log("Oscillator already stopped");
      }
    });
    this.activeOscillators = [];

    // アクティブなタイムアウトをクリア
    this.clearAllTimeouts();
    
    console.log("All audio stopped");
  }

  // タイムアウトをクリア
  private clearAllTimeouts(): void {
    this.activeTimeouts.forEach(timeout => clearTimeout(timeout));
    this.activeTimeouts = [];
  }
}

// シングルトンインスタンス
export const simpleAudioEngine = new SimpleAudioEngine();

// 音声再生関数（Tone.jsの代替）
export const playSound = async (
  categoryId: string,
  frequency: number,
  duration: number,
  volume: number,
  genre?: string
): Promise<void> => {
  if (!simpleAudioEngine.isReady()) {
    const initialized = await simpleAudioEngine.initialize();
    if (!initialized) {
      console.warn("Failed to initialize audio engine");
      return;
    }
  }

  await simpleAudioEngine.playTone(frequency, duration, volume);
};

// 明和電機風リズム生成（Tone.jsの代替）
export const generateMeiwaRhythm = async (
  beatDuration: number,
  categoryRatios: any[],
  playSoundCallback: (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => Promise<void>
): Promise<void> => {
  if (!simpleAudioEngine.isReady()) {
    const initialized = await simpleAudioEngine.initialize();
    if (!initialized) {
      console.warn("Failed to initialize audio engine");
      return;
    }
  }

  await simpleAudioEngine.playMeiwaRhythm(categoryRatios, beatDuration);
};

// 音楽生成（Tone.jsの代替）
export const generateMusic = async (
  categoryRatios: any[],
  balanceScore: number,
  genre: string,
  playSoundCallback: typeof playSound,
  generateMeiwaRhythmCallback: (beatDuration: number, categoryRatios: any[]) => Promise<void>
): Promise<void> => {
  if (!simpleAudioEngine.isReady()) {
    const initialized = await simpleAudioEngine.initialize();
    if (!initialized) {
      console.warn("Failed to initialize audio engine");
      return;
    }
  }

  const beatDuration = 0.5; // 120 BPM
  await generateMeiwaRhythmCallback(beatDuration, categoryRatios);
};

// バランススコア計算
export const calculateBalanceScore = (categoryRatios: any[]): number => {
  const totalRatio = categoryRatios.reduce((sum, cat) => sum + cat.ratio, 0);
  return totalRatio > 0 ? Math.min(totalRatio, 1) : 0;
};
