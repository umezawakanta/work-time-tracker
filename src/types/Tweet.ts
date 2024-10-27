import { Types } from 'mongoose';

export interface Tweet {
  _id: Types.ObjectId;
  content?: string;
  user: Types.ObjectId;
  image?: string;
  createdAt: Date;
}