import mongoose from "mongoose";

export interface IDebtEntry extends mongoose.Document {
  date: Date;
  value: number;
  description: string;
  account: string;
  createdAt: Date;
}

const DebtEntrySchema = new mongoose.Schema<IDebtEntry>({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  description: { type: String, required: true },
  account: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const DebtEntry = mongoose.model<IDebtEntry>(
  "DebtEntry",
  DebtEntrySchema
);
