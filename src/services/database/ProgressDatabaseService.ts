import { connectDB } from '../../server/config/database';
import mongoose from 'mongoose';

interface TaskProgress {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  phase: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  tags: string[];
  milestones: string[];
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
  }>;
  pullRequests: Array<{
    number: number;
    title: string;
    state: 'open' | 'closed' | 'merged';
    author: string;
    createdAt: string;
    mergedAt?: string;
    additions: number;
    deletions: number;
  }>;
  metrics: {
    codeQuality: number;
    testCoverage: number;
    performance: number;
    security: number;
    accessibility: number;
  };
  lastUpdated: string;
  updatedBy: string;
  metadata: {
    source: 'manual' | 'github' | 'ci' | 'auto';
    reason: string;
    confidence: number;
  };
}

interface ProjectProgress {
  id: string;
  name: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overallProgress: number;
  phases: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    startDate?: string;
    endDate?: string;
    tasks: string[];
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    progress: number;
    tasks: string[];
  }>;
  metrics: {
    velocity: number;
    burndownRate: number;
    qualityScore: number;
    teamEfficiency: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  timeline: Array<{
    date: string;
    event: string;
    description: string;
    type: 'milestone' | 'task' | 'phase' | 'release';
    metadata: Record<string, any>;
  }>;
  lastUpdated: string;
}

