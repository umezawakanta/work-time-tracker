import mongoose from 'mongoose';

export interface ICandidate extends mongoose.Document {
  name: string;
  party: string;
  prefecture: string | null;
  district: number | null;
  proportionalBlock: string | null;
}

const CandidateSchema = new mongoose.Schema<ICandidate>({
  name: { type: String, required: true },
  party: { type: String, required: true },
  prefecture: { type: String, required: false },
  district: { type: Number, required: false },
  proportionalBlock: { type: String, required: false },
});

export const Candidate = mongoose.model<ICandidate>('Candidate', CandidateSchema);
