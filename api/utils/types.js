// Type definitions for the work time tracker API
// This file provides type information for CommonJS modules

// Note: These are not actual TypeScript interfaces but rather documentation
// for the expected structure of documents in the database

// User Document Structure
// {
//   id: string,
//   email: string,
//   displayName: string,
//   password: string,
//   role: string,
//   isVerified: boolean,
//   avatar?: string,
//   preferences: any,
//   status: "active" | "inactive" | "suspended",
//   createdAt: Date,
//   updatedAt: Date
// }

// Book Document Structure
// {
//   id: string,
//   title: string,
//   author: string,
//   isbn: string,
//   status: "want_to_read" | "reading" | "read",
//   rating: number (1-5),
//   notes: string,
//   userId: string,
//   createdAt: Date,
//   updatedAt: Date
// }

// Work Record Document Structure
// {
//   id: string,
//   userId: string,
//   date: Date,
//   type: "salary" | "diary",
//   title: string,
//   content: string,
//   salary: number,
//   recordType: "income" | "expense",
//   createdAt: Date,
//   updatedAt: Date
// }

// Memo Document Structure
// {
//   id: string,
//   userId: string,
//   title: string,
//   content: string,
//   isPublic: boolean,
//   tags: string[],
//   createdAt: Date,
//   updatedAt: Date
// }

// User Settings Document Structure
// {
//   id: string,
//   userId: string,
//   featureOrder: string[],
//   hiddenFeatures: string[],
//   theme: string,
//   font: string,
//   createdAt: Date,
//   updatedAt: Date
// }

// Project Document Structure
// {
//   id: string,
//   userId: string,
//   name: string,
//   description: string,
//   color: string,
//   isActive: boolean,
//   createdAt: Date,
//   updatedAt: Date
// }

// Time Entry Document Structure
// {
//   id: string,
//   userId: string,
//   projectId: string,
//   startTime: Date,
//   endTime: Date,
//   duration: number,
//   description: string,
//   createdAt: Date,
//   updatedAt: Date
// }

// API Request/Response Types
// These are documented for reference but not used as actual validation schemas

// LoginRequest: { email: string, password: string }
// RegisterRequest: { email: string, password: string, displayName: string }
// EditUserRequest: { displayName?: string, email?: string, role?: string, status?: string }
// CreateBookRequest: { title: string, author: string, isbn?: string, status?: string, rating?: number, notes?: string }
// UpdateBookRequest: { title?: string, author?: string, isbn?: string, status?: string, rating?: number, notes?: string }
// CreateWorkRecordRequest: { type: "salary" | "diary", title: string, content?: string, salary?: number, recordType?: "income" | "expense" }
// UpdateWorkRecordRequest: { title?: string, content?: string, salary?: number, recordType?: "income" | "expense" }
// CreateMemoRequest: { title: string, content: string, isPublic?: boolean, tags?: string[] }
// UpdateMemoRequest: { title?: string, content?: string, isPublic?: boolean, tags?: string[] }

// CommonJS export for compatibility
// These exports are placeholders for TypeScript compatibility
module.exports = {
  // Document types (for reference only)
  UserDocument: 'UserDocument',
  BookDocument: 'BookDocument',
  WorkRecordDocument: 'WorkRecordDocument',
  MemoDocument: 'MemoDocument',
  UserSettingsDocument: 'UserSettingsDocument',
  ProjectDocument: 'ProjectDocument',
  TimeEntryDocument: 'TimeEntryDocument',
  
  // Request types (for reference only)
  LoginRequest: 'LoginRequest',
  RegisterRequest: 'RegisterRequest',
  EditUserRequest: 'EditUserRequest',
  CreateBookRequest: 'CreateBookRequest',
  UpdateBookRequest: 'UpdateBookRequest',
  CreateWorkRecordRequest: 'CreateWorkRecordRequest',
  UpdateWorkRecordRequest: 'UpdateWorkRecordRequest',
  CreateMemoRequest: 'CreateMemoRequest',
  UpdateMemoRequest: 'UpdateMemoRequest'
};