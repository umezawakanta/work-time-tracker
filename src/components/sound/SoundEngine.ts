import * as Tone from "tone";

// グローバルでTone.jsの初期化状態を管理
let globalToneInitialized = false;

// 8bit風エフェクトチェーンを作成
export const create8bitEffects = () => {
  if (!globalToneInitialized) {
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
export const createMeiwaInstrument = (categoryId: string) => {
  if (!globalToneInitialized) {
    return null;
  }

  try {
    const effects = create8bitEffects();
    if (!effects) {
      return null;
    }

    // カテゴリ別の明和電機風音色設定（エフェクト付き）
    switch (categoryId) {
      case "staple":
        // ドラム風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
            detune: -12, // 低音にデチューン
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.05, 
            sustain: 0.0, 
            release: 0.1 
          },
          filter: {
            type: "lowpass",
            frequency: 400,
          } as any,
        }).connect(effects);

      case "side":
        // ベース風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "sawtooth",
            detune: -6,
          } as any,
          envelope: { 
            attack: 0.01, 
            decay: 0.1, 
            sustain: 0.3, 
            release: 0.2 
          },
          filter: {
            type: "lowpass",
            frequency: 600,
          } as any,
        }).connect(effects);

      case "miso":
        // メロディー風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
            detune: 0,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.02, 
            sustain: 0.1, 
            release: 0.15 
          },
          filter: {
            type: "lowpass",
            frequency: 1200,
          } as any,
        }).connect(effects);

      case "meat":
        // リード風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "sawtooth",
            detune: 3,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.03, 
            sustain: 0.2, 
            release: 0.1 
          },
          filter: {
            type: "lowpass",
            frequency: 800,
          } as any,
        }).connect(effects);

      case "fish":
        // 高音域の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "triangle",
            detune: 6,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.01, 
            sustain: 0.05, 
            release: 0.08 
          },
          filter: {
            type: "lowpass",
            frequency: 2000,
          } as any,
        }).connect(effects);

      case "vegetable":
        // ピアノ風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
            detune: -3,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.05, 
            sustain: 0.1, 
            release: 0.2 
          },
          filter: {
            type: "lowpass",
            frequency: 1000,
          } as any,
        }).connect(effects);

      default:
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
            detune: 0,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.02, 
            sustain: 0.0, 
            release: 0.1 
          },
          filter: {
            type: "lowpass",
            frequency: 1000,
          } as any,
        }).connect(effects);
    }
  } catch (error) {
    console.error("Failed to create Meiwa instrument:", error);
    return null;
  }
};

// Tone.jsの初期化
export const initializeTone = async (): Promise<boolean> => {
  if (globalToneInitialized) {
    return true;
  }

  try {
    await Tone.start();
    console.log("Tone.js started successfully");
    globalToneInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Tone.js:", error);
    return false;
  }
};

// 音を再生
export const playSound = (
  categoryId: string,
  frequency: number,
  duration: number,
  volume: number,
  genre?: string,
  instrumentsRef?: { [key: string]: any },
  createInstrumentForGenre?: (categoryId: string, genre: string) => any,
  getOrCreateInstrument?: (categoryId: string) => any
) => {
  if (!globalToneInitialized) {
    console.warn("Tone.js not initialized, skipping sound playback");
    return;
  }

  try {
    const instrument = genre && createInstrumentForGenre
      ? createInstrumentForGenre(categoryId, genre)
      : getOrCreateInstrument
      ? getOrCreateInstrument(categoryId)
      : null;
    
    if (!instrument) {
      return;
    }

    const volumeDb = Math.log10(Math.max(0.001, volume)) * 20;
    instrument.volume.value = volumeDb;

    if (categoryId === "staple" || genre === "japanese") {
      instrument.triggerAttackRelease("C2", duration + "s");
    } else {
      let note;
      try {
        note = Tone.Frequency(frequency, "hz").toNote();
      } catch (freqError) {
        throw new Error(`Failed to convert frequency ${frequency} Hz to a musical note: ${freqError instanceof Error ? freqError.message : String(freqError)}`);
      }
      instrument.triggerAttackRelease(note, duration + "s");
    }
  } catch (error) {
    console.log(`Could not play sound for ${categoryId}:`, error);
  }
};

export { globalToneInitialized };
