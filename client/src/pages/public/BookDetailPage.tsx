import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Calendar, Building2, Hash, MapPin, Bookmark, Download, ExternalLink, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { BookCard } from '@/components/catalog/BookCard';
import { Button } from '@/components/ui/Button';
import { Badge, BookAvailabilityBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { generateBookPlaceholder } from '@/lib/utils';
import type { IBook } from '@libraryhub/shared';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [reserving, setReserving] = useState(false);

  const { data, isLoading } = useQuery<{ data: { data: { book: IBook; related: IBook[] } } }>({
    queryKey: ['book', id],
    queryFn: () => api.get(`/books/${id}`),
  });

  const reserve = useMutation({
    mutationFn: () => api.post('/reservations', { bookId: id }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ['book', id] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const addToList = useMutation({
    mutationFn: () => api.post(`/reading-list/${id}`),
    onSuccess: () => toast.success('Added to reading list'),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const book = data?.data?.data?.book;
  const related = data?.data?.data?.related || [];
  const cover = book ? (book.coverImage || generateBookPlaceholder(book.title)) : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
        <PublicHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            <Skeleton className="w-48 h-72 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
        <PublicHeader />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p className="font-serif text-2xl text-stone-700 dark:text-stone-300">Book not found</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const isDigital = book.format === 'ebook' || book.format === 'audiobook';
  const canReserve = book.availableCopies > 0 || (!isDigital);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
      <PublicHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-400 mb-6">
          <Link to="/catalog" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Catalog
          </Link>
          <span>/</span>
          <Link to={`/catalog?category=${book.category}`} className="hover:text-indigo-600">{book.category}</Link>
          <span>/</span>
          <span className="text-stone-600 dark:text-stone-300 truncate">{book.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
            <div className="w-48 lg:w-56 mx-auto">
              <img
                src={cover}
                alt={book.title}
                className="w-full rounded-2xl shadow-warm-xl"
                onError={(e) => { (e.target as HTMLImageElement).src = generateBookPlaceholder(book.title); }}
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="indigo">{book.category}</Badge>
              <Badge variant="default">{book.format.charAt(0).toUpperCase() + book.format.slice(1)}</Badge>
            </div>

            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-stone-500 dark:text-stone-400 mb-4">
              by {(book.authors || []).join(', ')}
            </p>

            <BookAvailabilityBadge available={book.availableCopies} total={book.totalCopies} />

            {book.description && (
              <p className="mt-5 text-stone-600 dark:text-stone-300 leading-relaxed">
                {book.description}
              </p>
            )}

            {/* Metadata */}
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {book.publisher && (
                <div className="flex items-center gap-2 text-stone-500">
                  <Building2 className="w-4 h-4 flex-shrink-0 text-stone-300" />
                  <span>{book.publisher}</span>
                </div>
              )}
              {book.publicationYear && (
                <div className="flex items-center gap-2 text-stone-500">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-stone-300" />
                  <span>{book.publicationYear}</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-2 text-stone-500">
                  <Hash className="w-4 h-4 flex-shrink-0 text-stone-300" />
                  <span className="font-mono text-xs">{book.isbn}</span>
                </div>
              )}
              {book.shelfLocation && (
                <div className="flex items-center gap-2 text-stone-500">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-stone-300" />
                  <span>Shelf {book.shelfLocation}</span>
                </div>
              )}
            </dl>

            {/* Tags */}
            {(book.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(book.tags || []).map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-stone-100 dark:bg-navy-700 text-stone-600 dark:text-stone-300 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Popularity */}
            <p className="mt-4 text-xs text-stone-400">
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              Borrowed {book.totalBorrows} times
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              {book.format === 'ebook' ? (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<BookOpen className="w-4 h-4" />}
                    onClick={() => navigate(`/ebooks/${book._id}/read`)}
                  >
                    Read Online
                  </Button>
                  {(book.ebookUrl || book.digitalUrl) && (
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<ExternalLink className="w-4 h-4" />}
                      onClick={() => window.open(book.ebookUrl || book.digitalUrl, '_blank')}
                    >
                      Open Source
                    </Button>
                  )}
                </>
              ) : book.format === 'audiobook' ? (
                <>
                  {(book.audiobookUrl || book.digitalUrl) && (
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<Headphones className="w-4 h-4" />}
                      onClick={() => window.open(book.audiobookUrl || book.digitalUrl, '_blank')}
                    >
                      Listen Now
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => window.open(book.audiobookUrl || book.digitalUrl, '_blank')}
                  >
                    Open Source
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  loading={reserve.isPending}
                  onClick={() => {
                    if (!isAuthenticated) { navigate('/login'); return; }
                    reserve.mutate();
                  }}
                  disabled={book.availableCopies === 0 && book.totalCopies !== 999}
                >
                  {book.availableCopies === 0 ? 'Join Waitlist' : 'Reserve Book'}
                </Button>
              )}

              {isAuthenticated && (
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Bookmark className="w-4 h-4" />}
                  onClick={() => addToList.mutate()}
                >
                  Save
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related books */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">
              More in {book.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {related.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
