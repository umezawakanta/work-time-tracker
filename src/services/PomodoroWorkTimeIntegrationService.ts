import { PomodoroSession, PomodoroMode } from '@/types/pomodoro';
import { WorkTimeEntry } from '@/types/workTimeEntry';
import { workTimeApi } from './api/workTimeApi';
import { store } from '@/store';
import { createWorkTimeEntry } from '@/store/workTimeSlice';

// ヘルパー関数: YYYY-MM-DD形式の日付文字列を生成
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ヘルパー関数: HH:MM形式の時刻文字列を生成
const formatTimeString = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export interface PomodoroWorkTimeEntry extends Omit<WorkTimeEntry, '_id' | 'userId'> {
  pomodoroSessionId?: string;
  sessionType: PomodoroMode;
  isFromPomodoro: boolean;
  pomodoroData?: {
    sessionNumber: number;
    totalSessions: number;
    efficiency?: number; // 集中度（将来の拡張用）
  };
}

export class PomodoroWorkTimeIntegrationService {
  private static instance: PomodoroWorkTimeIntegrationService;
  private userId: string = 'demo@example.com'; // TODO: 実際の認証システムから取得

  private constructor() {}

  public static getInstance(): PomodoroWorkTimeIntegrationService {
    if (!PomodoroWorkTimeIntegrationService.instance) {
      PomodoroWorkTimeIntegrationService.instance = new PomodoroWorkTimeIntegrationService();
    }
    return PomodoroWorkTimeIntegrationService.instance;
  }

  /**
   * ポモドーロセッション完了時に作業時間エントリを自動作成
   */
  public async recordPomodoroSession(
    session: PomodoroSession,
    sessionNumber: number,
    totalSessionsToday: number
  ): Promise<void> {
    try {
      console.log('🍅 ポモドーロセッション記録開始:', {
        sessionId: session.id,
        mode: session.mode,
        duration: session.duration,
        taskName: session.taskName,
        sessionNumber,
        totalSessionsToday,
      });

      // 作業セッションのみ記録（休憩は記録しない）
      if (session.mode !== 'work') {
        console.log('🍅 休憩セッションのため記録をスキップ');
        return;
      }

      const startTime = new Date(session.completedAt.getTime() - session.duration * 1000);
      const endTime = session.completedAt;

      const workTimeEntry: PomodoroWorkTimeEntry = {
        date: formatDateString(session.completedAt),
        startTime: formatTimeString(startTime),
        endTime: formatTimeString(endTime),
        duration: session.duration, // 秒単位
        projectName: this.generateProjectName(session.taskName),
        description: this.generateDescription(session, sessionNumber, totalSessionsToday),
        pomodoroSessionId: session.id,
        sessionType: session.mode,
        isFromPomodoro: true,
        pomodoroData: {
          sessionNumber,
          totalSessions: totalSessionsToday,
        },
      };

      console.log('🍅 作業時間エントリ作成:', workTimeEntry);

      try {
        // Redux storeのアクションを使用してAPIとstoreの両方を更新
        const result = await store.dispatch(createWorkTimeEntry(workTimeEntry));

        if (createWorkTimeEntry.fulfilled.match(result)) {
          console.log('✅ ポモドーロセッション記録完了 (Redux + API):', result.payload);
          this.showSuccessNotification(session, workTimeEntry);
        } else {
          throw new Error(result.payload as string);
        }
      } catch (apiError: any) {
        // 開発環境での認証エラー対応
        if (apiError?.response?.status === 401 && process.env.NODE_ENV === 'development') {
          console.log('🛠️ 開発環境: 認証エラーのためローカルストレージに保存');
          this.saveToLocalStorage(workTimeEntry);
          this.showSuccessNotification(session, workTimeEntry, true);
        } else {
          throw apiError; // その他のエラーは再スロー
        }
      }
    } catch (error) {
      console.error('❌ ポモドーロセッション記録エラー:', error);
      this.showErrorNotification(error);
    }
  }

