import mongoose, { Document, Schema } from 'mongoose';
import type { FineStatus, FineReason } from '@libraryhub/shared';

export interface IFineDocument extends Document {
  patronId: mongoose.Types.ObjectId;
  borrowId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  amount: number;
  reason: FineReason;
  status: FineStatus;
  paidAt?: Date;
  createdAt: Date;
}

const FineSchema = new Schema<IFineDocument>(
  {
    patronId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    borrowId: { type: Schema.Types.ObjectId, ref: 'Borrow', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, enum: ['overdue', 'damage', 'lost'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

FineSchema.index({ patronId: 1 });
FineSchema.index({ status: 1 });

export default mongoose.model<IFineDocument>('Fine', FineSchema);
