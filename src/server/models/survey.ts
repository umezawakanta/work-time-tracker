// src/server/models/survey.ts
import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  mediaOutlet: { type: String, required: true },
  surveyStartDate: { type: Date, required: true },
  surveyEndDate: { type: Date, required: true },
  sampleSize: { type: Number }
}, { timestamps: true });

// 同じ日付の調査を重複して登録できないように制約を追加
surveySchema.index({ surveyEndDate: 1 }, { unique: true });

export const Survey = mongoose.model("Survey", surveySchema);