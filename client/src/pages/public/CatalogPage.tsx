import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { BookCard } from '@/components/catalog/BookCard';
import { SearchBar } from '@/components/catalog/SearchBar';
import { Select } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { BOOK_CATEGORIES, BOOK_FORMATS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import type { IBook, PaginatedResponse } from '@libraryhub/shared';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [format, setFormat] = useState(searchParams.get('format') || '');
  const [available, setAvailable] = useState(searchParams.get('available') || '');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [readingList, setReadingList] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (format) params.format = format;
    if (available) params.available = available;
    setSearchParams(params);
    setPage(1);
  }, [search, category, format, available]);

  const queryKey = ['books', { search, category, format, available, sort, page }];
  const { data, isLoading } = useQuery<PaginatedResponse<IBook>>({
    queryKey,
    queryFn: () => api.get('/books', { params: { search, category, format, available, sort, page, limit: 20 } }).then((r) => r.data.data as PaginatedResponse<IBook>),
  });

  const addToList = useMutation({
    mutationFn: (bookId: string) => api.post(`/reading-list/${bookId}`),
    onSuccess: (_, bookId) => {
      setReadingList((s) => new Set([...s, bookId]));
      toast.success('Added to reading list');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const books = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const activeFilters = [
    category && { label: category, clear: () => setCategory('') },
    format && { label: BOOK_FORMATS.find((f) => f.value === format)?.label || format, clear: () => setFormat('') },
    available === 'true' && { label: 'Available only', clear: () => setAvailable('') },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">Library Catalog</h1>
          <p className="mt-1 text-stone-500 dark:text-stone-400">{total.toLocaleString()} items in collection</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <SearchBar initialValue={search} onSearch={setSearch} size="md" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-stone-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-stone-600 dark:text-stone-300 hover:border-indigo-300'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:block">Filters</span>
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>
          <div className="flex gap-1 bg-white dark:bg-navy-700 border border-stone-200 dark:border-navy-600 rounded-xl p-1">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-stone-400 hover:text-stone-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-stone-400 hover:text-stone-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-navy-800 rounded-2xl border border-stone-100 dark:border-navy-700 p-4 mb-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={BOOK_CATEGORIES.map((c) => ({ value: c, label: c }))}
                placeholder="All Categories"
              />
              <Select
                label="Format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={BOOK_FORMATS.map((f) => ({ value: f.value, label: f.label }))}
                placeholder="All Formats"
              />
              <Select
                label="Availability"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                options={[{ value: 'true', label: 'Available Now' }]}
                placeholder="All Books"
              />
              <Select
                label="Sort By"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                options={[
                  { value: 'createdAt', label: 'Date Added' },
                  { value: 'popularity', label: 'Most Popular' },
                  { value: 'title', label: 'Title A-Z' },
                ]}
              />
            </div>
          </motion.div>
        )}

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.clear}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium hover:bg-indigo-200 transition-colors"
              >
                {f.label} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <p className="font-serif text-xl font-bold text-stone-700 dark:text-stone-300">No books found</p>
            <p className="text-stone-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className={`gap-4 ${view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'flex flex-col'}`}
            >
              {books.map((book) => (
                <motion.div key={book._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <BookCard
                    book={book}
                    onAddToList={isAuthenticated ? (id) => addToList.mutate(id) : undefined}
                    inList={readingList.has(book._id)}
                  />
                </motion.div>
              ))}
            </motion.div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
