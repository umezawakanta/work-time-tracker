const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // 環境変数の確認
            console.log('Email service environment check:', {
                VERCEL: process.env.VERCEL,
                SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Not set',
                SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
                SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Not set',
                GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Not set',
                GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set',
            });

            // Vercel環境でのメール設定
            if (process.env.VERCEL) {
                // Vercel環境では環境変数から設定を取得
                if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                    this.transporter = nodemailer.createTransporter({
                        host: process.env.SMTP_HOST,
                        port: parseInt(process.env.SMTP_PORT) || 587,
                        secure: process.env.SMTP_SECURE === 'true',
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASS,
                        },
                    });
                    console.log('✅ Email service initialized for Vercel production');
                } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
                    // Gmail設定も試す
                    this.transporter = nodemailer.createTransporter({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_APP_PASSWORD,
                        },
                    });
                    console.log('✅ Email service initialized for Vercel with Gmail');
                } else {
                    console.log('⚠️ Email service not configured - missing email environment variables');
                }
            } else {
                // 開発環境ではGmailを使用
                if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
                    this.transporter = nodemailer.createTransporter({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_APP_PASSWORD,
                        },
                    });
                    console.log('✅ Email service initialized for development');
                } else {
                    console.log('⚠️ Email service not configured - missing Gmail environment variables');
                }
            }
        } catch (error) {
            console.error('❌ Email service initialization failed:', error);
        }
    }

    async sendPasswordResetEmail(email, resetUrl) {
        if (!this.transporter) {
            console.warn('Email service not available - skipping email send');
            return false;
        }

        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@work-time-tracker.com',
                to: email,
                subject: 'パスワードリセット - Work Time Tracker',
                html: this.createPasswordResetTemplate(resetUrl),
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            return false;
        }
    }

    createPasswordResetTemplate(resetUrl) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>パスワードリセット</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Work Time Tracker</div>
            <h1 class="title">パスワードリセット</h1>
          </div>
          
          <div class="content">
            <p>こんにちは、</p>
            <p>Work Time Trackerアカウントのパスワードリセットが要求されました。</p>
            <p>以下のボタンをクリックして、新しいパスワードを設定してください：</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">パスワードをリセット</a>
            </div>
            
            <div class="warning">
              <strong>注意：</strong>
              <ul>
                <li>このリンクは24時間後に期限切れになります</li>
                <li>このリクエストをしていない場合は、このメールを無視してください</li>
                <li>リンクがクリックできない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</li>
              </ul>
              <code style="word-break: break-all; background: #f3f4f6; padding: 8px; border-radius: 4px; display: block; margin-top: 10px;">${resetUrl}</code>
            </div>
          </div>
          
          <div class="footer">
            <p>このメールは自動送信されています。返信はできません。</p>
            <p>Work Time Tracker - ADHD/ASD特化勤怠管理システム</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}

// シングルトンインスタンス
const emailService = new EmailService();

module.exports = { emailService };
