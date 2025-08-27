import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DevelopmentStatus from '@/pages/DevelopmentStatus';

describe('DevelopmentStatus page', () => {
  beforeEach(() => {
    // @ts-expect-error - test polyfill
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        generatedAt: new Date().toISOString(),
        totals: { filesScanned: 10, findings: 2, todo: 1, mock: 1, wip: 0, errorHints: 0 },
        flags: { wipRoutes: ['/analytics'], mockRoutes: ['/quality-dashboard'] },
        findings: [
          { file: 'src/App.tsx', line: 1, snippet: 'TODO: fix something', kind: 'todo' },
          { file: 'src/pages/Mock.tsx', line: 2, snippet: 'mock data here', kind: 'mock' },
        ],
      }),
    });
  });

  it('renders summary and lists flags/findings', async () => {
    render(<DevelopmentStatus />);

    expect(screen.getByText('開発ステータス')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('フラグ付きルート')).toBeInTheDocument();
      expect(screen.getByText('/analytics')).toBeInTheDocument();
      expect(screen.getByText('/quality-dashboard')).toBeInTheDocument();
      expect(screen.getByText('TODO')).toBeInTheDocument();
      expect(screen.getByText('MOCK')).toBeInTheDocument();
    });
  });
});


