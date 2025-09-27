import * as Tone from "tone";

/**
 * AudioContextの状態を確認し、必要に応じて再開する（ユーザー操作後のみ）
 * @returns Promise<boolean> - 成功した場合true、失敗した場合false
 */
export const ensureAudioContextReady = async (): Promise<boolean> => {
  try {
    // AudioContextの状態を確認
    const context = Tone.getContext();
    const currentState = context.state;
    console.log(`Current AudioContext state: ${currentState}`);
    
    // 既にrunningの場合は成功
    if (currentState === 'running') {
      console.log("AudioContext is already running");
      return true;
    }
    
    // suspendedの場合はresumeを試行
    if (currentState === 'suspended') {
      console.log("AudioContext is suspended, attempting to resume...");
      try {
        await context.resume();
        
        // resume後に状態を確認（最大5秒待機）
        let attempts = 0;
        while (context.state !== 'running' && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (context.state === 'running') {
          console.log("AudioContext resumed successfully");
          return true;
        } else {
          console.warn(`AudioContext resume failed after ${attempts} attempts, state: ${context.state}`);
        }
      } catch (resumeError) {
        console.warn("Failed to resume AudioContext:", resumeError);
        // resumeに失敗した場合は新しいコンテキストを作成
        console.log("Resume failed, will create new context");
      }
    }
    
    // closedまたはその他の状態の場合は新しいコンテキストを作成
    if (currentState === 'closed' || ((currentState as string) !== 'running' && (currentState as string) !== 'suspended' && (currentState as string) !== 'interrupted')) {
      console.log("AudioContext is not running, creating new context...");
      
      try {
        // 既存のTone.jsコンテキストを適切に破棄
        if (context.state !== 'closed') {
          try {
            context.dispose();
            console.log("Disposed existing Tone.js context");
          } catch (disposeError) {
            console.warn("Failed to dispose existing context:", disposeError);
          }
        }
        
        // 新しいAudioContextを作成
        const newContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log(`Created new AudioContext with state: ${newContext.state}`);
        
        // 新しいコンテキストがsuspendedの場合はresume
        if (newContext.state === 'suspended') {
          console.log("New AudioContext is suspended, attempting to resume...");
          try {
            await newContext.resume();
            
            // resume後に状態を確認（最大3秒待機）
            let attempts = 0;
            while ((newContext.state as string) !== 'running' && attempts < 30) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
            }
            
            if ((newContext.state as string) !== 'running') {
              throw new Error(`New AudioContext failed to start after ${attempts} attempts, state: ${newContext.state}`);
            }
          } catch (resumeError) {
            console.error(`Failed to resume new AudioContext: ${resumeError instanceof Error ? resumeError.message : 'Unknown error'}`);
            // resumeに失敗した場合は新しいコンテキストを再作成
            newContext.close();
            throw new Error(`Failed to resume new AudioContext: ${resumeError instanceof Error ? resumeError.message : 'Unknown error'}`);
          }
        } else if ((newContext.state as string) !== 'running') {
          // suspended以外でrunningでない場合はエラー
          console.error(`New AudioContext is in unexpected state: ${newContext.state}`);
          newContext.close();
          throw new Error(`New AudioContext is in unexpected state: ${newContext.state}`);
        }
        
        // Tone.jsに新しいコンテキストを設定
        Tone.setContext(newContext);
        console.log("Set new context to Tone.js");
        
        // Tone.jsを開始
        await Tone.start();
        console.log("Started Tone.js");
        
        // Tone.jsが確実に開始されるまで待つ（最大5秒待機）
        let attempts = 0;
        while (Tone.getContext().state !== 'running' && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (Tone.getContext().state !== 'running') {
          throw new Error(`Tone.js failed to start after ${attempts} attempts, state: ${Tone.getContext().state}`);
        }
        
        console.log(`AudioContext and Tone.js initialized successfully after ${attempts} attempts`);
        return true;
        
      } catch (contextError) {
        console.error("Failed to create and initialize new AudioContext:", contextError);
        throw contextError;
      }
    }
    
    // 最終確認
    const finalContext = Tone.getContext();
    const finalState = finalContext.state;
    const actualContextState = finalContext.rawContext ? finalContext.rawContext.state : 'unknown';
    
    console.log(`Final AudioContext state - Tone.js: ${finalState}, Raw: ${actualContextState}`);
    
    if (finalState === 'running' || actualContextState === 'running') {
      console.log("AudioContext is ready");
      return true;
    } else {
      throw new Error(`AudioContext is not ready. Tone.js: ${finalState}, Raw: ${actualContextState}`);
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
- 現在のAudioContext状態: ${Tone.getContext().state}
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
    return Tone.getContext().state === 'running';
  } catch (error) {
    console.error("Failed to check AudioContext state:", error);
    return false;
  }
};
