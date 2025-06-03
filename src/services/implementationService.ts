export interface ImplementationLog {
  id?: string;
  action: string;
  details?: string;
  projectId: string;
  userId: string;
  user: string;
  timestamp?: string;
}

class ImplementationService {
  private logs: ImplementationLog[] = []; // ローカルストレージ

  async addLog(logData: ImplementationLog): Promise<void> {
    try {
      // タイムスタンプを追加
      const logWithTimestamp = {
        ...logData,
        id: logData.id || `log-${Date.now()}`,
        timestamp: logData.timestamp || new Date().toISOString(),
      };

      // ローカルストレージに保存
      this.logs.unshift(logWithTimestamp);

      // コンソールにログ出力（デバッグ用）
      console.log('Implementation log added:', logWithTimestamp);

      // 実際の実装では、ここでFirebaseやAPIに送信
      // await this.saveToDatabase(logWithTimestamp);
    } catch (error) {
      console.error('Failed to add log:', error);
      throw error;
    }
  }

  async getLogs(projectId: string): Promise<ImplementationLog[]> {
    // プロジェクトIDでフィルタリング
    return this.logs.filter((log) => log.projectId === projectId);
  }
}

export const implementationService = new ImplementationService();
export default implementationService;
