import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import AnalyticsEvent from '../../src/server/models/AnalyticsEvent';
import { cors } from '../../lib/cors';

interface TrackingEvent {
  event: string;
  data: any;
  timestamp: string;
}

interface TrackingResponse {
  success: boolean;
  message?: string;
  error?: string;
  eventId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'POST method required',
    } as TrackingResponse);
    return;
  }

  const operationId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const trackingEvent: TrackingEvent = req.body;

    console.log(`📊 [${operationId}] User tracking event:`, {
      event: trackingEvent.event,
      timestamp: trackingEvent.timestamp,
      dataType: typeof trackingEvent.data,
      hasData: !!trackingEvent.data,
    });

    // Validate event structure
    if (!trackingEvent.event || !trackingEvent.timestamp) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Required fields: event, timestamp',
      } as TrackingResponse);
      return;
    }

    // Normalize payload and enrich
    const safeEvent = String(trackingEvent.event);
    const safeTimestamp = new Date(trackingEvent.timestamp);
    if (Number.isNaN(safeTimestamp.getTime())) {
      res.status(400).json({ success: false, error: 'INVALID_TIMESTAMP' } as TrackingResponse);
      return;
    }
    const userAgent = String(req.headers['user-agent'] || '');
    const ipAddress = String(
      (req.headers['x-forwarded-for'] as string) || (req.connection as any)?.remoteAddress || ''
    );
    const referer = String((req.headers.referer as string) || '');
    const bodyUtm = (trackingEvent as any)?.utm;
    const utm = bodyUtm && typeof bodyUtm === 'object' ? bodyUtm : undefined;

    // Generate event ID (fallback when DB not used)
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Process different event types
    switch (safeEvent) {
      case 'session_start':
        console.log(`🎯 [${operationId}] Session started:`, {
          sessionId: trackingEvent.data?.sessionId,
          userId: trackingEvent.data?.userId,
          device: trackingEvent.data?.device?.type,
          browser: trackingEvent.data?.device?.browser,
        });
        break;

      case 'session_end':
        console.log(`⏰ [${operationId}] Session ended:`, {
          sessionId: trackingEvent.data?.sessionId,
          duration: trackingEvent.data?.totalTimeSpent,
          pageViews: trackingEvent.data?.pageViews?.length,
        });
        break;

      case 'page_view':
        console.log(`📄 [${operationId}] Page view:`, {
          page: trackingEvent.data?.page,
          title: trackingEvent.data?.title,
          userId: trackingEvent.data?.userId,
        });
        break;

      case 'page_view_end':
        console.log(`📄 [${operationId}] Page view ended:`, {
          page: trackingEvent.data?.page,
          timeSpent: trackingEvent.data?.timeSpent,
          scrollDepth: trackingEvent.data?.scrollDepth,
        });
        break;

      case 'interaction':
        console.log(`👆 [${operationId}] User interaction:`, {
          type: trackingEvent.data?.type,
          element: trackingEvent.data?.element,
          value: trackingEvent.data?.value,
        });
        break;

      case 'user_attributes':
        console.log(`👤 [${operationId}] User attributes updated:`, {
          userId: trackingEvent.data?.userId,
          role: trackingEvent.data?.role,
          subscriptionPlan: trackingEvent.data?.subscriptionPlan,
        });
        break;

      default:
        console.log(`❓ [${operationId}] Unknown event type:`, trackingEvent.event);
    }

    // Try to persist to DB (with safe fallback)
    let persistedId = eventId;
    try {
      await connectDB();
      const doc = await AnalyticsEvent.create({
        event: safeEvent,
        timestamp: safeTimestamp,
        data: { ...(trackingEvent.data || {}), utm },
        userAgent,
        ipAddress,
        url: referer,
        referrer: referer,
      });
      persistedId = String(doc._id);
      console.log(`💾 [${operationId}] Event saved to DB:`, persistedId);
    } catch (persistErr) {
      console.warn(`⚠️ [${operationId}] DB save failed, using in-memory ack`, persistErr);
    }

    res.status(200).json({
      success: true,
      message: 'トラッキングイベントが正常に記録されました',
      eventId: persistedId,
    } as TrackingResponse);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Tracking failed:`, error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'トラッキングの記録に失敗しました。しばらく後でお試しください。',
    } as TrackingResponse);
  }
}
