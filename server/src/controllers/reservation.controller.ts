import { Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Reservation from '../models/Reservation';
import Book from '../models/Book';
import { sendSuccess, sendError } from '../utils/response';
import { notifyReservationReady } from '../services/notification.service';
import type { AuthRequest } from '../middleware/auth';

export async function createReservation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookId } = z.object({ bookId: z.string() }).parse(req.body);
    const patronId = req.user!.id;

    const existing = await Reservation.findOne({
      patronId, bookId, status: { $in: ['pending', 'ready'] },
    });
    if (existing) {
      sendError(res, 'You already have an active reservation for this book', 400);
      return;
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      sendError(res, 'Book not found', 404);
      return;
    }

    const waitlistCount = await Reservation.countDocuments({
      bookId, status: { $in: ['pending', 'ready'] },
    });

    let status: 'pending' | 'ready' = 'pending';
    let waitlistPosition = 0;
    let expiresAt: Date | undefined;

    if (book.availableCopies > 0 && waitlistCount === 0) {
      status = 'ready';
      expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
      book.availableCopies -= 1;
      await book.save();
    } else {
      waitlistPosition = waitlistCount + 1;
    }

    const reservation = await Reservation.create({
      patronId: new mongoose.Types.ObjectId(patronId),
      bookId: new mongoose.Types.ObjectId(bookId),
      status,
      waitlistPosition,
      reservedAt: new Date(),
      expiresAt,
    });

    if (status === 'ready') {
      await notifyReservationReady(patronId, book.title, bookId);
    }

    sendSuccess(res, reservation, status === 'ready'
      ? 'Book reserved! Pick up within 48 hours.'
      : `Added to waitlist at position #${waitlistPosition}`, 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyReservations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const reservations = await Reservation.find({ patronId: req.user!.id })
      .populate('bookId', 'title authors coverImage category')
      .sort({ createdAt: -1 });
    sendSuccess(res, reservations);
  } catch (err) {
    next(err);
  }
}

export async function cancelReservation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) { sendError(res, 'Reservation not found', 404); return; }
    if (reservation.patronId.toString() !== req.user!.id && req.user!.role === 'patron') {
      sendError(res, 'Not your reservation', 403);
      return;
    }
    if (!['pending', 'ready'].includes(reservation.status)) {
      sendError(res, 'Cannot cancel this reservation', 400);
      return;
    }

    if (reservation.status === 'ready') {
      await Book.findByIdAndUpdate(reservation.bookId, { $inc: { availableCopies: 1 } });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    await promoteNextInWaitlist(reservation.bookId.toString());
    sendSuccess(res, null, 'Reservation cancelled');
  } catch (err) {
    next(err);
  }
}

export async function fulfillReservation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const reservation = await Reservation.findById(req.params.id).populate<{ bookId: { title: string } }>('bookId', 'title');
    if (!reservation) { sendError(res, 'Reservation not found', 404); return; }
    if (reservation.status !== 'ready') {
      sendError(res, 'Reservation is not in ready status', 400);
      return;
    }
    reservation.status = 'fulfilled';
    reservation.fulfilledAt = new Date();
    await reservation.save();
    sendSuccess(res, reservation, 'Reservation fulfilled');
  } catch (err) {
    next(err);
  }
}

export async function getAllReservations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [data, total] = await Promise.all([
      Reservation.find(query)
        .populate('patronId', 'firstName lastName email libraryCardNumber')
        .populate('bookId', 'title authors coverImage')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Reservation.countDocuments(query),
    ]);
    sendSuccess(res, { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

async function promoteNextInWaitlist(bookId: string) {
  const book = await Book.findById(bookId);
  if (!book || book.availableCopies === 0) return;

  const next = await Reservation.findOne({
    bookId, status: 'pending',
  }).sort({ createdAt: 1 });

  if (!next) return;

  next.status = 'ready';
  next.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  next.waitlistPosition = 0;
  await next.save();

  book.availableCopies -= 1;
  await book.save();

  const bookDoc = await Book.findById(bookId);
  if (bookDoc) {
    await notifyReservationReady(next.patronId.toString(), bookDoc.title, bookId);
  }

  await Reservation.updateMany(
    { bookId, status: 'pending', _id: { $ne: next._id } },
    { $inc: { waitlistPosition: -1 } }
  );
}

export { promoteNextInWaitlist };
