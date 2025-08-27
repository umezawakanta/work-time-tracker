import { __testables } from '../VersionInfo';

describe('VersionInfo cache-busting fetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    (global.fetch as any) = originalFetch;
    jest.clearAllMocks();
  });

  it('appends ts param when fetching version.json', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ version: '1.0.0' }) });
    (global as any).fetch = mockFetch;

    await __testables.fetchVersion();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toMatch(/\/version\.json\?ts=\d+/);
  });

  it('appends ts param when fetching changelog.json', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ entries: [] }) });
    (global as any).fetch = mockFetch;

    await __testables.fetchChangelog();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toMatch(/\/changelog\.json\?ts=\d+/);
  });
});


