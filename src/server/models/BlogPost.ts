import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: string;
  createdAt: Date;
}

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema);

export interface IBlogPost extends Document {
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  likes: number;
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
}, { timestamps: true });

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);