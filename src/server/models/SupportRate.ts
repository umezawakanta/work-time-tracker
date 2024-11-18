// src/server/models/supportRate.ts
import mongoose from "mongoose";

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

export const SupportRate = mongoose.model("SupportRate", supportRateSchema);