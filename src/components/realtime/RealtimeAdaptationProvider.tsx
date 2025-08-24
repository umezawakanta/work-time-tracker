/**
 * ⚡ リアルタイム適応プロバイダー
 * 行動パターンに基づくリアルタイムUI調整システム
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import BehavioralPatternDetector from '@/services/realtime/BehavioralPatternDetector';
import { useAdaptiveUI } from '@/components/ui/AdaptiveUIProvider';

// リアルタイム適応の型定義
interface RealtimeAdaptationState {
  isActive: boolean;
  cognitiveState: {
    attention: number;
    energy: number;
    stress: number;
    cognitiveLoad: number;
    flow: number;
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
  };
  adaptationHistory: AdaptationEvent[];
  currentRecommendations: string[];
  sessionMetrics: {
    sessionDuration: number;
    interactionCount: number;
    adaptationCount: number;
    averageAttention: number;
    averageEnergy: number;
  };
}

interface AdaptationEvent {
  timestamp: Date;
  type: 'ui_adjustment' | 'recommendation' | 'warning' | 'celebration';
  trigger: string;
  action: string;
  impact: 'low' | 'medium' | 'high';
  userResponse?: 'accepted' | 'dismissed' | 'ignored';
}

interface RealtimeAdaptationContextType {
  state: RealtimeAdaptationState;
  detector: BehavioralPatternDetector | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  getCurrentCognitiveState: () => any;
  addAdaptationEvent: (event: Omit<AdaptationEvent, 'timestamp'>) => void;
  updateUserResponse: (eventIndex: number, response: AdaptationEvent['userResponse']) => void;
}

const RealtimeAdaptationContext = createContext<RealtimeAdaptationContextType | null>(null);

// 初期状態
const initialState: RealtimeAdaptationState = {
  isActive: false,
  cognitiveState: {
    attention: 70,
    energy: 60,
    stress: 30,
    cognitiveLoad: 40,
    flow: 50,
    trend: 'stable',
    confidence: 0.5,
  },
  adaptationHistory: [],
  currentRecommendations: [],
  sessionMetrics: {
    sessionDuration: 0,
    interactionCount: 0,
    adaptationCount: 0,
    averageAttention: 70,
    averageEnergy: 60,
  },
};

interface RealtimeAdaptationProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
  adaptationThreshold?: number;
}

export const RealtimeAdaptationProvider: React.FC<RealtimeAdaptationProviderProps> = ({
  children,
  autoStart = true,
  adaptationThreshold = 0.7,
}) => {
  const [state, setState] = useState<RealtimeAdaptationState>(initialState);
  const [detector, setDetector] = useState<BehavioralPatternDetector | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const sessionStartTime = useRef<Date>(new Date());
  const adaptationThresholdRef = useRef(adaptationThreshold);

  // 適応的UIシステムとの連携 - 一時的に無効化（コンテキストエラー修正）
  // TODO: AdaptiveUIProvider のコンテキスト問題を解決後に再有効化
  const updateCognitiveState = (state: any) => {
    // プレースホルダー関数 - 引数を受け取るが何もしない
    console.log('updateCognitiveState called with:', state);
  };
  const updateSettings = (settings: any) => {
    // プレースホルダー関数 - 引数を受け取るが何もしない
    console.log('updateSettings called with:', settings);
  };

  // 行動パターン検出器の初期化
  useEffect(() => {
    const behavioralDetector = new BehavioralPatternDetector();
    setDetector(behavioralDetector);

    // イベントリスナーの設定
    behavioralDetector.on('cognitiveStateChanged', handleCognitiveStateChange);
    behavioralDetector.on('interactionRecorded', handleInteractionRecorded);
    behavioralDetector.on('sessionFinalized', handleSessionFinalized);

    // 自動開始
    if (autoStart) {
      behavioralDetector.startTracking();
      setIsTracking(true);
      setState((prev) => ({ ...prev, isActive: true }));
    }

    return () => {
      behavioralDetector.removeAllListeners();
      behavioralDetector.stopTracking();
    };
  }, [autoStart]);

  /**
   * 認知状態変化の処理
   */
  const handleCognitiveStateChange = useCallback(
    (cognitiveState: any) => {
      console.log('🧠 認知状態が更新されました:', cognitiveState);

      setState((prev) => ({
        ...prev,
        cognitiveState: {
          attention: cognitiveState.current.attention,
          energy: cognitiveState.current.energy,
          stress: cognitiveState.current.stress,
          cognitiveLoad: cognitiveState.current.cognitiveLoad,
          flow: cognitiveState.current.flow,
          trend: cognitiveState.trend,
          confidence: cognitiveState.confidence,
        },
        currentRecommendations: cognitiveState.recommendations,
      }));

      // 適応的UIシステムに状態を通知
      updateCognitiveState({
        currentEnergyLevel: Math.round(cognitiveState.current.energy / 10), // 0-100 → 1-10
        currentFocusLevel: Math.round(cognitiveState.current.attention / 10), // 0-100 → 1-10
        currentStressLevel: Math.round(cognitiveState.current.stress / 10), // 0-100 → 1-10
        cognitiveLoad: Math.round(cognitiveState.current.cognitiveLoad / 10), // 0-100 → 1-10
      });

      // 閾値を超えた場合の自動調整
      if (cognitiveState.confidence >= adaptationThresholdRef.current) {
        performAutomaticAdaptations(cognitiveState);
      }

      // 推奨事項の表示
      if (cognitiveState.recommendations.length > 0) {
        addAdaptationEvent({
          type: 'recommendation',
          trigger: 'cognitive_state_analysis',
          action: `推奨事項: ${cognitiveState.recommendations.join(', ')}`,
          impact: 'medium',
        });
      }
    },
    [updateCognitiveState]
  );

  /**
   * 自動的な適応処理
   */
  const performAutomaticAdaptations = useCallback(
    (cognitiveState: any) => {
      const { current } = cognitiveState;

      // 注意力が低下している場合
      if (current.attention < 40) {
        updateSettings({
          animationLevel: 'none',
          layoutDensity: 'spacious',
          focusIndicators: 'prominent',
        });

        addAdaptationEvent({
          type: 'ui_adjustment',
          trigger: 'low_attention',
          action: 'アニメーション無効化、レイアウト簡素化',
          impact: 'high',
        });
      }

      // ストレスレベルが高い場合
      if (current.stress > 70) {
        updateSettings({
          colorScheme: 'low-contrast',
          animationLevel: 'minimal',
        });

        addAdaptationEvent({
          type: 'ui_adjustment',
          trigger: 'high_stress',
          action: '低コントラスト配色、アニメーション最小化',
          impact: 'medium',
        });
      }

      // 認知負荷が高い場合
      if (current.cognitiveLoad > 80) {
        updateSettings({
          layoutDensity: 'spacious',
          navigationStyle: 'minimal',
        });

        addAdaptationEvent({
          type: 'ui_adjustment',
          trigger: 'high_cognitive_load',
          action: 'ナビゲーション簡素化、レイアウト拡張',
          impact: 'high',
        });
      }

      // フロー状態が良好な場合
      if (current.flow > 80) {
        addAdaptationEvent({
          type: 'celebration',
          trigger: 'high_flow_state',
          action: '集中状態良好！継続を推奨',
          impact: 'low',
        });
      }

      // エネルギーレベルが低い場合
      if (current.energy < 30) {
        addAdaptationEvent({
          type: 'warning',
          trigger: 'low_energy',
          action: '休憩推奨: エネルギーレベルが低下しています',
          impact: 'high',
        });
      }
    },
    [updateSettings]
  );

  /**
   * ユーザー操作の記録処理
   */
  const handleInteractionRecorded = useCallback((interaction: any) => {
    setState((prev) => ({
      ...prev,
      sessionMetrics: {
        ...prev.sessionMetrics,
        interactionCount: prev.sessionMetrics.interactionCount + 1,
      },
    }));
  }, []);

  /**
   * セッション終了の処理
   */
  const handleSessionFinalized = useCallback((sessionData: any) => {
    console.log('📊 セッションが終了しました:', sessionData);

    setState((prev) => ({
      ...prev,
      isActive: false,
      sessionMetrics: {
        ...prev.sessionMetrics,
        sessionDuration: sessionData.duration,
        interactionCount: sessionData.totalInteractions,
      },
    }));

    // セッション終了の記録
    addAdaptationEvent({
      type: 'ui_adjustment',
      trigger: 'session_end',
      action: `セッション終了: ${Math.round(sessionData.duration / 60000)}分間`,
      impact: 'low',
    });
  }, []);

  /**
   * 追跡開始
   */
  const startTracking = useCallback(() => {
    if (detector) {
      detector.startTracking();
      setIsTracking(true);
      sessionStartTime.current = new Date();

      setState((prev) => ({
        ...prev,
        isActive: true,
        sessionMetrics: {
          ...prev.sessionMetrics,
          sessionDuration: 0,
          interactionCount: 0,
          adaptationCount: 0,
        },
      }));

      addAdaptationEvent({
        type: 'ui_adjustment',
        trigger: 'tracking_start',
        action: 'リアルタイム適応システム開始',
        impact: 'low',
      });

      console.log('🚀 リアルタイム適応システムを開始しました');
    }
  }, [detector]);

  /**
   * 追跡停止
   */
  const stopTracking = useCallback(() => {
    if (detector) {
      detector.stopTracking();
      setIsTracking(false);

      setState((prev) => ({
        ...prev,
        isActive: false,
      }));

      addAdaptationEvent({
        type: 'ui_adjustment',
        trigger: 'tracking_stop',
        action: 'リアルタイム適応システム停止',
        impact: 'low',
      });

      console.log('⏹️ リアルタイム適応システムを停止しました');
    }
  }, [detector]);

  /**
   * 現在の認知状態取得
   */
  const getCurrentCognitiveState = useCallback(() => {
    if (detector) {
      return detector.getCurrentCognitiveState();
    }
    return null;
  }, [detector]);

  /**
   * 適応イベントの追加
   */
  const addAdaptationEvent = useCallback((event: Omit<AdaptationEvent, 'timestamp'>) => {
    const adaptationEvent: AdaptationEvent = {
      ...event,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      adaptationHistory: [...prev.adaptationHistory.slice(-49), adaptationEvent], // 最新50件を保持
      sessionMetrics: {
        ...prev.sessionMetrics,
        adaptationCount: prev.sessionMetrics.adaptationCount + 1,
      },
    }));

    // 重要なイベントはコンソールにも出力
    if (event.impact === 'high') {
      console.log(`⚡ 重要な適応: ${event.action}`);
    }
  }, []);

  /**
   * ユーザー応答の更新
   */
  const updateUserResponse = useCallback(
    (eventIndex: number, response: AdaptationEvent['userResponse']) => {
      setState((prev) => ({
        ...prev,
        adaptationHistory: prev.adaptationHistory.map((event, index) =>
          index === eventIndex ? { ...event, userResponse: response } : event
        ),
      }));
    },
    []
  );

  // セッション継続時間の定期更新
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      const currentDuration = Date.now() - sessionStartTime.current.getTime();

      setState((prev) => ({
        ...prev,
        sessionMetrics: {
          ...prev.sessionMetrics,
          sessionDuration: currentDuration,
        },
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking]);

  // 平均値の計算
  useEffect(() => {
    if (state.adaptationHistory.length > 0) {
      const cognitiveEvents = state.adaptationHistory.filter(
        (e) => e.type === 'ui_adjustment' && e.trigger.includes('cognitive')
      );

      if (cognitiveEvents.length > 0) {
        // 簡略化された平均計算
        setState((prev) => ({
          ...prev,
          sessionMetrics: {
            ...prev.sessionMetrics,
            averageAttention: prev.cognitiveState.attention,
            averageEnergy: prev.cognitiveState.energy,
          },
        }));
      }
    }
  }, [state.cognitiveState, state.adaptationHistory]);

  const contextValue: RealtimeAdaptationContextType = {
    state,
    detector,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentCognitiveState,
    addAdaptationEvent,
    updateUserResponse,
  };

  return (
    <RealtimeAdaptationContext.Provider value={contextValue}>
      {children}
    </RealtimeAdaptationContext.Provider>
  );
};

