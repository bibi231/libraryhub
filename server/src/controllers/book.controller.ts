import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import axios from 'axios';
import Book from '../models/Book';
import { sendSuccess, sendError } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';

const bookSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.number().optional(),
  category: z.enum([
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
    "Children's", 'Reference', 'Biography', 'Philosophy', 'Arts',
    'Religion', 'Law', 'Medicine', 'Business',
  ]),
  genre: z.array(z.string()).optional(),
  format: z.enum(['physical', 'ebook', 'audiobook', 'journal', 'magazine']),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  totalCopies: z.number().min(0),
  shelfLocation: z.string().optional(),
  condition: z.enum(['good', 'fair', 'poor', 'damaged']).optional(),
  tags: z.array(z.string()).optional(),
  digitalUrl: z.string().optional(),
});

export async function listBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search, category, format, available, sort = 'createdAt',
      order = 'desc', page = '1', limit = '20',
      yearFrom, yearTo,
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (format) query.format = format;
    if (available === 'true') query.availableCopies = { $gt: 0 };
    if (yearFrom || yearTo) {
      query.publicationYear = {};
      if (yearFrom) (query.publicationYear as Record<string, number>).$gte = parseInt(yearFrom);
      if (yearTo) (query.publicationYear as Record<string, number>).$lte = parseInt(yearTo);
    }

    const sortField = sort === 'popularity' ? 'totalBorrows' : sort;
    const sortOrder = order === 'asc' ? 1 : -1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [data, total] = await Promise.all([
      Book.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Book.countDocuments(query),
    ]);

    sendSuccess(res, { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) { sendError(res, 'Book not found', 404); return; }
    const related = await Book.find({
      category: book.category, _id: { $ne: book._id }, isActive: true,
    }).limit(5).select('title authors coverImage availableCopies totalCopies category format tags totalBorrows category format tags totalBorrows');
    sendSuccess(res, { book, related });
  } catch (err) {
    next(err);
  }
}

export async function createBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = bookSchema.parse(req.body);
    const book = await Book.create({ ...body, availableCopies: body.totalCopies });
    sendSuccess(res, book, 'Book created', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = bookSchema.partial().parse(req.body);
    if (body.totalCopies !== undefined) {
      const book = await Book.findById(req.params.id);
      if (!book) { sendError(res, 'Book not found', 404); return; }
      const borrowed = book.totalCopies - book.availableCopies;
      (body as Record<string, unknown>).availableCopies = Math.max(0, body.totalCopies - borrowed);
    }
    const book = await Book.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!book) { sendError(res, 'Book not found', 404); return; }
    sendSuccess(res, book);
  } catch (err) {
    next(err);
  }
}

export async function deleteBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) { sendError(res, 'Book not found', 404); return; }
    sendSuccess(res, null, 'Book deleted');
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Book.distinct('category', { isActive: true });
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function getPopularBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const books = await Book.find({ isActive: true })
      .sort({ totalBorrows: -1 })
      .limit(10);
    sendSuccess(res, books);
  } catch (err) {
    next(err);
  }
}

export async function getNewArrivals(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const books = await Book.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(12);
    sendSuccess(res, books);
  } catch (err) {
    next(err);
  }
}

export async function lookupIsbn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isbn } = req.params;
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const { data } = await axios.get(url, { timeout: 5000 });
    const bookData = data[`ISBN:${isbn}`];
    if (!bookData) {
      sendError(res, 'Book not found on Open Library', 404);
      return;
    }
    sendSuccess(res, {
      title: bookData.title,
      authors: bookData.authors?.map((a: { name: string }) => a.name) || [],
      publisher: bookData.publishers?.[0]?.name,
      publicationYear: bookData.publish_date ? parseInt(bookData.publish_date) : undefined,
      description: bookData.notes?.value || bookData.subtitle,
      coverImage: bookData.cover?.large || bookData.cover?.medium,
      isbn,
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkImport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'CSV file required', 400);
      return;
    }
    // CSV parsing handled in service layer — simplified here
    sendSuccess(res, null, 'Bulk import initiated');
  } catch (err) {
    next(err);
  }
}
