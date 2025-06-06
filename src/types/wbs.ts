// src/types/wbs.ts
export interface WBSNode {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  description: string;
  level: number;
  orderIndex: number;
  startDate: string;
  endDate: string;
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
  risks: WBSRisk[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  color?: string;
  icon?: string;
  category?: string;
  tags?: string[];
}

export interface WBSProject {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  owner: string;
  team: string[];
  budget: number;
  currency: string;
  visibility: 'private' | 'team' | 'public';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WBSRisk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: string;
}

export interface WBSComment {
  id: string;
  nodeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  mentions: string[];
}

export interface WBSActivity {
  id: string;
  nodeId: string;
  userId: string;
  action: 'created' | 'updated' | 'completed' | 'commented' | 'assigned';
  details: string;
  timestamp: string;
}

export interface WBSTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Partial<WBSNode>[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
}

export interface WBSExportOptions {
  format: 'json' | 'csv' | 'xml' | 'mpp' | 'pdf';
  includeComments: boolean;
  includeActivities: boolean;
  includeRisks: boolean;
  dateFormat: string;
}

export interface WBSImportResult {
  success: boolean;
  projectId?: string;
  nodesImported: number;
  errors: string[];
  warnings: string[];
}
