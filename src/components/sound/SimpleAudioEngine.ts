// 波形の種類
export enum WaveformType {
  SINE = 'sine',
  SQUARE = 'square',
  SAWTOOTH = 'sawtooth',
  TRIANGLE = 'triangle'
}

// 楽器の種類
export enum InstrumentType {
  PIANO = 'piano',
  GUITAR = 'guitar',
  DRUM = 'drum',
  BASS = 'bass',
  SYNTH = 'synth',
  MEIWA = 'meiwa' // 明和電機風
}

// ADSRエンベロープ設定
export interface EnvelopeSettings {
  attack: number;  // アタック時間（秒）
  decay: number;   // ディケイ時間（秒）
  sustain: number; // サステインレベル（0-1）
  release: number; // リリース時間（秒）
}

// 楽器設定
export interface InstrumentSettings {
  type: InstrumentType;
  waveform: WaveformType;
  envelope: EnvelopeSettings;
  detune?: number; // セント単位のデチューン
  harmonics?: number[]; // 倍音の重み
}

// 拡張されたWeb Audio APIベースの音声エンジン
class SimpleAudioEngine {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private gainNode: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeTimeouts: NodeJS.Timeout[] = [];
  private reverbNode: ConvolverNode | null = null;
  private delayNode: DelayNode | null = null;

