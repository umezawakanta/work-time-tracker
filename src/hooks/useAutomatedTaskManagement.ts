/**
 * 🤖 自動化タスク管理フック
 * タスク管理と自動化ルールの完全連携を実現
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems, addTodoItem, updateTodoItem, deleteTodoItem } from '@/store/todoSlice';
import { integratedAutomationService } from '@/services/automation/IntegratedAutomationService';
import { integratedGamificationService } from '@/services/gamification/IntegratedGamificationService';
import { Todo, NewTodo } from '@/types/todo';
import { toast } from 'react-hot-toast';

export interface AutomatedTaskEvent {
  type:
    | 'task_created'
    | 'task_updated'
    | 'task_completed'
    | 'task_deleted'
    | 'task_priority_changed';
  task: Todo;
  previousTask?: Todo;
  triggeredBy: 'user' | 'automation' | 'ai';
  metadata?: any;
}

export interface TaskAutomationConfig {
  enableAutoGeneration: boolean;
  enableAutoCompletion: boolean;
  enableAutoPrioritization: boolean;
  enableAutoNotification: boolean;
  enableGamificationIntegration: boolean;
  autoGenerationRules: {
    dailyTasks: boolean;
    weeklyTasks: boolean;
    projectTasks: boolean;
    maintenanceTasks: boolean;
  };
  autoCompletionRules: {
    timeBasedCompletion: boolean;
    dependencyBasedCompletion: boolean;
    conditionBasedCompletion: boolean;
  };
  prioritizationRules: {
    deadlineBasedPriority: boolean;
    dependencyBasedPriority: boolean;
    aiBasedPriority: boolean;
  };
}

export interface TaskAutomationStats {
  automatedTasksCreated: number;
  automatedTasksCompleted: number;
  automatedPriorityChanges: number;
  automationSuccessRate: number;
  timeSaved: number; // in minutes
  xpGained: number;
  badgesEarned: number;
}

export interface UseAutomatedTaskManagementResult {
  // Current state
  config: TaskAutomationConfig;
  stats: TaskAutomationStats;
  isAutomationActive: boolean;

  // Configuration
  updateConfig: (config: Partial<TaskAutomationConfig>) => void;

  // Task operations with automation
  createTask: (taskData: NewTodo, enableAutomation?: boolean) => Promise<Todo | null>;
  updateTask: (
    taskId: string,
    updates: Partial<Todo>,
    enableAutomation?: boolean
  ) => Promise<Todo | null>;
  completeTask: (taskId: string, enableAutomation?: boolean) => Promise<Todo | null>;
  deleteTask: (taskId: string, enableAutomation?: boolean) => Promise<boolean>;

  // Automation controls
  startAutomation: () => void;
  stopAutomation: () => void;
  triggerAutomatedTaskGeneration: () => Promise<void>;

  // Event system
  onTaskEvent: (callback: (event: AutomatedTaskEvent) => void) => void;
  offTaskEvent: (callback: (event: AutomatedTaskEvent) => void) => void;
}

export const useAutomatedTaskManagement = (): UseAutomatedTaskManagementResult => {
  // State Management
  const [config, setConfig] = useState<TaskAutomationConfig>({
    enableAutoGeneration: true,
    enableAutoCompletion: true,
    enableAutoPrioritization: true,
    enableAutoNotification: true,
    enableGamificationIntegration: true,
    autoGenerationRules: {
      dailyTasks: true,
      weeklyTasks: true,
      projectTasks: false,
      maintenanceTasks: true,
    },
    autoCompletionRules: {
      timeBasedCompletion: false,
      dependencyBasedCompletion: true,
      conditionBasedCompletion: false,
    },
    prioritizationRules: {
      deadlineBasedPriority: true,
      dependencyBasedPriority: true,
      aiBasedPriority: false,
    },
  });

  const [stats, setStats] = useState<TaskAutomationStats>({
    automatedTasksCreated: 0,
    automatedTasksCompleted: 0,
    automatedPriorityChanges: 0,
    automationSuccessRate: 100,
    timeSaved: 0,
    xpGained: 0,
    badgesEarned: 0,
  });

  const [isAutomationActive, setIsAutomationActive] = useState(false);
  const eventCallbacks = useRef<((event: AutomatedTaskEvent) => void)[]>([]);
  const automationInterval = useRef<NodeJS.Timeout | null>(null);

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);

  // Initialize automation system
  useEffect(() => {
    initializeAutomation();
    return () => {
      cleanup();
    };
  }, []);

  // Watch for todo changes to trigger automation
  useEffect(() => {
    if (isAutomationActive) {
      processTodoChanges();
    }
  }, [todos, isAutomationActive]);

  const initializeAutomation = () => {
    // Load configuration from storage
    loadConfigFromStorage();

    // Load stats from storage
    loadStatsFromStorage();

    // Setup automation rules in the automation service
    setupAutomationRules();

    console.log('🤖 Automated task management initialized');
  };

  const setupAutomationRules = async () => {
    try {
      // Create automation rules for task management
      const rules = [
        {
          name: 'タスク完了時ゲーミフィケーション',
          description: 'タスク完了時に自動的にXPとバッジを付与',
          category: 'gamification' as const,
          priority: 'high' as const,
          isActive: config.enableGamificationIntegration,
          trigger: {
            type: 'event_based' as const,
            config: {
              event: 'task_completed',
            },
          },
          conditions: [],
          actions: [
            {
              id: 'gamification_rewards',
              type: 'update_gamification' as const,
              config: {
                xpAmount: 25,
              },
            },
            {
              id: 'completion_notification',
              type: 'send_notification' as const,
              config: {
                message: '🎉 タスク完了！+25 XP獲得',
                notificationType: 'success',
              },
            },
          ],
          tags: ['task_completion', 'gamification'],
        },
        {
          name: '高優先度タスク自動通知',
          description: '高優先度タスクが作成されたら自動通知',
          category: 'notification' as const,
          priority: 'high' as const,
          isActive: config.enableAutoNotification,
          trigger: {
            type: 'event_based' as const,
            config: {
              event: 'task_created',
            },
          },
          conditions: [
            {
              id: 'high_priority_check',
              field: 'task.priority',
              operator: 'greater_than' as const,
              value: 4,
            },
          ],
          actions: [
            {
              id: 'priority_notification',
              type: 'send_notification' as const,
              config: {
                message: '🚨 高優先度タスクが作成されました',
                notificationType: 'warning',
              },
            },
          ],
          tags: ['high_priority', 'notification'],
        },
        {
          name: '日次タスク自動生成',
          description: '毎朝定型タスクを自動生成',
          category: 'task_management' as const,
          priority: 'medium' as const,
          isActive: config.autoGenerationRules.dailyTasks,
          trigger: {
            type: 'time_based' as const,
            config: {
              schedule: '0 9 * * *', // 毎日9時
            },
          },
          conditions: [],
          actions: [
            {
              id: 'create_daily_tasks',
              type: 'create_task' as const,
              config: {
                taskData: {
                  task: '日次レビュー・計画',
                  priority: 3,
                  type: 'input',
                },
              },
            },
          ],
          tags: ['daily_generation', 'automated'],
        },
      ];

      // Create rules in automation service
      for (const rule of rules) {
        try {
          await integratedAutomationService.createRule(rule);
        } catch (error) {
          console.error('Failed to create automation rule:', rule.name, error);
        }
      }

      console.log('✅ Task automation rules setup complete');
    } catch (error) {
      console.error('Failed to setup automation rules:', error);
    }
  };

  const updateConfig = useCallback((newConfig: Partial<TaskAutomationConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      saveConfigToStorage(updated);

      // Update automation rules based on new config
      updateAutomationRules(updated);

      return updated;
    });
  }, []);

  const createTask = useCallback(
    async (taskData: NewTodo, enableAutomation = true): Promise<Todo | null> => {
      try {
        // Dispatch Redux action
        const result = await dispatch(addTodoItem(taskData));

        if (result.payload && enableAutomation && isAutomationActive) {
          const task = result.payload as Todo;

          // Trigger automation event
          const event: AutomatedTaskEvent = {
            type: 'task_created',
            task,
            triggeredBy: 'user',
          };

          await processTaskEvent(event);
          emitTaskEvent(event);

          return task;
        }

        return (result.payload as Todo) || null;
      } catch (error) {
        console.error('Failed to create task:', error);
        toast.error('タスク作成に失敗しました');
        return null;
      }
    },
    [dispatch, isAutomationActive]
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<Todo>,
      enableAutomation = true
    ): Promise<Todo | null> => {
      try {
        const previousTask = todos.find((t) => t._id === taskId);

        // Dispatch Redux action
        const result = await dispatch(updateTodoItem({ id: taskId, updates }));

        if (result.payload && enableAutomation && isAutomationActive && previousTask) {
          const task = result.payload as Todo;

          // Determine event type
          let eventType: AutomatedTaskEvent['type'] = 'task_updated';
          if (!previousTask.completed && task.completed) {
            eventType = 'task_completed';
          } else if (previousTask.priority !== task.priority) {
            eventType = 'task_priority_changed';
          }

          // Trigger automation event
          const event: AutomatedTaskEvent = {
            type: eventType,
            task,
            previousTask,
            triggeredBy: 'user',
          };

          await processTaskEvent(event);
          emitTaskEvent(event);

          return task;
        }

        return (result.payload as Todo) || null;
      } catch (error) {
        console.error('Failed to update task:', error);
        toast.error('タスク更新に失敗しました');
        return null;
      }
    },
    [dispatch, todos, isAutomationActive]
  );

  const completeTask = useCallback(
    async (taskId: string, enableAutomation = true): Promise<Todo | null> => {
      return await updateTask(
        taskId,
        { completed: true, completedDate: new Date().toISOString() },
        enableAutomation
      );
    },
    [updateTask]
  );

  const deleteTask = useCallback(
    async (taskId: string, enableAutomation = true): Promise<boolean> => {
      try {
        const task = todos.find((t) => t._id === taskId);

        // Dispatch Redux action
        const result = await dispatch(deleteTodoItem(taskId));

        if (result.payload && enableAutomation && isAutomationActive && task) {
          // Trigger automation event
          const event: AutomatedTaskEvent = {
            type: 'task_deleted',
            task,
            triggeredBy: 'user',
          };

          await processTaskEvent(event);
          emitTaskEvent(event);
        }

        return !!result.payload;
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error('タスク削除に失敗しました');
        return false;
      }
    },
    [dispatch, todos, isAutomationActive]
  );

  const startAutomation = useCallback(() => {
    setIsAutomationActive(true);

    // Start periodic automation checks
    automationInterval.current = setInterval(() => {
      performAutomationChecks();
    }, 60000); // 1分間隔

    console.log('🚀 Task automation started');
    toast.success('タスク自動化を開始しました');
  }, []);

  const stopAutomation = useCallback(() => {
    setIsAutomationActive(false);

    if (automationInterval.current) {
      clearInterval(automationInterval.current);
      automationInterval.current = null;
    }

    console.log('⏹️ Task automation stopped');
    toast('タスク自動化を停止しました');
  }, []);

  const triggerAutomatedTaskGeneration = useCallback(async () => {
    if (!isAutomationActive) return;

    try {
      const generatedTasks: NewTodo[] = [];

      // Generate daily tasks
      if (config.autoGenerationRules.dailyTasks) {
        generatedTasks.push({
          task: '日次進捗レビュー',
          priority: 3,
          type: 'input',
        });
      }

      // Generate weekly tasks (on Mondays)
      if (config.autoGenerationRules.weeklyTasks && new Date().getDay() === 1) {
        generatedTasks.push({
          task: '週次計画・目標設定',
          priority: 4,
          type: 'input',
        });
      }

      // Generate maintenance tasks
      if (config.autoGenerationRules.maintenanceTasks) {
        generatedTasks.push({
          task: 'システムメンテナンス・更新確認',
          priority: 2,
          type: 'input',
        });
      }

      // Create generated tasks
      for (const taskData of generatedTasks) {
        await createTask(taskData, false); // Don't trigger automation for auto-generated tasks
      }

      // Update stats
      updateStats((prev) => ({
        ...prev,
        automatedTasksCreated: prev.automatedTasksCreated + generatedTasks.length,
        timeSaved: prev.timeSaved + generatedTasks.length * 2, // Assume 2 minutes saved per task
      }));

      if (generatedTasks.length > 0) {
        toast.success(`${generatedTasks.length}個のタスクを自動生成しました`);
        console.log('✅ Automated task generation completed:', generatedTasks.length);
      }
    } catch (error) {
      console.error('Automated task generation failed:', error);
      toast.error('自動タスク生成に失敗しました');
    }
  }, [isAutomationActive, config, createTask]);

  const onTaskEvent = useCallback((callback: (event: AutomatedTaskEvent) => void) => {
    eventCallbacks.current.push(callback);
  }, []);

  const offTaskEvent = useCallback((callback: (event: AutomatedTaskEvent) => void) => {
    const index = eventCallbacks.current.indexOf(callback);
    if (index > -1) {
      eventCallbacks.current.splice(index, 1);
    }
  }, []);

  // Private methods
  const processTaskEvent = async (event: AutomatedTaskEvent) => {
    try {
      switch (event.type) {
        case 'task_completed':
          await handleTaskCompletion(event);
          break;
        case 'task_created':
          await handleTaskCreation(event);
          break;
        case 'task_priority_changed':
          await handlePriorityChange(event);
          break;
      }
    } catch (error) {
      console.error('Error processing task event:', error);
    }
  };

  const handleTaskCompletion = async (event: AutomatedTaskEvent) => {
    if (config.enableGamificationIntegration) {
      try {
        // Award XP and update gamification
        const xpGained = calculateXPForTask(event.task);

        // Update stats
        updateStats((prev) => ({
          ...prev,
          automatedTasksCompleted: prev.automatedTasksCompleted + 1,
          xpGained: prev.xpGained + xpGained,
          timeSaved: prev.timeSaved + 1, // 1 minute saved by automation
        }));

        console.log('🎮 Task completion gamification processed:', event.task.task);
      } catch (error) {
        console.error('Gamification processing failed:', error);
      }
    }
  };

  const handleTaskCreation = async (event: AutomatedTaskEvent) => {
    // Auto-prioritization based on rules
    if (config.enableAutoPrioritization) {
      const suggestedPriority = calculateAutoPriority(event.task);

      if (suggestedPriority !== event.task.priority) {
        await updateTask(event.task._id!, { priority: suggestedPriority }, false);

        updateStats((prev) => ({
          ...prev,
          automatedPriorityChanges: prev.automatedPriorityChanges + 1,
        }));
      }
    }
  };

  const handlePriorityChange = async (event: AutomatedTaskEvent) => {
    // Handle priority change notifications
    if (config.enableAutoNotification && event.task.priority >= 4) {
      console.log('🚨 High priority task detected:', event.task.task);
    }
  };

  const calculateXPForTask = (task: Todo): number => {
    let baseXP = 25;

    // Priority bonus
    if (task.priority >= 4) baseXP += 10;
    if (task.priority >= 5) baseXP += 15;

    // Complexity bonus (based on task description length)
    if (task.task.length > 50) baseXP += 5;
    if (task.task.length > 100) baseXP += 10;

    return baseXP;
  };

  const calculateAutoPriority = (task: Todo): number => {
    let priority = task.priority || 3;

    // Deadline-based priority
    if (config.prioritizationRules.deadlineBasedPriority && task.deadline) {
      const deadline = new Date(task.deadline);
      const now = new Date();
      const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysUntilDeadline <= 1) priority = Math.max(priority, 5);
      else if (daysUntilDeadline <= 3) priority = Math.max(priority, 4);
      else if (daysUntilDeadline <= 7) priority = Math.max(priority, 3);
    }

    // Keyword-based priority
    const highPriorityKeywords = ['緊急', 'urgent', 'バグ', 'エラー', 'critical'];
    const hasHighPriorityKeyword = highPriorityKeywords.some((keyword) =>
      task.task.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasHighPriorityKeyword) {
      priority = Math.max(priority, 4);
    }

    return Math.min(priority, 5);
  };

  const processTodoChanges = () => {
    // Process any pending automation based on current todos
    // This could include detecting patterns, suggesting optimizations, etc.
  };

  const performAutomationChecks = () => {
    // Periodic automation checks
    if (config.autoGenerationRules.dailyTasks) {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        triggerAutomatedTaskGeneration();
      }
    }
  };

  const updateAutomationRules = (newConfig: TaskAutomationConfig) => {
    // Update automation service rules based on new configuration
    // This would involve updating the automation rules in the service
  };

  const emitTaskEvent = (event: AutomatedTaskEvent) => {
    eventCallbacks.current.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Task event callback error:', error);
      }
    });
  };

  const updateStats = (updater: (prev: TaskAutomationStats) => TaskAutomationStats) => {
    setStats((prev) => {
      const updated = updater(prev);
      saveStatsToStorage(updated);
      return updated;
    });
  };

  const saveConfigToStorage = (config: TaskAutomationConfig) => {
    try {
      localStorage.setItem('automated_task_config', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save task automation config:', error);
    }
  };

  const loadConfigFromStorage = () => {
    try {
      const saved = localStorage.getItem('automated_task_config');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load task automation config:', error);
    }
  };

  const saveStatsToStorage = (stats: TaskAutomationStats) => {
    try {
      localStorage.setItem('automated_task_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save task automation stats:', error);
    }
  };

  const loadStatsFromStorage = () => {
    try {
      const saved = localStorage.getItem('automated_task_stats');
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load task automation stats:', error);
    }
  };

  const cleanup = () => {
    if (automationInterval.current) {
      clearInterval(automationInterval.current);
    }
  };

  return {
    config,
    stats,
    isAutomationActive,
    updateConfig,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    startAutomation,
    stopAutomation,
    triggerAutomatedTaskGeneration,
    onTaskEvent,
    offTaskEvent,
  };
};
