import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.ANTHROPIC_PROXY_PORT || 3001;

// Anthropic API configuration
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Anthropic proxy endpoint
app.post('/api/ai/anthropic', async (req, res) => {
  // Check for API key
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Anthropic API key not configured',
      code: 'NOT_CONFIGURED',
    });
  }

  try {
    const body = req.body;

    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required',
        code: 'INVALID_REQUEST',
      });
    }

    console.log('Proxying request to Anthropic API...');

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
      const errorData = await anthropicResponse.json().catch(() => ({}));

      if (anthropicResponse.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT',
          retryAfter: anthropicResponse.headers.get('retry-after'),
        });
      } else if (anthropicResponse.status === 401) {
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
        });
      } else if (anthropicResponse.status === 400) {
        return res.status(400).json({
          error: errorData.error?.message || 'Bad request',
          code: 'BAD_REQUEST',
        });
      } else {
        return res.status(anthropicResponse.status).json({
          error: `API request failed: ${anthropicResponse.statusText}`,
          code: 'API_ERROR',
        });
      }
    }

    // Return successful response
    const data = await anthropicResponse.json();
    console.log('Anthropic API response received successfully');
    res.status(200).json(data);
  } catch (error) {
    console.error('Anthropic API proxy error:', error);

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Anthropic proxy server running on http://localhost:${PORT}`);
  console.log(`   API Key configured: ${ANTHROPIC_API_KEY ? 'Yes ✅' : 'No ❌'}`);
  if (!ANTHROPIC_API_KEY) {
    console.log('   ⚠️  Please set ANTHROPIC_API_KEY in .env.local file');
  }
});

export default app;
