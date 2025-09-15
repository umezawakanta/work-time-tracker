// User Document Interface
export interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  password: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  preferences: any;
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

// Book Document Interface
export interface BookDocument {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  totalPages: number;
  readPages: number;
  category: string;
  rating: number;
  status: "not-started" | "reading" | "completed" | "paused";
  notes: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Work Record Document Interface
export interface WorkRecordDocument {
  id: string;
  userId: string;
  type: "salary" | "diary";
  date: Date;
  amount?: number; // For salary records
  title?: string; // For diary records
  content?: string; // For diary records
  category?: string; // For diary records
  tags?: string[]; // For diary records
  createdAt: Date;
  updatedAt: Date;
}

// Memo Document Interface
export interface MemoDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Settings Document Interface
export interface UserSettingsDocument {
  id: string;
  userId: string;
  featureOrder: string[];
  hiddenFeatures: string[];
  theme: string;
  font: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project Document Interface
export interface ProjectDocument {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Time Entry Document Interface
export interface TimeEntryDocument {
  id: string;
  userId: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserDocument;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: UserDocument;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  users?: UserDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface BooksListResponse {
  success: boolean;
  message: string;
  books?: BookDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface WorkRecordsResponse {
  success: boolean;
  message: string;
  records?: WorkRecordDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface MemosResponse {
  success: boolean;
  message: string;
  memos?: MemoDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

// Request Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface EditUserRequest {
  userId: string;
  displayName?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  status?: "active" | "inactive" | "suspended";
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  totalPages: number;
  category: string;
  rating?: number;
  notes?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  isbn?: string;
  publishedYear?: number;
  totalPages?: number;
  readPages?: number;
  category?: string;
  rating?: number;
  status?: "not-started" | "reading" | "completed" | "paused";
  notes?: string;
}

export interface CreateWorkRecordRequest {
  type: "salary" | "diary";
  date: string;
  amount?: number; // For salary records
  title?: string; // For diary records
  content?: string; // For diary records
  category?: string; // For diary records
  tags?: string[]; // For diary records
}

export interface UpdateWorkRecordRequest {
  amount?: number; // For salary records
  title?: string; // For diary records
  content?: string; // For diary records
  category?: string; // For diary records
  tags?: string[]; // For diary records
}

export interface CreateMemoRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateMemoRequest {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

// CommonJS export for compatibility
module.exports = {
  UserDocument,
  BookDocument,
  WorkRecordDocument,
  MemoDocument,
  UserSettingsDocument,
  ProjectDocument,
  TimeEntryDocument,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  UsersListResponse,
  BooksListResponse,
  WorkRecordsResponse,
  MemosResponse,
  LoginRequest,
  RegisterRequest,
  EditUserRequest,
  CreateBookRequest,
  UpdateBookRequest,
  CreateWorkRecordRequest,
  UpdateWorkRecordRequest,
  CreateMemoRequest,
  UpdateMemoRequest
};