  // 楽器別のデフォルト設定
  private getInstrumentSettings(type: InstrumentType): InstrumentSettings {
    const settings: { [key in InstrumentType]: InstrumentSettings } = {
      [InstrumentType.PIANO]: {
        type: InstrumentType.PIANO,
        waveform: WaveformType.SINE,
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 },
        detune: 0,
        harmonics: [1, 0.5, 0.25, 0.125]
      },
      [InstrumentType.GUITAR]: {
        type: InstrumentType.GUITAR,
        waveform: WaveformType.SAWTOOTH,
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.8 },
        detune: 0,
        harmonics: [1, 0.8, 0.6, 0.4, 0.2]
      },
      [InstrumentType.DRUM]: {
        type: InstrumentType.DRUM,
        waveform: WaveformType.SQUARE,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.2 },
        detune: 0,
        harmonics: [1, 0.3, 0.1]
      },
      [InstrumentType.BASS]: {
        type: InstrumentType.BASS,
        waveform: WaveformType.SAWTOOTH,
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.8, release: 0.6 },
        detune: 0,
        harmonics: [1, 0.7, 0.5, 0.3]
      },
      [InstrumentType.SYNTH]: {
        type: InstrumentType.SYNTH,
        waveform: WaveformType.SQUARE,
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.9, release: 0.3 },
        detune: 0,
        harmonics: [1, 0.5, 0.25]
      },
      [InstrumentType.MEIWA]: {
        type: InstrumentType.MEIWA,
        waveform: WaveformType.SQUARE,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.8, release: 0.1 },
        detune: 0,
        harmonics: [1, 0.3, 0.1]
      }
    };
    return settings[type];
  }

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

      // リバーブノードを作成
      this.reverbNode = this.audioContext.createConvolver();
      this.reverbNode.buffer = this.createReverbBuffer();
      this.reverbNode.connect(this.gainNode);

      // ディレイノードを作成
      this.delayNode = this.audioContext.createDelay(1.0);
      this.delayNode.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
      this.delayNode.connect(this.gainNode);

      // コンテキストがsuspendedの場合はresume
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log("SimpleAudioEngine initialized successfully with effects");
      return true;
    } catch (error) {
      console.error("Failed to initialize SimpleAudioEngine:", error);
      return false;
    }
  }

  // リバーブバッファを作成
  private createReverbBuffer(): AudioBuffer {
    if (!this.audioContext) {
      throw new Error("AudioContext not initialized");
    }
    
    const length = this.audioContext.sampleRate * 2; // 2秒
    const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    return buffer;
  }

  // 拡張されたplayToneメソッド（楽器別音色対応）
  async playTone(
    frequency: number, 
    duration: number, 
    volume: number = 0.5, 
    instrumentType: InstrumentType = InstrumentType.MEIWA
  ): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) {
      console.warn("AudioEngine not initialized");
      return;
    }

    try {
      const settings = this.getInstrumentSettings(instrumentType);
      await this.playToneWithSettings(frequency, duration, volume, settings);
    } catch (error) {
      console.error("Failed to play tone:", error);
    }
  }

  // 設定付きの音色再生
  private async playToneWithSettings(
    frequency: number,
    duration: number,
    volume: number,
    settings: InstrumentSettings
  ): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      return;
    }

    const currentTime = this.audioContext.currentTime;
    const { envelope } = settings;

    // メインオシレーターを作成
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // 波形を設定
    oscillator.type = settings.waveform as OscillatorType;
    oscillator.frequency.setValueAtTime(frequency, currentTime);
    
    if (settings.detune) {
      oscillator.detune.setValueAtTime(settings.detune, currentTime);
    }

    // ADSRエンベロープを適用
    const attackEnd = currentTime + envelope.attack;
    const decayEnd = attackEnd + envelope.decay;
    const releaseStart = currentTime + duration - envelope.release;

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, attackEnd);
    gainNode.gain.linearRampToValueAtTime(volume * envelope.sustain, decayEnd);
    gainNode.gain.setValueAtTime(volume * envelope.sustain, releaseStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

    // 倍音を追加（楽器の特徴を再現）
    if (settings.harmonics && settings.harmonics.length > 1) {
      for (let i = 1; i < settings.harmonics.length; i++) {
        const harmonicOsc = this.audioContext.createOscillator();
        const harmonicGain = this.audioContext.createGain();
        
        harmonicOsc.type = settings.waveform as OscillatorType;
        harmonicOsc.frequency.setValueAtTime(frequency * (i + 1), currentTime);
        
        const harmonicVolume = volume * settings.harmonics[i] * 0.3; // 倍音は控えめに
        
        harmonicGain.gain.setValueAtTime(0, currentTime);
        harmonicGain.gain.linearRampToValueAtTime(harmonicVolume, attackEnd);
        harmonicGain.gain.linearRampToValueAtTime(harmonicVolume * envelope.sustain, decayEnd);
        harmonicGain.gain.setValueAtTime(harmonicVolume * envelope.sustain, releaseStart);
        harmonicGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

        harmonicOsc.connect(harmonicGain);
        harmonicGain.connect(this.gainNode);
        
        harmonicOsc.start(currentTime);
        harmonicOsc.stop(currentTime + duration);
        
        this.activeOscillators.push(harmonicOsc);
      }
    }

    // 接続
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);

    // エフェクトを適用
    if (this.reverbNode && settings.type !== InstrumentType.DRUM) {
      const reverbGain = this.audioContext.createGain();
      reverbGain.gain.setValueAtTime(0.3, currentTime);
      gainNode.connect(reverbGain);
      reverbGain.connect(this.reverbNode);
    }

    // アクティブなオシレーターリストに追加
    this.activeOscillators.push(oscillator);

    // 再生
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);

    // 停止時にリストから削除
    oscillator.addEventListener('ended', () => {
      const index = this.activeOscillators.indexOf(oscillator);
      if (index > -1) {
        this.activeOscillators.splice(index, 1);
      }
    });

    console.log(`Playing ${settings.type} tone: ${frequency}Hz for ${duration}s at volume ${volume}`);
  }

  // 楽器別の和音再生
  async playChord(
    frequencies: number[],
    duration: number,
    volume: number = 0.5,
    instrumentType: InstrumentType = InstrumentType.PIANO
  ): Promise<void> {
    const promises = frequencies.map(freq => 
      this.playTone(freq, duration, volume / frequencies.length, instrumentType)
    );
    await Promise.all(promises);
  }

  async playMeiwaRhythm(categoryRatios: any[], beatDuration: number): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioEngine not initialized");
      return;
    }

    // 既存のタイムアウトをクリア
    this.clearAllTimeouts();

    // 明和電機風のシンプルなリズムパターン（楽器別音色対応）
    const patterns = [
      { time: 0, frequency: 220, duration: 0.1, volume: 0.8, instrument: InstrumentType.MEIWA }, // A3
      { time: 0.25, frequency: 220, duration: 0.1, volume: 0.6, instrument: InstrumentType.MEIWA },
      { time: 0.5, frequency: 330, duration: 0.1, volume: 0.4, instrument: InstrumentType.SYNTH }, // E4
      { time: 0.75, frequency: 220, duration: 0.1, volume: 0.7, instrument: InstrumentType.MEIWA },
      { time: 1.0, frequency: 392, duration: 0.1, volume: 0.5, instrument: InstrumentType.PIANO }, // G4
      { time: 1.25, frequency: 220, duration: 0.1, volume: 0.6, instrument: InstrumentType.MEIWA },
      { time: 1.5, frequency: 330, duration: 0.1, volume: 0.3, instrument: InstrumentType.SYNTH },
      { time: 1.75, frequency: 220, duration: 0.1, volume: 0.8, instrument: InstrumentType.MEIWA },
    ];

    for (const pattern of patterns) {
      const timeoutId = setTimeout(() => {
        this.playTone(pattern.frequency, pattern.duration, pattern.volume, pattern.instrument);
      }, pattern.time * beatDuration * 1000);
      
      this.activeTimeouts.push(timeoutId);
    }
  }

  // 楽器別のリズムパターン再生
  async playInstrumentRhythm(
    categoryRatios: any[], 
    beatDuration: number, 
    instrumentType: InstrumentType = InstrumentType.PIANO
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioEngine not initialized");
      return;
    }

    this.clearAllTimeouts();

    // 楽器別のリズムパターン
    const patterns = this.getInstrumentRhythmPatterns(instrumentType, beatDuration);

    for (const pattern of patterns) {
      const timeoutId = setTimeout(() => {
        this.playTone(pattern.frequency, pattern.duration, pattern.volume, instrumentType);
      }, pattern.time * beatDuration * 1000);
      
      this.activeTimeouts.push(timeoutId);
    }
  }

  // 楽器別のリズムパターンを取得
  private getInstrumentRhythmPatterns(instrumentType: InstrumentType, beatDuration: number) {
    const basePatterns = {
      [InstrumentType.PIANO]: [
        { time: 0, frequency: 261.63, duration: 0.3, volume: 0.7 }, // C4
        { time: 0.5, frequency: 329.63, duration: 0.3, volume: 0.6 }, // E4
        { time: 1.0, frequency: 392.00, duration: 0.3, volume: 0.8 }, // G4
        { time: 1.5, frequency: 261.63, duration: 0.3, volume: 0.5 }, // C4
      ],
      [InstrumentType.GUITAR]: [
        { time: 0, frequency: 220, duration: 0.2, volume: 0.6 }, // A3
        { time: 0.25, frequency: 246.94, duration: 0.2, volume: 0.5 }, // B3
        { time: 0.5, frequency: 293.66, duration: 0.2, volume: 0.7 }, // D4
        { time: 0.75, frequency: 329.63, duration: 0.2, volume: 0.6 }, // E4
        { time: 1.0, frequency: 220, duration: 0.2, volume: 0.8 }, // A3
        { time: 1.5, frequency: 293.66, duration: 0.2, volume: 0.5 }, // D4
      ],
      [InstrumentType.DRUM]: [
        { time: 0, frequency: 100, duration: 0.05, volume: 0.9 }, // キック
        { time: 0.5, frequency: 200, duration: 0.05, volume: 0.7 }, // スネア
        { time: 1.0, frequency: 100, duration: 0.05, volume: 0.9 }, // キック
        { time: 1.5, frequency: 200, duration: 0.05, volume: 0.7 }, // スネア
      ],
      [InstrumentType.BASS]: [
        { time: 0, frequency: 82.41, duration: 0.4, volume: 0.8 }, // E2
        { time: 0.5, frequency: 87.31, duration: 0.4, volume: 0.7 }, // F2
        { time: 1.0, frequency: 92.50, duration: 0.4, volume: 0.8 }, // F#2
        { time: 1.5, frequency: 87.31, duration: 0.4, volume: 0.7 }, // F2
      ],
      [InstrumentType.SYNTH]: [
        { time: 0, frequency: 440, duration: 0.2, volume: 0.6 }, // A4
        { time: 0.25, frequency: 523.25, duration: 0.2, volume: 0.5 }, // C5
        { time: 0.5, frequency: 659.25, duration: 0.2, volume: 0.7 }, // E5
        { time: 0.75, frequency: 523.25, duration: 0.2, volume: 0.5 }, // C5
        { time: 1.0, frequency: 440, duration: 0.2, volume: 0.8 }, // A4
        { time: 1.5, frequency: 659.25, duration: 0.2, volume: 0.6 }, // E5
      ]
    };

    return basePatterns[instrumentType] || basePatterns[InstrumentType.PIANO];
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

// 音声再生関数（Tone.jsの代替）- 楽器別音色対応
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

  // ジャンルに基づいて楽器タイプを決定
  const instrumentType = getInstrumentTypeFromGenre(genre);
  await simpleAudioEngine.playTone(frequency, duration, volume, instrumentType);
};

