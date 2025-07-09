import mongoose from 'mongoose';

export interface IHabit extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  data: Map<string, boolean[]>;
  createdAt: Date;
  updatedAt: Date;
}

// データベースから取得される時の型
interface IHabitDocument extends Omit<IHabit, 'data'> {
  data: Map<string, boolean[]> | { [k: string]: boolean[] };
}

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    data: {
      type: Map,
      of: [Boolean],
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        if (ret.data instanceof Map) {
          ret.data = Object.fromEntries(ret.data);
        }
        return ret;
      },
    },
  }
);

habitSchema.pre('save', function (next) {
  // 適切な型アサーションでドキュメントの型を処理
  const doc = this as unknown as IHabitDocument;

  if (!doc.data) {
    doc.data = new Map();
  }

  if (!(doc.data instanceof Map)) {
    try {
      // プレーンオブジェクトをMapに変換
      const plainObject = doc.data as { [k: string]: boolean[] };
      doc.data = new Map(Object.entries(plainObject));
    } catch {
      // エラーメッセージを直接返す
      return next(new Error('Invalid data format'));
    }
  }

  for (const [key, value] of doc.data.entries()) {
    if (!Array.isArray(value)) {
      return next(new Error(`Invalid data format for month ${key}`));
    }
    if (!value.every((item) => typeof item === 'boolean')) {
      return next(new Error(`Data for month ${key} contains non-boolean values`));
    }
  }

  next();
});

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
