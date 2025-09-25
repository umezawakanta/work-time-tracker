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
    }
    
    // AudioContextが正常に動作しているか確認
    if (Tone.context.state === 'running') {
      console.log("AudioContext is ready");
      return true;
    } else {
      console.warn(`AudioContext state: ${Tone.context.state}`);
      return false;
    }
  } catch (error) {
    console.error("Failed to ensure AudioContext is ready:", error);
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
