import { IWorkTimeEntry } from "@/types";
import mongoose, { Schema } from "mongoose";

const WorkTimeSchema = new Schema<IWorkTimeEntry>({
  projectName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: String,
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const WorkTimeEntry = mongoose.model<IWorkTimeEntry>(
  "WorkTime",
  WorkTimeSchema
);
