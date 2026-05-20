import mongoose, { Document, Schema } from 'mongoose';
import type { BorrowStatus } from '@libraryhub/shared';

export interface IBorrowDocument extends Document {
  patronId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  librarianId: mongoose.Types.ObjectId;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  renewals: number;
  maxRenewals: number;
  status: BorrowStatus;
  conditionAtBorrow: string;
  conditionAtReturn?: string;
  fine: number;
  finePaid: boolean;
  createdAt: Date;
}

const BorrowSchema = new Schema<IBorrowDocument>(
  {
    patronId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    librarianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    renewals: { type: Number, default: 0 },
    maxRenewals: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active' },
    conditionAtBorrow: { type: String, default: 'good' },
    conditionAtReturn: { type: String },
    fine: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BorrowSchema.index({ patronId: 1 });
BorrowSchema.index({ bookId: 1 });
BorrowSchema.index({ status: 1 });
BorrowSchema.index({ dueDate: 1 });

export default mongoose.model<IBorrowDocument>('Borrow', BorrowSchema);
