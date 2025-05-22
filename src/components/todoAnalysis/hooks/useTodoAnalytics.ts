// src/components/todoAnalysis/hooks/useTodoAnalytics.ts
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AnalysisSummary, AnalyticsState, CategoryStats, CategoryDistribution } from '../types';

// ReduxストアのTodoItemに合わせて必須プロパティを調整
interface TodoItem {
    // idは必須ではなくオプショナルに変更
    id?: string | number;
    title?: string;
    completed?: boolean;
    category?: string;
    type?: string;
    createdAt?: string | Date;
    created_at?: string | Date;
    date?: string | Date;
    completedAt?: string | Date;
    completion_date?: string | Date;
    dateCompleted?: string | Date;
    completed_at?: string | Date;
    [key: string]: unknown;
}

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
    const rawTodos = useSelector((state: RootState) => state.todo.items);

    // useMemoを使用してtodosの初期化をラップし、依存関係を安定させる
    const todos = useMemo(() => {
        return (rawTodos as unknown) as TodoItem[] || [];
    }, [rawTodos]);

    // completedプロパティでフィルタリングもuseMemoでラップ
    const completedTodos = useMemo(() => {
        return todos.filter(todo => todo.completed);
    }, [todos]);

    useEffect(() => {
        const calculateAnalytics = async (): Promise<void> => {
            try {
                // 本番環境では、以下のコメントアウトされた部分を使用して
                // APIからデータを取得することが望ましい
                // const response = await fetch('/api/todo/analytics');
                // const data = await response.json();

                // モックデータの代わりに実際の計算ロジックを実装
                if (!todos || todos.length === 0) {
                    setState({
                        summary: null,
                        isLoading: false,
                        error: 'タスクデータが見つかりません。'
                    });
                    return;
                }

                // 完了率を計算
                const totalTasks = todos.length;
                const completionRate = totalTasks > 0
                    ? Math.round((completedTodos.length / totalTasks) * 100)
                    : 0;

                // カテゴリごとのタスク数をカウント
                const categoryStats = todos.reduce(
                    (acc, todo) => {
                        // todoのプロパティに合わせて調整
                        const category = todo.type || todo.category || 'uncategorized';

                        // 入力と出力のカテゴリをマッピング
                        if (typeof category === 'string' && (category.toLowerCase().includes('input') || category.toLowerCase() === 'インプット')) {
                            acc.input = (acc.input || 0) + 1;
                        } else if (typeof category === 'string' && (category.toLowerCase().includes('output') || category.toLowerCase() === 'アウトプット')) {
                            acc.output = (acc.output || 0) + 1;
                        }

                        // カテゴリごとのカウントも追加
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

                // 最も生産的な曜日を計算
                const dayCompletionCounts = completedTodos.reduce(
                    (acc, todo) => {
                        // completedAtがない場合はcompletion_dateやdateCompletedなどの
                        // 可能性のあるプロパティを確認
                        const completedAt =
                            todo.completedAt ||
                            todo.completion_date ||
                            todo.dateCompleted ||
                            todo.completed_at ||
                            todo.date;

                        // 日付に変換できるかチェック
                        const completedDate = completedAt ? new Date(completedAt) : new Date();

                        // 有効な日付かチェック
                        if (isNaN(completedDate.getTime())) {
                            return acc;
                        }

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

                const recentTasks = todos.filter(
                    todo => {
                        const createdAt = todo.createdAt || todo.created_at || todo.date;

                        if (!createdAt) return false;

                        const createdDate = new Date(createdAt);

                        // 有効な日付かチェック
                        if (isNaN(createdDate.getTime())) {
                            return false;
                        }

                        return createdDate >= thirtyDaysAgo;
                    }
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
    }, [todos, completedTodos]); // 依存配列にcompletedTodosを追加

    return state;
};