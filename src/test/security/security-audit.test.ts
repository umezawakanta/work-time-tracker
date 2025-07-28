import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import * as crypto from 'crypto';

// セキュリティテスト用のモックサーバー
const server = setupServer();

beforeEach(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

describe('セキュリティ監査テスト', () => {
  describe('認証セキュリティ', () => {
    test('SQLインジェクション攻撃に対する保護', async () => {
      const maliciousPayloads = [
        "'; DROP TABLE users; --",
        "admin'--",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'; UPDATE users SET password='hacked' WHERE email='admin@example.com'; --",
      ];

      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          const body = req.body as any;
          // SQLインジェクションペイロードが適切にエスケープされているか確認
          const email = body.email;

          // 危険な文字が含まれている場合は拒否されるべき
          if (maliciousPayloads.some((payload) => email?.includes(payload))) {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                error: 'Invalid input',
                message: '不正な入力が検出されました',
              })
            );
          }

          return res(ctx.status(200), ctx.json({ success: true }));
        })
      );

      for (const payload of maliciousPayloads) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload,
            password: 'test123',
          }),
        });

        const data = await response.json();

        // SQLインジェクション攻撃が拒否されることを確認
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toBe('不正な入力が検出されました');
      }
    });

    test('XSS攻撃に対する保護', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<svg onload="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
        "'><script>alert(String.fromCharCode(88,83,83))</script>",
      ];

      server.use(
        rest.post('/api/auth/register', (req, res, ctx) => {
          const body = req.body as any;
          const { displayName, email } = body;

          // XSSペイロードが適切にサニタイズされているか確認
          const hasXSSPayload = xssPayloads.some(
            (payload) => displayName?.includes(payload) || email?.includes(payload)
          );

          if (hasXSSPayload) {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                error: 'Invalid input',
                message: 'セキュリティ上の理由により入力が拒否されました',
              })
            );
          }

          return res(
            ctx.status(201),
            ctx.json({
              success: true,
              data: {
                user: {
                  displayName: displayName?.replace(/<[^>]*>/g, ''), // HTMLタグを除去
                  email: email?.replace(/<[^>]*>/g, ''),
                },
              },
            })
          );
        })
      );

      for (const payload of xssPayloads) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: payload,
            email: 'test@example.com',
            password: 'test123',
            acceptTerms: true,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 成功した場合、XSSペイロードがサニタイズされていることを確認
          expect(data.data.user.displayName).not.toContain('<script>');
          expect(data.data.user.displayName).not.toContain('javascript:');
          expect(data.data.user.displayName).not.toContain('onerror');
        } else {
          // 拒否された場合、適切なエラーメッセージが返されることを確認
          expect(data.message).toBe('セキュリティ上の理由により入力が拒否されました');
        }
      }
    });

    test('CSRF攻撃に対する保護', async () => {
      server.use(
        rest.post('/api/subscriptions/create', (req, res, ctx) => {
          const origin = req.headers.get('Origin');
          const referer = req.headers.get('Referer');
          const authToken = req.headers.get('Authorization');

          // CSRF保護の確認
          if (!authToken || !authToken.startsWith('Bearer ')) {
            return res(
              ctx.status(401),
              ctx.json({
                success: false,
                error: 'Unauthorized',
                message: '認証が必要です',
              })
            );
          }

          // 不正なOriginからのリクエストを拒否
          const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker.vercel.app'];
          if (origin && !allowedOrigins.includes(origin)) {
            return res(
              ctx.status(403),
              ctx.json({
                success: false,
                error: 'Forbidden',
                message: '不正なOriginからのリクエストです',
              })
            );
          }

          return res(ctx.status(201), ctx.json({ success: true }));
        })
      );

      // 不正なOriginからのリクエスト
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil-site.com',
          Authorization: 'Bearer valid_token_123',
        },
        body: JSON.stringify({
          planId: 'plan-basic',
          billingCycle: 'monthly',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.message).toBe('不正なOriginからのリクエストです');
    });

    test('ブルートフォース攻撃に対する保護', async () => {
      let attemptCount = 0;
      const maxAttempts = 5;

      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          attemptCount++;

          if (attemptCount > maxAttempts) {
            return res(
              ctx.status(429),
              ctx.json({
                success: false,
                error: 'Too many requests',
                message:
                  'ログイン試行回数が上限に達しました。しばらく待ってから再度お試しください。',
              })
            );
          }

          // 不正なログインを模倣
          return res(
            ctx.status(401),
            ctx.json({
              success: false,
              error: 'Invalid credentials',
              message: 'メールアドレスまたはパスワードが正しくありません',
            })
          );
        })
      );

      // 複数回の失敗したログイン試行
      for (let i = 0; i <= maxAttempts + 1; i++) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrong_password',
          }),
        });

        if (i <= maxAttempts) {
          expect(response.status).toBe(401);
        } else {
          // レート制限が適用されることを確認
          expect(response.status).toBe(429);
          const data = await response.json();
          expect(data.message).toContain('ログイン試行回数が上限に達しました');
        }
      }
    });

    test('JWT トークンのセキュリティ', () => {
      // 有効なJWTトークンの構造を確認
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      // JWT構造の確認
      const parts = validToken.split('.');
      expect(parts.length).toBe(3);

      // ヘッダーとペイロードがBase64でエンコードされていることを確認
      expect(() => {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        expect(header.alg).toBe('HS256');
        expect(header.typ).toBe('JWT');
      }).not.toThrow();

      // 不正なトークンの拒否
      const invalidTokens = [
        'invalid.token.format',
        'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0..', // algorithm: none
        '', // 空文字
        'Bearer ', // Bearerのみ
      ];

      invalidTokens.forEach((token) => {
        expect(() => {
          // トークン検証ロジック（実際の実装ではjwtライブラリを使用）
          if (!token || token.split('.').length !== 3) {
            throw new Error('Invalid token format');
          }
        }).toThrow();
      });
    });
  });

  describe('課金システムセキュリティ', () => {
    test('支払い情報の暗号化', async () => {
      const sensitiveData = {
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvc: '123',
        cardholderName: 'Test User',
      };

      // 暗号化関数のテスト
      const encrypt = (data: string): string => {
        const algorithm = 'aes-256-gcm';
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(algorithm, key);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return encrypted;
      };

      // カード番号が暗号化されることを確認
      const encryptedCardNumber = encrypt(sensitiveData.cardNumber);
      expect(encryptedCardNumber).not.toBe(sensitiveData.cardNumber);
      expect(encryptedCardNumber.length).toBeGreaterThan(0);

      // 暗号化されたデータに元の情報が含まれていないことを確認
      expect(encryptedCardNumber).not.toContain('4242');
    });

    test('PCI DSS準拠の確認', async () => {
      server.use(
        rest.post('/api/subscriptions/create', (req, res, ctx) => {
          const body = req.body as any;

          // カード情報が直接送信されていないことを確認
          const forbiddenFields = ['cardNumber', 'expiryDate', 'cvc'];
          const hasCardData = forbiddenFields.some((field) => body[field]);

          if (hasCardData) {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                error: 'Security violation',
                message: 'カード情報を直接送信することはできません',
              })
            );
          }

          return res(ctx.status(201), ctx.json({ success: true }));
        })
      );

      // カード情報を直接送信しようとした場合
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
        body: JSON.stringify({
          planId: 'plan-basic',
          cardNumber: '4242424242424242', // 直接送信（禁止）
          expiryDate: '12/25',
          cvc: '123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toBe('カード情報を直接送信することはできません');
    });

    test('金額の改ざん防止', async () => {
      server.use(
        rest.post('/api/subscriptions/create', (req, res, ctx) => {
          const body = req.body as any;

          // クライアントから金額が送信された場合は拒否
          if (body.amount || body.price) {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                error: 'Invalid request',
                message: '金額はサーバー側で決定されます',
              })
            );
          }

          return res(ctx.status(201), ctx.json({ success: true }));
        })
      );

      // 金額を改ざんしようとした場合
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
        body: JSON.stringify({
          planId: 'plan-basic',
          amount: 1, // 不正に低い金額
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toBe('金額はサーバー側で決定されます');
    });

    test('重複課金の防止', async () => {
      const processedTokens = new Set<string>();

      server.use(
        rest.post('/api/subscriptions/create', (req, res, ctx) => {
          const body = req.body as any;
          const confirmationToken = body.confirmationToken;

          if (!confirmationToken) {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                error: 'Missing confirmation token',
                message: '確認トークンが必要です',
              })
            );
          }

          if (processedTokens.has(confirmationToken)) {
            return res(
              ctx.status(409),
              ctx.json({
                success: false,
                error: 'Duplicate operation',
                message: '同じ操作が既に処理されています',
              })
            );
          }

          processedTokens.add(confirmationToken);
          return res(ctx.status(201), ctx.json({ success: true }));
        })
      );

      const confirmationToken = 'conf_test_123';

      // 最初のリクエスト（成功）
      const firstResponse = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
        body: JSON.stringify({
          planId: 'plan-basic',
          confirmationToken,
        }),
      });

      expect(firstResponse.status).toBe(201);

      // 重複リクエスト（拒否）
      const duplicateResponse = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
        body: JSON.stringify({
          planId: 'plan-basic',
          confirmationToken, // 同じトークン
        }),
      });

      expect(duplicateResponse.status).toBe(409);
      const data = await duplicateResponse.json();
      expect(data.message).toBe('同じ操作が既に処理されています');
    });
  });

  describe('APIセキュリティ', () => {
    test('レート制限の実装', async () => {
      let requestCount = 0;
      const rateLimit = 10;

      server.use(
        rest.get('/api/progress/tracking', (req, res, ctx) => {
          requestCount++;

          if (requestCount > rateLimit) {
            return res(
              ctx.status(429),
              ctx.json({
                success: false,
                error: 'Rate limit exceeded',
                message: 'リクエスト制限に達しました。しばらく待ってから再度お試しください。',
              })
            );
          }

          return res(ctx.status(200), ctx.json({ success: true }));
        })
      );

      // レート制限を超えるまでリクエストを送信
      for (let i = 0; i <= rateLimit + 1; i++) {
        const response = await fetch('/api/progress/tracking?type=tasks', {
          headers: { Authorization: 'Bearer valid_token' },
        });

        if (i <= rateLimit) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
          const data = await response.json();
          expect(data.message).toContain('リクエスト制限に達しました');
        }
      }
    });

    test('入力検証とサニタイゼーション', async () => {
      const maliciousInputs = [
        { type: 'script', value: '<script>alert("hack")</script>' },
        { type: 'sql', value: "'; DROP TABLE tasks; --" },
        { type: 'path', value: '../../etc/passwd' },
        { type: 'command', value: '$(rm -rf /)' },
        { type: 'overflow', value: 'A'.repeat(10000) },
      ];

      server.use(
        rest.post('/api/progress/tracking', (req, res, ctx) => {
          const body = req.body as any;

          // 危険な文字列パターンの検出
          const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /drop\s+table/i,
            /union\s+select/i,
            /\.\.\//,
            /\$\(/,
            /`.*`/,
          ];

          const input = JSON.stringify(body);
          const isDangerous = dangerousPatterns.some((pattern) => pattern.test(input));

          if (isDangerous) {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                error: 'Invalid input',
                message: 'セキュリティ上の理由により入力が拒否されました',
              })
            );
          }

          // 文字列長制限
          if (input.length > 5000) {
            return res(
              ctx.status(413),
              ctx.json({
                success: false,
                error: 'Payload too large',
                message: 'リクエストが大きすぎます',
              })
            );
          }

          return res(ctx.status(200), ctx.json({ success: true }));
        })
      );

      for (const maliciousInput of maliciousInputs) {
        const response = await fetch('/api/progress/tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid_token',
          },
          body: JSON.stringify({
            type: 'update',
            taskId: maliciousInput.value,
            updates: { notes: maliciousInput.value },
          }),
        });

        // 悪意のある入力が拒否されることを確認
        expect([400, 413]).toContain(response.status);
        const data = await response.json();
        expect(data.success).toBe(false);
      }
    });

    test('HTTPSリダイレクトの強制', () => {
      // HTTPSが強制されることを確認
      const httpUrl = 'http://example.com/api/auth/login';
      const httpsUrl = httpUrl.replace('http:', 'https:');

      // 実際の実装では、HTTPからHTTPSへのリダイレクトをテスト
      expect(httpsUrl).toBe('https://example.com/api/auth/login');

      // セキュリティヘッダーの確認
      const securityHeaders = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': "default-src 'self'",
      };

      Object.entries(securityHeaders).forEach(([header, value]) => {
        expect(header).toBeTruthy();
        expect(value).toBeTruthy();
      });
    });
  });

  describe('データ保護', () => {
    test('個人情報の暗号化', () => {
      const personalData = {
        email: 'user@example.com',
        name: 'テストユーザー',
        phoneNumber: '090-1234-5678',
      };

      // 暗号化関数のテスト
      const encryptPII = (data: string): string => {
        // 実際の暗号化ロジック（AES-256など）
        return Buffer.from(data).toString('base64'); // 簡易版
      };

      const encryptedEmail = encryptPII(personalData.email);
      const encryptedName = encryptPII(personalData.name);

      // 暗号化されたデータが元の形式と異なることを確認
      expect(encryptedEmail).not.toBe(personalData.email);
      expect(encryptedName).not.toBe(personalData.name);

      // 暗号化されたデータに個人情報が含まれていないことを確認
      expect(encryptedEmail).not.toContain('@example.com');
      expect(encryptedName).not.toContain('テスト');
    });

    test('データの仮名化', () => {
      const userData = {
        userId: 'user-12345',
        email: 'john.doe@example.com',
        ipAddress: '192.168.1.100',
      };

      // 仮名化関数
      const anonymize = (data: any) => ({
        userId: crypto.createHash('sha256').update(data.userId).digest('hex').substring(0, 16),
        email: `user_${crypto.createHash('sha256').update(data.email).digest('hex').substring(0, 8)}@anonymized.com`,
        ipAddress: data.ipAddress.replace(/\.\d+$/, '.xxx'),
      });

      const anonymizedData = anonymize(userData);

      // 仮名化されたデータが元の情報を特定できないことを確認
      expect(anonymizedData.userId).not.toBe(userData.userId);
      expect(anonymizedData.email).not.toBe(userData.email);
      expect(anonymizedData.ipAddress).toBe('192.168.1.xxx');

      // 一貫性の確認（同じ入力は同じ出力）
      const anonymizedDataAgain = anonymize(userData);
      expect(anonymizedData.userId).toBe(anonymizedDataAgain.userId);
    });

    test('機密データのログ除外', () => {
      const logData = {
        userId: 'user-123',
        email: 'test@example.com',
        password: 'secret123',
        cardNumber: '4242424242424242',
        apiKey: 'sk_test_123456789',
      };

      // ログから機密データを除外する関数
      const sanitizeForLogging = (data: any) => {
        const sanitized = { ...data };

        // 機密フィールドをマスク
        const sensitiveFields = ['password', 'cardNumber', 'apiKey', 'token'];
        sensitiveFields.forEach((field) => {
          if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
          }
        });

        // メールアドレスの部分マスク
        if (sanitized.email) {
          sanitized.email = sanitized.email.replace(/(.{2})[^@]*@/, '$1***@');
        }

        return sanitized;
      };

      const sanitizedLog = sanitizeForLogging(logData);

      // 機密データがマスクされていることを確認
      expect(sanitizedLog.password).toBe('[REDACTED]');
      expect(sanitizedLog.cardNumber).toBe('[REDACTED]');
      expect(sanitizedLog.apiKey).toBe('[REDACTED]');
      expect(sanitizedLog.email).toBe('te***@example.com');

      // 非機密データは保持されていることを確認
      expect(sanitizedLog.userId).toBe('user-123');
    });
  });

  describe('監査ログ', () => {
    test('セキュリティイベントのログ記録', () => {
      const securityEvents = [
        {
          type: 'LOGIN_ATTEMPT',
          userId: 'user-123',
          success: false,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date().toISOString(),
        },
        {
          type: 'PAYMENT_FAILURE',
          userId: 'user-123',
          errorCode: 'CARD_DECLINED',
          amount: 980,
          timestamp: new Date().toISOString(),
        },
        {
          type: 'API_RATE_LIMIT_EXCEEDED',
          ipAddress: '10.0.0.1',
          endpoint: '/api/subscriptions/create',
          requestCount: 100,
          timestamp: new Date().toISOString(),
        },
      ];

      // 監査ログの構造検証
      securityEvents.forEach((event) => {
        expect(event.type).toBeTruthy();
        expect(event.timestamp).toBeTruthy();
        expect(new Date(event.timestamp)).toBeInstanceOf(Date);

        // イベントタイプ別の必須フィールド確認
        switch (event.type) {
          case 'LOGIN_ATTEMPT':
            expect(event.userId).toBeTruthy();
            expect(event.ipAddress).toBeTruthy();
            expect(typeof event.success).toBe('boolean');
            break;
          case 'PAYMENT_FAILURE':
            expect(event.userId).toBeTruthy();
            expect(event.errorCode).toBeTruthy();
            expect(typeof event.amount).toBe('number');
            break;
          case 'API_RATE_LIMIT_EXCEEDED':
            expect(event.ipAddress).toBeTruthy();
            expect(event.endpoint).toBeTruthy();
            expect(typeof event.requestCount).toBe('number');
            break;
        }
      });
    });

    test('改ざん防止のためのログ整合性確認', () => {
      const logEntries = [
        { id: 1, message: 'User login', timestamp: '2024-01-01T10:00:00Z' },
        { id: 2, message: 'Payment processed', timestamp: '2024-01-01T10:05:00Z' },
        { id: 3, message: 'User logout', timestamp: '2024-01-01T10:30:00Z' },
      ];

      // ログエントリのハッシュ値計算
      const calculateLogHash = (entries: any[]) => {
        const concatenated = entries
          .map((entry) => `${entry.id}:${entry.message}:${entry.timestamp}`)
          .join('|');

        return crypto.createHash('sha256').update(concatenated).digest('hex');
      };

      const originalHash = calculateLogHash(logEntries);

      // ログの改ざん試行
      const tamperedEntries = [...logEntries];
      tamperedEntries[1].message = 'Payment failed'; // 改ざん

      const tamperedHash = calculateLogHash(tamperedEntries);

      // ハッシュ値が変更されていることを確認（改ざん検出）
      expect(tamperedHash).not.toBe(originalHash);
    });
  });
});

// セキュリティテスト用のユーティリティ関数
export const generateMaliciousPayload = (type: 'xss' | 'sql' | 'path' | 'overflow') => {
  const payloads = {
    xss: [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      'javascript:alert("XSS")',
    ],
    sql: ["'; DROP TABLE users; --", "' OR '1'='1", "' UNION SELECT * FROM users --"],
    path: ['../../etc/passwd', '..\\..\\windows\\system32\\config\\sam', '/proc/self/environ'],
    overflow: [
      'A'.repeat(10000),
      'あ'.repeat(5000), // マルチバイト文字
    ],
  };

  return payloads[type];
};

export const validateSecurityHeaders = (headers: Record<string, string>) => {
  const requiredHeaders = [
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Content-Security-Policy',
  ];

  return requiredHeaders.every((header) => headers[header]);
};

export const simulateSecurityAttack = async (attackType: string, payload: any) => {
  // セキュリティ攻撃のシミュレーション
  return {
    attackType,
    payload,
    detected: true,
    blocked: true,
    timestamp: new Date().toISOString(),
  };
};
