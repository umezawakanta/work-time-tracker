import mongoose, { Document, Schema } from 'mongoose';

export interface IChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface IImplementationTask extends Document {
  title: string;
  description: string;
  phase: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  checklist: IChecklistItem[];
  startDate?: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours: number;
  branch?: string;
  pr?: string;
  projectId: string;
  createdBy: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dependencies: string[];
  notes: string;
  researchResult?: {
    content: string;
    knowledgeEntries: string[];
    executedAt: string;
    executedBy: string;
    confidence: number;
  };
}

const checklistItemSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: String, required: true },
  completedAt: { type: String },
});

const implementationTaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    phase: { type: String, required: true },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'blocked'],
      default: 'not-started',
    },
    assignee: { type: String },
    checklist: [checklistItemSchema],
    startDate: { type: Date },
    completedDate: { type: Date },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    branch: { type: String },
    pr: { type: String },
    projectId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    tags: [{ type: String }],
    dependencies: [{ type: String }],
    notes: { type: String, default: '' },
    researchResult: {
      content: String,
      knowledgeEntries: [String],
      executedAt: String,
      executedBy: String,
      confidence: Number,
    },
  },
  { timestamps: true }
);

// インデックスの作成
implementationTaskSchema.index({ projectId: 1, phase: 1 });
implementationTaskSchema.index({ assignee: 1 });
implementationTaskSchema.index({ status: 1 });

export const ImplementationTask = mongoose.model<IImplementationTask>(
  'ImplementationTask',
  implementationTaskSchema
);
