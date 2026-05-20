import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import type { IBook } from '@libraryhub/shared';
import { BookAvailabilityBadge } from '@/components/ui/Badge';
import { generateBookPlaceholder } from '@/lib/utils';

interface BookCardProps {
  book: IBook;
  onAddToList?: (bookId: string) => void;
  inList?: boolean;
}

const formatColors: Record<string, string> = {
  physical: 'bg-stone-100 text-stone-600',
  ebook: 'bg-indigo-100 text-indigo-700',
  audiobook: 'bg-teal-100 text-teal-700',
  journal: 'bg-amber-100 text-amber-700',
  magazine: 'bg-pink-100 text-pink-700',
};

const formatLabels: Record<string, string> = {
  physical: 'Physical',
  ebook: 'E-Book',
  audiobook: 'Audio',
  journal: 'Journal',
  magazine: 'Magazine',
};

export function BookCard({ book, onAddToList, inList }: BookCardProps) {
  const cover = book.coverImage || generateBookPlaceholder(book.title);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-navy-800 rounded-2xl shadow-warm border border-stone-100 dark:border-navy-700 overflow-hidden group"
    >
      <Link to={`/books/${book._id}`} className="block">
        {/* Cover */}
        <div className="relative h-52 overflow-hidden bg-stone-50 dark:bg-navy-700">
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generateBookPlaceholder(book.title);
            }}
            loading="lazy"
          />
          {/* Format badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${formatColors[book.format] || formatColors.physical}`}>
              {formatLabels[book.format] || book.format}
            </span>
          </div>
          {/* Category bookmark */}
          <div className="absolute top-0 right-3 w-6 h-10 bg-terracotta-600 flex items-end justify-center pb-1.5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}>
            <span className="text-white" style={{ fontSize: 7, lineHeight: 1 }}>
              {(book.category || 'GEN').slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-50 text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 truncate">
            {(book.authors || []).join(', ')}
          </p>
          <div className="mt-3">
            <BookAvailabilityBadge available={book.availableCopies} total={book.totalCopies} />
          </div>
        </div>
      </Link>

      {onAddToList && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => { e.preventDefault(); onAddToList(book._id); }}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              inList ? 'text-indigo-600' : 'text-stone-400 hover:text-indigo-600'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${inList ? 'fill-current' : ''}`} />
            {inList ? 'Saved' : 'Save'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
