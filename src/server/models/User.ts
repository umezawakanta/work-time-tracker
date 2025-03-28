import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// モデルのスタティックメソッド用のインターフェース
interface UserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new mongoose.Schema<IUser, UserModel>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '有効なメールアドレスを入力してください'] 
  },
  password: { 
    type: String, 
    required: true,
    minlength: [6, 'パスワードは6文字以上である必要があります']
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [2, '名前は2文字以上である必要があります']
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// パスワードをハッシュ化するミドルウェア
userSchema.pre<IUser>('save', async function(next) {
  // パスワードが変更された場合のみハッシュ化
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (error) {
      return next(error as mongoose.Error);
    }
  } else {
    next();
  }
});

// パスワード比較メソッド
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// メールアドレスで検索するスタティックメソッド
userSchema.statics.findByEmail = async function(email: string): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase() });
};

// モデルの作成
export const User = mongoose.model<IUser, UserModel>('User', userSchema);