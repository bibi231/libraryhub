import { Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Borrow from '../models/Borrow';
import Book from '../models/Book';
import Fine from '../models/Fine';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { calculateOverdueFine } from '../utils/fineCalculator';
import { notifyFine } from '../services/notification.service';
import { promoteNextInWaitlist } from './reservation.controller';
import type { AuthRequest } from '../middleware/auth';

const BORROW_DAYS = 14;
const RENEW_DAYS = 7;

export async function checkout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patronId, bookIds } = z.object({
      patronId: z.string(),
      bookIds: z.array(z.string()).min(1),
    }).parse(req.body);

    const patron = await User.findById(patronId);
    if (!patron || !patron.isActive) {
      sendError(res, 'Patron not found or inactive', 404);
      return;
    }

    const borrows = [];
    for (const bookId of bookIds) {
      const book = await Book.findById(bookId);
      if (!book || book.availableCopies === 0) {
        sendError(res, `Book "${book?.title || bookId}" not available`, 400);
        return;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

      const borrow = await Borrow.create({
        patronId: new mongoose.Types.ObjectId(patronId),
        bookId: new mongoose.Types.ObjectId(bookId),
        librarianId: new mongoose.Types.ObjectId(req.user!.id),
        borrowDate: new Date(),
        dueDate,
        conditionAtBorrow: book.condition,
      });

      book.availableCopies -= 1;
      book.totalBorrows += 1;
      await book.save();
      borrows.push(borrow);
    }

    sendSuccess(res, borrows, 'Books checked out successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function returnBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { borrowId, condition } = z.object({
      borrowId: z.string(),
      condition: z.enum(['good', 'fair', 'poor', 'damaged']).optional(),
    }).parse(req.body);

    const borrow = await Borrow.findById(borrowId).populate<{ bookId: { _id: mongoose.Types.ObjectId; title: string; condition: string; availableCopies: number; totalCopies: number } }>('bookId');
    if (!borrow) { sendError(res, 'Borrow record not found', 404); return; }
    if (borrow.status === 'returned') { sendError(res, 'Book already returned', 400); return; }

    const returnDate = new Date();
    const fine = calculateOverdueFine(borrow.dueDate, returnDate);

    borrow.returnDate = returnDate;
    borrow.status = 'returned';
    borrow.conditionAtReturn = condition || 'good';
    borrow.fine = fine;
    await borrow.save();

    const book = borrow.bookId;
    await Book.findByIdAndUpdate(book._id, {
      $inc: { availableCopies: 1 },
      ...(condition && { condition }),
    });

    if (fine > 0) {
      await Fine.create({
        patronId: borrow.patronId,
        borrowId: borrow._id,
        bookId: book._id,
        amount: fine,
        reason: 'overdue',
      });
      await User.findByIdAndUpdate(borrow.patronId, { $inc: { fineBalance: fine } });
      await notifyFine(borrow.patronId.toString(), fine, 'overdue return');
    }

    await promoteNextInWaitlist(book._id.toString());

    sendSuccess(res, { borrow, fine }, fine > 0 ? `Book returned. Fine: ₦${fine}` : 'Book returned successfully');
  } catch (err) {
    next(err);
  }
}

export async function renewBorrow(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) { sendError(res, 'Borrow not found', 404); return; }
    if (borrow.patronId.toString() !== req.user!.id) {
      sendError(res, 'Not your borrow', 403); return;
    }
    if (borrow.renewals >= borrow.maxRenewals) {
      sendError(res, 'Maximum renewals reached', 400); return;
    }
    if (borrow.status !== 'active') {
      sendError(res, 'Can only renew active borrows', 400); return;
    }

    const waitlist = await (await import('../models/Reservation')).default.countDocuments({
      bookId: borrow.bookId, status: 'pending',
    });
    if (waitlist > 0) {
      sendError(res, 'Cannot renew — others are waiting for this book', 400); return;
    }

    borrow.dueDate = new Date(borrow.dueDate.getTime() + RENEW_DAYS * 24 * 60 * 60 * 1000);
    borrow.renewals += 1;
    await borrow.save();
    sendSuccess(res, borrow, `Renewed. New due date: ${borrow.dueDate.toDateString()}`);
  } catch (err) {
    next(err);
  }
}

export async function getMyBorrows(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const borrows = await Borrow.find({ patronId: req.user!.id, status: { $in: ['active', 'overdue'] } })
      .populate('bookId', 'title authors coverImage category')
      .sort({ dueDate: 1 });
    sendSuccess(res, borrows);
  } catch (err) {
    next(err);
  }
}

export async function getMyBorrowHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [data, total] = await Promise.all([
      Borrow.find({ patronId: req.user!.id, status: 'returned' })
        .populate('bookId', 'title authors coverImage category')
        .sort({ returnDate: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Borrow.countDocuments({ patronId: req.user!.id, status: 'returned' }),
    ]);
    sendSuccess(res, { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

export async function getOverdueBorrows(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const borrows = await Borrow.find({ status: { $in: ['overdue', 'active'], }, dueDate: { $lt: new Date() } })
      .populate('patronId', 'firstName lastName email libraryCardNumber phone')
      .populate('bookId', 'title authors')
      .sort({ dueDate: 1 });
    sendSuccess(res, borrows);
  } catch (err) {
    next(err);
  }
}

export async function getActiveBorrows(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [data, total] = await Promise.all([
      Borrow.find({ status: { $in: ['active', 'overdue'] } })
        .populate('patronId', 'firstName lastName email libraryCardNumber')
        .populate('bookId', 'title authors')
        .sort({ dueDate: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Borrow.countDocuments({ status: { $in: ['active', 'overdue'] } }),
    ]);
    sendSuccess(res, { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}
