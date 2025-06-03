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
  async addLog(logData: ImplementationLog): Promise<void> {
    // Mock implementation - just log to console
    console.log('Implementation log:', logData);
    // In real implementation, this would save to Firebase/database
  }
}

export const implementationService = new ImplementationService();
export default implementationService;
