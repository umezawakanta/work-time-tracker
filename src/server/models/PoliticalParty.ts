import mongoose from 'mongoose';

// src/server/models/PoliticalParty.ts
const politicalPartySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    colorCode: { type: String, required: true },
  },
  { timestamps: true }
);

export const PoliticalParty = mongoose.model('PoliticalParty', politicalPartySchema);
