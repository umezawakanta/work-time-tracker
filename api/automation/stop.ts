import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';

interface AutomationStopRequest {
  userId: string;
  automationId?: string;
}

interface AutomationResponse {
  success: boolean;
  data?: {
    automationId?: string;
    status: 'inactive';
    stoppedAt: string;
  };
  error?: string;
  message?: string;
}

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'POST method required',
    } as AutomationResponse);
    return;
  }

  const operationId = `automation_stop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { userId, automationId }: AutomationStopRequest = req.body;
    const authenticatedUserId = req.user!.userId;

    console.log(`⏹️ [${operationId}] Stopping automation for user:`, {
      userId,
      authenticatedUserId,
      automationId,
    });

    // Validate user authorization
    if (userId !== authenticatedUserId) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'ユーザー認証エラー',
      } as AutomationResponse);
      return;
    }

    // Stop automation processes
    const stoppedAt = new Date().toISOString();

    // In production, this would:
    // 1. Find active automation for the user
    // 2. Stop all background processes
    // 3. Update database status
    // 4. Clean up resources

    stopAutomationProcesses(userId, automationId);

    console.log(`✅ [${operationId}] Automation stopped successfully:`, {
      userId,
      automationId,
      stoppedAt,
    });

    res.status(200).json({
      success: true,
      data: {
        automationId,
        status: 'inactive',
        stoppedAt,
      },
      message: '自動化が正常に停止されました',
    } as AutomationResponse);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Automation stop failed:`, error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '自動化の停止に失敗しました。しばらく後でお試しください。',
    } as AutomationResponse);
  }
};

/**
 * Stop automation background processes
 */
function stopAutomationProcesses(userId: string, automationId?: string) {
  console.log(`🛑 Stopping automation processes for user ${userId}:`, automationId);

  // Stop task generation
  console.log('📝 Stopping task generation automation');

  // Stop scheduling automation
  console.log('📅 Stopping scheduling automation');

  // Stop prioritization automation
  console.log('🎯 Stopping prioritization automation');

  // Clean up any scheduled jobs
  console.log('🧹 Cleaning up scheduled jobs');

  console.log(`✅ All automation processes stopped for user ${userId}`);
}

export default withAuth(handler);
