import mongoose from 'mongoose';

export interface IBook extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  totalPages: number;
  readPages: number;
  category: string;
  rating: number;
  notes?: string;
  lentTo?: string;
  isPublic?: boolean;
  isFamilyOnly?: boolean;
  isAdminOnly?: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new mongoose.Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: false },
  publishedYear: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  readPages: { type: Number, default: 0 },
  category: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  notes: { type: String, default: '' },
  lentTo: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
BookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Book = mongoose.model<IBook>('Book', BookSchema);
