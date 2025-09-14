import mongoose, { Schema, Document } from "mongoose";

// User document interface
export interface UserDocument extends Document {
  id: string;
  email: string;
  displayName: string;
  password: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  preferences: any;
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

// Main User schema
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    preferences: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Virtual for user ID
UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    const { _id, __v, password, ...cleanRet } = ret;
    return cleanRet;
  },
});

export const User = mongoose.model<UserDocument>("User", UserSchema);
export default User;