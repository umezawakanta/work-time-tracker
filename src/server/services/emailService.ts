import nodemailer from 'nodemailer';
import { TodoItem } from '../../types';
import { NotificationSettings } from '../../types/notification';

// メール送信設定の型定義
interface EmailConfig {
  service: string;
  user: string;
  pass: string;
}

// 通知設定の型定義
// Note: NotificationSettings interface is imported from '../../types/notification'

// メールテンプレートの型定義
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  /**
   * メールサービスの初期化
   */
  private initialize() {
    const emailConfig = this.getEmailConfig();

    if (emailConfig) {
      try {
        this.transporter = nodemailer.createTransport({
          service: emailConfig.service,
          auth: {
            user: emailConfig.user,
            pass: emailConfig.pass,
          },
        });

        this.isConfigured = true;
        console.log('✅ Email service initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize email service:', error);
        this.isConfigured = false;
      }
    } else {
      console.log('⚠️ Email configuration not found. Email notifications disabled.');
    }
  }

  /**
   * 環境変数から設定を取得
   */
  private getEmailConfig(): EmailConfig | null {
    const service = process.env.EMAIL_SERVICE || 'gmail';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      return null;
    }

    return { service, user, pass };
  }

  /**
   * ユーザー設定からトランスポーターを作成
   */
  createUserTransporter(settings: NotificationSettings): nodemailer.Transporter | null {
    if (!settings.emailUser || !settings.emailPass) {
      return null;
    }

    try {
      if (settings.emailService === 'custom' && settings.smtpHost) {
        // カスタムSMTP設定
        return nodemailer.createTransport({
          host: settings.smtpHost,
          port: settings.smtpPort || 587,
          secure: settings.smtpSecure || false,
          auth: {
            user: settings.emailUser,
            pass: settings.emailPass,
          },
        });
      } else {
        // プリセットサービス（Gmail, Outlook等）
        return nodemailer.createTransport({
          service: settings.emailService || 'gmail',
          auth: {
            user: settings.emailUser,
            pass: settings.emailPass,
          },
        });
      }
    } catch (error) {
      console.error('Failed to create user transporter:', error);
      return null;
    }
  }

  /**
   * タスク追加通知メールを送信
   */
  async sendTaskAddedNotification(
    userEmail: string,
    task: TodoItem,
    totalTasks: number,
    userSettings?: NotificationSettings
  ): Promise<boolean> {
    // ユーザー固有の設定がある場合は優先
    let transporter = this.transporter;
    let fromEmail = process.env.EMAIL_USER || 'noreply@worktime-tracker.com';

    if (userSettings?.emailUser && userSettings?.emailPass) {
      const userTransporter = this.createUserTransporter(userSettings);
      if (userTransporter) {
        transporter = userTransporter;
        fromEmail = userSettings.emailUser;
      }
    }

    if (!transporter) {
      console.log('No email transporter available');
      return false;
    }

    const template = this.createTaskAddedTemplate(task, totalTasks);

    try {
      await transporter.sendMail({
        from: `"Work Time Tracker" <${fromEmail}>`,
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`✅ Task added notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send task added notification:', error);
      return false;
    }
  }

  /**
   * 期限接近通知メールを送信
   */
  async sendDeadlineNotification(
    userEmail: string,
    tasks: TodoItem[],
    userSettings?: NotificationSettings
  ): Promise<boolean> {
    if (tasks.length === 0) {
      return false;
    }

    // ユーザー固有の設定がある場合は優先
    let transporter = this.transporter;
    let fromEmail = process.env.EMAIL_USER || 'noreply@worktime-tracker.com';

    if (userSettings?.emailUser && userSettings?.emailPass) {
      const userTransporter = this.createUserTransporter(userSettings);
      if (userTransporter) {
        transporter = userTransporter;
        fromEmail = userSettings.emailUser;
      }
    }

    if (!transporter) {
      console.log('No email transporter available');
      return false;
    }

    const template = this.createDeadlineTemplate(tasks);

    try {
      await transporter.sendMail({
        from: `"Work Time Tracker" <${fromEmail}>`,
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`✅ Deadline notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send deadline notification:', error);
      return false;
    }
  }

  /**
   * デイリーダイジェストメールを送信
   */
  async sendDailyDigest(
    userEmail: string,
    stats: {
      totalTasks: number;
      completedToday: number;
      pendingTasks: number;
      upcomingDeadlines: TodoItem[];
      highPriorityTasks: TodoItem[];
    },
    userSettings?: NotificationSettings
  ): Promise<boolean> {
    // ユーザー固有の設定がある場合は優先
    let transporter = this.transporter;
    let fromEmail = process.env.EMAIL_USER || 'noreply@worktime-tracker.com';

    if (userSettings?.emailUser && userSettings?.emailPass) {
      const userTransporter = this.createUserTransporter(userSettings);
      if (userTransporter) {
        transporter = userTransporter;
        fromEmail = userSettings.emailUser;
      }
    }

    if (!transporter) {
      console.log('No email transporter available');
      return false;
    }

    const template = this.createDailyDigestTemplate(stats);

    try {
      await transporter.sendMail({
        from: `"Work Time Tracker" <${fromEmail}>`,
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`✅ Daily digest sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send daily digest:', error);
      return false;
    }
  }

  /**
   * タスク追加テンプレート作成
   */
  private createTaskAddedTemplate(task: TodoItem, totalTasks: number): EmailTemplate {
    const priorityLabel = this.getPriorityLabel(task.priority);
    const typeLabel = task.type === 'input' ? '📥 インプット' : '📤 アウトプット';
    const deadlineText = task.deadline
      ? `締切: ${new Date(task.deadline).toLocaleString('ja-JP')}`
      : '締切: なし';

    return {
      subject: `✅ 新しいタスクが追加されました: ${task.task}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px; }
            .task-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .priority { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .priority-high { background: #fee2e2; color: #dc2626; }
            .priority-medium { background: #fef3c7; color: #d97706; }
            .priority-low { background: #dbeafe; color: #2563eb; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-item { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎯 新しいタスクが追加されました！</h1>
            </div>
            <div class="content">
              <div class="task-box">
                <h2 style="color: #1f2937; margin-top: 0;">${task.task}</h2>
                <p>
                  <span class="priority ${this.getPriorityClass(task.priority)}">${priorityLabel}</span>
                  <span style="margin-left: 10px;">${typeLabel}</span>
                </p>
                <p style="color: #6b7280;">${deadlineText}</p>
                ${task.note ? `<p style="color: #4b5563;">${task.note}</p>` : ''}
              </div>
              
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${totalTasks}</div>
                  <div class="stat-label">総タスク数</div>
                </div>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  タスクを管理する →
                </a>
              </p>
              
              <div class="footer">
                <p>このメールは Work Time Tracker から自動送信されています。</p>
                <p>通知設定は<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/notifications">こちら</a>から変更できます。</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
新しいタスクが追加されました！

タスク: ${task.task}
優先度: ${priorityLabel}
種類: ${typeLabel}
${deadlineText}
${task.note ? `説明: ${task.note}` : ''}

現在の総タスク数: ${totalTasks}

タスク管理画面: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks
      `.trim(),
    };
  }

  /**
   * 期限接近テンプレート作成
   */
  private createDeadlineTemplate(tasks: TodoItem[]): EmailTemplate {
    const taskList = tasks
      .map((task) => {
        const hoursRemaining = task.deadline
          ? Math.round((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60))
          : 0;

        return `
        <div class="task-item">
          <h3 style="color: #dc2626; margin: 10px 0;">${task.task}</h3>
          <p style="color: #6b7280;">
            締切まで残り: <strong>${hoursRemaining}時間</strong><br>
            締切: ${new Date(task.deadline!).toLocaleString('ja-JP')}
          </p>
        </div>
      `;
      })
      .join('');

    return {
      subject: `⏰ ${tasks.length}件のタスクの締切が近づいています！`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px; }
            .task-item { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; border-radius: 4px; }
            .action-button { background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⏰ 締切が近づいています！</h1>
              <p style="margin: 10px 0 0 0;">以下のタスクの締切が迫っています。早めの対応をお勧めします。</p>
            </div>
            <div class="content">
              ${taskList}
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" class="action-button">
                  タスクを確認する →
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: tasks
        .map((task) => {
          const hoursRemaining = task.deadline
            ? Math.round((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60))
            : 0;
          return `- ${task.task} (残り${hoursRemaining}時間)`;
        })
        .join('\n'),
    };
  }

  /**
   * デイリーダイジェストテンプレート作成
   */
  private createDailyDigestTemplate(stats: {
    totalTasks: number;
    completedToday: number;
    pendingTasks: number;
    upcomingDeadlines: TodoItem[];
    highPriorityTasks: TodoItem[];
  }): EmailTemplate {
    const completionRate =
      stats.totalTasks > 0 ? Math.round((stats.completedToday / stats.totalTasks) * 100) : 0;

    return {
      subject: `📊 本日のタスクサマリー: ${stats.completedToday}件完了 / ${stats.pendingTasks}件残`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
            .stat-label { color: #6b7280; margin-top: 5px; }
            .task-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .task-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .task-item:last-child { border-bottom: none; }
            .progress-bar { width: 100%; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 20px 0; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📊 本日のタスクレポート</h1>
              <p style="margin: 10px 0 0 0;">${new Date().toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${completionRate}%;"></div>
              </div>
              <p style="text-align: center; color: #4b5563;">完了率: ${completionRate}%</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${stats.completedToday}</div>
                  <div class="stat-label">本日完了</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.pendingTasks}</div>
                  <div class="stat-label">残タスク</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.upcomingDeadlines.length}</div>
                  <div class="stat-label">締切接近</div>
                </div>
              </div>
              
              ${
                stats.highPriorityTasks.length > 0
                  ? `
                <div class="task-list">
                  <h3 style="margin-top: 0;">🔥 高優先度タスク</h3>
                  ${stats.highPriorityTasks
                    .slice(0, 5)
                    .map(
                      (task) => `
                    <div class="task-item">
                      <strong>${task.task}</strong>
                      ${task.deadline ? `<span style="color: #dc2626; margin-left: 10px;">締切: ${new Date(task.deadline).toLocaleDateString('ja-JP')}</span>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  タスクを確認する →
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
本日のタスクレポート
${new Date().toLocaleDateString('ja-JP')}

完了: ${stats.completedToday}件
残り: ${stats.pendingTasks}件
締切接近: ${stats.upcomingDeadlines.length}件

${
  stats.highPriorityTasks.length > 0
    ? `高優先度タスク:\n${stats.highPriorityTasks
        .slice(0, 5)
        .map((t) => `- ${t.task}`)
        .join('\n')}`
    : ''
}
      `.trim(),
    };
  }

  /**
   * 優先度ラベル取得
   */
  private getPriorityLabel(priority: number): string {
    switch (priority) {
      case 5:
        return '🔴 最高';
      case 4:
        return '🟠 高';
      case 3:
        return '🟡 中';
      case 2:
        return '🔵 低';
      case 1:
        return '⚪ 最低';
      default:
        return '⚪ 未設定';
    }
  }

  /**
   * 優先度CSSクラス取得
   */
  private getPriorityClass(priority: number): string {
    if (priority >= 4) return 'priority-high';
    if (priority === 3) return 'priority-medium';
    return 'priority-low';
  }

  /**
   * メールサービスの状態確認
   */
  isReady(): boolean {
    return this.isConfigured && this.transporter !== null;
  }
}

// シングルトンインスタンスをエクスポート
export const emailService = new EmailService();
export default emailService;
