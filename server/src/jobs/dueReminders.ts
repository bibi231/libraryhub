import cron from 'node-cron';
import Borrow from '../models/Borrow';
import { notifyDueReminder } from '../services/notification.service';

export function startDueReminders() {
  // Run daily at 9am
  cron.schedule('0 9 * * *', async () => {
    try {
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

      const dueSoon = await Borrow.find({
        status: 'active',
        dueDate: { $gte: now, $lte: in3Days },
      }).populate<{ bookId: { title: string } }>('bookId', 'title');

      for (const borrow of dueSoon) {
        const msLeft = borrow.dueDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
        if (daysLeft === 3 || daysLeft === 1) {
          await notifyDueReminder(
            borrow.patronId.toString(),
            borrow.bookId.title,
            borrow.bookId.toString(),
            borrow._id.toString(),
            daysLeft
          );
        }
      }
    } catch (err) {
      console.error('Due reminders error:', err);
    }
  });
}
