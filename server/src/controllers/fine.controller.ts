import { Response, NextFunction } from 'express';
import Fine from '../models/Fine';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';

export async function getMyFines(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const fines = await Fine.find({ patronId: req.user!.id })
      .populate('bookId', 'title authors coverImage')
      .sort({ createdAt: -1 });
    sendSuccess(res, fines);
  } catch (err) {
    next(err);
  }
}

export async function getAllFines(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [data, total] = await Promise.all([
      Fine.find(query)
        .populate('patronId', 'firstName lastName email libraryCardNumber')
        .populate('bookId', 'title authors')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Fine.countDocuments(query),
    ]);
    sendSuccess(res, { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

export async function payFine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) { sendError(res, 'Fine not found', 404); return; }
    if (fine.status !== 'pending') { sendError(res, 'Fine already resolved', 400); return; }
    fine.status = 'paid';
    fine.paidAt = new Date();
    await fine.save();
    await User.findByIdAndUpdate(fine.patronId, { $inc: { fineBalance: -fine.amount } });
    sendSuccess(res, fine, 'Fine paid');
  } catch (err) {
    next(err);
  }
}

export async function waiveFine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) { sendError(res, 'Fine not found', 404); return; }
    if (fine.status !== 'pending') { sendError(res, 'Fine already resolved', 400); return; }
    fine.status = 'waived';
    await fine.save();
    await User.findByIdAndUpdate(fine.patronId, { $inc: { fineBalance: -fine.amount } });
    sendSuccess(res, fine, 'Fine waived');
  } catch (err) {
    next(err);
  }
}
