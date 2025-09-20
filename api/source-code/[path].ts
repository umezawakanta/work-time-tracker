import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path } = req.query;
    
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'File path is required' });
    }

    // パスの安全性をチェック（ディレクトリトラバーサル攻撃を防ぐ）
    const safePath = path.replace(/\.\./g, '').replace(/\/\//g, '/');
    
    // 許可されたファイル拡張子のみ
    const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html', '.md'];
    const hasAllowedExtension = allowedExtensions.some(ext => safePath.endsWith(ext));
    
    if (!hasAllowedExtension) {
      return res.status(400).json({ error: 'File type not allowed' });
    }

    // Vercel環境でのパス解決
    let filePath: string;
    
    // 本番環境では、ソースファイルは別の場所にある可能性がある
    if (process.env.NODE_ENV === 'production') {
      // Vercelの本番環境では、ソースファイルは通常利用できない
      // 代わりに、ビルドされたファイルの情報を返すか、エラーメッセージを返す
      return res.status(503).json({
        error: 'Source code access not available in production',
        message: 'ソースコードの閲覧は開発環境でのみ利用可能です。',
        suggestion: 'ローカル環境で開発サーバーを起動してご利用ください。'
      });
    } else {
      // 開発環境では通常のパス解決
      filePath = join(process.cwd(), safePath);
    }
    
    try {
      const content = await readFile(filePath, 'utf-8');
      
      res.status(200).json({
        success: true,
        content,
        path: safePath,
        size: content.length,
        lines: content.split('\n').length
      });
    } catch (fileError) {
      console.error('File read error:', fileError);
      res.status(404).json({ 
        error: 'File not found',
        path: safePath,
        details: fileError instanceof Error ? fileError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Source code API error:', error);
    res.status(500).json({ 
      error: 'Failed to read source code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
