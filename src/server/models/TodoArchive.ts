// src/server/models/TodoArchive.ts
import mongoose from 'mongoose';

export interface ITodoArchive {
  originalId: mongoose.Types.ObjectId;
  task: string;
  completed: boolean;
  completedDate: Date | null;
  priority: number;
  isPrioritized: boolean;
  archivedAt: Date;
}

const todoArchiveSchema = new mongoose.Schema<ITodoArchive>(
  {
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    task: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: Number,
      default: 0,
    },
    isPrioritized: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const TodoArchive = mongoose.model<ITodoArchive>('TodoArchive', todoArchiveSchema);
