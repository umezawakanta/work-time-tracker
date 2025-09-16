const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  displayName: { 
    type: String, 
    required: true,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  avatar: { 
    type: String 
  },
  preferences: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, password, ...cleanRet } = ret;
      return cleanRet;
    },
  },
});

// Book Schema
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  readPages: { type: Number, default: 0 },
  category: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  status: { 
    type: String, 
    enum: ['not-started', 'reading', 'completed', 'paused'], 
    default: 'not-started' 
  },
  notes: { type: String, default: '' },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...cleanRet } = ret;
      return { id: _id, ...cleanRet };
    },
  },
});

// Work Record Schema
const WorkRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['salary', 'diary'], 
    required: true 
  },
  date: { type: Date, required: true },
  amount: { type: Number }, // For salary records
  title: { type: String }, // For diary records
  content: { type: String }, // For diary records
  category: { type: String }, // For diary records
  tags: [{ type: String }], // For diary records
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...cleanRet } = ret;
      return { id: _id, ...cleanRet };
    },
  },
});

// Memo Schema
const MemoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...cleanRet } = ret;
      return { id: _id, ...cleanRet };
    },
  },
});

// User Settings Schema
const UserSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  featureOrder: { type: [String], default: [] },
  hiddenFeatures: { type: [String], default: [] },
  theme: { type: String, default: 'ocean' },
  font: { type: String, default: 'system' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...cleanRet } = ret;
      return { id: _id, ...cleanRet };
    },
  },
});

// Add pre-save middleware for updatedAt
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

BookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

WorkRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

MemoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

UserSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Project Schema
const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#3B82F6' },
  isActive: { type: Boolean, default: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...cleanRet } = ret;
      return { id: _id, ...cleanRet };
    },
  },
});

// Time Entry Schema
const TimeEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  projectId: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  description: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...cleanRet } = ret;
      return { id: _id, ...cleanRet };
    },
  },
});

// Add pre-save middleware for updatedAt
ProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

TimeEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = {
  UserSchema,
  BookSchema,
  WorkRecordSchema,
  MemoSchema,
  UserSettingsSchema,
  ProjectSchema,
  TimeEntrySchema
};
