import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Book from '../models/Book';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';

// Store reading list as array on user document via a separate schema-less array
// Using a simple approach: store bookIds in user's favoriteCategories-style array
// For production, would be a separate collection; here embedding in user for simplicity

const ReadingListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  addedAt: { type: Date, default: Date.now },
});
ReadingListSchema.index({ userId: 1, bookId: 1 }, { unique: true });
const ReadingList = mongoose.models.ReadingList || mongoose.model('ReadingList', ReadingListSchema);

export async function addToReadingList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) { sendError(res, 'Book not found', 404); return; }
    await ReadingList.create({ userId: req.user!.id, bookId: req.params.bookId });
    sendSuccess(res, null, 'Added to reading list', 201);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      sendError(res, 'Already in reading list', 400);
      return;
    }
    next(err);
  }
}

export async function removeFromReadingList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await ReadingList.findOneAndDelete({ userId: req.user!.id, bookId: req.params.bookId });
    sendSuccess(res, null, 'Removed from reading list');
  } catch (err) {
    next(err);
  }
}

export async function getReadingList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = await ReadingList.find({ userId: req.user!.id })
      .populate('bookId', 'title authors coverImage category format availableCopies totalCopies')
      .sort({ addedAt: -1 });
    sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
}
