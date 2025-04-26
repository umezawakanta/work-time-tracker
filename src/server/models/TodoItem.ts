import mongoose, { Document, Schema } from 'mongoose';

export interface ITodoItem extends Document {
  task: string;
  completed: boolean;
  completedDate: Date | null;
  priority: number;
  isPrioritized: boolean;
  type: 'input' | 'output'; // タイプフィールドを追加
  deadline: Date | null; // 期限フィールドを追加
}

const todoItemSchema = new Schema({
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
  type: {
    type: String,
    enum: ['input', 'output'], // 許容値を制限
    default: 'input', // デフォルト値
  },
  deadline: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

export const TodoItem = mongoose.model<ITodoItem>('TodoItem', todoItemSchema);