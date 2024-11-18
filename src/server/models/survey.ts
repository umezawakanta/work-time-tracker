// src/server/models/Survey.ts
import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  mediaOutlet: { type: String, required: true },
  surveyStartDate: { type: Date, required: true },
  surveyEndDate: { type: Date, required: true },
  sampleSize: { type: Number }
}, { timestamps: true });

export const Survey = mongoose.model("Survey", surveySchema);



