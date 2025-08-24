import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AnalyticsEventDocument extends Document {
  event: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  data: Record<string, unknown>;
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  referrer?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema = new Schema<AnalyticsEventDocument>(
  {
    event: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    userId: { type: String, index: true },
    sessionId: { type: String, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    userAgent: { type: String },
    ipAddress: { type: String },
    url: { type: String },
    referrer: { type: String },
  },
  { timestamps: true, versionKey: false }
);

AnalyticsEventSchema.index({ event: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });

export const AnalyticsEvent: Model<AnalyticsEventDocument> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<AnalyticsEventDocument>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEvent;
