import mongoose from 'mongoose';

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 280,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Tweet = mongoose.model('Tweet', tweetSchema);