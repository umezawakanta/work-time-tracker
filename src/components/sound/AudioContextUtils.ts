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
      
      // resume後に状態を確認
      let attempts = 0;
      while (Tone.context.state !== 'running' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (Tone.context.state === 'running') {
        console.log("AudioContext resumed successfully");
        return true;
      } else {
        console.warn(`AudioContext resume failed, state: ${Tone.context.state}`);
      }
    }
    
    if (currentState === 'closed' || currentState !== 'running') {
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
        
        // Tone.jsのコンテキスト状態を強制的に更新
        if (newContext.state === 'running') {
          // Tone.jsのコンテキストを再初期化して状態を同期
          try {
            // 既存のTone.jsコンテキストを破棄
            if (Tone.context.state !== 'closed') {
              Tone.context.dispose();
            }
            
            // 新しいコンテキストを設定
            Tone.setContext(newContext);
            
            // 少し待ってからTone.jsを開始
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Tone.jsを開始
            await Tone.start();
            
            // Tone.jsが確実に開始されるまで待つ
            let attempts = 0;
            while (Tone.context.state !== 'running' && attempts < 10) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
            }
            
            console.log(`Tone.js context synchronized with new AudioContext after ${attempts} attempts`);
          } catch (toneError) {
            console.warn("Failed to start Tone.js with new context:", toneError);
          }
        }
      } catch (contextError) {
        console.error("Failed to create new AudioContext:", contextError);
        throw contextError;
      }
    }
    
    // AudioContextが正常に動作しているか確認
    const finalState = Tone.context.state;
    const actualContextState = Tone.context.rawContext ? Tone.context.rawContext.state : 'unknown';
    
    console.log(`Final AudioContext state - Tone.js: ${finalState}, Raw: ${actualContextState}`);
    
    // Tone.jsのコンテキストがrunningでない場合は再試行
    if (finalState !== 'running') {
      console.warn(`Tone.js context is not running (${finalState}), attempting to restart...`);
      try {
        await Tone.start();
        console.log("Tone.js restarted successfully");
      } catch (restartError) {
        console.error("Failed to restart Tone.js:", restartError);
        throw new Error(`AudioContext is not ready. Tone.js: ${Tone.context.state}, Raw: ${actualContextState}`);
      }
    }
    
    // 最終確認
    const finalCheckState = Tone.context.state;
    if (finalCheckState === 'running' || actualContextState === 'running') {
      console.log("AudioContext is ready");
      return true;
    } else {
      console.warn(`AudioContext final state - Tone.js: ${finalCheckState}, Raw: ${actualContextState}`);
      throw new Error(`AudioContext is not ready. Tone.js: ${finalCheckState}, Raw: ${actualContextState}`);
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
