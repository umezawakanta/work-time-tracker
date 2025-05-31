// src/services/data/TodoService.ts
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
  deleteField,
  FieldValue,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Todo,
  NewTodo,
  TodoUpdate,
  TodoFilter,
  TodoStats,
  TodoHistoryEntry,
  TaskType,
  PriorityLevel,
} from '@/types/todo';
import TodoWBSIntegrationService from '../integration/TodoWBSIntegrationService';

type FirestoreUpdateData = {
  [key: string]: FieldValue | Partial<unknown> | undefined;
};

export class TodoService {
  private collectionName = 'todos';

  async createTodo(userId: string, todoData: NewTodo): Promise<Todo> {
    const todoCollection = collection(db, this.collectionName);

    const newTodo = {
      ...todoData,
      userId,
      completed: false,
      isPrioritized: todoData.isPrioritized || false,
      priority: todoData.priority || 3,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedDate: null,
    };

    const docRef = await addDoc(todoCollection, newTodo);

    const createdTodo: Todo = {
      _id: docRef.id,
      task: todoData.task,
      type: todoData.type,
      completed: false,
      priority: todoData.priority || 3,
      priorityLevel: this.mapPriorityToLevel(todoData.priority || 3),
      isPrioritized: todoData.isPrioritized || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedDate: null,
      deadline: todoData.deadline,
      note: todoData.note,
      tags: todoData.tags,
      recurrence: todoData.recurrence,
      reminders: todoData.reminders,
      attachments: todoData.attachments,
    };

    // WBS連携の実行
    await TodoWBSIntegrationService.handleTodoCreation(createdTodo, userId);

    return createdTodo;
  }

