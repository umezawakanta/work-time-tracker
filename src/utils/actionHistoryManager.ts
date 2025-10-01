import type { ActionRecord, ActionPattern } from '../types';

class ActionHistoryManager {
  private static instance: ActionHistoryManager;
  private actionRecords: ActionRecord[] = [];
  private actionPatterns: ActionPattern[] = [];

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): ActionHistoryManager {
    if (!ActionHistoryManager.instance) {
      ActionHistoryManager.instance = new ActionHistoryManager();
    }
    return ActionHistoryManager.instance;
  }

  private loadFromLocalStorage(): void {
    try {
      const storedRecords = localStorage.getItem('action-records');
      if (storedRecords) {
        this.actionRecords = JSON.parse(storedRecords);
      }
      const storedPatterns = localStorage.getItem('action-patterns');
      if (storedPatterns) {
        this.actionPatterns = JSON.parse(storedPatterns);
      }
    } catch (error) {
      console.error('Failed to load action history from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('action-records', JSON.stringify(this.actionRecords));
      localStorage.setItem('action-patterns', JSON.stringify(this.actionPatterns));
    } catch (error) {
      console.error('Failed to save action history to localStorage:', error);
    }
  }

  public addActionRecord(record: Omit<ActionRecord, '_id' | 'createdAt' | 'updatedAt'>): ActionRecord {
    const newRecord: ActionRecord = {
      ...record,
      _id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.actionRecords.push(newRecord);
    this.saveToLocalStorage();
    return newRecord;
  }

  public getActionRecords(): ActionRecord[] {
    return [...this.actionRecords];
  }

  public getActionRecordsByPeriod(startDate: Date, endDate: Date): ActionRecord[] {
    return this.actionRecords.filter(record => {
      const recordDate = new Date(record.startTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  public getActionRecordsByCategory(category: string): ActionRecord[] {
    return this.actionRecords.filter(record => record.category === category);
  }

  public clearData(): void {
    this.actionRecords = [];
    this.actionPatterns = [];
    this.saveToLocalStorage();
  }
}

export const actionHistoryManager = ActionHistoryManager.getInstance();