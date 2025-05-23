import { useCallback, useRef, useEffect } from "react";

interface PerformanceMetrics {
    componentName: string;
    measurementName: string;
    duration: number;
    timestamp: number;
}

interface PerformanceThresholds {
    warning: number;
    critical: number;
}

/**
 * usePerformanceMonitor Hook
 * コンポーネントのパフォーマンスを監視・最適化
 */
export const usePerformanceMonitor = (
    componentName: string,
    thresholds: PerformanceThresholds = { warning: 100, critical: 300 }
) => {
    const measurements = useRef<Map<string, number>>(new Map());
    const metrics = useRef<PerformanceMetrics[]>([]);

    // パフォーマンス測定開始
    const startMeasurement = useCallback((measurementName: string) => {
        measurements.current.set(measurementName, performance.now());
    }, []);

    // パフォーマンス測定終了
    const endMeasurement = useCallback((measurementName: string) => {
        const startTime = measurements.current.get(measurementName);
        if (!startTime) {
            console.warn(`Measurement ${measurementName} was not started`);
            return;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        const metric: PerformanceMetrics = {
            componentName,
            measurementName,
            duration,
            timestamp: Date.now(),
        };

        metrics.current.push(metric);
        measurements.current.delete(measurementName);

        // パフォーマンス警告
        if (duration > thresholds.critical) {
            console.error(
                `[Performance Critical] ${componentName}.${measurementName}: ${duration.toFixed(2)}ms`
            );
        } else if (duration > thresholds.warning) {
            console.warn(
                `[Performance Warning] ${componentName}.${measurementName}: ${duration.toFixed(2)}ms`
            );
        } else if (process.env.NODE_ENV === "development") {
            console.log(
                `[Performance] ${componentName}.${measurementName}: ${duration.toFixed(2)}ms`
            );
        }

        // メトリクスをアナリティクスに送信（本番環境のみ）
        if (process.env.NODE_ENV === "production" && duration > thresholds.warning) {
            sendPerformanceMetrics(metric);
        }
    }, [componentName, thresholds]);

    // コンポーネントのレンダリング時間を測定
    useEffect(() => {
        startMeasurement("render");
        return () => {
            endMeasurement("render");
        };
    }, [startMeasurement, endMeasurement]);

    // メトリクスのサマリーを取得
    const getMetricsSummary = useCallback(() => {
        const summary = metrics.current.reduce(
            (acc, metric) => {
                if (!acc[metric.measurementName]) {
                    acc[metric.measurementName] = {
                        count: 0,
                        total: 0,
                        min: Infinity,
                        max: -Infinity,
                        avg: 0,
                    };
                }

                const stat = acc[metric.measurementName];
                stat.count++;
                stat.total += metric.duration;
                stat.min = Math.min(stat.min, metric.duration);
                stat.max = Math.max(stat.max, metric.duration);
                stat.avg = stat.total / stat.count;

                return acc;
            },
            {} as Record<
                string,
                {
                    count: number;
                    total: number;
                    min: number;
                    max: number;
                    avg: number;
                }
            >
        );

        return summary;
    }, []);

    return {
        startMeasurement,
        endMeasurement,
        getMetricsSummary,
    };
};

// パフォーマンスメトリクスを送信
async function sendPerformanceMetrics(metric: PerformanceMetrics): Promise<void> {
    try {
        // 実際のエンドポイントに送信
        await fetch("/api/performance/metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(metric),
        });
    } catch (error) {
        console.error("Failed to send performance metrics:", error);
    }
}