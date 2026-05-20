import mongoose, { Document, Schema } from 'mongoose';
import type { NotificationType } from '@libraryhub/shared';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedBookId?: mongoose.Types.ObjectId;
  relatedBorrowId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['reservation_ready', 'due_reminder', 'overdue', 'waitlist_update', 'fine', 'new_arrival'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedBookId: { type: Schema.Types.ObjectId, ref: 'Book' },
    relatedBorrowId: { type: Schema.Types.ObjectId, ref: 'Borrow' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotificationDocument>('Notification', NotificationSchema);