/**
 * リアルタイム適応システムのフック
 */
export const useRealtimeAdaptation = () => {
  const context = useContext(RealtimeAdaptationContext);
  if (!context) {
    throw new Error('useRealtimeAdaptation must be used within a RealtimeAdaptationProvider');
  }
  return context;
};

/**
 * 認知状態監視フック
 */
export const useCognitiveMonitoring = () => {
  const { state, getCurrentCognitiveState } = useRealtimeAdaptation();

  const [cognitiveMetrics, setCognitiveMetrics] = useState({
    currentState: state.cognitiveState,
    isOptimal: false,
    needsBreak: false,
    recommendations: state.currentRecommendations,
  });

  useEffect(() => {
    const { attention, energy, stress, cognitiveLoad } = state.cognitiveState;

    const isOptimal = attention > 70 && energy > 60 && stress < 50 && cognitiveLoad < 60;
    const needsBreak = energy < 30 || stress > 80 || cognitiveLoad > 90;

    setCognitiveMetrics({
      currentState: state.cognitiveState,
      isOptimal,
      needsBreak,
      recommendations: state.currentRecommendations,
    });
  }, [state.cognitiveState, state.currentRecommendations]);

  return cognitiveMetrics;
};

/**
 * セッション統計フック
 */
export const useSessionStats = () => {
  const { state } = useRealtimeAdaptation();

  return {
    duration: Math.round(state.sessionMetrics.sessionDuration / 1000 / 60), // 分
    interactions: state.sessionMetrics.interactionCount,
    adaptations: state.sessionMetrics.adaptationCount,
    averageAttention: state.sessionMetrics.averageAttention,
    averageEnergy: state.sessionMetrics.averageEnergy,
    recentEvents: state.adaptationHistory.slice(-5),
  };
};

export default RealtimeAdaptationProvider;
