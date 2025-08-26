import nodemailer from 'nodemailer';

interface PaymentFailureNotificationData {
  to: string;
  customerName: string;
  invoiceId: string;
  amount: number;
  currency: string;
  dueDate: Date;
  attemptCount: number;
  nextRetry: Date | null;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * 📧 EmailService - 統合メール送信サービス
 * 決済失敗通知、ユーザー通知、管理者通知を統合管理
 */
class EmailService {
  private static instance: EmailService | null = null;
  private transporter: nodemailer.Transporter | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.initializeTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * メールトランスポーター初期化
   */
  private async initializeTransporter(): Promise<void> {
    try {
      // 環境変数から設定を取得
      const emailConfig = {
        service: process.env.EMAIL_SERVICE || 'gmail', // gmail, sendgrid, ses, etc.
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      // SendGrid使用の場合
      if (emailConfig.service === 'sendgrid') {
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        });
      }
      // AWS SES使用の場合
      else if (emailConfig.service === 'ses') {
        this.transporter = nodemailer.createTransport({
          host:
            emailConfig.host ||
            'email-smtp.' + (process.env.AWS_REGION || 'us-east-1') + '.amazonaws.com',
          port: emailConfig.port || 587,
          secure: emailConfig.secure || false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }
      // 標準SMTP設定
      else {
        this.transporter = nodemailer.createTransport(emailConfig as any);
      }

      // 接続テスト
      if (this.transporter) {
        await this.transporter.verify();
        console.log('✅ EmailService: メール送信サービス初期化完了');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ EmailService: 初期化失敗:', error);
      console.warn('⚠️ EmailService: メール送信機能は無効化されています');
      // 初期化失敗時はログ出力のみで機能を継続
      this.isInitialized = false;
    }
  }

  /**
   * 決済失敗通知メール送信
   */
  public async sendPaymentFailureNotification(data: PaymentFailureNotificationData): Promise<void> {
    if (!this.isInitialized || !this.transporter) {
      console.warn('⚠️ EmailService: メール送信スキップ（サービス未初期化）');
      return;
    }

    try {
      const template = this.generatePaymentFailureTemplate(data);

      const mailOptions = {
        from: {
          name: 'Work Time Tracker',
          address: process.env.FROM_EMAIL || 'noreply@worktimetracker.com',
        },
        to: data.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        headers: {
          'X-Notification-Type': 'payment-failure',
          'X-Invoice-ID': data.invoiceId,
          'X-Customer-Name': data.customerName,
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ EmailService: 決済失敗通知送信完了:', {
        messageId: result.messageId,
        to: data.to,
        invoiceId: data.invoiceId,
      });
    } catch (error) {
      console.error('❌ EmailService: 決済失敗通知送信失敗:', error);
      throw new Error(
        `メール送信失敗: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 決済失敗通知テンプレート生成
   */
  private generatePaymentFailureTemplate(data: PaymentFailureNotificationData): EmailTemplate {
    const formatCurrency = (amount: number, currency: string): string => {
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100); // Stripeは通常cent単位
    };

    const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    const subject = `【重要】お支払いに関するお知らせ - Work Time Tracker`;

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>お支払いに関するお知らせ</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 30px; }
        .amount { font-size: 24px; font-weight: bold; color: #dc2626; margin: 20px 0; }
        .info-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .action-button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #666; }
        .retry-info { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>お支払いに関するお知らせ</h1>
        </div>
        <div class="content">
            <p>いつもWork Time Trackerをご利用いただき、ありがとうございます。</p>
            
            <p><strong>${data.customerName}</strong> 様、</p>
            
            <p>申し訳ございませんが、以下のお支払いで問題が発生いたしました：</p>
            
            <div class="info-box">
                <h3>お支払い詳細</h3>
                <p><strong>請求書番号:</strong> ${data.invoiceId}</p>
                <p><strong>金額:</strong> <span class="amount">${formatCurrency(data.amount, data.currency)}</span></p>
                <p><strong>支払期限:</strong> ${formatDate(data.dueDate)}</p>
                <p><strong>試行回数:</strong> ${data.attemptCount}回目</p>
            </div>
            
            <h3>今後の対応について</h3>
            <p>クレジットカードの有効期限切れや残高不足などが原因として考えられます。</p>
            
            ${
              data.nextRetry
                ? `
            <div class="retry-info">
                <h4>📅 次回自動再試行予定</h4>
                <p><strong>${formatDate(data.nextRetry)}</strong></p>
                <p>この日時に自動的に再度お支払いを試行いたします。</p>
            </div>
            `
                : ''
            }
            
            <h3>お客様にしていただくこと</h3>
            <ol>
                <li>クレジットカード情報の確認・更新</li>
                <li>残高の確認</li>
                <li>必要に応じて別のお支払い方法への変更</li>
            </ol>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/billing" class="action-button">
                    お支払い情報を更新する
                </a>
            </div>
            
            <div class="info-box">
                <h4>⚠️ 重要なお知らせ</h4>
                <p>お支払いが完了するまで、一部のプレミアム機能がご利用いただけない場合があります。</p>
                <p>ご不明な点がございましたら、お気軽にサポートまでお問い合わせください。</p>
            </div>
        </div>
        <div class="footer">
            <p>Work Time Tracker サポートチーム</p>
            <p>Email: support@worktimetracker.com</p>
            <p>このメールは自動送信されています。直接返信はできません。</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
【重要】お支払いに関するお知らせ - Work Time Tracker

${data.customerName} 様、

いつもWork Time Trackerをご利用いただき、ありがとうございます。

申し訳ございませんが、以下のお支払いで問題が発生いたしました：

お支払い詳細:
- 請求書番号: ${data.invoiceId}
- 金額: ${formatCurrency(data.amount, data.currency)}
- 支払期限: ${formatDate(data.dueDate)}
- 試行回数: ${data.attemptCount}回目

${data.nextRetry ? `次回自動再試行予定: ${formatDate(data.nextRetry)}` : ''}

今後の対応について:
クレジットカードの有効期限切れや残高不足などが原因として考えられます。

お客様にしていただくこと:
1. クレジットカード情報の確認・更新
2. 残高の確認  
3. 必要に応じて別のお支払い方法への変更

お支払い情報の更新: ${process.env.FRONTEND_URL}/billing

⚠️ 重要: お支払いが完了するまで、一部のプレミアム機能がご利用いただけない場合があります。

ご不明な点がございましたら、support@worktimetracker.com までお問い合わせください。

Work Time Tracker サポートチーム
    `;

    return { subject, html, text };
  }

  /**
   * ウェルカムメール送信
   */
  public async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    if (!this.isInitialized || !this.transporter) {
      console.warn('⚠️ EmailService: ウェルカムメール送信スキップ（サービス未初期化）');
      return;
    }

    try {
      const mailOptions = {
        from: {
          name: 'Work Time Tracker',
          address: process.env.FROM_EMAIL || 'noreply@worktimetracker.com',
        },
        to,
        subject: 'Work Time Trackerへようこそ！',
        html: this.generateWelcomeEmailHtml(userName),
        text: this.generateWelcomeEmailText(userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ EmailService: ウェルカムメール送信完了:', {
        messageId: result.messageId,
        to,
      });
    } catch (error) {
      console.error('❌ EmailService: ウェルカムメール送信失敗:', error);
      throw new Error(
        `ウェルカムメール送信失敗: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private generateWelcomeEmailHtml(userName: string): string {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Work Time Trackerへようこそ！</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 30px; }
        .feature { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .action-button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Work Time Trackerへようこそ！</h1>
        </div>
        <div class="content">
            <p><strong>${userName}</strong> 様、</p>
            
            <p>Work Time Trackerにご登録いただき、ありがとうございます！</p>
            
            <p>あなたの生産性向上とワークライフバランスの実現をサポートする準備が整いました。</p>
            
            <h3>🚀 主な機能をご紹介</h3>
            
            <div class="feature">
                <h4>🧠 認知特性最適化</h4>
                <p>ADHD/ASD特化の設計で、あなたの認知特性に合わせた最適な作業環境を提供します。</p>
            </div>
            
            <div class="feature">
                <h4>🎮 ゲームループタスク管理</h4>
                <p>先延ばしを防ぐゲーミフィケーション要素で、楽しく継続的にタスクを完了できます。</p>
            </div>
            
            <div class="feature">
                <h4>🤖 AI統合支援</h4>
                <p>GPT-4、Claude、Geminiとの統合で、パーソナライズされた提案とサポートを受けられます。</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="action-button">
                    ダッシュボードを見る
                </a>
            </div>
            
            <h3>📚 はじめ方</h3>
            <ol>
                <li>認知プロファイル診断を受ける</li>
                <li>最初のタスクを作成する</li>
                <li>ポモドーロタイマーを試す</li>
                <li>進捗を確認する</li>
            </ol>
            
            <p>ご質問がございましたら、お気軽にサポートまでお問い合わせください。</p>
        </div>
        <div class="footer">
            <p>Work Time Tracker チーム</p>
            <p>Email: support@worktimetracker.com</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateWelcomeEmailText(userName: string): string {
    return `
Work Time Trackerへようこそ！

${userName} 様、

Work Time Trackerにご登録いただき、ありがとうございます！

あなたの生産性向上とワークライフバランスの実現をサポートする準備が整いました。

主な機能:
🧠 認知特性最適化 - ADHD/ASD特化の設計
🎮 ゲームループタスク管理 - 先延ばし防止
🤖 AI統合支援 - GPT-4、Claude、Gemini統合

ダッシュボードを見る: ${process.env.FRONTEND_URL}/dashboard

はじめ方:
1. 認知プロファイル診断を受ける
2. 最初のタスクを作成する  
3. ポモドーロタイマーを試す
4. 進捗を確認する

ご質問: support@worktimetracker.com

Work Time Tracker チーム
    `;
  }

  /**
   * サービス状態確認
   */
  public getServiceStatus(): { initialized: boolean; transporterReady: boolean } {
    return {
      initialized: this.isInitialized,
      transporterReady: !!this.transporter,
    };
  }
}

export { EmailService };
