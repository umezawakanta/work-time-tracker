import mongoose, { Document } from 'mongoose';

export interface ITweet extends Document {
  content?: string;
  user: mongoose.Types.ObjectId;
  image?: string;
  createdAt: Date;
}

const tweetSchema = new mongoose.Schema<ITweet>({
  content: {
    type: String,
    maxlength: 280,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Tweet = mongoose.model<ITweet>('Tweet', tweetSchema);