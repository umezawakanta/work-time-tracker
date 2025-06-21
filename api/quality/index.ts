import { NextApiRequest, NextApiResponse } from 'next';
import { qualityAnalysisService } from '../../src/services/quality/QualityAnalysisService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET': {
        const metrics = await qualityAnalysisService.getQualityMetrics();
        res.status(200).json({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'POST':
        // レポート更新の要求
        await qualityAnalysisService.refreshReports();
        res.status(200).json({
          success: true,
          message: 'Reports refresh triggered',
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          success: false,
          error: 'Method not allowed',
        });
        break;
    }
  } catch (error) {
    console.error('Quality API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
