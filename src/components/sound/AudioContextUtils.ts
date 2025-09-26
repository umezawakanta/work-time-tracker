import * as Tone from "tone";

/**
 * AudioContextの状態を確認し、必要に応じて再開する（ユーザー操作後のみ）
 * @returns Promise<boolean> - 成功した場合true、失敗した場合false
 */
export const ensureAudioContextReady = async (): Promise<boolean> => {
  try {
    // AudioContextの状態を確認
    const currentState = Tone.context.state;
    console.log(`Current AudioContext state: ${currentState}`);
    
    if (currentState === 'suspended') {
      console.log("AudioContext is suspended, attempting to resume...");
      await Tone.context.resume();
    } else if (currentState === 'closed') {
      console.log("AudioContext is closed, creating new context...");
      // 新しいAudioContextを作成（ユーザー操作後なので安全）
      const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Tone.jsのコンテキストを更新
      Tone.setContext(newContext);
      
      // 新しいコンテキストが開始されるまで少し待つ
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // AudioContextが正常に動作しているか確認
    const finalState = Tone.context.state;
    if (finalState === 'running') {
      console.log("AudioContext is ready");
      return true;
    } else {
      console.warn(`AudioContext final state: ${finalState}`);
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
