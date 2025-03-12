import mongoose from "mongoose";

export interface IAssetEntry extends mongoose.Document {
  date: Date;
  value: number;
  account: string;
  createdAt: Date;

  // save メソッドを追加
  save(): Promise<IAssetEntry>;
}

const AssetEntrySchema = new mongoose.Schema<IAssetEntry>({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  account: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AssetEntry = mongoose.model<IAssetEntry>(
  "AssetEntry",
  AssetEntrySchema
);
