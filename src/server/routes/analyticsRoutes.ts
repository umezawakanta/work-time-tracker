/**
 * 📊 Analytics API Routes
 * ユーザー行動トラッキングとアナリティクス機能のAPIエンドポイント
 */

import express from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/AnalyticsService';

const router = express.Router();
const analyticsService = new AnalyticsService();

// バリデーションスキーマ
const TrackEventSchema = z.object({
  event: z.string().min(1, 'イベント名は必須です'),
  data: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

const GetAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventType: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * 📈 イベントトラッキング
 * POST /api/analytics/track
 */
router.post('/track', async (req, res) => {
  try {
    if (process.env.ANALYTICS_DISABLED === 'true' || !process.env.MONGODB_URI) {
      return res.status(204).end();
    }
    // リクエストボディの検証
    const validationResult = TrackEventSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'バリデーションエラー',
        details: validationResult.error.issues,
      });
    }

    const { event, data, timestamp, userId, sessionId } = validationResult.data;

    // IPアドレスとユーザーエージェントを取得
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // イベントデータを作成
    const eventData = {
      event,
      data: data || {},
      timestamp: timestamp || new Date().toISOString(),
      userId: userId || 'anonymous',
      sessionId: sessionId || (req as any).sessionID || 'unknown',
      userAgent,
      ipAddress,
      url: req.headers.referer || 'unknown',
    };

    // イベントを記録
    const result = await analyticsService.trackEvent(eventData);

    res.status(201).json({
      success: true,
      message: 'イベントが記録されました',
      data: {
        eventId: result.id,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error('📊 Analytics tracking error:', error);

    res.status(500).json({
      success: false,
      error: 'イベントの記録に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * 📊 ページビュートラッキング
 * POST /api/analytics/pageview
 */
router.post('/pageview', async (req, res) => {
  try {
    const { page, title, referrer, userId, sessionId } = req.body;

    if (!page) {
      return res.status(400).json({
        success: false,
        error: 'ページ情報は必須です',
      });
    }

    const pageViewData = {
      event: 'page_view',
      data: {
        page,
        title: title || page,
        referrer: referrer || req.headers.referer || 'direct',
      },
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      sessionId: sessionId || (req as any).sessionID || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      url: page,
    };

    const result = await analyticsService.trackEvent(pageViewData);

    res.status(201).json({
      success: true,
      message: 'ページビューが記録されました',
      data: {
        eventId: result.id,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error('📊 Page view tracking error:', error);

    res.status(500).json({
      success: false,
      error: 'ページビューの記録に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * 📈 アナリティクス取得
 * GET /api/analytics
 */
router.get('/', async (req, res) => {
  try {
    const validationResult = GetAnalyticsSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'クエリパラメータが無効です',
        details: validationResult.error.issues,
      });
    }

    const { startDate, endDate, eventType, userId } = validationResult.data;

    const analytics = await analyticsService.getAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventType,
      userId,
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('📊 Analytics retrieval error:', error);

    res.status(500).json({
      success: false,
      error: 'アナリティクスの取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * 📊 ダッシュボード用サマリー
 * GET /api/analytics/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '7d', userId } = req.query;

    const dashboard = await analyticsService.getDashboardData({
      period: period as string,
      userId: userId as string,
    });

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('📊 Dashboard analytics error:', error);

    res.status(500).json({
      success: false,
      error: 'ダッシュボードデータの取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * 🔍 ユーザー行動分析
 * GET /api/analytics/user-behavior/:userId
 */
router.get('/user-behavior/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ユーザーIDは必須です',
      });
    }

    const behavior = await analyticsService.getUserBehavior({
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: behavior,
    });
  } catch (error) {
    console.error('📊 User behavior analysis error:', error);

    res.status(500).json({
      success: false,
      error: 'ユーザー行動分析に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * 📱 リアルタイム統計
 * GET /api/analytics/realtime
 */
router.get('/realtime', async (req, res) => {
  try {
    const realtimeStats = await analyticsService.getRealtimeStats();

    res.json({
      success: true,
      data: realtimeStats,
    });
  } catch (error) {
    console.error('📊 Realtime stats error:', error);

    res.status(500).json({
      success: false,
      error: 'リアルタイム統計の取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * ⚡ ヘルスチェック
 * GET /api/analytics/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
