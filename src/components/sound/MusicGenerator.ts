import * as Tone from "tone";
import { playSound } from "./SoundEngine";
import { generateMeiwaRhythm } from "./MeiwaSoundGenerator";
import { IDEAL_BALANCE_RATIOS } from "./constants";
import { MusicGenre, CategoryRatio } from "./types";

export const generateMusic = async (
  categoryRatios: CategoryRatio[],
  balanceScore: number,
  genre: MusicGenre,
  playSoundCallback: typeof playSound,
  generateMeiwaRhythmCallback: (beatDuration: number, categoryRatios: CategoryRatio[]) => Promise<void>
) => {
  // 明和電機風の固定テンポ（120 BPM）
  const adjustedTempo = 120;
  const beatDuration = 60 / adjustedTempo;
  const sixteenthNoteDuration = beatDuration * 0.25; // 16分音符の長さ

  const activeCats = categoryRatios
    .filter((cat) => cat.ratio > 0)
    .sort((a, b) => b.ratio - a.ratio);

  // Transportが開始されていない場合は開始
  if (Tone.Transport.state !== 'started') {
    try {
      // AudioContextの状態を確認
      const { rawContext } = Tone.getContext();
      
      if (rawContext && rawContext.state === 'closed') {
        console.warn("AudioContext is closed, cannot start Transport");
        throw new Error("AudioContext is closed");
      }
      
      if (rawContext && rawContext.state === 'suspended') {
        console.log("AudioContext is suspended, attempting to resume before starting Transport...");
        try {
          await rawContext.resume();
          console.log("AudioContext resumed successfully");
        } catch (resumeError) {
          console.warn("Failed to resume AudioContext:", resumeError);
          throw new Error("Failed to resume AudioContext");
        }
      }
      
      Tone.Transport.start();
      console.log("Tone.js Transport started successfully");
    } catch (transportError) {
      console.warn("Failed to start Transport:", transportError);
      // Transportの開始に失敗した場合はフォールバックを使用
    }
  }

  // 明和電機風の8bit音楽を生成（正確なテンポ同期）
  await generateMeiwaRhythmCallback(beatDuration, categoryRatios);

  // バランススコアに応じた追加のメロディー（機械的な正確性を重視）
  if (balanceScore > 0.5) {
    const harmonyPattern = [
      { time: 32, note: "C4", category: "vegetable", volume: 0.4 },
      { time: 36, note: "E4", category: "vegetable", volume: 0.3 },
      { time: 40, note: "G4", category: "vegetable", volume: 0.4 },
      { time: 44, note: "C5", category: "vegetable", volume: 0.5 },
    ];

    harmonyPattern.forEach((pattern) => {
      // 16分音符ベースで正確なタイミング計算
      const delay = pattern.time * sixteenthNoteDuration;
      const frequency = Tone.Frequency(pattern.note).toFrequency();
      const duration = 0.1;
      
      setTimeout(async () => {
        await playSoundCallback(pattern.category, frequency, duration, pattern.volume, "meiwa");
      }, delay);
    });
  }

  // 明和電機風の機械的リズムパターンを追加（より正確なタイミング）
  const mechanicalPattern = [
    { time: 48, note: "C3", category: "side", volume: 0.6 },
    { time: 52, note: "E3", category: "side", volume: 0.4 },
    { time: 56, note: "G3", category: "side", volume: 0.5 },
    { time: 60, note: "C4", category: "miso", volume: 0.7 },
  ];

  mechanicalPattern.forEach((pattern) => {
    const delay = pattern.time * sixteenthNoteDuration;
    const frequency = Tone.Frequency(pattern.note).toFrequency();
    const duration = 0.08; // 短い8bit風の音
    
    setTimeout(async () => {
      await playSoundCallback(pattern.category, frequency, duration, pattern.volume, "meiwa");
    }, delay);
  });
};

export const calculateBalanceScore = (categoryRatios: any[]) => {
  return categoryRatios.reduce((score, category) => {
    const ideal = IDEAL_BALANCE_RATIOS[category.id as keyof typeof IDEAL_BALANCE_RATIOS] || 0;
    return score + (1 - Math.abs(ideal - category.ratio));
  }, 0) / categoryRatios.length;
};
