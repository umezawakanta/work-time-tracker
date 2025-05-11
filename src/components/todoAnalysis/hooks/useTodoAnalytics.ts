// src/components/todoAnalysis/hooks/useTodoAnalytics.ts
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AnalysisSummary, AnalyticsState } from '../types';

/**
 * タスク分析データを取得・計算するカスタムフック
 */
export const useTodoAnalytics = (): AnalyticsState => {
    const [state, setState] = useState<AnalyticsState>({
        summary: null,
        isLoading: true,
        error: null
    });

    // Reduxからタスクデータを取得
    const todos = useSelector((state: RootState) => state.todo.items);
    const completedTodos = useSelector((state: RootState) => state.todo.completedItems);

    useEffect(() => {
        const calculateAnalytics = async (): Promise<void> => {
            try {
                // 本番環境では、以下のコメントアウトされた部分を使用して
                // APIからデータを取得することが望ましい
                // const response = await fetch('/api/todo/analytics');
                // const data = await response.json();

                // モックデータの代わりに実際の計算ロジックを実装
                if (!todos || !completedTodos) {
                    setState({
                        summary: null,
                        isLoading: false,
                        error: 'タスクデータが見つかりません。'
                    });
                    return;
                }

                // 完了率を計算
                const totalTasks = todos.length + completedTodos.length;
                const completionRate = totalTasks > 0
                    ? Math.round((completedTodos.length / totalTasks) * 100)
                    : 0;

                // カテゴリごとのタスク数をカウント
                const categoryStats = todos.concat(completedTodos).reduce(
                    (acc, todo) => {
                        const category = todo.category || 'uncategorized';
                        acc[category] = (acc[category] || 0) + 1;
                        return acc;
                    },
                    { input: 0, output: 0 } as Record<string, number>
                );

                // カテゴリの分布を計算
                const categoryDistribution: Record<string, number> = {};
                Object.keys(categoryStats).forEach(key => {
                    categoryDistribution[key] = totalTasks > 0
                        ? categoryStats[key] / totalTasks
                        : 0;
                });

                // 最も生産的な曜日を計算（仮の実装）
                const dayCompletionCounts = completedTodos.reduce(
                    (acc, todo) => {
                        const completedDate = new Date(todo.completedAt || Date.now());
                        const day = completedDate.toLocaleDateString('ja-JP', { weekday: 'long' });
                        acc[day] = (acc[day] || 0) + 1;
                        return acc;
                    },
                    {} as Record<string, number>
                );

                // 最も完了タスクが多い曜日を特定
                let mostProductiveDay = '未確定';
                let maxCompletions = 0;
                Object.entries(dayCompletionCounts).forEach(([day, count]) => {
                    if (count > maxCompletions) {
                        mostProductiveDay = day;
                        maxCompletions = count;
                    }
                });

                // インプット/アウトプットバランスに基づいた推奨事項を生成
                const inputRatio = categoryDistribution.input || 0;
                const outputRatio = categoryDistribution.output || 0;

                const recommendations: string[] = [];
                if (inputRatio > 0.7) {
                    recommendations.push('インプットが多すぎます。アウトプットの増加を検討しましょう。');
                } else if (outputRatio > 0.7) {
                    recommendations.push('アウトプットが多すぎます。インプットの増加を検討しましょう。');
                } else if (completionRate < 50) {
                    recommendations.push('タスク完了率が低いです。優先順位を見直しましょう。');
                }

                if (totalTasks === 0) {
                    recommendations.push('タスクを追加して生産性を記録しましょう。');
                }

                // 1日あたりの平均タスク数を計算（過去30日間）
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentTasks = todos.concat(completedTodos).filter(
                    todo => new Date(todo.createdAt) >= thirtyDaysAgo
                );

                const averageTasksPerDay = recentTasks.length / 30;

                const analysisSummary: AnalysisSummary = {
                    completionRate,
                    averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10, // 小数点第一位まで
                    mostProductiveDay,
                    categoryStats: categoryStats as CategoryStats,
                    categoryDistribution: categoryDistribution as CategoryDistribution,
                    recommendations,
                    lastUpdated: new Date()
                };

                setState({
                    summary: analysisSummary,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                setState({
                    summary: null,
                    isLoading: false,
                    error: error instanceof Error ? error.message : '分析データの取得中にエラーが発生しました。'
                });
            }
        };

        calculateAnalytics();
    }, [todos, completedTodos]);

    return state;
};