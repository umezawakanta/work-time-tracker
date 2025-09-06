import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

interface DocumentInfo {
  id: string;
  title: string;
  path: string;
  category: string;
  lastModified: string;
  size: number;
  description?: string;
}

interface DocumentListResponse {
  success: boolean;
  data: DocumentInfo[];
  total: number;
}

interface DocumentContentResponse {
  success: boolean;
  data: {
    content: string;
    metadata: DocumentInfo;
  };
}

// ドキュメントのカテゴリとメタデータを定義
const documentCategories = {
  features: {
    name: '機能仕様書',
    description: '各機能の要件定義、設計書、テスト仕様書',
  },
  api: {
    name: 'API仕様書',
    description: 'APIエンドポイントの仕様とドキュメント',
  },
  'user-guide': {
    name: 'ユーザーガイド',
    description: 'ユーザー向け操作手順書',
  },
  admin: {
    name: '管理者向けドキュメント',
    description: '管理者向けの運用手順書',
  },
  development: {
    name: '開発者向けドキュメント',
    description: '開発者向けの技術仕様書',
  },
};

// ドキュメントファイルのスキャン
function scanDocuments(): DocumentInfo[] {
  const docsDir = path.join(process.cwd(), 'public', 'docs');
  const documents: DocumentInfo[] = [];

  try {
    // カテゴリごとにドキュメントをスキャン
    Object.keys(documentCategories).forEach((category) => {
      const categoryDir = path.join(docsDir, category);

      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir, { withFileTypes: true });

        files.forEach((file) => {
          if (file.isFile() && file.name.endsWith('.md')) {
            const filePath = path.join(categoryDir, file.name);
            const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
            const stats = fs.statSync(filePath);

            // ファイル名からタイトルを生成
            const title = file.name
              .replace('.md', '')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());

            documents.push({
              id: `${category}/${file.name.replace('.md', '')}`,
              title,
              path: `/${relativePath}`,
              category,
              lastModified: stats.mtime.toISOString(),
              size: stats.size,
              description: getDocumentDescription(filePath),
            });
          }
        });
      }
    });
  } catch (error) {
    console.error('Error scanning documents:', error);
  }

  return documents.sort(
    (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
}

// ドキュメントの説明を取得（ファイルの最初の段落から）
function getDocumentDescription(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 最初の非空行を探す
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        return trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed;
      }
    }
  } catch (error) {
    console.error('Error reading document description:', error);
  }

  return '';
}

// ドキュメントの内容を取得
function getDocumentContent(docPath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', docPath);
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error('Error reading document content:', error);
    throw new Error('ドキュメントが見つかりません');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS設定
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';

  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { action, id } = req.query;

      if (action === 'list') {
        // ドキュメント一覧を取得
        const documents = scanDocuments();
        const response: DocumentListResponse = {
          success: true,
          data: documents,
          total: documents.length,
        };

        res.status(200).json(response);
        return;
      }

      if (action === 'content' && id) {
        // 特定のドキュメントの内容を取得
        const docId = Array.isArray(id) ? id[0] : id;
        const docPath = `docs/${docId}.md`;

        try {
          const content = getDocumentContent(docPath);
          const documents = scanDocuments();
          const metadata = documents.find((doc) => doc.id === docId);

          if (!metadata) {
            res.status(404).json({
              success: false,
              message: 'ドキュメントが見つかりません',
            });
            return;
          }

          const response: DocumentContentResponse = {
            success: true,
            data: {
              content,
              metadata,
            },
          };

          res.status(200).json(response);
          return;
        } catch (error) {
          res.status(404).json({
            success: false,
            message: 'ドキュメントが見つかりません',
          });
          return;
        }
      }

      if (action === 'categories') {
        // カテゴリ一覧を取得
        res.status(200).json({
          success: true,
          data: documentCategories,
        });
        return;
      }

      // デフォルトはドキュメント一覧を返す
      const documents = scanDocuments();
      const response: DocumentListResponse = {
        success: true,
        data: documents,
        total: documents.length,
      };

      res.status(200).json(response);
      return;
    }

    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Documents API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
    });
  }
}
