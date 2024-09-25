import mongoose from "mongoose";

const workTimeEntrySchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export const WorkTimeEntry = mongoose.model(
  "WorkTimeEntry",
  workTimeEntrySchema
);
