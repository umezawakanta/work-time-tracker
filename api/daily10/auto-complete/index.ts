import { VercelRequest, VercelResponse } from '@vercel/node';

interface AutoCompleteRequest {
  taskId: string;
  subtaskId: string;
  action: string;
  data: any;
}

interface AutoCompleteResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }

    const { taskId, subtaskId, action, data } = req.body as AutoCompleteRequest;

    // 必須パラメータのチェック
    if (!taskId || !subtaskId || !action) {
      return res.status(400).json({
        success: false,
        message: 'taskId, subtaskId, and action are required',
      });
    }

    // デバッグログ
    console.log('Auto-complete request:', { taskId, subtaskId, action, data });

    // 自動完了の処理
    const result = {
      taskId,
      subtaskId,
      action,
      data,
      completedAt: new Date().toISOString(),
      message: 'Auto-complete executed successfully',
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Auto-complete API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
