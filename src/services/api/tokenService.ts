import axios from 'axios';

// 循環依存を避けるため、独立したaxiosインスタンスを作成
const tokenApi = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchTokenFromDB(): Promise<string> {
  // 開発環境では無効化
  if (process.env.NODE_ENV === 'development') {
    console.log('🚫 Development: Token fetch from DB disabled');
    throw new Error('Token fetch disabled in development mode');
  }

  // API base URLを動的に取得（循環依存を避けるため）
  const getTokenApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname === 'work-time-tracker-5d9q.vercel.app') {
        return 'https://work-time-tracker-5d9q.vercel.app/api';
      }

      if (hostname.match(/^work-time-tracker-5d9q-.*\.vercel\.app$/)) {
        return 'https://work-time-tracker-5d9q.vercel.app/api';
      }

      if (hostname === 'localhost') {
        return 'http://localhost:3001/api';
      }

      return `${window.location.protocol}//${window.location.hostname}/api`;
    }

    return 'http://localhost:3001/api';
  };

  try {
    const response = await tokenApi.get(`${getTokenApiUrl()}/auth/token`);
    return response.data.token;
  } catch (error) {
    console.error('Token fetch failed:', error);
    throw error;
  }
}
