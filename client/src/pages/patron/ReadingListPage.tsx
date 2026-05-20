import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { PatronLayout } from '@/components/layout/PatronLayout';
import { Card } from '@/components/ui/Card';
import { BookCard } from '@/components/catalog/BookCard';
import type { IBook } from '@libraryhub/shared';

export function ReadingListPage() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['readingList'],
    queryFn: () => api.get('/reading-list').then((r) => r.data.data as Array<{ _id: string; bookId: IBook }>),
  });

  const remove = useMutation({
    mutationFn: (bookId: string) => api.delete(`/reading-list/${bookId}`),
    onSuccess: () => { toast.success('Removed from list'); qc.invalidateQueries({ queryKey: ['readingList'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const list = data || [];

  return (
    <PatronLayout title="Reading List" subtitle="Books you've saved">
      {list.length === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="w-12 h-12 text-stone-200 mx-auto mb-3" />
          <p className="font-serif text-xl text-stone-700 dark:text-stone-300">Your reading list is empty</p>
          <p className="text-stone-400 mt-2 text-sm">Save books from the catalog to read later</p>
          <Link to="/catalog">
            <button className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700">Browse Catalog →</button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {list.map(({ _id, bookId }) => (
            <div key={_id} className="relative">
              <BookCard book={bookId} />
              <button
                onClick={() => remove.mutate(bookId._id)}
                className="absolute top-2 right-2 p-1.5 bg-white dark:bg-navy-700 rounded-lg shadow text-stone-400 hover:text-red-500 transition-colors"
                aria-label="Remove from list"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </PatronLayout>
  );
}
