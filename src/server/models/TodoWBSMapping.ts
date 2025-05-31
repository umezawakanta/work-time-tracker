import mongoose, { Document, Schema } from 'mongoose';

export interface ITodoWBSMapping extends Document {
  todoId: string;
  wbsNodeId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

const todoWBSMappingSchema = new Schema(
  {
    todoId: { type: String, required: true, unique: true },
    wbsNodeId: { type: String, required: true },
    projectId: { type: String, required: true },
  },
  { timestamps: true }
);

// インデックスの作成
todoWBSMappingSchema.index({ todoId: 1 });
todoWBSMappingSchema.index({ wbsNodeId: 1 });

export const TodoWBSMapping = mongoose.model<ITodoWBSMapping>(
  'TodoWBSMapping',
  todoWBSMappingSchema
);
