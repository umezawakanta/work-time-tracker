import { ErrorRecoveryService } from '@/services/ErrorRecoveryService';

type FetchMap = Record<string, { ok: boolean; status?: number }>;

function mockFetch(map: FetchMap) {
  global.fetch = jest.fn(async (input: RequestInfo) => {
    const url = String(input);
    const entry = map[url] || { ok: false, status: 404 };
    return {
      ok: entry.ok,
      status: entry.status ?? (entry.ok ? 200 : 500),
      json: async () => ({}),
    } as any;
  }) as any;
}

describe('ErrorRecoveryService.performSelfDiagnosis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all true when all health endpoints are OK', async () => {
    mockFetch({
      '/api/health': { ok: true },
      '/api/notifications/health': { ok: true },
      '/api/db/status': { ok: true },
      '/api/auth/check': { ok: true },
    });

    const s = ErrorRecoveryService.getInstance();
    const res = await s.performSelfDiagnosis();
    expect(res.server).toBe(true);
    expect(res.websocket).toBe(true);
    expect(res.database).toBe(true);
    expect(res.auth).toBe(true);
  });

  it('returns auth=false when /api/auth/check is 401', async () => {
    mockFetch({
      '/api/health': { ok: true },
      '/api/notifications/health': { ok: true },
      '/api/db/status': { ok: true },
      '/api/auth/check': { ok: false, status: 401 },
    });

    const s = ErrorRecoveryService.getInstance();
    const res = await s.performSelfDiagnosis();
    expect(res.server).toBe(true);
    expect(res.websocket).toBe(true);
    expect(res.database).toBe(true);
    expect(res.auth).toBe(false);
  });
});
