import { WBSNode } from '@/types/wbs';
import { TodoItem } from '@/types';
import { Task } from '@/types/implementation';
// import { IWorkTimeEntry } from '@/server/models/WorkTimeEntry'; // モジュールが見つからないためコメントアウト
import TodoService from '../data/TodoService';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// 統合タスク型の定義
export interface UnifiedTask {
  id: string;
  title: string;
  completed: boolean;
  completedDate: string | null;
  estimatedHours?: number;
  actualHours?: number;
  priority: number;
  tags: string[];
  createdAt?: string;
  startDate?: string;
  projectId?: string;
  notes?: string;
  category?: string;
  note?: string;
}

export interface ActualDataSummary {
  nodeId: string;
  actualHours: number;
  plannedHours: number;
  actualStartDate: string | null;
  actualEndDate: string | null;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  efficiency: number; // actualHours / plannedHours * 100
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  workTimeEntries: WorkTimeEntrySummary[];
  relatedTasks: TaskSummary[];
}

export interface WorkTimeEntrySummary {
  date: string;
  duration: number;
  description: string;
  projectName: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  completed: boolean;
  completedDate: string | null;
  estimatedHours?: number;
  actualHours?: number;
  priority: number;
  tags: string[];
}

export interface WBSActualReport {
  projectId: string;
  reportDate: string;
  totalPlannedHours: number;
  totalActualHours: number;
  overallProgress: number;
  onTimeDelivery: number;
  budgetEfficiency: number;
  nodeReports: ActualDataSummary[];
  topPerformingNodes: string[];
  delayedNodes: string[];
  recommendations: string[];
}

// ローカルWorkTimeEntryインターフェース定義
export interface IWorkTimeEntry {
  id: string;
  userId: string;
  date: Date;
  duration: number;
  description?: string;
  projectName: string;
  category?: string;
  tags?: string[];
}

class WBSActualDataService {
  private readonly WORK_TIME_COLLECTION = 'workTimeEntries';
  private readonly TASKS_COLLECTION = 'implementationTasks';

  /**
   * WBSノードに実際のデータを反映
   */
  async updateWBSWithActualData(nodes: WBSNode[], userId: string): Promise<WBSNode[]> {
    const [todos, workTimeEntries, implementationTasks] = await Promise.all([
      this.getTodoData(userId),
      this.getWorkTimeEntries(userId),
      this.getImplementationTasks(userId),
    ]);

    const updatedNodes = await Promise.all(
      nodes.map(async (node) => {
        const actualData = await this.calculateActualDataForNode(
          node,
          todos,
          workTimeEntries,
          implementationTasks
        );

        return {
          ...node,
          actualHours: actualData.actualHours || 0,
          progress: actualData.progress || 0,
          status: actualData.status || 'not-started',
        };
      })
    );

    return updatedNodes;
  }

