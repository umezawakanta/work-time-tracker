import { TodoItem } from '../../types';
import {
  NotificationSettings,
  EmailNotification,
  NotificationType,
} from '../../types/notification';
import emailService from './emailService';
import { connectDB } from '../config/database';
import { TodoModel } from '../models/Todo';
import cron, { ScheduledTask } from 'node-cron';

/**
 * 通知管理サービス
 * メール通知のスケジューリングと送信を管理
 */
class NotificationService {
  private userSettings: Map<string, NotificationSettings> = new Map();
  private scheduledJobs: Map<string, ScheduledTask> = new Map();

  constructor() {
    this.initialize();
  }

  /**
   * サービスの初期化
   */
  private async initialize() {
    console.log('🔔 Notification service initializing...');

    // データベースから全ユーザーの設定を読み込む（実装予定）
    await this.loadAllUserSettings();

    // 定期ジョブのスケジューリング
    this.schedulePeriodicJobs();

    console.log('✅ Notification service initialized');
  }

  /**
   * 全ユーザーの設定を読み込み
   */
  private async loadAllUserSettings() {
    // 将来的に: DBから全ユーザー分の通知設定をロード
    try {
      await connectDB();
      // NOTE: 通知設定のサーバーモデルとの差異があるため、初期ロードは未実装のままとします
      // 必要になった時点でマッピング実装を追加してください
      console.log('ℹ️ Notification settings initial load skipped (no mock, no-op)');
    } catch (e) {
      console.warn('⚠️ Notification settings load skipped due to DB error:', (e as Error).message);
    }
  }

  /**
   * ユーザー設定を取得
   */
  async getUserSettings(userId: string): Promise<NotificationSettings | null> {
    return this.userSettings.get(userId) || null;
  }

  /**
   * ユーザー設定を保存
   */
  async saveUserSettings(userId: string, settings: NotificationSettings): Promise<void> {
    this.userSettings.set(userId, settings);

    // 設定変更に応じてスケジュールを更新
    this.updateUserSchedules(userId, settings);

    // TODO: データベースに保存
    console.log(`✅ Notification settings saved for user: ${userId}`);
  }

  /**
   * タスク追加通知
   */
  async notifyTaskAdded(userId: string, task: TodoItem, totalTasks: number): Promise<void> {
    const settings = await this.getUserSettings(userId);

    if (!settings || !settings.enabled || !settings.notifyOnTaskAdd) {
      return;
    }

    // 優先度フィルター
    if (task.priority < settings.minPriorityForNotification) {
      return;
    }

    // カテゴリーフィルター
    if (
      settings.notificationCategories.length > 0 &&
      task.category &&
      !settings.notificationCategories.includes(task.category)
    ) {
      return;
    }

    // メール送信（ユーザー設定を渡す）
    await emailService.sendTaskAddedNotification(settings.emailAddress, task, totalTasks, settings);

    // 通知履歴を記録
    await this.recordNotification({
      userId,
      type: 'task_added',
      recipient: settings.emailAddress,
      subject: `新しいタスク: ${task.task}`,
      content: '',
      status: 'sent',
      metadata: { taskId: task._id },
    });
  }

