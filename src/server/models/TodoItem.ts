import mongoose, { Document, Schema } from 'mongoose';

export interface ITodoItem extends Document {
  task: string;
  completed: boolean;
  completedDate: Date | null;
  priority: number;
  isPrioritized: boolean;
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
}, { timestamps: true });

export const TodoItem = mongoose.model<ITodoItem>('TodoItem', todoItemSchema);