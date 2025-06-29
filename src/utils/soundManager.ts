class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;

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
  }

  private saveMutedState() {
    localStorage.setItem('dq-sound-muted', this.isMuted.toString());
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
}

// シングルトンインスタンス
export const soundManager = new SoundManager();
