import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface AnalyticsEvent {
    eventName: string;
    properties?: Record<string, unknown>;
    timestamp: number;
    userId?: string;
    sessionId: string;
}

interface AnalyticsConfig {
    enableConsoleLog?: boolean;
    enableRemoteTracking?: boolean;
    batchSize?: number;
    flushInterval?: number;
}

/**
 * useAnalytics Hook
 * エンタープライズグレードのアナリティクストラッキング
 */
export const useAnalytics = (config: AnalyticsConfig = {}) => {
    const {
        enableConsoleLog = process.env.NODE_ENV === "development",
        enableRemoteTracking = process.env.NODE_ENV === "production",
        batchSize = 10,
        flushInterval = 5000,
    } = config;

    const userId = useSelector((state: RootState) => state.user?.id);
    const sessionId = useRef(generateSessionId()).current;
    const eventQueue = useRef<AnalyticsEvent[]>([]);
    const flushTimer = useRef<NodeJS.Timeout | null>(null);

    // イベントをバッチ送信
    const flushEvents = useCallback(async () => {
        if (eventQueue.current.length === 0) return;

        const eventsToSend = [...eventQueue.current];
        eventQueue.current = [];

        if (enableRemoteTracking) {
            try {
                // 実際のアナリティクスエンドポイントに送信
                await fetch("/api/analytics/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ events: eventsToSend }),
                });
            } catch (error) {
                console.error("Analytics flush failed:", error);
                // 失敗したイベントを再度キューに戻す
                eventQueue.current = [...eventsToSend, ...eventQueue.current];
            }
        }
    }, [enableRemoteTracking]);

    // イベントトラッキング
    const track = useCallback((
        eventName: string,
        properties?: Record<string, unknown>
    ) => {
        const event: AnalyticsEvent = {
            eventName,
            properties,
            timestamp: Date.now(),
            userId: userId || undefined,
            sessionId,
        };

        if (enableConsoleLog) {
            console.log("[Analytics]", eventName, properties);
        }

        eventQueue.current.push(event);

        // バッチサイズに達したら即座に送信
        if (eventQueue.current.length >= batchSize) {
            flushEvents();
        } else {
            // タイマーリセット
            if (flushTimer.current) {
                clearTimeout(flushTimer.current);
            }
            flushTimer.current = setTimeout(flushEvents, flushInterval);
        }
    }, [userId, sessionId, enableConsoleLog, batchSize, flushInterval, flushEvents]);

    // ページビュートラッキング
    const trackPageView = useCallback((pageName: string, properties?: Record<string, unknown>) => {
        track("page_view", { pageName, ...properties });
    }, [track]);

    // エラートラッキング
    const trackError = useCallback((error: Error, context?: Record<string, unknown>) => {
        track("error", {
            message: error.message,
            stack: error.stack,
            ...context,
        });
    }, [track]);

    return {
        track,
        trackPageView,
        trackError,
        flushEvents,
    };
};

// ユーティリティ関数
function generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
} 