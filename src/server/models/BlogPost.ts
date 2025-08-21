import mongoose, { Document, Schema } from 'mongoose';

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
  authorId?: string;
  category: string;
  tags: string[];
  likes: string[];
  comments: mongoose.Types.ObjectId[];
  status: 'published' | 'draft' | 'deleted';
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema(
  {
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
    authorId: {
      type: String,
      default: null,
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
      type: [String],
      default: [],
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    status: {
      type: String,
      enum: ['published', 'draft', 'deleted'],
      default: 'published',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
