import cron from 'node-cron';
import Borrow from '../models/Borrow';
import Fine from '../models/Fine';
import User from '../models/User';
import { calculateOverdueFine } from '../utils/fineCalculator';
import { notifyOverdue } from '../services/notification.service';

export function startOverdueChecker() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running overdue checker...');
    try {
      const now = new Date();
      const activeBorrows = await Borrow.find({
        status: 'active',
        dueDate: { $lt: now },
      }).populate<{ bookId: { title: string } }>('bookId', 'title');

      for (const borrow of activeBorrows) {
        borrow.status = 'overdue';
        const fine = calculateOverdueFine(borrow.dueDate, now);
        borrow.fine = fine;
        await borrow.save();

        const existingFine = await Fine.findOne({ borrowId: borrow._id, status: 'pending' });
        if (!existingFine && fine > 0) {
          await Fine.create({
            patronId: borrow.patronId,
            borrowId: borrow._id,
            bookId: borrow.bookId,
            amount: fine,
            reason: 'overdue',
          });
          await User.findByIdAndUpdate(borrow.patronId, { fineBalance: fine });
          await notifyOverdue(
            borrow.patronId.toString(),
            borrow.bookId.title,
            borrow.bookId.toString(),
            borrow._id.toString(),
            fine
          );
        }
      }
      console.log(`Overdue checker: processed ${activeBorrows.length} borrows`);
    } catch (err) {
      console.error('Overdue checker error:', err);
    }
  });
}
