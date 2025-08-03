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

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { timeRange = '7d' } = req.query;
      console.log('📊 分析データ取得リクエスト:', { timeRange });

      // 時間範囲に基づいてデータを調整
      const multiplier = getTimeRangeMultiplier(timeRange as string);

      const mockAnalyticsData = {
        analytics: {
          users: {
            total: Math.round(2847 * multiplier),
            active: Math.round(1923 * multiplier),
            new: Math.round(347 * multiplier),
            returning: Math.round(1576 * multiplier),
            churned: Math.round(924 * multiplier),
          },
          sessions: {
            total: Math.round(8921 * multiplier),
            avgDuration: 342 + Math.round(Math.random() * 100),
            bounceRate: 32.4 + Math.round(Math.random() * 10),
            pagesPerSession: 4.7 + Math.random(),
          },
          pageViews: {
            total: Math.round(41863 * multiplier),
            unique: Math.round(38291 * multiplier),
            topPages: [
              { path: '/', views: Math.round(8921 * multiplier), avgTime: 127 },
              { path: '/todos', views: Math.round(6734 * multiplier), avgTime: 298 },
              { path: '/quadrant-dashboard', views: Math.round(4521 * multiplier), avgTime: 456 },
              { path: '/integrated-dashboard', views: Math.round(3892 * multiplier), avgTime: 312 },
              { path: '/login', views: Math.round(2156 * multiplier), avgTime: 89 },
              { path: '/analytics-dashboard', views: Math.round(1834 * multiplier), avgTime: 234 },
              { path: '/testing-dashboard', views: Math.round(1567 * multiplier), avgTime: 178 },
            ],
          },
          traffic: {
            direct: 42.3 + Math.round(Math.random() * 5),
            search: 28.7 + Math.round(Math.random() * 5),
            social: 15.2 + Math.round(Math.random() * 3),
            referral: 9.8 + Math.round(Math.random() * 3),
            email: 4.0 + Math.round(Math.random() * 2),
          },
          devices: {
            desktop: 64.2 + Math.round(Math.random() * 5),
            mobile: 28.9 + Math.round(Math.random() * 5),
            tablet: 6.9 + Math.round(Math.random() * 2),
          },
          geography: [
            {
              country: 'Japan',
              users: Math.round(1892 * multiplier),
              sessions: Math.round(5647 * multiplier),
            },
            {
              country: 'United States',
              users: Math.round(423 * multiplier),
              sessions: Math.round(1289 * multiplier),
            },
            {
              country: 'South Korea',
              users: Math.round(289 * multiplier),
              sessions: Math.round(856 * multiplier),
            },
            {
              country: 'Taiwan',
              users: Math.round(156 * multiplier),
              sessions: Math.round(478 * multiplier),
            },
            {
              country: 'Singapore',
              users: Math.round(87 * multiplier),
              sessions: Math.round(251 * multiplier),
            },
            {
              country: 'Canada',
              users: Math.round(76 * multiplier),
              sessions: Math.round(234 * multiplier),
            },
            {
              country: 'Australia',
              users: Math.round(64 * multiplier),
              sessions: Math.round(189 * multiplier),
            },
          ],
          realtime: {
            activeUsers: Math.round(127 + Math.random() * 50),
            currentPageViews: [
              { path: '/', users: Math.round(34 + Math.random() * 10) },
              { path: '/todos', users: Math.round(28 + Math.random() * 8) },
              { path: '/quadrant-dashboard', users: Math.round(21 + Math.random() * 6) },
              { path: '/integrated-dashboard', users: Math.round(18 + Math.random() * 5) },
              { path: '/login', users: Math.round(12 + Math.random() * 4) },
              { path: '/analytics-dashboard', users: Math.round(8 + Math.random() * 3) },
            ],
          },
        },
        sessions: generateMockSessions(Math.round(50 * multiplier)),
        pageViews: generateMockPageViews(Math.round(200 * multiplier)),
        users: generateMockUsers(Math.round(20 * multiplier)),
        timestamp: new Date().toISOString(),
      };

      console.log('✅ 分析データ生成完了:', {
        timeRange,
        totalUsers: mockAnalyticsData.analytics.users.total,
        totalPageViews: mockAnalyticsData.analytics.pageViews.total,
      });

      res.status(200).json({
        success: true,
        ...mockAnalyticsData,
        message: '分析データを正常に取得しました',
        metadata: {
          timeRange,
          generatedAt: new Date().toISOString(),
          dataPoints: {
            users: mockAnalyticsData.users.length,
            sessions: mockAnalyticsData.sessions.length,
            pageViews: mockAnalyticsData.pageViews.length,
          },
        },
      });
    } catch (error: any) {
      console.error('❌ 分析データ取得エラー:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: '分析データの取得に失敗しました',
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

function getTimeRangeMultiplier(timeRange: string): number {
  switch (timeRange) {
    case '1d':
      return 0.14; // 1/7
    case '7d':
      return 1;
    case '30d':
      return 4.3; // 30/7
    case '90d':
      return 12.9; // 90/7
    default:
      return 1;
  }
}

function generateMockSessions(count: number) {
  const sessions = [];
  const devices = ['desktop', 'mobile', 'tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const countries = ['Japan', 'United States', 'South Korea', 'Taiwan', 'Singapore'];
  const cities = {
    Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Sendai'],
    'United States': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston'],
    'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
    Taiwan: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Hsinchu'],
    Singapore: ['Singapore', 'Jurong', 'Tampines', 'Woodlands', 'Bedok'],
  };

  for (let i = 0; i < count; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const cityList = cities[country as keyof typeof cities];
    const city = cityList[Math.floor(Math.random() * cityList.length)];

    sessions.push({
      id: `session-${i}`,
      userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: `Mozilla/5.0 (${device === 'mobile' ? 'iPhone' : 'Windows NT 10.0'}) AppleWebKit/537.36`,
      device,
      browser,
      os: device === 'mobile' ? 'iOS' : 'Windows',
      location: { country, city, region: 'Unknown' },
      startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: Math.floor(Math.random() * 3600) + 60,
      pageViews: Math.floor(Math.random() * 15) + 1,
      referrer: Math.random() > 0.5 ? 'https://google.com' : undefined,
      utmSource: Math.random() > 0.7 ? 'google' : undefined,
      utmMedium: Math.random() > 0.7 ? 'organic' : undefined,
    });
  }

  return sessions;
}

function generateMockPageViews(count: number) {
  const pageViews = [];
  const paths = [
    '/',
    '/todos',
    '/quadrant-dashboard',
    '/integrated-dashboard',
    '/login',
    '/analytics-dashboard',
    '/testing-dashboard',
  ];
  const titles = {
    '/': 'Work Time Tracker - Home',
    '/todos': 'Todo Management',
    '/quadrant-dashboard': 'Quadrant Dashboard',
    '/integrated-dashboard': 'Integrated Dashboard',
    '/login': 'Login',
    '/analytics-dashboard': 'Analytics Dashboard',
    '/testing-dashboard': 'Testing Dashboard',
  };

  for (let i = 0; i < count; i++) {
    const path = paths[Math.floor(Math.random() * paths.length)];
    const title = titles[path as keyof typeof titles];

    pageViews.push({
      id: `view-${i}`,
      sessionId: `session-${Math.floor(Math.random() * 50)}`,
      userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
      path,
      title,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeOnPage: Math.floor(Math.random() * 600) + 30,
      scrollDepth: Math.floor(Math.random() * 100) + 1,
      clicks: Math.floor(Math.random() * 20),
      referrer: Math.random() > 0.5 ? 'https://google.com' : undefined,
    });
  }

  return pageViews;
}

function generateMockUsers(count: number) {
  const users = [];
  const roles = ['user', 'premium', 'admin', 'developer'];
  const languages = ['ja', 'en', 'ko', 'zh'];
  const timezones = ['Asia/Tokyo', 'America/New_York', 'Europe/London', 'Asia/Seoul'];
  const features = [
    'todos',
    'quadrant-dashboard',
    'time-tracking',
    'analytics',
    'testing',
    'integrated-dashboard',
  ];
  const devices = ['desktop', 'mobile', 'tablet'];

  for (let i = 0; i < count; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const hasPremium = role === 'premium' || role === 'admin';

    users.push({
      id: `user-${i}`,
      email: `user${i}@example.com`,
      displayName: `User ${i}`,
      role,
      registrationDate: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalSessions: Math.floor(Math.random() * 100) + 1,
      totalPageViews: Math.floor(Math.random() * 500) + 10,
      avgSessionDuration: Math.floor(Math.random() * 1800) + 120,
      preferredLanguage: languages[Math.floor(Math.random() * languages.length)],
      timezone: timezones[Math.floor(Math.random() * timezones.length)],
      subscription: hasPremium
        ? {
            plan: role === 'admin' ? 'enterprise' : 'premium',
            status: 'active',
            startDate: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          }
        : undefined,
      behavior: {
        mostUsedFeatures: features.slice(0, Math.floor(Math.random() * 4) + 2),
        preferredDevices: devices.slice(0, Math.floor(Math.random() * 2) + 1),
        activeHours: Array.from({ length: Math.floor(Math.random() * 12) + 4 }, () =>
          Math.floor(Math.random() * 24)
        ).sort((a, b) => a - b),
      },
    });
  }

  return users;
}
