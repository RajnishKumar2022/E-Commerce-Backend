import bcrypt from "bcryptjs";
import mongoose, { Model, Document } from "mongoose";

enum UserRole {
  User = "customer",
  Admin = "admin",
  Seller = "seller",
}

export interface IUser extends Document {
  firstName: string;
  lastName?: string; // Optional field in schema (not required)
  email: string;
  password?: string; // Optional if you support OAuth logins later
  emailVerified: boolean;
  isActive: boolean;
  role: UserRole; // Enforces our specific enum types
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      minlength: 3,
      maxlength: 45,
    },
    lastName: {
      type: String,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 45,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      maxlength: 322,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: 6,
      maxlength: 100,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      lowercase: true,
      default: UserRole.User,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return
  try {
    this.password = await bcrypt.hash(this.password, 12);
    
  } catch (error) {
    console.log(error);
  }
});

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
