class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private bgmGainNode: GainNode | null = null;
  private currentBgmSource: AudioBufferSourceNode | null = null;
  private bgmVolume: number = 0.3;
  private isBgmMuted: boolean = false;

  constructor() {
    this.initializeAudioContext();
    this.loadMutedState();
  }

  private initializeAudioContext() {
    try {
      // ユーザーインタラクション後に初期化
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private loadMutedState() {
    const saved = localStorage.getItem('dq-sound-muted');
    this.isMuted = saved === 'true';

    const bgmSaved = localStorage.getItem('dq-bgm-muted');
    this.isBgmMuted = bgmSaved === 'true';

    const bgmVolumeSaved = localStorage.getItem('dq-bgm-volume');
    if (bgmVolumeSaved) {
      this.bgmVolume = parseFloat(bgmVolumeSaved);
    }
  }

  private saveMutedState() {
    localStorage.setItem('dq-sound-muted', this.isMuted.toString());
    localStorage.setItem('dq-bgm-muted', this.isBgmMuted.toString());
    localStorage.setItem('dq-bgm-volume', this.bgmVolume.toString());
  }

  async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Web Audio APIでビープ音を生成（DQ風）
  async playTextSound() {
    if (this.isMuted) return;

    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // DQ風のテキスト表示音
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume * 0.3,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Failed to play text sound:', error);
    }
  }

  // メッセージ完了音
  async playMessageCompleteSound() {
    if (this.isMuted) return;

    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // DQ風の決定音
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(550, this.audioContext.currentTime + 0.05);
      oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume * 0.4,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Failed to play message complete sound:', error);
    }
  }

  // ボタンクリック音
  async playButtonSound() {
    if (this.isMuted) return;

    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // DQ風のカーソル移動音
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume * 0.2,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (error) {
      console.warn('Failed to play button sound:', error);
    }
  }

  // レベルアップ音
  async playLevelUpSound() {
    if (this.isMuted) return;

    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = this.audioContext.currentTime;
      // DQ風のレベルアップメロディー
      playNote(523, now, 0.2); // C
      playNote(659, now + 0.1, 0.2); // E
      playNote(784, now + 0.2, 0.2); // G
      playNote(1047, now + 0.3, 0.4); // C (オクターブ上)
    } catch (error) {
      console.warn('Failed to play level up sound:', error);
    }
  }

  // 警告音
  async playWarningSound() {
    if (this.isMuted) return;

    try {
      await this.ensureAudioContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // DQ風の警告音
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume * 0.4,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play warning sound:', error);
    }
  }

  // 音量設定
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('dq-sound-volume', this.volume.toString());
  }

  getVolume(): number {
    return this.volume;
  }

  // ミュート切り替え
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveMutedState();
    return this.isMuted;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }

  // 初期化（ユーザーインタラクション時に呼ぶ）
  async initialize() {
    try {
      await this.ensureAudioContext();
      // BGM用のGainNodeを作成
      if (this.audioContext && !this.bgmGainNode) {
        this.bgmGainNode = this.audioContext.createGain();
        this.bgmGainNode.connect(this.audioContext.destination);
        this.updateBgmVolume();
      }

      // 無音のテスト音を再生してブラウザの制限を解除
      if (this.audioContext) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.001);
      }
    } catch (error) {
      console.warn('Failed to initialize sound manager:', error);
    }
  }

  // BGM関連のメソッド

  /**
   * 🎵 BGM再生（Web Audio APIでドラゴンクエスト風のメロディーを生成）
   */
  async playQuestBgm() {
    if (this.isBgmMuted) return;

    try {
      await this.ensureAudioContext();
      if (!this.audioContext || !this.bgmGainNode) return;

      // 既存のBGMを停止
      this.stopBgm();

      // ドラゴンクエスト風のメロディーを生成（著作権フリー）
      this.playGeneratedQuestBgm();
    } catch (error) {
      console.warn('Failed to play quest BGM:', error);
    }
  }

  /**
   * 🎼 ドラゴンクエスト風メロディー生成・再生
   */
  private playGeneratedQuestBgm() {
    if (!this.audioContext || !this.bgmGainNode) return;

    // DQ風のコード進行とメロディーを作成
    const questMelody = [
      // メインテーマ風（4/4拍子）
      { note: 'C4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'C5', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },
      { note: 'C4', duration: 1.0 },

      { note: 'D4', duration: 0.5 },
      { note: 'F4', duration: 0.5 },
      { note: 'A4', duration: 0.5 },
      { note: 'D5', duration: 0.5 },
      { note: 'A4', duration: 0.5 },
      { note: 'F4', duration: 0.5 },
      { note: 'D4', duration: 1.0 },

      { note: 'E4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'B4', duration: 0.5 },
      { note: 'E5', duration: 0.5 },
      { note: 'D5', duration: 0.5 },
      { note: 'C5', duration: 0.5 },
      { note: 'G4', duration: 1.0 },

      { note: 'F4', duration: 0.5 },
      { note: 'A4', duration: 0.5 },
      { note: 'C5', duration: 0.5 },
      { note: 'F5', duration: 0.5 },
      { note: 'E5', duration: 0.5 },
      { note: 'D5', duration: 0.5 },
      { note: 'C5', duration: 2.0 },
    ];

    // 音程マッピング
    const noteFrequencies: Record<string, number> = {
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.0,
      A4: 440.0,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
      E5: 659.25,
      F5: 698.46,
      G5: 783.99,
    };

    let currentTime = this.audioContext.currentTime;

    // メロディーをループ再生
    const playMelodyLoop = () => {
      if (!this.audioContext || !this.bgmGainNode) return;

      questMelody.forEach((note, index) => {
        // メインメロディー
        this.createTone(noteFrequencies[note.note], currentTime, note.duration, 0.1, 'sine');

        // ハーモニー（3度下）
        const harmonyFreq = noteFrequencies[note.note] * 0.794; // 短3度下
        this.createTone(harmonyFreq, currentTime, note.duration, 0.06, 'triangle');

        // ベース音（オクターブ下）
        const bassFreq = noteFrequencies[note.note] * 0.5;
        this.createTone(bassFreq, currentTime, note.duration, 0.08, 'square');

        currentTime += note.duration;
      });

      // 2秒の休符後にループ
      setTimeout(
        () => {
          if (!this.isBgmMuted && this.currentBgmSource) {
            currentTime = this.audioContext!.currentTime;
            playMelodyLoop();
          }
        },
        (currentTime - this.audioContext.currentTime + 2) * 1000
      );
    };

    // ダミーのSourceNodeを作成してループ管理
    this.currentBgmSource = this.audioContext.createBufferSource();
    playMelodyLoop();
  }

  /**
   * 🎼 音色生成
   */
  private createTone(
    frequency: number,
    startTime: number,
    duration: number,
    volume: number,
    waveType: OscillatorType
  ) {
    if (!this.audioContext || !this.bgmGainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.bgmGainNode);

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // エンベロープ（ADSR）
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * this.bgmVolume, startTime + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(volume * this.bgmVolume * 0.8, startTime + 0.1); // Decay
    gainNode.gain.setValueAtTime(volume * this.bgmVolume * 0.7, startTime + duration - 0.1); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Release

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * 🛑 BGM停止
   */
  stopBgm() {
    if (this.currentBgmSource) {
      try {
        this.currentBgmSource.stop();
      } catch (error) {
        // Already stopped
      }
      this.currentBgmSource = null;
    }
  }

  /**
   * 🔊 BGM音量更新
   */
  private updateBgmVolume() {
    if (this.bgmGainNode) {
      const volume = this.isBgmMuted ? 0 : this.bgmVolume;
      this.bgmGainNode.gain.setValueAtTime(volume, this.audioContext?.currentTime || 0);
    }
  }

  // BGM制御の公開メソッド

  /**
   * BGM音量設定
   */
  setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateBgmVolume();
    this.saveMutedState();
  }

  getBgmVolume(): number {
    return this.bgmVolume;
  }

  /**
   * BGMミュート切り替え
   */
  toggleBgmMute(): boolean {
    this.isBgmMuted = !this.isBgmMuted;
    this.updateBgmVolume();
    this.saveMutedState();
    return this.isBgmMuted;
  }

  isBgmSoundMuted(): boolean {
    return this.isBgmMuted;
  }

  /**
   * クエストページ用BGM開始
   */
  async startQuestPageBgm() {
    await this.initialize();
    if (!this.isBgmMuted) {
      await this.playQuestBgm();
    }
  }

  /**
   * クエストページ用BGM停止
   */
  stopQuestPageBgm() {
    this.stopBgm();
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager();
