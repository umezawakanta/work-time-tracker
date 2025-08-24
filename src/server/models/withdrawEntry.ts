import mongoose from 'mongoose';

export interface IWithdrawalEntry extends mongoose.Document {
  date: Date;
  bank: string;
  branch: string;
  amount: number;
  description: string;
  createdAt: Date;
}

const WithdrawalEntrySchema = new mongoose.Schema<IWithdrawalEntry>({
  date: { type: Date, required: true },
  bank: { type: String, required: true },
  branch: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const WithdrawalEntry = mongoose.model<IWithdrawalEntry>(
  'WithdrawalEntry',
  WithdrawalEntrySchema
);
