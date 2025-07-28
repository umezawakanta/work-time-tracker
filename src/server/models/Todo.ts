import mongoose, { Schema, Document } from 'mongoose';
import { Todo } from '@/database/schema/UnifiedDatabaseSchema';

// Simplified TodoDocument interface
export interface TodoDocument extends Document {
  title: string;
  description?: string;
  category: 'personal' | 'work' | 'project' | 'learning' | 'health';
  type: 'task' | 'reminder' | 'goal' | 'habit';
  completed: boolean;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  reminderDate?: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  parentTodoId?: string;
  subtodos: string[];
  tags: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  location?: string;
  context: string[];
  source: 'manual' | 'imported' | 'generated' | 'ai_suggested';
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subdocument schemas
const RecurringPatternSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      required: true,
    },
    interval: { type: Number, required: true },
    daysOfWeek: [{ type: Number }],
    endDate: { type: String },
    maxOccurrences: { type: Number },
  },
  { _id: false }
);

// Main Todo schema
const TodoSchema = new Schema(
  {
    // 基本情報
    title: { type: String, required: true },
    description: { type: String },

    // 分類
    category: {
      type: String,
      enum: ['personal', 'work', 'project', 'learning', 'health'],
      required: true,
    },
    type: {
      type: String,
      enum: ['task', 'reminder', 'goal', 'habit'],
      required: true,
    },

    // 状態
    completed: { type: Boolean, default: false },
    completedAt: { type: String },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },

    // 期間
    dueDate: { type: String },
    reminderDate: { type: String },

    // 関連
    userId: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    taskId: { type: String, index: true },
    parentTodoId: { type: String, index: true },
    subtodos: [{ type: String }],

    // 詳細
    tags: [{ type: String }],
    estimatedMinutes: { type: Number },
    actualMinutes: { type: Number },

    // 繰り返し
    recurring: RecurringPatternSchema,

    // 場所・コンテキスト
    location: { type: String },
    context: [{ type: String }],

    // メタデータ
    source: {
      type: String,
      enum: ['manual', 'imported', 'generated', 'ai_suggested'],
      default: 'manual',
    },
    sourceId: { type: String },

    // Base fields
    version: { type: Number, default: 1 },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'conflict', 'error'],
      default: 'synced',
    },
    lastSyncAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
TodoSchema.index({ userId: 1, completed: 1 });
TodoSchema.index({ userId: 1, category: 1 });
TodoSchema.index({ userId: 1, priority: 1 });
TodoSchema.index({ projectId: 1 });
TodoSchema.index({ dueDate: 1 });
TodoSchema.index({ tags: 1 });
TodoSchema.index({ createdAt: -1 });

// Virtual for todo ID
TodoSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
TodoSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Pre-save middleware to update version and sync status
TodoSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.syncStatus = 'pending';
  }
  next();
});

// Static methods
TodoSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

TodoSchema.statics.findByUserIdAndCompleted = function (userId: string, completed: boolean) {
  return this.find({ userId, completed }).sort({ createdAt: -1 });
};

TodoSchema.statics.findByUserIdAndCategory = function (userId: string, category: string) {
  return this.find({ userId, category }).sort({ createdAt: -1 });
};

TodoSchema.statics.findByUserIdAndTags = function (userId: string, tags: string[]) {
  return this.find({ userId, tags: { $in: tags } }).sort({ createdAt: -1 });
};

TodoSchema.statics.findOverdue = function (userId: string) {
  const now = new Date().toISOString();
  return this.find({
    userId,
    completed: false,
    dueDate: { $lt: now },
  }).sort({ dueDate: 1 });
};

TodoSchema.statics.findDueToday = function (userId: string) {
  const today = new Date().toISOString().split('T')[0];
  return this.find({
    userId,
    completed: false,
    dueDate: { $regex: `^${today}` },
  }).sort({ dueDate: 1 });
};

// Instance methods
TodoSchema.methods.markCompleted = function () {
  this.completed = true;
  this.completedAt = new Date().toISOString();
  return this.save();
};

TodoSchema.methods.markIncomplete = function () {
  this.completed = false;
  this.completedAt = undefined;
  return this.save();
};

TodoSchema.methods.addTag = function (tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

TodoSchema.methods.removeTag = function (tag: string) {
  this.tags = this.tags.filter((t: string) => t !== tag);
  return this.save();
};

export const TodoModel = mongoose.model<TodoDocument>('Todo', TodoSchema);
export default TodoModel;
