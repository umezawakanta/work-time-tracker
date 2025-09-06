import mongoose from 'mongoose';

const ErrorLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: { type: String, enum: ['error', 'warn', 'info', 'debug'], required: true },
  message: { type: String, required: true },
  stack: String,
  userId: String,
  endpoint: String,
  method: String,
  statusCode: Number,
  userAgent: String,
  ip: String,
  sessionId: String,
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
});

// モデルが既に存在する場合は既存のものを返す
export function getErrorLogModel() {
  try {
    return mongoose.model('ErrorLog');
  } catch (error) {
    return mongoose.model('ErrorLog', ErrorLogSchema);
  }
}

export default ErrorLogSchema;
