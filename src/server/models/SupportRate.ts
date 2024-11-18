import mongoose from "mongoose";

// src/server/models/supportRate.ts
const supportRateSchema = new mongoose.Schema({
    surveyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Survey", 
      required: true 
    },
    partyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PoliticalParty", 
      required: true 
    },
    supportRate: { type: Number, required: true },
    rateChange: { type: Number }
  }, { timestamps: true });
  
  // 同じ調査で同じ政党のデータを重複して登録できないように制約を追加
  supportRateSchema.index({ surveyId: 1, partyId: 1 }, { unique: true });
  
  export const SupportRate = mongoose.model("SupportRate", supportRateSchema);