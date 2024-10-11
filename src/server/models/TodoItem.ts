import mongoose, { Document, Schema } from 'mongoose';

export interface ITodoItem extends Document {
  task: string;
  completed: boolean;
  completedDate: Date | null;
  order: number;
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
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export const TodoItem = mongoose.model<ITodoItem>('TodoItem', todoItemSchema);