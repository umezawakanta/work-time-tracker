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
      try {
        // 新しいAudioContextを作成（ユーザー操作後なので安全）
        const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Tone.jsのコンテキストを更新
        Tone.setContext(newContext);
        
        // 新しいコンテキストが開始されるまで待つ
        if (newContext.state === 'suspended') {
          console.log("New AudioContext is suspended, attempting to resume...");
          await newContext.resume();
        }
        
        // コンテキストが確実に開始されるまで待つ
        let attempts = 0;
        while (newContext.state !== 'running' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          attempts++;
        }
        
        console.log(`AudioContext creation completed after ${attempts} attempts, state: ${newContext.state}`);
      } catch (contextError) {
        console.error("Failed to create new AudioContext:", contextError);
        throw contextError;
      }
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
    
    // AudioContextエラーを不具合報告フォームに送信
    const errorDetails = `
AudioContextの初期化に失敗しました。

エラー詳細:
- エラーメッセージ: ${error instanceof Error ? error.message : "Unknown error"}
- エラータイプ: AudioContext初期化エラー
- 時刻: ${new Date().toISOString()}
- ユーザーエージェント: ${navigator.userAgent}
- 現在のAudioContext状態: ${Tone.context.state}
- ブラウザ: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}

このエラーは自動的に検出されました。
    `.trim();
    
    // グローバルな状態更新関数を呼び出すためのイベントを発火
    window.dispatchEvent(new CustomEvent('showErrorReport', {
      detail: {
        category: '音声エラー',
        content: errorDetails
      }
    }));
    
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
