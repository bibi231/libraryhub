import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Headphones, Play, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { generateBookPlaceholder } from '@/lib/utils';
import type { IBook, PaginatedResponse } from '@libraryhub/shared';

const SOURCE_LABELS: Record<string, string> = {
  librivox: 'LibriVox',
  gutenberg: 'Gutenberg',
  archive: 'Archive.org',
};

export function AudiobooksPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<IBook>>({
    queryKey: ['audiobooks'],
    queryFn: () => api.get('/books', { params: { format: 'audiobook', limit: 50 } }).then((r) => r.data.data),
  });

  const books = data?.data || [];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
      <PublicHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium mb-4">
            <Headphones className="w-4 h-4" /> Free Audiobooks
          </div>
          <h1 className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-50">Audiobooks</h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400 max-w-2xl">
            Listen to classic titles read by volunteers — completely free.
            Powered by LibriVox and Internet Archive.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <Headphones className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-stone-500">No audiobooks available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, i) => {
              const listenUrl = book.audiobookUrl || book.digitalUrl;
              return (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-stone-100 dark:border-navy-700 shadow-warm flex gap-4 hover:shadow-warm-lg transition-shadow"
                >
                  <img
                    src={book.coverImage || generateBookPlaceholder(book.title)}
                    alt={book.title}
                    className="w-20 h-24 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).src = generateBookPlaceholder(book.title); }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-medium mb-2">
                      <Headphones className="w-3 h-3" />
                      {book.mediaType ? SOURCE_LABELS[book.mediaType] || book.mediaType : 'Free'}
                    </span>
                    <h3 className="font-serif font-bold text-stone-900 dark:text-stone-50 text-base leading-tight truncate">
                      {book.title}
                    </h3>
                    <p className="text-stone-400 text-xs mb-3 truncate">{book.authors.join(', ')}</p>
                    <div className="flex gap-2">
                      {listenUrl ? (
                        <>
                          <a
                            href={listenUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Play className="w-3 h-3" /> Listen
                          </a>
                          <a
                            href={listenUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 dark:border-navy-600 text-stone-600 dark:text-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-50 dark:hover:bg-navy-700 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </>
                      ) : (
                        <Link
                          to={`/books/${book._id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Play className="w-3 h-3" /> Details
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-teal-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <Headphones className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h2 className="font-serif text-2xl font-bold mb-2">Prefer reading?</h2>
          <p className="text-teal-100 mb-5 max-w-md mx-auto text-sm">
            Browse our e-book collection or reserve physical books from the full catalog.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/ebooks"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors text-sm"
            >
              E-Books <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors text-sm"
            >
              Full Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
