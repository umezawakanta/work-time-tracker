import mongoose, { Document, Schema } from 'mongoose';

export interface IWBSNode extends Document {
  projectId: string;
  parentId: string | null;
  name: string;
  description: string;
  level: number;
  orderIndex: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  assignees: string[];
  dependencies: string[];
  estimatedHours: number;
  actualHours: number;
  budget: number;
  actualCost: number;
  deliverables: string[];
  risks: {
    id: string;
    description: string;
    probability?: string;
    impact?: string;
    mitigation?: string;
    owner?: string;
  }[];
  createdBy: string;
  color?: string;
  icon?: string;
}

const wbsNodeSchema = new Schema(
  {
    projectId: { type: String, required: true },
    parentId: { type: String, default: null },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    level: { type: Number, required: true },
    orderIndex: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'delayed', 'cancelled'],
      default: 'not-started',
    },
    assignees: [{ type: String }],
    dependencies: [{ type: String }],
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    deliverables: [{ type: String }],
    risks: [
      {
        id: String,
        description: String,
        probability: String,
        impact: String,
        mitigation: String,
        owner: String,
      },
    ],
    createdBy: { type: String, required: true },
    color: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

// インデックスの作成
wbsNodeSchema.index({ projectId: 1, level: 1 });
wbsNodeSchema.index({ parentId: 1 });

export const WBSNode = mongoose.model<IWBSNode>('WBSNode', wbsNodeSchema);
