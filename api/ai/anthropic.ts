import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';

// Anthropic API configuration
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY ||
  process.env.VITE_ANTHROPIC_API_KEY ||
  (process.env as any).NEXT_PUBLIC_ANTHROPIC_API_KEY;

interface AnthropicRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  system?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  await cors(req, res);

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check for API key
  if (!ANTHROPIC_API_KEY) {
    res.status(500).json({
      error: 'Anthropic API key not configured',
      code: 'NOT_CONFIGURED',
    });
    return;
  }

  try {
    const body: AnthropicRequest = req.body;

    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      res.status(400).json({
        error: 'Invalid request: messages array is required',
        code: 'INVALID_REQUEST',
      });
      return;
    }

    // Forward request to Anthropic API
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-3-5-sonnet-20241022',
        max_tokens: body.max_tokens || 8192,
        temperature: body.temperature || 0.7,
        top_p: body.top_p || 0.95,
        messages: body.messages,
        system: body.system,
      }),
    });

    // Handle Anthropic API errors
    if (!anthropicResponse.ok) {
      type AnthropicError = { error?: { message?: string } };
      const errorData: AnthropicError = (await anthropicResponse
        .json()
        .catch(() => ({}) as AnthropicError)) as AnthropicError;

      if (anthropicResponse.status === 429) {
        res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT',
          retryAfter: anthropicResponse.headers.get('retry-after'),
        });
        return;
      } else if (anthropicResponse.status === 401) {
        res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
        });
        return;
      } else if (anthropicResponse.status === 400) {
        res.status(400).json({
          error: errorData.error?.message || 'Bad request',
          code: 'BAD_REQUEST',
        });
        return;
      } else {
        res.status(anthropicResponse.status).json({
          error: `API request failed: ${anthropicResponse.statusText}`,
          code: 'API_ERROR',
        });
        return;
      }
    }

    // Return successful response
    const data = await anthropicResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Anthropic API proxy error:', error);

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
