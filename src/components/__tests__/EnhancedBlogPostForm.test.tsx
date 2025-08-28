import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils/render';
import EnhancedBlogPostForm from '@/components/EnhancedBlogPostForm';

// Mock ENV to pass API key guard and provide required named exports
jest.mock('@/utils/env', () => ({
  __esModule: true,
  // Named exports used by apiConfig and others
  getEnv: jest.fn(() => undefined),
  getBooleanEnv: jest.fn(() => false),
  isDev: jest.fn(() => false),
  isProd: jest.fn(() => false),
  // ENV helper used by components
  ENV: {
    OPENAI_API_KEY: () => 'test-key',
    ANTHROPIC_API_KEY: () => undefined,
    GEMINI_API_KEY: () => undefined,
  },
  // Default export mirrors ENV for compatibility
  default: {
    OPENAI_API_KEY: () => 'test-key',
    ANTHROPIC_API_KEY: () => undefined,
    GEMINI_API_KEY: () => undefined,
  },
}));

// Mock extraction service
jest.mock('@/services/ai/BlogTaskExtractionService', () => ({
  __esModule: true,
  default: {
    extractFromContent: jest.fn().mockResolvedValue({
      tasks: [{ title: 'Write weekly report', type: 'output' }],
    }),
  },
}));

describe('EnhancedBlogPostForm - task extraction', () => {
  it('renders extraction button and calls service on click', async () => {
    const onSubmit = jest.fn();

    render(
      <EnhancedBlogPostForm
        initialValues={{ title: 't', content: 'x'.repeat(80), category: 'c', tags: [] }}
        onSubmit={onSubmit}
        submitButtonText="Save"
      />
    );

    // Button accessible name changed in component: use the aria-label variant or partial match
    const extractBtn = screen.getByRole('button', { name: /AIでタスクを抽出|AIでタスク抽出/i });
    expect(extractBtn).toBeInTheDocument();

    fireEvent.click(extractBtn);

    const mod = await import('@/services/ai/BlogTaskExtractionService');
    const svc: any = (mod as any).default;

    await waitFor(() => {
      expect(svc.extractFromContent).toHaveBeenCalledTimes(1);
    });
  });
});
