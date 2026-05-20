import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PatronLayout } from '@/components/layout/PatronLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, generateBookPlaceholder } from '@/lib/utils';
import type { IBorrow, PaginatedResponse } from '@libraryhub/shared';

export function PatronHistoryPage() {
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['borrowHistory', page],
    queryFn: () => api.get(`/borrows/my/history?page=${page}&limit=20`).then((r) => r.data.data as PaginatedResponse<IBorrow>),
  });

  const borrows = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <PatronLayout title="Borrowing History" subtitle="Your complete borrowing record">
      <Card className="p-6">
        {borrows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-400">No borrowing history yet</p>
            <Link to="/catalog">
              <button className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700">Browse Catalog →</button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {borrows.map((borrow) => {
                const book = borrow.bookId as unknown as { title: string; authors: string[]; coverImage: string; _id: string };
                return (
                  <div key={borrow._id} className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-navy-700 rounded-xl">
                    <img
                      src={book.coverImage || generateBookPlaceholder(book.title)}
                      alt={book.title}
                      className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = generateBookPlaceholder(book.title); }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/books/${book._id}`}>
                        <p className="font-semibold text-sm text-stone-800 dark:text-stone-100 hover:text-indigo-600 truncate">{book.title}</p>
                      </Link>
                      <p className="text-xs text-stone-400">{book.authors?.join(', ')}</p>
                    </div>
                    <div className="text-right text-xs text-stone-400 flex-shrink-0">
                      <p>Borrowed {formatDate(borrow.borrowDate)}</p>
                      {borrow.returnDate && <p>Returned {formatDate(borrow.returnDate)}</p>}
                      {borrow.fine > 0 && <p className="text-red-500 font-medium mt-1">Fine: ₦{borrow.fine}</p>}
                    </div>
                    <Badge variant="success">Returned</Badge>
                  </div>
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </PatronLayout>
  );
}
