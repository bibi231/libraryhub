import Notification from '../models/Notification';
import type { NotificationType } from '@libraryhub/shared';
import mongoose from 'mongoose';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedBookId?: string;
  relatedBorrowId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return Notification.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    type: params.type,
    title: params.title,
    message: params.message,
    relatedBookId: params.relatedBookId ? new mongoose.Types.ObjectId(params.relatedBookId) : undefined,
    relatedBorrowId: params.relatedBorrowId ? new mongoose.Types.ObjectId(params.relatedBorrowId) : undefined,
  });
}

export async function notifyReservationReady(userId: string, bookTitle: string, bookId: string) {
  return createNotification({
    userId,
    type: 'reservation_ready',
    title: 'Book Ready for Pickup',
    message: `"${bookTitle}" is now available for pickup. Please collect it within 48 hours.`,
    relatedBookId: bookId,
  });
}

export async function notifyDueReminder(userId: string, bookTitle: string, bookId: string, borrowId: string, daysLeft: number) {
  return createNotification({
    userId,
    type: 'due_reminder',
    title: `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    message: `"${bookTitle}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Please return or renew it on time.`,
    relatedBookId: bookId,
    relatedBorrowId: borrowId,
  });
}

export async function notifyOverdue(userId: string, bookTitle: string, bookId: string, borrowId: string, fine: number) {
  return createNotification({
    userId,
    type: 'overdue',
    title: 'Overdue Book',
    message: `"${bookTitle}" is overdue. Current fine: ₦${fine}. Please return it immediately.`,
    relatedBookId: bookId,
    relatedBorrowId: borrowId,
  });
}

export async function notifyFine(userId: string, amount: number, reason: string) {
  return createNotification({
    userId,
    type: 'fine',
    title: 'Fine Added to Your Account',
    message: `A fine of ₦${amount} has been added to your account. Reason: ${reason}.`,
  });
}

export async function notifyWaitlistUpdate(userId: string, bookTitle: string, bookId: string, position: number) {
  return createNotification({
    userId,
    type: 'waitlist_update',
    title: 'Waitlist Update',
    message: `Your position for "${bookTitle}" is now #${position} on the waitlist.`,
    relatedBookId: bookId,
  });
}