  /**
   * 期限接近通知をチェック
   */
  async checkDeadlineNotifications(): Promise<void> {
    console.log('🔍 Checking deadline notifications...');

    for (const [userId, settings] of this.userSettings.entries()) {
      if (!settings.enabled || !settings.notifyOnDeadlineApproaching) {
        continue;
      }

      // ユーザーのタスクを取得（TODO: 実際のデータベースから取得）
      const tasks = await this.getUserTasks(userId);

      // 期限が近いタスクをフィルター
      const upcomingTasks = tasks.filter((task) => {
        if (!task.deadline || task.completed) return false;

        const hoursUntilDeadline =
          (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursUntilDeadline > 0 && hoursUntilDeadline <= settings.deadlineWarningHours;
      });

      if (upcomingTasks.length > 0) {
        await emailService.sendDeadlineNotification(settings.emailAddress, upcomingTasks, settings);

        console.log(
          `📧 Sent deadline notification to ${settings.emailAddress}: ${upcomingTasks.length} tasks`
        );
      }
    }
  }

  /**
   * デイリーダイジェストを送信
   */
  async sendDailyDigests(): Promise<void> {
    console.log('📊 Sending daily digests...');

    for (const [userId, settings] of this.userSettings.entries()) {
      if (!settings.enabled || !settings.dailyDigest) {
        continue;
      }

      const tasks = await this.getUserTasks(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 本日完了したタスクをカウント
      const completedToday = tasks.filter((task: any) => {
        if (!task.completed) return false;
        const updatedAt: string | undefined =
          task.updatedAt || task.completedDate || task.createdAt;
        if (!updatedAt) return false;
        const updatedDate = new Date(updatedAt);
        updatedDate.setHours(0, 0, 0, 0);
        return updatedDate.getTime() === today.getTime();
      }).length;

      // 未完了タスク
      const pendingTasks = tasks.filter((task) => !task.completed).length;

      // 期限が近いタスク（48時間以内）
      const upcomingDeadlines = tasks.filter((task) => {
        if (!task.deadline || task.completed) return false;
        const hoursUntilDeadline =
          (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursUntilDeadline > 0 && hoursUntilDeadline <= 48;
      });

      // 高優先度タスク
      const highPriorityTasks = tasks.filter((task) => !task.completed && task.priority >= 4);

      const stats = {
        totalTasks: tasks.length,
        completedToday,
        pendingTasks,
        upcomingDeadlines,
        highPriorityTasks,
      };

      await emailService.sendDailyDigest(settings.emailAddress, stats, settings);

      console.log(`📧 Sent daily digest to ${settings.emailAddress}`);
    }
  }

  /**
   * 定期ジョブのスケジューリング
   */
  private schedulePeriodicJobs() {
    // 期限チェック（1時間ごと）
    const deadlineJob = cron.schedule('0 * * * *', async () => {
      await this.checkDeadlineNotifications();
    });
    this.scheduledJobs.set('deadline-check', deadlineJob);

    // デイリーダイジェスト（毎日9時）
    const dailyJob = cron.schedule('0 9 * * *', async () => {
      await this.sendDailyDigests();
    });
    this.scheduledJobs.set('daily-digest', dailyJob);

    console.log('📅 Periodic notification jobs scheduled');
  }

  /**
   * ユーザー固有のスケジュールを更新
   */
  private updateUserSchedules(userId: string, settings: NotificationSettings) {
    const jobKey = `daily-${userId}`;

    // 既存のジョブをキャンセル
    const existingJob = this.scheduledJobs.get(jobKey);
    if (existingJob) {
      existingJob.stop();
      this.scheduledJobs.delete(jobKey);
    }

    // 新しいジョブをスケジュール
    if (settings.enabled && settings.dailyDigest) {
      const [hour, minute] = settings.dailyDigestTime.split(':').map(Number);
      const cronExpression = `${minute} ${hour} * * *`;

      const job = cron.schedule(cronExpression, async () => {
        // 特定のユーザーのみのダイジェストを送信
        await this.sendUserDailyDigest(userId);
      });

      this.scheduledJobs.set(jobKey, job);
      console.log(`📅 Scheduled daily digest for ${userId} at ${settings.dailyDigestTime}`);
    }
  }

  /**
   * 特定ユーザーのデイリーダイジェストを送信
   */
  private async sendUserDailyDigest(userId: string): Promise<void> {
    const settings = await this.getUserSettings(userId);
    if (!settings || !settings.enabled || !settings.dailyDigest) {
      return;
    }

    // ダイジェスト送信ロジック（sendDailyDigestsから抽出）
    // ...
  }

  /**
   * ユーザーのタスクを取得（モック実装）
   */
  private async getUserTasks(userId: string): Promise<TodoItem[]> {
    try {
      await connectDB();
      const docs = await TodoModel.find({ userId }).sort({ createdAt: -1 });
      // 可能な範囲で TodoItem に整形（不足は呼び出し側で未使用のため許容）
      const priorityMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
      return (docs as any[]).map((d) => ({
        _id: d._id?.toString?.() ?? d.id ?? '',
        task: d.title,
        description: d.description,
        category: d.category,
        type: d.type,
        completed: Boolean(d.completed),
        priority: priorityMap[String(d.priority)] ?? 1,
        deadline: d.dueDate,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        userId: d.userId,
      })) as unknown as TodoItem[];
    } catch (e) {
      console.warn('⚠️ getUserTasks failed:', (e as Error).message);
      return [];
    }
  }

  /**
   * 通知履歴を記録
   */
  private async recordNotification(notification: EmailNotification): Promise<void> {
    // TODO: データベースに保存
    console.log(`📝 Notification recorded: ${notification.type} to ${notification.recipient}`);
  }

  /**
   * サービスのクリーンアップ
   */
  cleanup() {
    // すべてのスケジュールされたジョブを停止
    for (const job of this.scheduledJobs.values()) {
      job.stop();
    }
    this.scheduledJobs.clear();
    console.log('🔔 Notification service cleaned up');
  }
}

// シングルトンインスタンスをエクスポート
export const notificationService = new NotificationService();
export default notificationService;
