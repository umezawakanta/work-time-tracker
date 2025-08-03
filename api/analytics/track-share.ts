import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://work-time-tracker-5d9q.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ];

  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { platform, content, timestamp, userAgent, referrer } = req.body;

      console.log('📊 SNSシェアトラッキング:', {
        platform,
        title: content.title,
        url: content.url,
        timestamp,
      });

      // 実際のプロダクションでは、これらのデータをデータベースに保存
      const shareEvent = {
        id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        platform,
        content: {
          title: content.title,
          description: content.description,
          url: content.url,
          hashtags: content.hashtags || [],
        },
        metadata: {
          timestamp,
          userAgent,
          referrer,
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          origin: req.headers.origin,
        },
        analytics: {
          tracked: true,
          source: 'sns-share-component',
        },
      };

      // モック処理：実際にはデータベースに保存
      console.log('💾 シェアイベント記録:', shareEvent);

      // 成功応答
      res.status(200).json({
        success: true,
        message: 'シェアトラッキングが完了しました',
        eventId: shareEvent.id,
        platform,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('❌ シェアトラッキングエラー:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'シェアトラッキングに失敗しました',
        details: error.message,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'サポートされていないHTTPメソッドです',
    });
  }
}