// MongoDB Schemas
const TaskProgressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'blocked', 'cancelled'],
      default: 'not-started',
      index: true,
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    category: { type: String, required: true, index: true },
    phase: { type: String, required: true, index: true },
    assignee: { type: String, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
    completedDate: { type: Date },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    dependencies: [{ type: String }],
    tags: [{ type: String }],
    milestones: [{ type: String }],
    commits: [
      {
        sha: String,
        message: String,
        author: String,
        date: Date,
        filesChanged: Number,
        linesAdded: Number,
        linesDeleted: Number,
      },
    ],
    pullRequests: [
      {
        number: Number,
        title: String,
        state: { type: String, enum: ['open', 'closed', 'merged'] },
        author: String,
        createdAt: Date,
        mergedAt: Date,
        additions: Number,
        deletions: Number,
      },
    ],
    metrics: {
      codeQuality: { type: Number, min: 0, max: 100, default: 0 },
      testCoverage: { type: Number, min: 0, max: 100, default: 0 },
      performance: { type: Number, min: 0, max: 100, default: 0 },
      security: { type: Number, min: 0, max: 100, default: 0 },
      accessibility: { type: Number, min: 0, max: 100, default: 0 },
    },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    metadata: {
      source: {
        type: String,
        enum: ['manual', 'github', 'ci', 'auto'],
        default: 'manual',
      },
      reason: String,
      confidence: { type: Number, min: 0, max: 100, default: 100 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ProjectProgressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    inProgressTasks: { type: Number, default: 0 },
    blockedTasks: { type: Number, default: 0 },
    overallProgress: { type: Number, min: 0, max: 100, default: 0 },
    phases: [
      {
        id: String,
        name: String,
        progress: { type: Number, min: 0, max: 100, default: 0 },
        status: String,
        startDate: Date,
        endDate: Date,
        tasks: [String],
      },
    ],
    milestones: [
      {
        id: String,
        title: String,
        description: String,
        dueDate: Date,
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed', 'overdue'],
          default: 'pending',
        },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        tasks: [String],
      },
    ],
    metrics: {
      velocity: { type: Number, default: 0 },
      burndownRate: { type: Number, default: 0 },
      qualityScore: { type: Number, min: 0, max: 100, default: 0 },
      teamEfficiency: { type: Number, min: 0, max: 100, default: 0 },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
      },
    },
    timeline: [
      {
        date: Date,
        event: String,
        description: String,
        type: {
          type: String,
          enum: ['milestone', 'task', 'phase', 'release'],
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
TaskProgressSchema.index({ category: 1, status: 1 });
TaskProgressSchema.index({ phase: 1, progress: -1 });
TaskProgressSchema.index({ assignee: 1, status: 1 });
TaskProgressSchema.index({ lastUpdated: -1 });
TaskProgressSchema.index({ tags: 1 });

ProjectProgressSchema.index({ 'phases.id': 1 });
ProjectProgressSchema.index({ 'milestones.id': 1 });
ProjectProgressSchema.index({ lastUpdated: -1 });

const TaskProgressModel =
  mongoose.models.TaskProgress || mongoose.model('TaskProgress', TaskProgressSchema);
const ProjectProgressModel =
  mongoose.models.ProjectProgress || mongoose.model('ProjectProgress', ProjectProgressSchema);

export class ProgressDatabaseService {
  private static instance: ProgressDatabaseService;

  static getInstance(): ProgressDatabaseService {
    if (!ProgressDatabaseService.instance) {
      ProgressDatabaseService.instance = new ProgressDatabaseService();
    }
    return ProgressDatabaseService.instance;
  }

  async ensureConnection(): Promise<void> {
    try {
      await connectDB();
      console.log('✅ Progress database connection established');
    } catch (error) {
      console.error('❌ Progress database connection failed:', error);
      throw error;
    }
  }

  // Task Progress Operations
  async createTask(task: Omit<TaskProgress, 'lastUpdated'>): Promise<TaskProgress> {
    await this.ensureConnection();

    const taskDoc = new TaskProgressModel({
      ...task,
      lastUpdated: new Date(),
    });

    const savedTask = await taskDoc.save();
    await this.updateProjectProgress(task.phase);

    return this.formatTask(savedTask);
  }

  async updateTask(taskId: string, updates: Partial<TaskProgress>): Promise<TaskProgress | null> {
    await this.ensureConnection();

    const updatedTask = await TaskProgressModel.findOneAndUpdate(
      { id: taskId },
      {
        ...updates,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updatedTask) {
      return null;
    }

    await this.updateProjectProgress(updatedTask.phase);

    return this.formatTask(updatedTask);
  }

  async getTask(taskId: string): Promise<TaskProgress | null> {
    await this.ensureConnection();

    const task = await TaskProgressModel.findOne({ id: taskId });
    return task ? this.formatTask(task) : null;
  }

  async getTasks(filters?: {
    phase?: string;
    status?: string;
    assignee?: string;
    category?: string;
    tags?: string[];
  }): Promise<TaskProgress[]> {
    await this.ensureConnection();

    const query: any = {};

    if (filters?.phase) query.phase = filters.phase;
    if (filters?.status) query.status = filters.status;
    if (filters?.assignee) query.assignee = filters.assignee;
    if (filters?.category) query.category = filters.category;
    if (filters?.tags?.length) query.tags = { $in: filters.tags };

    const tasks = await TaskProgressModel.find(query).sort({ lastUpdated: -1 }).lean();

    return tasks.map((task) => this.formatTask(task));
  }

  async deleteTask(taskId: string): Promise<boolean> {
    await this.ensureConnection();

    const result = await TaskProgressModel.deleteOne({ id: taskId });

    if (result.deletedCount > 0) {
      // Update project progress after task deletion
      const allTasks = await this.getTasks();
      const phases = [...new Set(allTasks.map((t) => t.phase))];

      for (const phase of phases) {
        await this.updateProjectProgress(phase);
      }
    }

    return result.deletedCount > 0;
  }

  // Project Progress Operations
  async createProject(project: Omit<ProjectProgress, 'lastUpdated'>): Promise<ProjectProgress> {
    await this.ensureConnection();

    const projectDoc = new ProjectProgressModel({
      ...project,
      lastUpdated: new Date(),
    });

    const savedProject = await projectDoc.save();
    return this.formatProject(savedProject);
  }

  async updateProject(
    projectId: string,
    updates: Partial<ProjectProgress>
  ): Promise<ProjectProgress | null> {
    await this.ensureConnection();

    const updatedProject = await ProjectProgressModel.findOneAndUpdate(
      { id: projectId },
      {
        ...updates,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    return updatedProject ? this.formatProject(updatedProject) : null;
  }

  async getProject(projectId: string): Promise<ProjectProgress | null> {
    await this.ensureConnection();

    const project = await ProjectProgressModel.findOne({ id: projectId });
    return project ? this.formatProject(project) : null;
  }

  async getProjects(): Promise<ProjectProgress[]> {
    await this.ensureConnection();

    const projects = await ProjectProgressModel.find({}).sort({ lastUpdated: -1 }).lean();

    return projects.map((project) => this.formatProject(project));
  }

  async deleteProject(projectId: string): Promise<boolean> {
    await this.ensureConnection();

    const result = await ProjectProgressModel.deleteOne({ id: projectId });
    return result.deletedCount > 0;
  }

  // Analytics and Metrics
  async getMetrics(): Promise<{
    overview: {
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      blockedTasks: number;
      completionRate: number;
    };
    averageMetrics: {
      codeQuality: number;
      testCoverage: number;
      performance: number;
      security: number;
      accessibility: number;
    };
    projectMetrics: Array<{
      id: string;
      name: string;
      progress: number;
      metrics: any;
    }>;
  }> {
    await this.ensureConnection();

    const tasks = await TaskProgressModel.find({}).lean();
    const projects = await ProjectProgressModel.find({}).lean();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;

    const averageMetrics = tasks.reduce(
      (acc, task) => ({
        codeQuality: acc.codeQuality + (task.metrics?.codeQuality || 0),
        testCoverage: acc.testCoverage + (task.metrics?.testCoverage || 0),
        performance: acc.performance + (task.metrics?.performance || 0),
        security: acc.security + (task.metrics?.security || 0),
        accessibility: acc.accessibility + (task.metrics?.accessibility || 0),
      }),
      { codeQuality: 0, testCoverage: 0, performance: 0, security: 0, accessibility: 0 }
    );

    Object.keys(averageMetrics).forEach((key) => {
      averageMetrics[key as keyof typeof averageMetrics] /= totalTasks || 1;
    });

    return {
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      },
      averageMetrics,
      projectMetrics: projects.map((p) => ({
        id: p.id,
        name: p.name,
        progress: p.overallProgress,
        metrics: p.metrics,
      })),
    };
  }

  // Automatic project progress update
  private async updateProjectProgress(phaseId?: string): Promise<void> {
    if (!phaseId) return;

    const projects = await ProjectProgressModel.find({
      'phases.id': phaseId,
    });

    for (const project of projects) {
      const projectTasks = await TaskProgressModel.find({
        phase: phaseId,
      });

      if (projectTasks.length === 0) continue;

      const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
      const inProgressTasks = projectTasks.filter((t) => t.status === 'in-progress').length;
      const blockedTasks = projectTasks.filter((t) => t.status === 'blocked').length;

      project.totalTasks = projectTasks.length;
      project.completedTasks = completedTasks;
      project.inProgressTasks = inProgressTasks;
      project.blockedTasks = blockedTasks;
      project.overallProgress = Math.round((completedTasks / projectTasks.length) * 100);

      // Update phase progress
      const phaseIndex = project.phases.findIndex((p) => p.id === phaseId);
      if (phaseIndex !== -1) {
        const phaseTasks = projectTasks.filter((t) =>
          project.phases[phaseIndex].tasks.includes(t.id)
        );

        if (phaseTasks.length > 0) {
          const phaseCompletedTasks = phaseTasks.filter((t) => t.status === 'completed').length;
          project.phases[phaseIndex].progress = Math.round(
            (phaseCompletedTasks / phaseTasks.length) * 100
          );

          if (project.phases[phaseIndex].progress === 100) {
            project.phases[phaseIndex].status = 'completed';
          } else if (phaseTasks.some((t) => t.status === 'in-progress')) {
            project.phases[phaseIndex].status = 'in-progress';
          } else {
            project.phases[phaseIndex].status = 'pending';
          }
        }
      }

      // Update milestones
      project.milestones.forEach((milestone) => {
        const milestoneTasks = projectTasks.filter((t) => milestone.tasks.includes(t.id));
        if (milestoneTasks.length > 0) {
          const milestoneCompletedTasks = milestoneTasks.filter(
            (t) => t.status === 'completed'
          ).length;
          milestone.progress = Math.round((milestoneCompletedTasks / milestoneTasks.length) * 100);

          if (milestone.progress === 100) {
            milestone.status = 'completed';
          } else if (milestoneTasks.some((t) => t.status === 'in-progress')) {
            milestone.status = 'in-progress';
          } else if (new Date(milestone.dueDate) < new Date()) {
            milestone.status = 'overdue';
          } else {
            milestone.status = 'pending';
          }
        }
      });

      project.lastUpdated = new Date();
      await project.save();
    }
  }

  // GitHub Integration
  async addCommitToTask(taskId: string, commit: TaskProgress['commits'][0]): Promise<void> {
    await this.ensureConnection();

    await TaskProgressModel.updateOne(
      { id: taskId },
      {
        $push: { commits: commit },
        $set: { lastUpdated: new Date() },
      }
    );
  }

  async addPullRequestToTask(
    taskId: string,
    pullRequest: TaskProgress['pullRequests'][0]
  ): Promise<void> {
    await this.ensureConnection();

    await TaskProgressModel.updateOne(
      { id: taskId },
      {
        $push: { pullRequests: pullRequest },
        $set: { lastUpdated: new Date() },
      }
    );
  }

  async updateTaskMetrics(
    taskId: string,
    metrics: Partial<TaskProgress['metrics']>
  ): Promise<void> {
    await this.ensureConnection();

    await TaskProgressModel.updateOne(
      { id: taskId },
      {
        $set: {
          metrics: metrics,
          lastUpdated: new Date(),
        },
      }
    );
  }

  // Helper methods
  private formatTask(task: any): TaskProgress {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      progress: task.progress,
      priority: task.priority,
      category: task.category,
      phase: task.phase,
      assignee: task.assignee,
      startDate: task.startDate?.toISOString(),
      endDate: task.endDate?.toISOString(),
      completedDate: task.completedDate?.toISOString(),
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      dependencies: task.dependencies || [],
      tags: task.tags || [],
      milestones: task.milestones || [],
      commits: task.commits || [],
      pullRequests: task.pullRequests || [],
      metrics: task.metrics || {
        codeQuality: 0,
        testCoverage: 0,
        performance: 0,
        security: 0,
        accessibility: 0,
      },
      lastUpdated: task.lastUpdated?.toISOString() || new Date().toISOString(),
      updatedBy: task.updatedBy,
      metadata: task.metadata || {
        source: 'manual',
        reason: '',
        confidence: 100,
      },
    };
  }

  private formatProject(project: any): ProjectProgress {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      totalTasks: project.totalTasks,
      completedTasks: project.completedTasks,
      inProgressTasks: project.inProgressTasks,
      blockedTasks: project.blockedTasks,
      overallProgress: project.overallProgress,
      phases: project.phases || [],
      milestones: project.milestones || [],
      metrics: project.metrics || {
        velocity: 0,
        burndownRate: 0,
        qualityScore: 0,
        teamEfficiency: 0,
        riskLevel: 'low',
      },
      timeline: project.timeline || [],
      lastUpdated: project.lastUpdated?.toISOString() || new Date().toISOString(),
    };
  }

  // Data Migration (for converting from mock data)
  async migrateMockData(mockTasks: TaskProgress[], mockProjects: ProjectProgress[]): Promise<void> {
    await this.ensureConnection();

    console.log('🔄 Migrating mock data to database...');

    // Clear existing data
    await TaskProgressModel.deleteMany({});
    await ProjectProgressModel.deleteMany({});

    // Insert tasks
    for (const task of mockTasks) {
      await this.createTask(task);
    }

    // Insert projects
    for (const project of mockProjects) {
      await this.createProject(project);
    }

    console.log('✅ Mock data migration completed');
  }
}

export default ProgressDatabaseService.getInstance();
