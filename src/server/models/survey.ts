import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema(
  {
    mediaOutlet: { type: String, required: true },
    surveyStartDate: { type: Date, required: true },
    surveyEndDate: { type: Date, required: true },
    sampleSize: { type: Number },
  },
  { timestamps: true }
);

// 日付 + メディアをユニークに制約
surveySchema.index({ surveyEndDate: 1, mediaOutlet: 1 }, { unique: true });

export const Survey = mongoose.model('Survey', surveySchema);
