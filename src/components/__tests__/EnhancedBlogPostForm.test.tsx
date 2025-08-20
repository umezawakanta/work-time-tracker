import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils/render';
import EnhancedBlogPostForm from '@/components/EnhancedBlogPostForm';

// Mock ENV to pass API key guard
jest.mock('@/utils/env', () => ({
  ENV: {
    OPENAI_API_KEY: () => 'test-key',
    ANTHROPIC_API_KEY: () => undefined,
    GEMINI_API_KEY: () => undefined,
  },
  __esModule: true,
  default: { OPENAI_API_KEY: () => 'test-key' },
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

    const extractBtn = screen.getByRole('button', { name: 'AIでタスク抽出' });
    expect(extractBtn).toBeInTheDocument();

    fireEvent.click(extractBtn);

    const mod = await import('@/services/ai/BlogTaskExtractionService');
    const svc: any = (mod as any).default;

    await waitFor(() => {
      expect(svc.extractFromContent).toHaveBeenCalledTimes(1);
    });
  });
});
