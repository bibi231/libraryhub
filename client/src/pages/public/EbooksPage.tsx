import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { BookCard } from '@/components/catalog/BookCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { IBook, PaginatedResponse } from '@libraryhub/shared';

export function EbooksPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<IBook>>({
    queryKey: ['ebooks'],
    queryFn: () => api.get('/books', { params: { format: 'ebook', limit: 50 } }).then((r) => r.data.data),
  });

  const books = data?.data || [];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
      <PublicHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" /> Free E-Books
          </div>
          <h1 className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-50">Digital Library</h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400 max-w-2xl">
            Read classic and contemporary titles online — no signup required for public domain works.
            Powered by Project Gutenberg and Internet Archive.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500">No e-books available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <div key={book._id} className="relative group">
                <BookCard book={book} />
                {(book.ebookUrl || book.digitalUrl) && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                    <Link
                      to={`/ebooks/${book._id}/read`}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" /> Read
                    </Link>
                    <a
                      href={book.ebookUrl || book.digitalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-indigo-600 rounded-2xl p-8 text-center text-white">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h2 className="font-serif text-2xl font-bold mb-2">Want physical books too?</h2>
          <p className="text-indigo-200 mb-5 max-w-md mx-auto text-sm">
            Browse our full catalog and reserve physical copies at your nearest branch.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
          >
            Browse Full Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
