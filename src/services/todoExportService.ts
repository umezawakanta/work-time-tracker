import { Todo } from '@/types/todo';
import { api } from '@/lib/api';

/**
 * タスクのエクスポート処理に関するサービス
 */

// サポートされているエクスポート形式
export type ExportFormat = 'csv' | 'json' | 'ical' | 'xlsx';

// エクスポートオプション
export interface ExportOptions {
  includeCompleted: boolean;       // 完了済みタスクを含める
  includeHistory: boolean;         // 履歴データを含める
  dateRange?: [Date, Date] | null; // 日付範囲
  fields?: string[];               // エクスポートするフィールド
}

// デフォルトのエクスポートオプション
const defaultExportOptions: ExportOptions = {
  includeCompleted: true,
  includeHistory: false,
  dateRange: null,
  fields: undefined
};

/**
 * タスクをエクスポートする
 * @param format エクスポート形式
 * @param options エクスポートオプション
 * @returns ダウンロード用のBlobデータ
 */
export const exportTasks = async (
  format: ExportFormat = 'csv',
  options: Partial<ExportOptions> = {}
): Promise<Blob> => {
  try {
    // オプションをマージ
    const mergedOptions = { ...defaultExportOptions, ...options };
    
    // APIリクエスト
    const response = await api.get('/api/todos/export', {
      params: {
        format,
        ...mergedOptions,
        dateRange: mergedOptions.dateRange 
          ? mergedOptions.dateRange.map(d => d.toISOString()) 
          : undefined,
      },
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('エクスポート中にエラーが発生しました', error);
    throw new Error('タスクのエクスポートに失敗しました');
  }
};

/**
 * Blobデータをダウンロードする
 * @param blob Blobデータ
 * @param filename ファイル名
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // リソースの解放
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * タスクをエクスポートしてダウンロードする
 * @param format エクスポート形式
 * @param options エクスポートオプション
 * @returns 成功したかどうか
 */
export const exportAndDownload = async (
  format: ExportFormat = 'csv',
  options: Partial<ExportOptions> = {}
): Promise<boolean> => {
  try {
    // 現在の日付を取得
    const date = new Date().toISOString().split('T')[0];
    
    // ファイル名の生成
    const filename = `tasks_${date}.${format}`;
    
    // エクスポート処理
    const blob = await exportTasks(format, options);
    
    // ダウンロード処理
    downloadBlob(blob, filename);
    
    return true;
  } catch (error) {
    console.error('エクスポート処理中にエラーが発生しました', error);
    return false;
  }
};

/**
 * CSVデータをタスクに変換する
 * @param csv CSVデータ
 * @returns タスクの配列
 */
export const parseCsvToTasks = (csv: string): Partial<Todo>[] => {
  // ヘッダーと行に分割
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  // タスクに変換
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const task: Record<string, any> = {};
    
    // 各フィールドをマッピング
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      
      // 型変換
      switch (header) {
        case 'completed':
          task[header] = value === 'true';
          break;
        case 'priority':
          task[header] = parseInt(value) || 3;
          break;
        case 'isPrioritized':
          task[header] = value === 'true';
          break;
        case 'deadline':
        case 'completedDate':
        case 'createdAt':
        case 'updatedAt':
          task[header] = value || null;
          break;
        default:
          task[header] = value;
      }
    });
    
    return task as Partial<Todo>;
  });
};

/**
 * JSONデータをタスクに変換する
 * @param json JSONデータ
 * @returns タスクの配列
 */
export const parseJsonToTasks = (json: string): Partial<Todo>[] => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('JSONのパースに失敗しました', error);
    throw new Error('JSONの形式が正しくありません');
  }
};

/**
 * ファイルからタスクをインポートする
 * @param file ファイル
 * @param format ファイル形式
 * @returns タスクの配列
 */
export const importTasksFromFile = async (
  file: File,
  format: string = 'auto'
): Promise<Partial<Todo>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        // 自動フォーマット検出
        if (format === 'auto') {
          const extension = file.name.split('.').pop()?.toLowerCase();
          format = extension === 'json' ? 'json' : 'csv';
        }
        
        // 形式に応じたパース
        const tasks = format === 'json'
          ? parseJsonToTasks(content)
          : parseCsvToTasks(content);
        
        resolve(tasks);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * タスクをAPIに送信してインポートする
 * @param tasks タスクの配列
 * @returns 成功したかどうか
 */
export const sendTasksToApi = async (tasks: Partial<Todo>[]): Promise<boolean> => {
  try {
    // APIリクエスト
    await api.post('/api/todos/import', { tasks });
    return true;
  } catch (error) {
    console.error('タスクのインポート中にエラーが発生しました', error);
    return false;
  }
};

/**
 * ファイルからタスクをインポートしてAPIに送信する
 * @param file ファイル
 * @param format ファイル形式
 * @returns 成功したかどうか
 */
export const importTasksAndSend = async (
  file: File,
  format: string = 'auto'
): Promise<boolean> => {
  try {
    // ファイルからタスクを読み込み
    const tasks = await importTasksFromFile(file, format);
    
    // タスク数のチェック
    if (tasks.length === 0) {
      throw new Error('インポートするタスクがありません');
    }
    
    // APIに送信
    return await sendTasksToApi(tasks);
  } catch (error) {
    console.error('インポート処理中にエラーが発生しました', error);
    return false;
  }
};