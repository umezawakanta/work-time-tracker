// src/types/blogTask.ts
// Blog content → AI task extraction result types

// Strict, reusable primitives
export type TaskType = 'input' | 'output';
export type PriorityLevel = 1 | 2 | 3 | 4 | 5;
export type ISODateString = string; // e.g., '2025-08-20T06:30:00.000Z'

// A single task extracted from blog content
export interface ExtractedTask {
  title: string;
  type: TaskType;
  priority?: PriorityLevel;
  dueDate?: ISODateString;
  notes?: string;
}

// AI extraction result for a given blog post/content
export interface ExtractedTaskResult {
  tasks: ExtractedTask[];
  sourcePostId?: string;
}
