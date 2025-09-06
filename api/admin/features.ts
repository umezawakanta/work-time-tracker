import { VercelRequest, VercelResponse } from '@vercel/node';

interface AdminFeature {
  id: string;
  name: string;
  path: string;
  category: string;
  description?: string;
  status: string;
  requiresRealAPI?: boolean;
  priority?: string;
  disabled?: boolean;
  targetRelease?: string;
  createdAt?: string;
  updatedAt?: string;
  completionRate?: number;
  dependencies?: string[];
  blockers?: string[];
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  lastActivity?: string;
  testCoverage?: number;
  documentationStatus?: 'none' | 'partial' | 'complete';
  deploymentStatus?: 'not_deployed' | 'staging' | 'production';
  userFeedback?: {
    rating: number;
    count: number;
    lastUpdated: string;
  };
}

interface AdminFeaturesResponse {
  success: boolean;
  features: AdminFeature[];
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    completionRate: number;
    overdueCount: number;
    thisWeekCount: number;
  };
  lastUpdated: string;
}

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    console.log('[admin/features] Starting request');

    // 管理者認証
    const ctx = await import('../_lib/user-context.js');
    console.log('[admin/features] Context loaded');

    const auth = await ctx.verifyJwtAndExtract(req as any);
    console.log('[admin/features] Auth verified:', { userId: auth?.userId });

    // 管理者権限チェック
    const User = await ctx.ensureDbAndUserModel();
    console.log('[admin/features] User model ensured');

    const user = await ctx.findUserByIdLoose(User, auth.userId);
    console.log('[admin/features] User found:', {
      user: user ? { id: user._id, role: user.role } : null,
    });

    if (!user || user.role !== 'admin') {
      return void res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // MongoDB接続
    const mongoLib = (await import('../_lib/mongo.js')) as any;
    await mongoLib.connectMongoDirect();
    const mongoose = await mongoLib.getMongoose();

    // 機能データの取得（featuresRegistryから）
    const featuresModule = await import('../../src/config/features.js');
    const featuresRegistry = featuresModule.featuresRegistry;

    // 各機能の詳細情報を取得
    const adminFeatures: AdminFeature[] = featuresRegistry.map((feature: any) => {
      // 完成率の計算
      const statusOrder = [
        'planning',
        'designing',
        'developing',
        'unit_testing',
        'integration_testing',
        'system_testing',
        'documenting',
        'review',
        'release_pending',
        'complete',
      ];
      const currentIndex = statusOrder.indexOf(feature.status);
      const completionRate =
        currentIndex >= 0 ? Math.round((currentIndex / (statusOrder.length - 1)) * 100) : 0;

      // リリース予定日の状態判定
      const today = new Date();
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      let releaseStatus = 'normal';
      if (feature.targetRelease) {
        const releaseDate = new Date(feature.targetRelease);
        if (releaseDate < today && feature.status !== 'complete') {
          releaseStatus = 'overdue';
        } else if (
          releaseDate >= today &&
          releaseDate <= oneWeekFromNow &&
          feature.status !== 'complete'
        ) {
          releaseStatus = 'thisWeek';
        }
      }

      return {
        id: feature.id,
        name: feature.name,
        path: feature.path,
        category: feature.category,
        description: feature.description,
        status: feature.status,
        requiresRealAPI: feature.requiresRealAPI || false,
        priority: feature.priority || 'P3',
        disabled: feature.disabled || false,
        targetRelease: feature.targetRelease,
        createdAt: feature.createdAt || new Date().toISOString(),
        updatedAt: feature.updatedAt || new Date().toISOString(),
        completionRate,
        dependencies: feature.dependencies || [],
        blockers: feature.blockers || [],
        assignee: feature.assignee || 'unassigned',
        estimatedHours: feature.estimatedHours || 0,
        actualHours: feature.actualHours || 0,
        lastActivity: feature.lastActivity || new Date().toISOString(),
        testCoverage: feature.testCoverage || 0,
        documentationStatus: feature.documentationStatus || 'none',
        deploymentStatus: feature.deploymentStatus || 'not_deployed',
        userFeedback: feature.userFeedback || {
          rating: 0,
          count: 0,
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    // サマリー統計の計算
    const summary = {
      total: adminFeatures.length,
      byStatus: adminFeatures.reduce(
        (acc, feature) => {
          acc[feature.status] = (acc[feature.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byCategory: adminFeatures.reduce(
        (acc, feature) => {
          acc[feature.category] = (acc[feature.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byPriority: adminFeatures.reduce(
        (acc, feature) => {
          acc[feature.priority!] = (acc[feature.priority!] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      completionRate: Math.round(
        adminFeatures.reduce((sum, feature) => sum + feature.completionRate, 0) /
          adminFeatures.length
      ),
      overdueCount: adminFeatures.filter((feature) => {
        if (!feature.targetRelease) return false;
        const releaseDate = new Date(feature.targetRelease);
        return releaseDate < new Date() && feature.status !== 'complete';
      }).length,
      thisWeekCount: adminFeatures.filter((feature) => {
        if (!feature.targetRelease) return false;
        const releaseDate = new Date(feature.targetRelease);
        const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return (
          releaseDate >= new Date() &&
          releaseDate <= oneWeekFromNow &&
          feature.status !== 'complete'
        );
      }).length,
    };

    const response: AdminFeaturesResponse = {
      success: true,
      features: adminFeatures,
      summary,
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Admin features fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

module.exports = handler;
