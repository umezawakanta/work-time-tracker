import mongoose, { Schema, Document } from 'mongoose';

// User document interface
export interface UserDocument extends Document {
  uid: string;
  email: string;
  username?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  password: string; // Add password property
  provider: 'jwt' | 'firebase' | 'google' | 'github';
  isVerified: boolean;
  role: 'user' | 'admin' | 'manager' | 'guest';
  permissions: string[];
  preferences: any;
  settings: any;
  stats: any;
  employeeInfo?: any;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  version: number;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncAt?: Date;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateLastActivity(): Promise<UserDocument>;
  updateStats(updates: any): Promise<UserDocument>;
}

// Subdocument schemas
const NotificationPreferencesSchema = new Schema(
  {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    digest: { type: String, enum: ['none', 'daily', 'weekly'], default: 'daily' },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' },
    },
  },
  { _id: false }
);

const DashboardWidgetSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      w: { type: Number, required: true },
      h: { type: Number, required: true },
    },
    config: { type: Schema.Types.Mixed, default: {} },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const DashboardPreferencesSchema = new Schema(
  {
    layout: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
    defaultView: { type: String, default: 'dashboard' },
    widgets: [DashboardWidgetSchema],
    refreshInterval: { type: Number, default: 30000 },
    showWelcome: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductivityPreferencesSchema = new Schema(
  {
    pomodoroEnabled: { type: Boolean, default: false },
    pomodoroMinutes: { type: Number, default: 25 },
    breakMinutes: { type: Number, default: 5 },
    longBreakMinutes: { type: Number, default: 15 },
    autoStartBreaks: { type: Boolean, default: false },
    focusMode: { type: Boolean, default: false },
    distractionBlocking: { type: Boolean, default: false },
    goalSetting: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserPreferencesSchema = new Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, enum: ['ja', 'en', 'zh', 'ko'], default: 'ja' },
    timezone: { type: String, default: 'Asia/Tokyo' },
    dateFormat: { type: String, default: 'YYYY-MM-DD' },
    timeFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
    currency: { type: String, default: 'JPY' },
    notifications: NotificationPreferencesSchema,
    dashboard: DashboardPreferencesSchema,
    productivity: ProductivityPreferencesSchema,
  },
  { _id: false }
);

const PrivacySettingsSchema = new Schema(
  {
    profileVisibility: { type: String, enum: ['public', 'team', 'private'], default: 'team' },
    activityVisibility: { type: String, enum: ['public', 'team', 'private'], default: 'team' },
    allowDataSharing: { type: Boolean, default: false },
    allowAnalytics: { type: Boolean, default: true },
    allowMarketing: { type: Boolean, default: false },
  },
  { _id: false }
);

const SecuritySettingsSchema = new Schema(
  {
    twoFactorEnabled: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 86400000 }, // 24 hours
    allowMultipleSessions: { type: Boolean, default: true },
    ipWhitelist: [{ type: String }],
    deviceTrust: { type: Boolean, default: false },
    loginNotifications: { type: Boolean, default: true },
  },
  { _id: false }
);

const IntegrationSettingsSchema = new Schema(
  {
    enabledProviders: [{ type: String }],
    autoSync: { type: Boolean, default: true },
    syncFrequency: { type: Number, default: 300000 }, // 5 minutes
    dataMapping: { type: Schema.Types.Mixed, default: {} },
    conflictResolution: { type: String, enum: ['manual', 'auto'], default: 'manual' },
  },
  { _id: false }
);

const FeatureFlagsSchema = new Schema(
  {
    betaFeatures: { type: Boolean, default: false },
    experimentalFeatures: { type: Boolean, default: false },
    aiFeatures: { type: Boolean, default: true },
    advancedAnalytics: { type: Boolean, default: false },
    teamFeatures: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSettingsSchema = new Schema(
  {
    privacy: PrivacySettingsSchema,
    security: SecuritySettingsSchema,
    integrations: IntegrationSettingsSchema,
    features: FeatureFlagsSchema,
  },
  { _id: false }
);

const UserStatsSchema = new Schema(
  {
    totalWorkHours: { type: Number, default: 0 },
    totalProjects: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    achievementCount: { type: Number, default: 0 },
    badgeCount: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    averageProductivity: { type: Number, default: 0 },
    joinDate: { type: String, required: true },
    lastWeekHours: { type: Number, default: 0 },
    lastMonthHours: { type: Number, default: 0 },
  },
  { _id: false }
);

const EmployeeInfoSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    manager: { type: String },
    salary: { type: Number },
    startDate: { type: String, required: true },
    contractType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      required: true,
    },
    workingHours: {
      start: { type: String, required: true },
      end: { type: String, required: true },
      breakDuration: { type: Number, default: 60 }, // minutes
    },
  },
  { _id: false }
);

// Main User schema
const UserSchema = new Schema(
  {
    // 基本情報
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, unique: true, sparse: true },
    displayName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    avatar: { type: String },

    // 認証情報
    provider: {
      type: String,
      enum: ['jwt', 'firebase', 'google', 'github'],
      required: true,
    },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager', 'guest'],
      default: 'user',
    },
    permissions: [{ type: String }],

    // 設定
    preferences: { type: UserPreferencesSchema, required: true },
    settings: { type: UserSettingsSchema, required: true },

    // 統計
    stats: { type: UserStatsSchema, required: true },

    // 勤怠情報
    employeeInfo: EmployeeInfoSchema,

    // 状態
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    lastLoginAt: { type: Date },
    lastActivityAt: { type: Date },

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
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ lastLoginAt: -1 });
UserSchema.index({ createdAt: -1 });

// Text index for search (email/displayName/username)
UserSchema.index(
  { email: 'text', displayName: 'text', username: 'text' },
  { name: 'user_text_search', weights: { email: 10, displayName: 5, username: 4 } }
);

// Virtual for user ID
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    const { _id, __v, password, ...cleanRet } = ret;
    return cleanRet;
  },
});

// Pre-save middleware to update version and sync status
UserSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.syncStatus = 'pending';
  }
  next();
});

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

UserSchema.statics.findByUid = function (uid: string) {
  return this.findOne({ uid });
};

UserSchema.statics.findActiveUsers = function () {
  return this.find({ status: 'active' });
};

// Instance methods
UserSchema.methods.updateLastActivity = function () {
  this.lastActivityAt = new Date();
  return this.save();
};

UserSchema.methods.updateStats = function (updates: any) {
  this.stats = { ...this.stats, ...updates };
  return this.save();
};

export const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;
