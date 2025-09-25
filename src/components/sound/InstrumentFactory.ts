import * as Tone from "tone";
import { ensureAudioContextReady } from "./AudioContextUtils";

export const createInstrumentForCategory = async (categoryId: string) => {
  // AudioContextが準備できているか確認
  const isReady = await ensureAudioContextReady();
  if (!isReady) {
    console.warn("AudioContext is not ready for creating instrument");
    return null;
  }
  switch (categoryId) {
    case "staple":
      // 明和電機風のドラム音
      return new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 12,
        oscillator: { 
          type: "sawtooth",
          detune: 5,
        },
        envelope: { 
          attack: 0.001, 
          decay: 0.2, 
          sustain: 0.01, 
          release: 0.8 
        },
      }).toDestination();

    case "side":
      // 明和電機風のベース音
      return new Tone.FMSynth({
        harmonicity: 2.5,
        modulationIndex: 20,
        oscillator: { 
          type: "sawtooth",
          detune: -10,
        },
        envelope: { 
          attack: 0.01, 
          decay: 0.2, 
          sustain: 0.3, 
          release: 0.4 
        },
        modulation: { 
          type: "square",
          detune: 5,
        },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.6,
          release: 0.3,
        },
      }).toDestination();

    case "miso":
      // 明和電機風のトランペット音
      return new Tone.FMSynth({
        harmonicity: 1.8,
        modulationIndex: 25,
        oscillator: { 
          type: "triangle",
          detune: 3,
        },
        envelope: { 
          attack: 0.02, 
          decay: 0.1, 
          sustain: 0.6, 
          release: 0.2 
        },
        modulation: { 
          type: "sine",
          detune: -2,
        },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.05,
          sustain: 0.8,
          release: 0.1,
        },
      }).toDestination();

    case "meat":
      // 明和電機風のエレキギター音
      return new Tone.FMSynth({
        harmonicity: 4.0,
        modulationIndex: 35,
        oscillator: { 
          type: "sawtooth",
          detune: 8,
        },
        envelope: { 
          attack: 0.001, 
          decay: 0.2, 
          sustain: 0.1, 
          release: 0.3 
        },
        modulation: { 
          type: "square",
          detune: -8,
        },
        modulationEnvelope: {
          attack: 0.005,
          decay: 0.3,
          sustain: 0.1,
          release: 0.05,
        },
      }).toDestination();

    case "fish":
      // 明和電機風のシンセサイザー音
      return new Tone.FMSynth({
        harmonicity: 1.2,
        modulationIndex: 18,
        oscillator: { 
          type: "sawtooth",
          detune: 12,
        },
        envelope: { 
          attack: 0.01, 
          decay: 0.05, 
          sustain: 0.2, 
          release: 0.3 
        },
        modulation: { 
          type: "triangle",
          detune: -5,
        },
        modulationEnvelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.4,
          release: 0.2,
        },
      }).toDestination();

    case "vegetable":
      // 明和電機風のピアノ音
      return new Tone.FMSynth({
        harmonicity: 0.5,
        modulationIndex: 8,
        oscillator: { 
          type: "sine",
          detune: 2,
        },
        envelope: { 
          attack: 0.005, 
          decay: 0.2, 
          sustain: 0.4, 
          release: 0.8 
        },
        modulation: { 
          type: "sine",
          detune: 1,
        },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.2,
          release: 0.5,
        },
      }).toDestination();

    default:
      return null;
  }
};
