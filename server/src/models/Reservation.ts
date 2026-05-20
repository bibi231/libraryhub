import mongoose, { Document, Schema } from 'mongoose';
import type { ReservationStatus } from '@libraryhub/shared';

export interface IReservationDocument extends Document {
  patronId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  status: ReservationStatus;
  waitlistPosition: number;
  reservedAt: Date;
  expiresAt: Date;
  fulfilledAt?: Date;
  createdAt: Date;
}

const ReservationSchema = new Schema<IReservationDocument>(
  {
    patronId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    status: {
      type: String,
      enum: ['pending', 'ready', 'fulfilled', 'expired', 'cancelled'],
      default: 'pending',
    },
    waitlistPosition: { type: Number, default: 0 },
    reservedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    fulfilledAt: { type: Date },
  },
  { timestamps: true }
);

ReservationSchema.index({ patronId: 1 });
ReservationSchema.index({ bookId: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ expiresAt: 1 });

export default mongoose.model<IReservationDocument>('Reservation', ReservationSchema);
