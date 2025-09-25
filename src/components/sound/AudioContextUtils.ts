import * as Tone from "tone";

/**
 * AudioContextの状態を確認し、必要に応じて再開する
 * @returns Promise<boolean> - 成功した場合true、失敗した場合false
 */
export const ensureAudioContextReady = async (): Promise<boolean> => {
  try {
    // AudioContextの状態を確認
    if (Tone.context.state === 'suspended') {
      console.log("AudioContext is suspended, attempting to resume...");
      await Tone.context.resume();
      console.log("AudioContext resumed successfully");
    }
    return true;
  } catch (error) {
    console.error("Failed to resume AudioContext:", error);
    return false;
  }
};

/**
 * AudioContextが準備できているかチェック
 * @returns boolean - 準備できている場合true
 */
export const isAudioContextReady = (): boolean => {
  try {
    return Tone.context.state === 'running';
  } catch (error) {
    console.error("Failed to check AudioContext state:", error);
    return false;
  }
};
