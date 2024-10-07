import mongoose from "mongoose";

export interface ITodoItem extends mongoose.Document {
  task: string;
  completed: boolean;
  createdAt: Date;
}

const TodoItemSchema = new mongoose.Schema<ITodoItem>({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const TodoItem = mongoose.model<ITodoItem>("TodoItem", TodoItemSchema);
