import { Response, NextFunction } from 'express';
import { stringify } from 'csv-stringify/sync';
import Book from '../models/Book';
import User from '../models/User';
import Borrow from '../models/Borrow';
import Fine from '../models/Fine';
import Reservation from '../models/Reservation';
import { sendSuccess } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';

export async function getOverview(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalBooks, totalPatrons, activeBorrows, overdueCount, pendingFines] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'patron', isActive: true }),
      Borrow.countDocuments({ status: { $in: ['active', 'overdue'] } }),
      Borrow.countDocuments({ status: 'overdue' }),
      Fine.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    sendSuccess(res, {
      totalBooks,
      totalPatrons,
      activeBorrows,
      overdueCount,
      totalPendingFines: pendingFines[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCirculationReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to } = req.query as Record<string, string>;
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const borrows = await Borrow.aggregate([
      { $match: { borrowDate: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$borrowDate' } },
          borrows: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const returns = await Borrow.aggregate([
      { $match: { returnDate: { $gte: fromDate, $lte: toDate, $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$returnDate' } },
          returns: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendSuccess(res, { borrows, returns });
  } catch (err) {
    next(err);
  }
}

export async function getPopularReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { period = '30' } = req.query as Record<string, string>;
    const since = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const popular = await Borrow.aggregate([
      { $match: { borrowDate: { $gte: since } } },
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $project: {
          title: '$book.title',
          authors: '$book.authors',
          coverImage: '$book.coverImage',
          category: '$book.category',
          count: 1,
        },
      },
    ]);
    sendSuccess(res, popular);
  } catch (err) {
    next(err);
  }
}

export async function getOverdueReport(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const overdue = await Borrow.find({ status: { $in: ['active', 'overdue'] }, dueDate: { $lt: new Date() } })
      .populate('patronId', 'firstName lastName email libraryCardNumber phone')
      .populate('bookId', 'title authors isbn')
      .sort({ dueDate: 1 });
    sendSuccess(res, overdue);
  } catch (err) {
    next(err);
  }
}

export async function getInventoryReport(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [byCategory, byFormat, byCondition, lowStock] = await Promise.all([
      Book.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalCopies: { $sum: '$totalCopies' } } },
        { $sort: { count: -1 } },
      ]),
      Book.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$format', count: { $sum: 1 } } },
      ]),
      Book.aggregate([
        { $match: { isActive: true, format: 'physical' } },
        { $group: { _id: '$condition', count: { $sum: 1 } } },
      ]),
      Book.find({ isActive: true, availableCopies: { $lte: 1 } })
        .select('title authors availableCopies totalCopies')
        .limit(20),
    ]);
    sendSuccess(res, { byCategory, byFormat, byCondition, lowStock });
  } catch (err) {
    next(err);
  }
}

export async function getPatronActivityReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to } = req.query as Record<string, string>;
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const [mostActive, newRegistrations] = await Promise.all([
      Borrow.aggregate([
        { $match: { borrowDate: { $gte: fromDate, $lte: toDate } } },
        { $group: { _id: '$patronId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'patron',
          },
        },
        { $unwind: '$patron' },
        {
          $project: {
            name: { $concat: ['$patron.firstName', ' ', '$patron.lastName'] },
            email: '$patron.email',
            libraryCardNumber: '$patron.libraryCardNumber',
            count: 1,
          },
        },
      ]),
      User.aggregate([
        { $match: { role: 'patron', createdAt: { $gte: fromDate, $lte: toDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    sendSuccess(res, { mostActive, newRegistrations });
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type } = req.params;
    const { format = 'csv' } = req.query as Record<string, string>;

    let data: Record<string, unknown>[] = [];
    let filename = 'report';

    switch (type) {
      case 'overdue': {
        const overdue = await Borrow.find({ status: { $in: ['active', 'overdue'] }, dueDate: { $lt: new Date() } })
          .populate<{ patronId: { firstName: string; lastName: string; email: string; libraryCardNumber: string } }>('patronId', 'firstName lastName email libraryCardNumber')
          .populate<{ bookId: { title: string; isbn: string } }>('bookId', 'title isbn');
        data = overdue.map((b) => ({
          patron: `${b.patronId.firstName} ${b.patronId.lastName}`,
          email: b.patronId.email,
          cardNumber: b.patronId.libraryCardNumber,
          book: b.bookId.title,
          dueDate: b.dueDate.toISOString().split('T')[0],
          fine: b.fine,
        }));
        filename = 'overdue-report';
        break;
      }
      default:
        data = [];
    }

    if (format === 'csv') {
      const csv = stringify(data, { header: true });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      res.send(csv);
    } else {
      res.json({ success: true, data });
    }
  } catch (err) {
    next(err);
  }
}
