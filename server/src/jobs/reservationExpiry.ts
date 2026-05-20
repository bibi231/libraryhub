import cron from 'node-cron';
import Reservation from '../models/Reservation';
import Book from '../models/Book';
import { promoteNextInWaitlist } from '../controllers/reservation.controller';

export function startReservationExpiry() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const expired = await Reservation.find({
        status: 'ready',
        expiresAt: { $lt: new Date() },
      });

      for (const res of expired) {
        res.status = 'expired';
        await res.save();
        await Book.findByIdAndUpdate(res.bookId, { $inc: { availableCopies: 1 } });
        await promoteNextInWaitlist(res.bookId.toString());
      }

      if (expired.length > 0) {
        console.log(`Reservation expiry: expired ${expired.length} reservations`);
      }
    } catch (err) {
      console.error('Reservation expiry error:', err);
    }
  });
}
