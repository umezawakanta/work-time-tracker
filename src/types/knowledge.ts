export interface KnowledgeEntry {
  id: string;
  term: string;
  definition: string;
  category: string;
  tags: string[];
  relatedTasks?: string[]; // 関連するWBSタスクID
  source?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  metadata?: {
    aiGenerated?: boolean;
    confidence?: number;
    references?: string[];
  };
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
}
