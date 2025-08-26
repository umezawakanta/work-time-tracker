import { z } from 'zod';

export const analyticsEventSchema = z.object({
  event: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_]+$/i, 'Only alphanumerics and underscores are allowed'),
  data: z.unknown().optional(),
  timestamp: z.string().optional(),
  clientId: z.string().optional(),
  sessionId: z.string().optional(),
  path: z.string().optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