  /**
   * 特定のWBSノードの詳細な実績データを取得
   */
  async getActualDataSummary(nodeId: string, userId: string): Promise<ActualDataSummary> {
    const [todos, workTimeEntries, implementationTasks] = await Promise.all([
      this.getTodoData(userId),
      this.getWorkTimeEntries(userId),
      this.getImplementationTasks(userId),
    ]);

    const relatedTasks = this.findRelatedTasks(nodeId, todos, implementationTasks);
    const relatedWorkEntries = this.findRelatedWorkEntries(nodeId, workTimeEntries);

    const actualHours = this.calculateTotalActualHours(relatedTasks, relatedWorkEntries);
    const progress = this.calculateProgress(relatedTasks);
    const plannedHours = relatedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

    const completedTasks = relatedTasks.filter((task) => task.completed).length;
    const efficiency = plannedHours > 0 ? (actualHours / plannedHours) * 100 : 100;

    const dates = this.calculateActualDates(relatedTasks, relatedWorkEntries);
    const status = this.determineStatus(progress, dates, new Date());

    return {
      nodeId,
      actualHours,
      plannedHours,
      actualStartDate: dates.startDate,
      actualEndDate: dates.endDate,
      progress,
      completedTasks,
      totalTasks: relatedTasks.length,
      efficiency,
      status,
      workTimeEntries: relatedWorkEntries.map((entry) => ({
        date: entry.date.toISOString().split('T')[0],
        duration: entry.duration,
        description: entry.description || '',
        projectName: entry.projectName,
      })),
      relatedTasks: relatedTasks.map((task) => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        completedDate: task.completedDate,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        priority: task.priority,
        tags: task.tags || [],
      })),
    };
  }

  /**
   * プロジェクト全体の実績レポートを生成
   */
  async generateWBSActualReport(
    projectId: string,
    nodes: WBSNode[],
    userId: string
  ): Promise<WBSActualReport> {
    const nodeReports = await Promise.all(
      nodes.map((node) => this.getActualDataSummary(node.id, userId))
    );

    const totalPlannedHours = nodeReports.reduce((sum, report) => sum + report.plannedHours, 0);
    const totalActualHours = nodeReports.reduce((sum, report) => sum + report.actualHours, 0);
    const overallProgress =
      nodeReports.length > 0
        ? nodeReports.reduce((sum, report) => sum + report.progress, 0) / nodeReports.length
        : 0;

    const completedOnTime = nodeReports.filter(
      (report) => report.status === 'completed' && report.efficiency <= 110
    ).length;
    const onTimeDelivery =
      nodeReports.length > 0 ? (completedOnTime / nodeReports.length) * 100 : 100;

    const budgetEfficiency =
      totalPlannedHours > 0 ? (totalPlannedHours / totalActualHours) * 100 : 100;

    const topPerformingNodes = nodeReports
      .filter((report) => report.efficiency <= 90 && report.progress >= 80)
      .sort((a, b) => a.efficiency - b.efficiency)
      .slice(0, 5)
      .map((report) => report.nodeId);

    const delayedNodes = nodeReports
      .filter((report) => report.status === 'delayed' || report.efficiency > 120)
      .map((report) => report.nodeId);

    const recommendations = this.generateRecommendations(nodeReports);

    return {
      projectId,
      reportDate: new Date().toISOString(),
      totalPlannedHours,
      totalActualHours,
      overallProgress,
      onTimeDelivery,
      budgetEfficiency,
      nodeReports,
      topPerformingNodes,
      delayedNodes,
      recommendations,
    };
  }

  /**
   * リアルタイムでWBSデータを更新
   */
  async syncWBSWithRealTimeData(
    nodeId: string,
    userId: string,
    callback: (actualData: ActualDataSummary) => void
  ): Promise<() => void> {
    // リアルタイム更新のためのインターバル
    const updateInterval = setInterval(async () => {
      try {
        const actualData = await this.getActualDataSummary(nodeId, userId);
        callback(actualData);
      } catch (error) {
        console.error('Failed to sync WBS data:', error);
      }
    }, 30000); // 30秒ごとに更新

    // 即座に初回データを取得
    try {
      const actualData = await this.getActualDataSummary(nodeId, userId);
      callback(actualData);
    } catch (error) {
      console.error('Failed to get initial WBS data:', error);
    }

    // クリーンアップ関数を返す
    return () => clearInterval(updateInterval);
  }

  // Private methods

  private async getTodoData(userId: string): Promise<TodoItem[]> {
    try {
      return (await TodoService.getTodos(userId)) as unknown as TodoItem[];
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      return [];
    }
  }

  private async getWorkTimeEntries(userId: string): Promise<IWorkTimeEntry[]> {
    try {
      const q = query(
        collection(db, this.WORK_TIME_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IWorkTimeEntry[];
    } catch (error) {
      console.error('Failed to fetch work time entries:', error);
      return [];
    }
  }

  private async getImplementationTasks(userId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, this.TASKS_COLLECTION),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Task[];
    } catch (error) {
      console.error('Failed to fetch implementation tasks:', error);
      return [];
    }
  }

  private async calculateActualDataForNode(
    node: WBSNode,
    todos: TodoItem[],
    workTimeEntries: IWorkTimeEntry[],
    implementationTasks: Task[]
  ): Promise<Partial<ActualDataSummary>> {
    const relatedTasks = this.findRelatedTasks(node.id, todos, implementationTasks);
    const relatedWorkEntries = this.findRelatedWorkEntries(node.id, workTimeEntries);

    const actualHours = this.calculateTotalActualHours(relatedTasks, relatedWorkEntries);
    const progress = this.calculateProgress(relatedTasks);
    const dates = this.calculateActualDates(relatedTasks, relatedWorkEntries);
    const status = this.determineStatus(progress, dates, new Date());

    return {
      actualHours,
      progress,
      actualStartDate: dates.startDate,
      actualEndDate: dates.endDate,
      status,
    };
  }

  private findRelatedTasks(
    nodeId: string,
    todos: TodoItem[],
    implementationTasks: Task[]
  ): UnifiedTask[] {
    const relatedTodos = todos.filter(
      (todo) =>
        todo.tags?.includes(nodeId) || todo.category === nodeId || todo.note?.includes(nodeId)
    );

    const relatedImpl = implementationTasks.filter(
      (task) =>
        task.tags?.includes(nodeId) || task.projectId === nodeId || task.notes?.includes(nodeId)
    );

    // TodoItemをUnifiedTaskに変換
    const convertedTodos: UnifiedTask[] = relatedTodos.map((todo) => ({
      id: todo._id,
      title: todo.task,
      completed: todo.completed,
      completedDate: todo.completedDate,
      estimatedHours: todo.estimatedDuration,
      actualHours: 0, // TodoItemには実績工数がない
      priority: todo.priority,
      tags: todo.tags || [],
      createdAt: todo.createdAt,
      category: todo.category,
      note: todo.note,
    }));

    // TaskをUnifiedTaskに変換
    const convertedTasks: UnifiedTask[] = relatedImpl.map((task) => ({
      id: task.id,
      title: task.title,
      completed: task.status === 'completed',
      completedDate: task.completedDate || null,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      priority: task.priority === 'high' ? 5 : task.priority === 'medium' ? 3 : 1,
      tags: task.tags || [],
      createdAt: task.createdAt,
      startDate: task.startDate,
      projectId: task.projectId,
      notes: task.notes,
    }));

    return [...convertedTodos, ...convertedTasks];
  }

  private findRelatedWorkEntries(
    nodeId: string,
    workTimeEntries: IWorkTimeEntry[]
  ): IWorkTimeEntry[] {
    return workTimeEntries.filter(
      (entry) => entry.projectName.includes(nodeId) || entry.description?.includes(nodeId)
    );
  }

  private calculateTotalActualHours(tasks: UnifiedTask[], workEntries: IWorkTimeEntry[]): number {
    const taskHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    const workHours = workEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    return Math.max(taskHours, workHours);
  }

  private calculateProgress(tasks: UnifiedTask[]): number {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter((task) => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  private calculateActualDates(
    tasks: UnifiedTask[],
    workEntries: IWorkTimeEntry[]
  ): { startDate: string | null; endDate: string | null } {
    const allDates: Date[] = [];

    tasks.forEach((task) => {
      if (task.createdAt) allDates.push(new Date(task.createdAt));
      if (task.completedDate) allDates.push(new Date(task.completedDate));
      if (task.startDate) allDates.push(new Date(task.startDate));
    });

    workEntries.forEach((entry) => {
      if (entry.date) allDates.push(new Date(entry.date));
    });

    if (allDates.length === 0) {
      return { startDate: null, endDate: null };
    }

    allDates.sort((a, b) => a.getTime() - b.getTime());

    return {
      startDate: allDates[0].toISOString().split('T')[0],
      endDate: allDates[allDates.length - 1].toISOString().split('T')[0],
    };
  }

  private determineStatus(
    progress: number,
    dates: { startDate: string | null; endDate: string | null },
    currentDate: Date
  ): 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'cancelled' {
    if (progress === 100) return 'completed';
    if (progress === 0) return 'not-started';

    if (dates.endDate) {
      const endDate = new Date(dates.endDate);
      if (currentDate > endDate && progress < 100) {
        return 'delayed';
      }
    }

    return 'in-progress';
  }

  private generateRecommendations(reports: ActualDataSummary[]): string[] {
    const recommendations: string[] = [];

    const inefficientNodes = reports.filter((r) => r.efficiency > 120);
    if (inefficientNodes.length > 0) {
      recommendations.push(
        `${inefficientNodes.length}個のノードで予算超過が発生しています。作業プロセスの見直しを検討してください。`
      );
    }

    const delayedNodes = reports.filter((r) => r.status === 'delayed');
    if (delayedNodes.length > 0) {
      recommendations.push(
        `${delayedNodes.length}個のノードで遅延が発生しています。リソースの再配分を検討してください。`
      );
    }

    const lowProgressNodes = reports.filter((r) => r.progress < 30 && r.actualHours > 0);
    if (lowProgressNodes.length > 0) {
      recommendations.push(
        `作業は開始されているが進捗が低いノードがあります。障害要因の特定が必要です。`
      );
    }

    const highPerformanceNodes = reports.filter((r) => r.efficiency < 80 && r.progress > 80);
    if (highPerformanceNodes.length > 0) {
      recommendations.push(
        `効率的に進行しているノードのベストプラクティスを他のノードに適用してください。`
      );
    }

    return recommendations;
  }
}

export default new WBSActualDataService();
