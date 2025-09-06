/* eslint-disable @typescript-eslint/no-explicit-any */
interface NextApiRequest {
  method?: string;
  body?: any;
  query?: any;
  get?: (header: string) => string | undefined;
}

interface NextApiResponse {
  status: (code: number) => NextApiResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string | string[]) => void;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: 'ja' | 'en';
    notifications: boolean;
  };
}

// Mock data for development
const mockUserProfile: UserProfile = {
  id: '68b5919',
  email: 'user@example.com',
  name: 'テストユーザー',
  role: 'user',
  isActive: true,
  createdAt: '2025-09-01T00:00:00.000Z',
  updatedAt: '2025-09-07T00:00:00.000Z',
  lastLoginAt: '2025-09-07T00:00:00.000Z',
  preferences: {
    theme: 'light',
    language: 'ja',
    notifications: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { name, email, preferences } = req.body;

      if (!name && !email && !preferences) {
        return res.status(400).json({
          success: false,
          message: '更新するデータが指定されていません',
        });
      }

      // 本番環境では実際のデータベースを更新
      const host = req.get('host') || '';
      const isProduction = host.includes('vercel.app');

      if (isProduction) {
        // 本番環境では実際のデータベースを更新
        // 現在はモックデータを返す
        const updatedProfile: UserProfile = {
          ...mockUserProfile,
          name: name || mockUserProfile.name,
          email: email || mockUserProfile.email,
          preferences: preferences || mockUserProfile.preferences,
          updatedAt: new Date().toISOString(),
        };

        res.status(200).json({
          success: true,
          message: 'プロフィールが正常に更新されました',
          data: updatedProfile,
        });
      } else {
        // 開発環境ではモックデータを返す
        const updatedProfile: UserProfile = {
          ...mockUserProfile,
          name: name || mockUserProfile.name,
          email: email || mockUserProfile.email,
          preferences: preferences || mockUserProfile.preferences,
          updatedAt: new Date().toISOString(),
        };

        res.status(200).json({
          success: true,
          message: 'プロフィールが正常に更新されました',
          data: updatedProfile,
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'プロフィールの更新に失敗しました',
      });
    }
  } else if (req.method === 'GET') {
    try {
      // 本番環境では実際のデータベースから取得
      const host = req.get('host') || '';
      const isProduction = host.includes('vercel.app');

      if (isProduction) {
        // 本番環境では実際のデータベースから取得
        // 現在はモックデータを返す
        res.status(200).json({
          success: true,
          data: mockUserProfile,
        });
      } else {
        // 開発環境ではモックデータを返す
        res.status(200).json({
          success: true,
          data: mockUserProfile,
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'プロフィールの取得に失敗しました',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }
}
