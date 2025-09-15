// User Document Interface
interface UserDocument {
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
interface BookDocument {
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
interface WorkRecordDocument {
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
interface MemoDocument {
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
interface UserSettingsDocument {
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
interface ProjectDocument {
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
interface TimeEntryDocument {
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
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserDocument;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user?: UserDocument;
}

interface UsersListResponse {
  success: boolean;
  message: string;
  users?: UserDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

interface BooksListResponse {
  success: boolean;
  message: string;
  books?: BookDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

interface WorkRecordsResponse {
  success: boolean;
  message: string;
  records?: WorkRecordDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

interface MemosResponse {
  success: boolean;
  message: string;
  memos?: MemoDocument[];
  total?: number;
  page?: number;
  limit?: number;
}

// Request Interfaces
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

interface EditUserRequest {
  userId: string;
  displayName?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  status?: "active" | "inactive" | "suspended";
}

interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  totalPages: number;
  category: string;
  rating?: number;
  notes?: string;
}

interface UpdateBookRequest {
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

interface CreateWorkRecordRequest {
  type: "salary" | "diary";
  date: string;
  amount?: number; // For salary records
  title?: string; // For diary records
  content?: string; // For diary records
  category?: string; // For diary records
  tags?: string[]; // For diary records
}

interface UpdateWorkRecordRequest {
  amount?: number; // For salary records
  title?: string; // For diary records
  content?: string; // For diary records
  category?: string; // For diary records
  tags?: string[]; // For diary records
}

interface CreateMemoRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isPublic?: boolean;
}

interface UpdateMemoRequest {
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
