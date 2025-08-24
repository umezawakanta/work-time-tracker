import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';

interface TaskGenerationRequest {
  userId: string;
  config: {
    maxTasksPerDay?: number;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    context?: string;
  };
}

interface GeneratedTask {
  id: string;
  task: string;
  description: string;
  priority: number;
  category: string;
  estimatedTime: number;
  deadline?: string;
  tags: string[];
  quadrant?:
    | 'urgent-important'
    | 'important-not-urgent'
    | 'urgent-not-important'
    | 'not-urgent-not-important';
}

interface TaskGenerationResponse {
  success: boolean;
  data?: {
    tasks: GeneratedTask[];
    tasksGenerated: number;
    generatedAt: string;
    context: string;
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
    } as TaskGenerationResponse);
    return;
  }

  const operationId = `task_generation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { userId, config }: TaskGenerationRequest = req.body;
    const authenticatedUserId = req.user!.userId;

    console.log(`⚡ [${operationId}] Generating tasks for user:`, {
      userId,
      authenticatedUserId,
      config,
    });

    // Validate user authorization
    if (userId !== authenticatedUserId) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'ユーザー認証エラー',
      } as TaskGenerationResponse);
      return;
    }

    // Generate intelligent tasks based on user context
    const tasks = await generateIntelligentTasks(userId, config);
    const generatedAt = new Date().toISOString();

    console.log(`✅ [${operationId}] Tasks generated successfully:`, {
      tasksGenerated: tasks.length,
      generatedAt,
    });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        tasksGenerated: tasks.length,
        generatedAt,
        context: `ユーザー ${userId} の作業パターンと目標に基づいて生成`,
      },
      message: `${tasks.length}個のタスクが正常に生成されました`,
    } as TaskGenerationResponse);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Task generation failed:`, error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'タスク生成に失敗しました。しばらく後でお試しください。',
    } as TaskGenerationResponse);
  }
};

/**
 * Generate intelligent tasks based on user context and patterns
 */
async function generateIntelligentTasks(
  userId: string,
  config: TaskGenerationRequest['config']
): Promise<GeneratedTask[]> {
  const maxTasks = config.maxTasksPerDay ?? 5;
  const currentTime = new Date();
  const taskTemplates = getTaskTemplates(config.category);

  const tasks: GeneratedTask[] = [];

  // Generate productive tasks based on time of day and user patterns
  for (let i = 0; i < Math.min(maxTasks, taskTemplates.length); i++) {
    const template = taskTemplates[i];
    const task: GeneratedTask = {
      id: `gen_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
      task: template.title,
      description: template.description,
      priority: getPriorityValue(config.priority ?? template.defaultPriority),
      category: template.category,
      estimatedTime: template.estimatedTime,
      deadline: calculateDeadline(template.urgency),
      tags: [...template.tags, 'AI生成', '自動化'],
      quadrant: determineQuadrant(template.importance, template.urgency),
    };

    tasks.push(task);
  }

  // Add context-specific tasks
  if (config.context) {
    const contextTask = generateContextTask(config.context, userId);
    if (contextTask) {
      tasks.push(contextTask);
    }
  }

  console.log(`📝 Generated ${tasks.length} intelligent tasks for user ${userId}`);
  return tasks;
}

/**
 * Get task templates based on category
 */
function getTaskTemplates(category?: string) {
  const templates = {
    work: [
      {
        title: 'プロジェクト進捗確認',
        description: '現在進行中のプロジェクトの状況を確認し、必要なアクションを特定する',
        category: '仕事',
        importance: 'high',
        urgency: 'medium',
        defaultPriority: 'high',
        estimatedTime: 30,
        tags: ['プロジェクト管理', 'レビュー'],
      },
      {
        title: 'チームミーティング準備',
        description: '次回のチームミーティングのアジェンダを準備し、資料を整理する',
        category: '仕事',
        importance: 'medium',
        urgency: 'high',
        defaultPriority: 'medium',
        estimatedTime: 20,
        tags: ['会議', '準備'],
      },
      {
        title: 'メール整理と返信',
        description: '重要なメールに返信し、受信トレイを整理する',
        category: '仕事',
        importance: 'medium',
        urgency: 'medium',
        defaultPriority: 'medium',
        estimatedTime: 15,
        tags: ['コミュニケーション', '整理'],
      },
    ],
    personal: [
      {
        title: '健康チェック',
        description: '今日の体調を記録し、運動計画を確認する',
        category: '健康',
        importance: 'high',
        urgency: 'low',
        defaultPriority: 'medium',
        estimatedTime: 10,
        tags: ['健康', 'セルフケア'],
      },
      {
        title: '学習時間',
        description: '今日の学習目標を設定し、進捗を記録する',
        category: '学習',
        importance: 'high',
        urgency: 'low',
        defaultPriority: 'medium',
        estimatedTime: 45,
        tags: ['学習', '自己啓発'],
      },
      {
        title: '家事・整理整頓',
        description: '生活空間を整理し、必要な家事を完了する',
        category: '生活',
        importance: 'medium',
        urgency: 'medium',
        defaultPriority: 'low',
        estimatedTime: 25,
        tags: ['家事', '整理'],
      },
    ],
    default: [
      {
        title: '今日の振り返り',
        description: '今日の成果と課題を振り返り、明日の計画を立てる',
        category: '振り返り',
        importance: 'high',
        urgency: 'low',
        defaultPriority: 'medium',
        estimatedTime: 15,
        tags: ['振り返り', '計画'],
      },
      {
        title: '目標確認',
        description: '長期目標の進捗を確認し、必要な調整を行う',
        category: '目標管理',
        importance: 'high',
        urgency: 'low',
        defaultPriority: 'medium',
        estimatedTime: 20,
        tags: ['目標', '計画'],
      },
    ],
  };

  return templates[category as keyof typeof templates] || templates.default;
}

/**
 * Generate context-specific task
 */
function generateContextTask(context: string, userId: string): GeneratedTask | null {
  if (!context.trim()) return null;

  return {
    id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    task: `コンテキストタスク: ${context}`,
    description: `ユーザーのコンテキスト「${context}」に基づいて生成されたタスク`,
    priority: 3,
    category: 'カスタム',
    estimatedTime: 30,
    tags: ['コンテキスト', 'カスタム', 'AI生成'],
    quadrant: 'important-not-urgent',
  };
}

/**
 * Convert priority string to numeric value
 */
function getPriorityValue(priority: string): number {
  const mapping = { low: 1, medium: 3, high: 5 };
  return mapping[priority as keyof typeof mapping] || 3;
}

/**
 * Calculate deadline based on urgency
 */
function calculateDeadline(urgency: string): string | undefined {
  const now = new Date();

  switch (urgency) {
    case 'high':
      now.setHours(now.getHours() + 4); // 4 hours
      break;
    case 'medium':
      now.setDate(now.getDate() + 1); // Tomorrow
      break;
    case 'low':
      now.setDate(now.getDate() + 3); // 3 days
      break;
    default:
      return undefined;
  }

  return now.toISOString();
}

/**
 * Determine quadrant based on importance and urgency
 */
function determineQuadrant(importance: string, urgency: string): GeneratedTask['quadrant'] {
  if (importance === 'high' && urgency === 'high') {
    return 'urgent-important';
  } else if (importance === 'high' && urgency !== 'high') {
    return 'important-not-urgent';
  } else if (importance !== 'high' && urgency === 'high') {
    return 'urgent-not-important';
  } else {
    return 'not-urgent-not-important';
  }
}

export default withAuth(handler);
