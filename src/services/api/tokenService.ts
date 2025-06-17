import axios from 'axios';

// 循環依存を避けるため、独立したaxiosインスタンスを作成
const tokenApi = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchTokenFromDB(): Promise<string> {
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

  const baseURL = getTokenApiUrl();

  try {
    const response = await tokenApi.get(`${baseURL}/auth/token`, {
      withCredentials: true,
    });

    if (!response.data?.accessToken) {
      throw new Error('Access token not found in response');
    }

    return response.data.accessToken;
  } catch (error) {
    console.warn('Token fetch failed:', error);
    // トークン取得に失敗してもアプリケーションを停止させない
    return '';
  }
}
