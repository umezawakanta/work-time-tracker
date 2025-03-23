// src/server/models/TodoHistory.ts
import mongoose from 'mongoose';

interface ITodoHistoryTask {
  task: string;
  completedDate: Date | null;
}

export interface ITodoHistory {
  date: string;
  completedCount: number;
  taskDetails: ITodoHistoryTask[];
}

const todoHistorySchema = new mongoose.Schema<ITodoHistory>({
  date: {
    type: String,
    required: true,
    index: true
  },
  completedCount: {
    type: Number,
    required: true,
    default: 0
  },
  taskDetails: [{
    task: String,
    completedDate: Date
  }]
}, { timestamps: true });

export const TodoHistory = mongoose.model<ITodoHistory>('TodoHistory', todoHistorySchema);