import mongoose from "mongoose";

export interface IAssetEntry extends mongoose.Document {
  date: string;
  value: number;
  createdAt: Date;
}

const AssetEntrySchema = new mongoose.Schema<IAssetEntry>({
  date: { type: String, required: true },
  value: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AssetEntry = mongoose.model<IAssetEntry>(
  "AssetEntry",
  AssetEntrySchema
);