  async getTodos(userId: string, filter?: TodoFilter, limit?: number): Promise<Todo[]> {
    let q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (filter?.completed !== undefined) {
      q = query(q, where('completed', '==', filter.completed));
    }

    if (filter?.type) {
      q = query(q, where('type', '==', filter.type));
    }

    if (filter?.isPrioritized !== undefined) {
      q = query(q, where('isPrioritized', '==', filter.isPrioritized));
    }

    if (filter?.tags && filter.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filter.tags));
    }

    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => this.mapDocumentToTodo(doc));
  }

  subscribeTodos(
    userId: string,
    callback: (todos: Todo[]) => void,
    filter?: TodoFilter
  ): Unsubscribe {
    let q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (filter?.completed !== undefined) {
      q = query(q, where('completed', '==', filter.completed));
    }

    if (filter?.type) {
      q = query(q, where('type', '==', filter.type));
    }

    if (filter?.isPrioritized !== undefined) {
      q = query(q, where('isPrioritized', '==', filter.isPrioritized));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const todos = snapshot.docs.map((doc) => this.mapDocumentToTodo(doc));
        callback(todos);
      },
      (error) => {
        console.error('Error subscribing to todos:', error);
      }
    );
  }

  async updateTodo(update: TodoUpdate): Promise<void> {
    const todoRef = doc(db, this.collectionName, update._id);

    const updateData: FirestoreUpdateData = {
      updatedAt: serverTimestamp(),
    };

    Object.entries(update.updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value as FieldValue | Partial<unknown>;
      }
    });

    if (update.updates.completed === true) {
      updateData.completedDate = serverTimestamp();
    } else if (update.updates.completed === false) {
      updateData.completedDate = deleteField();
    }

    await updateDoc(todoRef, updateData);

    const updatedTodo = await this.getTodoById(update._id);
    if (updatedTodo) {
      // WBSへの同期
      await TodoWBSIntegrationService.syncTodoToWBS(updatedTodo);
    }
  }

  async deleteTodo(todoId: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, todoId));
  }

  async getTodoStats(userId: string): Promise<TodoStats> {
    const todos = await this.getTodos(userId);
    const completed = todos.filter((t) => t.completed);

    const inputTasks = todos.filter((t) => t.type === 'input');
    const outputTasks = todos.filter((t) => t.type === 'output');

    const tasksWithDeadline = todos.filter((t) => t.deadline);
    const completedBeforeDeadline = completed.filter((t) => {
      if (!t.deadline || !t.completedDate) return false;
      return new Date(t.completedDate) <= new Date(t.deadline);
    });

    const streakDays = await this.calculateStreakDays(userId);
    const longestStreak = await this.calculateLongestStreak(userId);

    const completionTimes = completed
      .filter((t) => t.efficiency?.completionTime)
      .map((t) => t.efficiency!.completionTime!);

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    return {
      totalTasks: todos.length,
      completedTasks: completed.length,
      completionRate: todos.length > 0 ? (completed.length / todos.length) * 100 : 0,
      averageCompletionTime,
      inputTasks: inputTasks.length,
      outputTasks: outputTasks.length,
      inputOutputRatio:
        outputTasks.length > 0 ? inputTasks.length / outputTasks.length : inputTasks.length,
      tasksCompletedBeforeDeadline: completedBeforeDeadline.length,
      tasksCompletedAfterDeadline:
        completed.filter((t) => t.deadline).length - completedBeforeDeadline.length,
      deadlineMeetRate:
        tasksWithDeadline.length > 0
          ? (completedBeforeDeadline.length / tasksWithDeadline.length) * 100
          : 100,
      streakDays,
      longestStreak,
    };
  }

  async getTodoHistory(userId: string, days: number = 30): Promise<TodoHistoryEntry[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const todos = await this.getTodos(userId);
    const history: TodoHistoryEntry[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayTodos = todos.filter((t) => {
        if (!t.completedDate) return false;
        const completedDateStr = new Date(t.completedDate).toISOString().split('T')[0];
        return completedDateStr === dateStr;
      });

      history.push({
        date: dateStr,
        count: dayTodos.length,
        inputCount: dayTodos.filter((t) => t.type === 'input').length,
        outputCount: dayTodos.filter((t) => t.type === 'output').length,
        averageTime: this.calculateAverageTime(dayTodos),
        totalTime: this.calculateTotalTime(dayTodos),
      });
    }

    return history;
  }

  private mapDocumentToTodo(doc: QueryDocumentSnapshot<DocumentData>): Todo {
    const data = doc.data();
    return {
      _id: doc.id,
      task: data.task,
      type: data.type as TaskType,
      completed: data.completed || false,
      priority: data.priority || 3,
      priorityLevel: this.mapPriorityToLevel(data.priority || 3),
      isPrioritized: data.isPrioritized || false,
      createdAt: this.formatTimestamp(data.createdAt),
      updatedAt: this.formatTimestamp(data.updatedAt),
      completedDate: data.completedDate ? this.formatTimestamp(data.completedDate) : null,
      deadline: data.deadline,
      note: data.note,
      tags: data.tags || [],
      efficiency: data.efficiency,
      recurrence: data.recurrence,
      reminders: data.reminders || [],
      attachments: data.attachments || [],
      visibility: data.visibility || 'private',
      sharedWith: data.sharedWith || [],
    };
  }

  private formatTimestamp(timestamp: Timestamp | string | undefined): string {
    if (!timestamp) return new Date().toISOString();

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }

    return timestamp;
  }

  private mapPriorityToLevel(priority: number): PriorityLevel {
    if (priority >= 5) return 'high';
    if (priority >= 3) return 'medium';
    if (priority >= 1) return 'low';
    return 'none';
  }

  private async calculateStreakDays(userId: string): Promise<number> {
    const history = await this.getTodoHistory(userId, 365);
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].date === today || streak > 0) {
        if (history[i].count > 0) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  private async calculateLongestStreak(userId: string): Promise<number> {
    const history = await this.getTodoHistory(userId, 365);
    let currentStreak = 0;
    let longestStreak = 0;

    for (const entry of history) {
      if (entry.count > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  private calculateAverageTime(todos: Todo[]): number {
    const times = todos
      .filter((t) => t.efficiency?.completionTime)
      .map((t) => t.efficiency!.completionTime!);

    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  private calculateTotalTime(todos: Todo[]): number {
    return todos
      .filter((t) => t.efficiency?.completionTime)
      .reduce((sum, t) => sum + t.efficiency!.completionTime!, 0);
  }
}

export default new TodoService();
