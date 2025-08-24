import { extractFromContent } from '@/services/ai/BlogTaskExtractionService';

// Mock the dynamically imported AdvancedAIService
jest.mock('@/services/ai/AdvancedAIService', () => ({
  __esModule: true,
  default: {
    generateResponse: jest.fn(),
  },
}));

describe('BlogTaskExtractionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses tasks from strict JSON response', async () => {
    const mod = await import('@/services/ai/AdvancedAIService');
    const AdvancedAIService: any = (mod as any).default;

    AdvancedAIService.generateResponse.mockResolvedValueOnce(
      JSON.stringify({
        tasks: [
          { title: 'Write weekly report', type: 'output', priority: 4 },
          {
            title: 'Read research paper',
            type: 'input',
            priority: 3,
            dueDate: '2025-01-01T09:00:00.000Z',
            notes: 'Section 2 focus',
          },
        ],
      })
    );

    const result = await extractFromContent('dummy content', { locale: 'en', maxTasks: 5 });
    expect(Array.isArray(result.tasks)).toBe(true);
    expect(result.tasks.length).toBe(2);
    expect(result.tasks[0].title).toBe('Write weekly report');
    expect(result.tasks[0].type === 'input' || result.tasks[0].type === 'output').toBe(true);
    expect(result.tasks[1].dueDate).toBe('2025-01-01T09:00:00.000Z');
  });

  it('falls back to bullet list parsing when JSON is not returned', async () => {
    const mod = await import('@/services/ai/AdvancedAIService');
    const AdvancedAIService: any = (mod as any).default;

    AdvancedAIService.generateResponse.mockResolvedValueOnce(`- Write report\n- Read paper`);

    const result = await extractFromContent('ignored because AI returns text', {
      locale: 'en',
      maxTasks: 3,
    });

    expect(result.tasks.length).toBe(2);
    expect(result.tasks[0].title).toBe('Write report');
    expect(result.tasks[1].title).toBe('Read paper');
  });
});
