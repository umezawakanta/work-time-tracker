// 料理タイマー関連のユーティリティ関数

import type { CookingRecipes } from '../types';

export interface CookingTimerState {
    eggTimerActive: boolean;
    eggTimerPaused: boolean;
    eggTimerTime: number;
    eggTimerOriginalTime: number;
    eggTimerPhase: string;
    eggTimerPhaseTime: number;
    eggTimerPhaseName: string;
    eggTimerSound: string;
    selectedRecipe: string;
    selectedEggType?: string;
}

export interface CookingTimerSetters {
    setEggTimerTime: (time: number | ((prev: number) => number)) => void;
    setEggTimerOriginalTime: (time: number) => void;
    setEggTimerActive: (active: boolean) => void;
    setEggTimerPaused: (paused: boolean) => void;
    setEggTimerPhase: (phase: 'heating' | 'boiling' | 'cooking') => void;
    setEggTimerPhaseTime: (time: number) => void;
    setEggTimerPhaseName: (name: string) => void;
    setEggTimerInterval: (interval: NodeJS.Timeout | null) => void;
    setMessage: (message: string) => void;
    sendNotification: (title: string, body: string, icon?: string) => void;
    startSoundLoop: (soundType: 'bell' | 'chime' | 'beep' | 'alarm') => void;
    addToTimerHistory: (name: string, duration: number, type: 'custom' | 'egg' | 'preset') => void;
}

export const startCookingTimer = (
    state: CookingTimerState,
    setters: CookingTimerSetters,
    cookingRecipes: CookingRecipes,
    getRecipePhases: (recipeKey: string, eggType?: 'soft' | 'medium' | 'hard') => Array<{ name: string; duration: number }>,
    getTotalCookingTime: (recipeKey: string, eggType?: string) => number
) => {
    const {
        eggTimerActive,
        eggTimerPaused,
        selectedRecipe,
        selectedEggType,
        eggTimerSound
    } = state;

    const {
        setEggTimerTime,
        setEggTimerOriginalTime,
        setEggTimerActive,
        setEggTimerPaused,
        setEggTimerPhase,
        setEggTimerPhaseTime,
        setEggTimerPhaseName,
        setEggTimerInterval,
        setMessage,
        sendNotification,
        startSoundLoop,
        addToTimerHistory
    } = setters;

    if (eggTimerActive && !eggTimerPaused) return;

    const phases = getRecipePhases(selectedRecipe, selectedRecipe === 'egg' ? selectedEggType : undefined);
    const totalTime = getTotalCookingTime(selectedRecipe, selectedRecipe === 'egg' ? selectedEggType : undefined);

    if (eggTimerPaused) {
        // 一時停止から再開
        setEggTimerPaused(false);
        const interval = setInterval(() => {
            setEggTimerTime(prev => {
                if (prev <= 1) {
                    setEggTimerActive(false);
                    setEggTimerPaused(false);
                    clearInterval(interval);
                    setEggTimerInterval(null);
                    // タイマー終了時の通知
                    const recipeName = cookingRecipes[selectedRecipe].name;
                    setMessage(`🍳 ${recipeName}タイマー終了！できあがりです！音を停止するには「音を停止」ボタンを押してください。`);

                    // ブラウザ通知を送信
                    sendNotification(
                        `🍳 ${recipeName}タイマー終了！`,
                        `${recipeName}ができあがりました！音を停止するには「音を停止」ボタンを押してください。`,
                        '🍳'
                    );

                    // ループ音声を開始
                    startSoundLoop(eggTimerSound as 'bell' | 'chime' | 'beep' | 'alarm');

                    // 履歴に追加
                    addToTimerHistory(recipeName, state.eggTimerOriginalTime, 'egg');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setEggTimerInterval(interval);
    } else {
        // 新規開始
        setEggTimerTime(totalTime);
        setEggTimerOriginalTime(totalTime);
        setEggTimerActive(true);
        setEggTimerPaused(false);
        setEggTimerPhase('heating');
        setEggTimerPhaseTime(phases[0].duration);
        setEggTimerPhaseName(phases[0].name);

        let currentPhaseIndex = 0;

        const interval = setInterval(() => {
            setEggTimerTime(prev => {
                if (prev <= 1) {
                    setEggTimerActive(false);
                    setEggTimerPaused(false);
                    clearInterval(interval);
                    setEggTimerInterval(null);
                    // タイマー終了時の通知
                    const recipeName = cookingRecipes[selectedRecipe].name;
                    setMessage(`🍳 ${recipeName}タイマー終了！できあがりです！音を停止するには「音を停止」ボタンを押してください。`);

                    // ブラウザ通知を送信
                    sendNotification(
                        `🍳 ${recipeName}タイマー終了！`,
                        `${recipeName}ができあがりました！音を停止するには「音を停止」ボタンを押してください。`,
                        '🍳'
                    );

                    // ループ音声を開始
                    startSoundLoop(eggTimerSound as 'bell' | 'chime' | 'beep' | 'alarm');

                    // 履歴に追加
                    addToTimerHistory(recipeName, totalTime, 'egg');
                    return 0;
                }

                // 段階の更新チェック
                const remainingTime = prev - 1;
                let phaseTimeRemaining = remainingTime;
                let newPhaseIndex = 0;

                for (let i = 0; i < phases.length; i++) {
                    if (phaseTimeRemaining <= phases[i].duration) {
                        newPhaseIndex = i;
                        break;
                    }
                    phaseTimeRemaining -= phases[i].duration;
                }

                if (newPhaseIndex !== currentPhaseIndex) {
                    currentPhaseIndex = newPhaseIndex;
                    setEggTimerPhase(newPhaseIndex === 0 ? 'heating' : newPhaseIndex === phases.length - 1 ? 'cooking' : 'boiling');
                    setEggTimerPhaseTime(phaseTimeRemaining);
                    setEggTimerPhaseName(phases[newPhaseIndex].name);

                    // 段階変更の通知
                    setMessage(`🔄 ${phases[newPhaseIndex].name}に移行しました！`);
                }

                return remainingTime;
            });
        }, 1000);

        setEggTimerInterval(interval);
    }
};
