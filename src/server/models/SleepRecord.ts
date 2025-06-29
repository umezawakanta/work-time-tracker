import mongoose from 'mongoose';

const sleepRecordSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    wakeUp: {
      type: String,
      default: null,
    },
    bedtime: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const SleepRecord = mongoose.model('SleepRecord', sleepRecordSchema);
