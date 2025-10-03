import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../src/server/database';
import { Memo } from '../src/server/models/Memo';

const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
};

const ensureDatabaseConnection = async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('データベース接続に失敗しました');
  }
};

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // データベース接続を確実にする
    await ensureDatabaseConnection();
    
    console.log('Database connected successfully for error-reports API');

    if (req.method === 'POST') {
      // エラー報告を保存
      console.log('Creating error report...');
      
      try {
        const { title, content, errorDetails, userAgent, timestamp } = req.body;

        if (!title || !content) {
          return res.status(400).json({
            success: false,
            message: 'タイトルと内容は必須です'
          });
        }

        // エラー報告をメモとして保存
        const errorReport = new Memo({
          title: `[エラー報告] ${title}`,
          content: `## エラー詳細\n\n${content}\n\n## 技術情報\n\n**エラー詳細:**\n\`\`\`\n${errorDetails}\n\`\`\`\n\n**ユーザーエージェント:**\n\`\`\`\n${userAgent}\n\`\`\`\n\n**発生時刻:**\n${timestamp}`,
          category: 'エラー報告',
          tags: ['エラー', 'バグ報告', 'システム'],
          isPublic: true,
          isFamilyOnly: false,
          isAdminOnly: false,
          userId: 'system', // システムからの報告として扱う
          authorName: 'システム',
          authorEmail: 'system@example.com',
          postType: 'error_report'
        });

        await errorReport.save();
        
        console.log('Error report created successfully:', errorReport._id);

        return res.status(201).json({
          success: true,
          message: 'エラー報告を送信しました',
          id: errorReport._id
        });
      } catch (saveError) {
        console.error('Error saving error report:', saveError);
        return res.status(500).json({
          success: false,
          message: 'エラー報告の保存に失敗しました',
          error: saveError.message
        });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in error-reports API:', error);
    
    // レスポンスが既に送信されている場合は何もしない
    if (res.headersSent) {
      return;
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました',
      error: error.message 
    });
  }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // リクエストとレスポンスオブジェクトの存在チェック
    if (!req || !res) {
      console.error('Request or response object is undefined');
      return;
    }

    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    await handleRequest(req, res);
  } catch (error) {
    console.error('Error in error-reports module:', error);
    
    // レスポンスが既に送信されている場合は何もしない
    if (res && res.headersSent) {
      return;
    }
    
    if (res) {
      return res.status(500).json({ 
        success: false, 
        message: 'サーバーエラーが発生しました',
        error: error.message 
      });
    }
  }
};
