import { TodoItem } from '@/types';

// test-tasks.jsonのタスク型定義
interface ImportTask {
  task: string;
  description: string;
  priority: number;
  type: 'input' | 'output';
  category: string;
  estimatedDuration: number;
}

interface ImportPhase {
  phase: string;
  tasks: ImportTask[];
}

// test-tasks.jsonの構造
type ImportData = ImportPhase[];

/**
 * test-tasks.jsonのデータをTodoItem型に変換する
 */
export const convertImportDataToTodoItems = (importData: ImportData): Omit<TodoItem, '_id'>[] => {
  const todoItems: Omit<TodoItem, '_id'>[] = [];

  importData.forEach((phase) => {
    phase.tasks.forEach((task) => {
      const todoItem: Omit<TodoItem, '_id'> = {
        task: task.task,
        note: task.description,
        priority: Math.min(Math.max(task.priority, 1), 5), // 1-5の範囲に制限
        type: task.type,
        category: task.category,
        completed: false,
        isPrioritized: task.priority <= 2, // 優先度1-2を優先タスクとする
        createdAt: new Date().toISOString(),
        completedDate: null,
        tags: [phase.phase, task.category], // フェーズとカテゴリをタグとして追加
        estimatedDuration: task.estimatedDuration,
      };

      todoItems.push(todoItem);
    });
  });

  return todoItems;
};

/**
 * JSONファイルを読み込んで検証する
 */
export const validateImportData = (data: any): data is ImportData => {
  if (!Array.isArray(data)) {
    throw new Error('データは配列である必要があります');
  }

  for (let i = 0; i < data.length; i++) {
    const phase = data[i];

    if (typeof phase !== 'object' || !phase.phase || !Array.isArray(phase.tasks)) {
      throw new Error(`フェーズ ${i + 1} の形式が正しくありません`);
    }

    for (let j = 0; j < phase.tasks.length; j++) {
      const task = phase.tasks[j];

      if (
        typeof task !== 'object' ||
        typeof task.task !== 'string' ||
        typeof task.description !== 'string' ||
        typeof task.priority !== 'number' ||
        (task.type !== 'input' && task.type !== 'output') ||
        typeof task.category !== 'string' ||
        typeof task.estimatedDuration !== 'number'
      ) {
        throw new Error(`フェーズ "${phase.phase}" のタスク ${j + 1} の形式が正しくありません`);
      }
    }
  }

  return true;
};

/**
 * CSVデータをTodoItem型に変換する（簡易版）
 */
export const convertCSVToTodoItems = (csvText: string): Omit<TodoItem, '_id'>[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  // 必要なヘッダーの確認
  const requiredHeaders = ['task', 'description', 'priority', 'type', 'category'];
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0) {
    throw new Error(`必要なヘッダーが不足しています: ${missingHeaders.join(', ')}`);
  }

  const todoItems: Omit<TodoItem, '_id'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

    if (values.length < headers.length) continue;

    const taskData: any = {};
    headers.forEach((header, index) => {
      taskData[header] = values[index];
    });

    const todoItem: Omit<TodoItem, '_id'> = {
      task: taskData.task,
      note: taskData.description || '',
      priority: Math.min(Math.max(parseInt(taskData.priority) || 3, 1), 5),
      type: taskData.type === 'output' ? 'output' : 'input',
      category: taskData.category || '一般',
      completed: false,
      isPrioritized: (parseInt(taskData.priority) || 3) <= 2,
      createdAt: new Date().toISOString(),
      completedDate: null,
      tags: taskData.category ? [taskData.category] : [],
      estimatedDuration: parseInt(taskData.estimatedDuration) || 30,
    };

    todoItems.push(todoItem);
  }

  return todoItems;
};
