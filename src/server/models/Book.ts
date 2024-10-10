import mongoose from "mongoose";

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
  createdAt: Date;
}

const BookSchema = new mongoose.Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  readPages: { type: Number, default: 0 },
  category: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Book = mongoose.model<IBook>("Book", BookSchema);