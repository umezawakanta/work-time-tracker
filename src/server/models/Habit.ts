import mongoose from 'mongoose';

export interface IHabit extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  data: Map<string, boolean[]>;
  createdAt: Date;
  updatedAt: Date;
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
      type: mongoose.Schema.Types.Mixed,
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
  try {
    // Mixed型を使用するため、より柔軟な型チェックを行う
    const doc = this as any;

    // dataが存在しない場合は新しいMapを作成
    if (!doc.data) {
      doc.data = new Map();
      return next();
    }

    // Mapインスタンスでない場合はオブジェクトからMapに変換
    if (!(doc.data instanceof Map)) {
      if (typeof doc.data === 'object' && doc.data !== null) {
        doc.data = new Map(Object.entries(doc.data));
      } else {
        doc.data = new Map();
      }
    }

    // Mapの内容を検証
    for (const [key, value] of doc.data.entries()) {
      if (!Array.isArray(value)) {
        return next(new Error(`Invalid data format for month ${key}: expected array`));
      }
      if (!value.every((item) => typeof item === 'boolean')) {
        return next(new Error(`Data for month ${key} contains non-boolean values`));
      }
    }

    next();
  } catch (error) {
    next(
      new Error(
        `Habit validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    );
  }
});

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
