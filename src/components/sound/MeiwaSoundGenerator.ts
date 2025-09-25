import * as Tone from "tone";
import { playSound } from "./SoundEngine";
import { CategoryRatio, RhythmPattern } from "./types";

// 明和電機風の8bitリズムパターンを生成（音の重ね合わせ対応）
export const generateMeiwaRhythm = (
  beatDuration: number, 
  categoryRatios: CategoryRatio[], 
  playSoundCallback: (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => Promise<void>
) => {
  const activeCats = categoryRatios
    .filter((cat) => cat.ratio > 0)
    .sort((a, b) => b.ratio - a.ratio);

  // 8bit風のドラムパターン（16分音符ベース）
  const drumPattern: RhythmPattern[] = [
    { time: 0, note: "C2", category: "staple", volume: 0.8 },
    { time: 4, note: "C2", category: "staple", volume: 0.6 },
    { time: 8, note: "E2", category: "side", volume: 0.4 },
    { time: 12, note: "C2", category: "staple", volume: 0.7 },
    { time: 16, note: "G2", category: "miso", volume: 0.5 },
    { time: 20, note: "C2", category: "staple", volume: 0.6 },
    { time: 24, note: "E2", category: "side", volume: 0.3 },
    { time: 28, note: "C2", category: "staple", volume: 0.8 },
  ];

  // 明和電機風のメロディーパターン（シンプルで機械的）
  const melodyPattern = [
    { time: 0, note: "C4", category: "miso", volume: 0.6 },
    { time: 2, note: "C4", category: "miso", volume: 0.4 },
    { time: 4, note: "D4", category: "miso", volume: 0.5 },
    { time: 6, note: "D4", category: "miso", volume: 0.3 },
    { time: 8, note: "E4", category: "miso", volume: 0.6 },
    { time: 10, note: "E4", category: "miso", volume: 0.4 },
    { time: 12, note: "F4", category: "miso", volume: 0.5 },
    { time: 14, note: "F4", category: "miso", volume: 0.3 },
    { time: 16, note: "G4", category: "meat", volume: 0.7 },
    { time: 18, note: "G4", category: "meat", volume: 0.5 },
    { time: 20, note: "A4", category: "meat", volume: 0.6 },
    { time: 22, note: "A4", category: "meat", volume: 0.4 },
    { time: 24, note: "B4", category: "fish", volume: 0.5 },
    { time: 26, note: "B4", category: "fish", volume: 0.3 },
    { time: 28, note: "C5", category: "fish", volume: 0.8 },
    { time: 30, note: "C5", category: "fish", volume: 0.6 },
  ];

  // ベースパターン（低音の8bit風）
  const bassPattern = [
    { time: 0, note: "C3", category: "side", volume: 0.4 },
    { time: 8, note: "E3", category: "side", volume: 0.3 },
    { time: 16, note: "G3", category: "side", volume: 0.4 },
    { time: 24, note: "C3", category: "side", volume: 0.3 },
  ];

  // 明和電機風の音の重ね合わせ（デチューン効果）
  const layeredPattern = [
    { time: 0, note: "C4", category: "vegetable", volume: 0.3, detune: 5 },
    { time: 0, note: "C4", category: "vegetable", volume: 0.3, detune: -5 },
    { time: 8, note: "E4", category: "vegetable", volume: 0.2, detune: 3 },
    { time: 8, note: "E4", category: "vegetable", volume: 0.2, detune: -3 },
    { time: 16, note: "G4", category: "vegetable", volume: 0.3, detune: 7 },
    { time: 16, note: "G4", category: "vegetable", volume: 0.3, detune: -7 },
    { time: 24, note: "C5", category: "vegetable", volume: 0.4, detune: 4 },
    { time: 24, note: "C5", category: "vegetable", volume: 0.4, detune: -4 },
  ] as Array<{ time: number; note: string; category: string; volume: number; detune?: number }>;

  // すべてのパターンを統合して再生
  const scheduledEvents: number[] = [];
  [...drumPattern, ...melodyPattern, ...bassPattern, ...layeredPattern].forEach((pattern) => {
    const delay = pattern.time * beatDuration * 0.25 / 1000; // convert ms to seconds for Tone.Transport
    const baseFrequency = Tone.Frequency(pattern.note).toFrequency();
    const frequency = pattern.detune ? 
      baseFrequency * Math.pow(2, pattern.detune / 1200) : // セント単位のデチューン
      baseFrequency;
    const duration = 0.05; // 短い8bit風の音

    const eventId = Tone.Transport.scheduleOnce((time) => {
      playSoundCallback(pattern.category, frequency, duration, pattern.volume, "meiwa");
    }, `+${delay}`);
    scheduledEvents.push(eventId);
  });

  // Return a cleanup function to clear scheduled events
  return () => {
    scheduledEvents.forEach((id) => Tone.Transport.clear(id));
  };
};

// 和音の定義（明和電機風に強化）
export const chordProgressions = {
  major: [
    { name: "C", notes: ["C4", "E4", "G4"] },
    { name: "F", notes: ["F4", "A4", "C5"] },
    { name: "G", notes: ["G4", "B4", "D5"] },
    { name: "Am", notes: ["A4", "C5", "E5"] },
  ],
  minor: [
    { name: "Am", notes: ["A3", "C4", "E4"] },
    { name: "Dm", notes: ["D4", "F4", "A4"] },
    { name: "Em", notes: ["E4", "G4", "B4"] },
    { name: "G", notes: ["G3", "B3", "D4"] },
  ],
  jazz: [
    { name: "CMaj7", notes: ["C4", "E4", "G4", "B4"] },
    { name: "Dm7", notes: ["D4", "F4", "A4", "C5"] },
    { name: "G7", notes: ["G3", "B3", "D4", "F4"] },
    { name: "Am7", notes: ["A3", "C4", "E4", "G4"] },
  ],
  japanese: [
    { name: "Iyoushi", notes: ["C4", "D4", "F4"] },
    { name: "Youshi", notes: ["C4", "E4", "G4"] },
    { name: "Ritsu", notes: ["D4", "E4", "A4"] },
    { name: "Min", notes: ["E4", "F4", "B4"] },
  ],
  meiwa: [
    // 明和電機風の8bitメロディー（シンプルな音階）
    { name: "Meiwa1", notes: ["C4", "D4", "E4", "F4"] },
    { name: "Meiwa2", notes: ["G4", "A4", "B4", "C5"] },
    { name: "Meiwa3", notes: ["F4", "E4", "D4", "C4"] },
    { name: "Meiwa4", notes: ["G4", "F4", "E4", "D4"] },
  ],
};

// ジャンルに応じた和音進行を選択（明和電機風に強化）
export const getChordProgression = (genre: string, balanceScore: number) => {
  if (genre === "meiwa") {
    return chordProgressions.meiwa;
  }
  if (genre === "jazz") {
    return chordProgressions.jazz;
  }
  if (genre === "japanese") {
    return chordProgressions.japanese;
  }
  if (genre === "classical" || balanceScore > 0.7) {
    return chordProgressions.major;
  }
  return chordProgressions.minor;
};
