import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  isAdmin: boolean; // isAdminフィールドを追加
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }, // デフォルトはfalse
  },
  {
    timestamps: true, // createdAtとupdatedAtを自動的に追加
  }
);

userSchema.pre<IUser>('save', async function (next) {
  try {
    console.log('=== User pre-save hook started ===');
    console.log('User data before save:', {
      email: this.email,
      name: this.name,
      isAdmin: this.isAdmin,
      passwordModified: this.isModified('password'),
      passwordLength: this.password ? this.password.length : 0,
    });

    if (this.isModified('password')) {
      console.log('Password was modified, starting hash process...');
      const originalPasswordLength = this.password.length;
      this.password = await bcrypt.hash(this.password, 10);
      console.log('Password hashed successfully:', {
        originalLength: originalPasswordLength,
        hashedLength: this.password.length,
      });
    }

    console.log('=== User pre-save hook completed successfully ===');
    next();
  } catch (error) {
    console.error('=== User pre-save hook error ===');
    console.error('Error during user pre-save:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
