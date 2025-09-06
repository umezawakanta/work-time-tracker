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

interface UserSubscription {
  _id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data for development
const mockUserSubscriptions: UserSubscription[] = [
  {
    _id: 'sub_1',
    userId: '68b5919',
    planId: 'pro',
    status: 'active',
    currentPeriodEnd: '2025-10-07T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    createdAt: '2025-09-07T00:00:00.000Z',
    updatedAt: '2025-09-07T00:00:00.000Z',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'ユーザーIDは必須です',
        });
      }

      // 本番環境では実際のデータベースから取得
      const host = req.get('host') || '';
      const isProduction = host.includes('vercel.app');

      if (isProduction) {
        // 本番環境では実際のデータベースから取得
        // 現在はモックデータを返す
        const userSubscription = mockUserSubscriptions.find((sub) => sub.userId === userId);

        if (!userSubscription) {
          return res.status(404).json({
            success: false,
            message: 'ユーザーのサブスクリプションが見つかりません',
          });
        }

        res.status(200).json({
          success: true,
          data: userSubscription,
        });
      } else {
        // 開発環境ではモックデータを返す
        const userSubscription = mockUserSubscriptions.find((sub) => sub.userId === userId);

        if (!userSubscription) {
          return res.status(404).json({
            success: false,
            message: 'ユーザーのサブスクリプションが見つかりません',
          });
        }

        res.status(200).json({
          success: true,
          data: userSubscription,
        });
      }
    } catch (error) {
      console.error('User subscription fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'サブスクリプションの取得に失敗しました',
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }
}
