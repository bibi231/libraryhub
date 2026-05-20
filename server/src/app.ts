import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { corsOptions } from './config/cors';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import bookRoutes from './routes/book.routes';
import reservationRoutes from './routes/reservation.routes';
import borrowRoutes from './routes/borrow.routes';
import fineRoutes from './routes/fine.routes';
import notificationRoutes from './routes/notification.routes';
import readingListRoutes from './routes/readingList.routes';
import reportRoutes from './routes/report.routes';

import { startOverdueChecker } from './jobs/overdueChecker';
import { startReservationExpiry } from './jobs/reservationExpiry';
import { startDueReminders } from './jobs/dueReminders';

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check — start server first, then DB (Render free tier needs this)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reading-list', readingListRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

// Start HTTP listener FIRST (Render requirement), then connect DB
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB().then(() => {
    // Start cron jobs after DB connects
    startOverdueChecker();
    startReservationExpiry();
    startDueReminders();
  });
});

export default app;
