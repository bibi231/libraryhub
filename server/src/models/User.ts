import mongoose, { Document, Schema } from 'mongoose';
import type { UserRole, IdType } from '@libraryhub/shared';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  idType: IdType;
  idNumber: string;
  libraryCardNumber: string;
  role: UserRole;
  favoriteCategories: string[];
  isActive: boolean;
  fineBalance: number;
  refreshToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    idType: { type: String, enum: ['NIN', 'BVN', 'StudentID', 'StaffID'], required: true },
    idNumber: { type: String, required: true },
    libraryCardNumber: { type: String, unique: true },
    role: { type: String, enum: ['patron', 'librarian', 'admin'], default: 'patron' },
    favoriteCategories: [{ type: String }],
    isActive: { type: Boolean, default: true },
    fineBalance: { type: Number, default: 0 },
    refreshToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ libraryCardNumber: 1 });

export default mongoose.model<IUserDocument>('User', UserSchema);