  /**
   * 開発環境用：ローカルストレージに作業時間エントリを保存
   */
  private saveToLocalStorage(workTimeEntry: PomodoroWorkTimeEntry): void {
    try {
      const storageKey = 'pomodoro-work-entries';
      const existingEntries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const entryWithId = {
        ...workTimeEntry,
        _id: `local-${Date.now()}`,
        userId: this.userId,
        createdAt: new Date().toISOString(),
      };

      existingEntries.push(entryWithId);
      localStorage.setItem(storageKey, JSON.stringify(existingEntries));

      console.log('💾 ローカルストレージに保存完了:', entryWithId);
    } catch (error) {
      console.error('❌ ローカルストレージ保存エラー:', error);
    }
  }

  /**
   * ローカルストレージから作業時間エントリを取得
   */
  public getLocalStorageEntries(): any[] {
    try {
      const storageKey = 'pomodoro-work-entries';
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (error) {
      console.error('❌ ローカルストレージ読み込みエラー:', error);
      return [];
    }
  }

  /**
   * ローカルストレージをクリア
   */
  public clearLocalStorage(): void {
    try {
      localStorage.removeItem('pomodoro-work-entries');
      console.log('🧹 ローカルストレージクリア完了');
    } catch (error) {
      console.error('❌ ローカルストレージクリアエラー:', error);
    }
  }

  /**
   * プロジェクト名を生成
   */
  private generateProjectName(taskName?: string): string {
    if (taskName && taskName.trim().length > 0) {
      // タスク名から推測したプロジェクト名を生成
      return this.extractProjectFromTask(taskName);
    }
    return 'ポモドーロ作業';
  }

  /**
   * タスク名からプロジェクト名を推測
   */
  private extractProjectFromTask(taskName: string): string {
    // キーワードベースでプロジェクト名を推測
    const projectKeywords = {
      メール: 'メール対応',
      会議: '会議・ミーティング',
      資料: '資料作成',
      開発: 'システム開発',
      コード: 'システム開発',
      プログラム: 'システム開発',
      設計: 'システム設計',
      デザイン: 'デザイン業務',
      学習: '学習・研修',
      調査: '調査・分析',
      報告: '報告・レポート作成',
    };

    for (const [keyword, project] of Object.entries(projectKeywords)) {
      if (taskName.includes(keyword)) {
        return project;
      }
    }

    // キーワードが見つからない場合は、タスク名の最初の部分をプロジェクト名とする
    const words = taskName.split(/[、。\s]+/);
    return words[0] || 'ポモドーロ作業';
  }

  /**
   * 作業内容の説明を生成
   */
  private generateDescription(
    session: PomodoroSession,
    sessionNumber: number,
    totalSessionsToday: number
  ): string {
    const baseDescription = session.taskName
      ? `ポモドーロタイマーで作業: ${session.taskName}`
      : 'ポモドーロタイマーで集中作業';

    const sessionInfo = `(${sessionNumber}セッション目 / 今日${totalSessionsToday}セッション完了)`;
    const durationInfo = `作業時間: ${Math.round(session.duration / 60)}分`;

    return `${baseDescription} ${sessionInfo} - ${durationInfo}`;
  }

  /**
   * 成功通知を表示
   */
  private showSuccessNotification(
    session: PomodoroSession,
    workTimeEntry: PomodoroWorkTimeEntry,
    isLocalStorage?: boolean
  ): void {
    // デベロッパー向けログ
    console.log('🎉 作業時間自動記録完了:', {
      taskName: session.taskName,
      duration: `${Math.round(session.duration / 60)}分`,
      projectName: workTimeEntry.projectName,
      time: `${workTimeEntry.startTime} - ${workTimeEntry.endTime}`,
      isLocalStorage,
    });
  }

  /**
   * エラー通知を表示
   */
  private showErrorNotification(error: any): void {
    console.error('🚨 作業時間記録エラー:', error);

    // 将来的にはユーザー向けの通知も追加可能
    // toast.error('作業時間の自動記録に失敗しました');
  }

  /**
   * 今日のポモドーロセッション統計を取得
   */
  public async getTodayPomodoroStats(): Promise<{
    totalSessions: number;
    totalWorkTime: number; // 分
    averageSessionLength: number; // 分
    mostProductiveHour: number;
  }> {
    try {
      let todayPomodoroEntries: any[] = [];
      const today = formatDateString(new Date());

      // APIからのデータを取得（モックデータまたは実際のAPI）
      try {
        const allEntries = await workTimeApi.getAll();
        todayPomodoroEntries = allEntries.data.filter(
          (entry) =>
            entry.date === today &&
            (entry as any).isFromPomodoro === true &&
            (entry as any).sessionType === 'work'
        );
        console.log('📊 API統計データ取得成功:', todayPomodoroEntries.length);
      } catch (apiError: any) {
        console.warn('📊 API統計データ取得失敗:', apiError.message);
      }

      // 追加: 旧ポモドーロストレージからのデータも取得（下位互換性）
      const legacyEntries = this.getLocalStorageEntries().filter(
        (entry) =>
          entry.date === today && entry.isFromPomodoro === true && entry.sessionType === 'work'
      );

      let uniqueLegacyEntries: any[] = [];
      if (legacyEntries.length > 0) {
        console.log('📊 レガシーローカル統計データ使用:', legacyEntries.length, '件');

        // 重複を除去して統合（APIデータを優先）
        const apiIds = new Set(todayPomodoroEntries.map((e) => e._id));
        uniqueLegacyEntries = legacyEntries.filter((e) => !apiIds.has(e._id));
        todayPomodoroEntries = [...todayPomodoroEntries, ...uniqueLegacyEntries];
      }

      const totalSessions = todayPomodoroEntries.length;
      const totalWorkTime = todayPomodoroEntries.reduce(
        (sum, entry) => sum + entry.duration / 60,
        0
      );
      const averageSessionLength = totalSessions > 0 ? totalWorkTime / totalSessions : 0;

      // 最も生産的な時間帯を計算
      const hourCounts: { [hour: number]: number } = {};
      todayPomodoroEntries.forEach((entry) => {
        const hour = parseInt(entry.startTime.split(':')[0]);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const mostProductiveHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
        ? parseInt(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0][0])
        : 9; // デフォルト: 9時

      // 詳細ログは開発環境でのみ表示
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 統計計算完了:', {
          totalSessions,
          totalWorkTime: Math.round(totalWorkTime),
          averageSessionLength: Math.round(averageSessionLength),
          mostProductiveHour,
          sources: {
            api: todayPomodoroEntries.length - uniqueLegacyEntries.length,
            legacy: uniqueLegacyEntries.length,
          },
        });
      }

      return {
        totalSessions,
        totalWorkTime: Math.round(totalWorkTime),
        averageSessionLength: Math.round(averageSessionLength),
        mostProductiveHour,
      };
    } catch (error) {
      console.error('ポモドーロ統計取得エラー:', error);
      return {
        totalSessions: 0,
        totalWorkTime: 0,
        averageSessionLength: 0,
        mostProductiveHour: 9,
      };
    }
  }

  /**
   * ユーザーIDを設定（認証システムと連携する場合）
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * ローカルストレージのエントリ情報を表示（デバッグ用）
   */
  public showLocalStorageInfo(): void {
    const entries = this.getLocalStorageEntries();
    console.log('💾 ローカルストレージ保存済みエントリ:', {
      total: entries.length,
      today: entries.filter((e) => e.date === formatDateString(new Date())).length,
      entries: entries.map((e) => ({
        id: e._id,
        date: e.date,
        time: `${e.startTime}-${e.endTime}`,
        project: e.projectName,
        duration: `${Math.round(e.duration / 60)}分`,
      })),
    });
  }
}

// シングルトンインスタンスをエクスポート
export const pomodoroWorkTimeIntegration = PomodoroWorkTimeIntegrationService.getInstance();
