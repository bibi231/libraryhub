import mongoose, { Document, Schema } from 'mongoose';
import type { BookFormat, BookCondition, BookCategory } from '@libraryhub/shared';

export interface IBookDocument extends Document {
  title: string;
  authors: string[];
  isbn: string;
  publisher: string;
  publicationYear: number;
  category: BookCategory;
  genre: string[];
  format: BookFormat;
  description: string;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  condition: BookCondition;
  tags: string[];
  digitalUrl?: string;
  totalBorrows: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBookDocument>(
  {
    title: { type: String, required: true, trim: true },
    authors: [{ type: String, required: true }],
    isbn: { type: String, trim: true },
    publisher: { type: String, trim: true },
    publicationYear: { type: Number },
    category: {
      type: String,
      enum: [
        'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
        "Children's", 'Reference', 'Biography', 'Philosophy', 'Arts',
        'Religion', 'Law', 'Medicine', 'Business',
      ],
      required: true,
    },
    genre: [{ type: String }],
    format: {
      type: String,
      enum: ['physical', 'ebook', 'audiobook', 'journal', 'magazine'],
      required: true,
    },
    description: { type: String },
    coverImage: { type: String, default: '' },
    totalCopies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
    shelfLocation: { type: String },
    condition: { type: String, enum: ['good', 'fair', 'poor', 'damaged'], default: 'good' },
    tags: [{ type: String }],
    digitalUrl: { type: String },
    totalBorrows: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BookSchema.index({ title: 'text', authors: 'text', description: 'text', tags: 'text' });
BookSchema.index({ category: 1 });
BookSchema.index({ format: 1 });
BookSchema.index({ availableCopies: 1 });
BookSchema.index({ totalBorrows: -1 });

export default mongoose.model<IBookDocument>('Book', BookSchema);