// ジャンルから楽器タイプを取得
const getInstrumentTypeFromGenre = (genre?: string): InstrumentType => {
  if (!genre) {
    return InstrumentType.MEIWA;
  }
  
  const genreMap: { [key: string]: InstrumentType } = {
    'meiwa': InstrumentType.MEIWA,
    'piano': InstrumentType.PIANO,
    'guitar': InstrumentType.GUITAR,
    'drum': InstrumentType.DRUM,
    'bass': InstrumentType.BASS,
    'synth': InstrumentType.SYNTH,
    'rock': InstrumentType.GUITAR,
    'classical': InstrumentType.PIANO,
    'techno': InstrumentType.SYNTH,
    'jazz': InstrumentType.PIANO,
    'ambient': InstrumentType.SYNTH
  };
  
  return genreMap[genre.toLowerCase()] || InstrumentType.MEIWA;
};

// 楽器別音色での音声再生
export const playSoundWithInstrument = async (
  frequency: number,
  duration: number,
  volume: number,
  instrumentType: InstrumentType
): Promise<void> => {
  if (!simpleAudioEngine.isReady()) {
    const initialized = await simpleAudioEngine.initialize();
    if (!initialized) {
      console.warn("Failed to initialize audio engine");
      return;
    }
  }

  await simpleAudioEngine.playTone(frequency, duration, volume, instrumentType);
};

// 和音再生
export const playChord = async (
  frequencies: number[],
  duration: number,
  volume: number,
  instrumentType: InstrumentType = InstrumentType.PIANO
): Promise<void> => {
  if (!simpleAudioEngine.isReady()) {
    const initialized = await simpleAudioEngine.initialize();
    if (!initialized) {
      console.warn("Failed to initialize audio engine");
      return;
    }
  }

  await simpleAudioEngine.playChord(frequencies, duration, volume, instrumentType);
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
