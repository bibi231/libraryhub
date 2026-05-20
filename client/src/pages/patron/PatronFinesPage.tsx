import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { PatronLayout } from '@/components/layout/PatronLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { IFine } from '@libraryhub/shared';

export function PatronFinesPage() {
  const { data } = useQuery({
    queryKey: ['myFines'],
    queryFn: () => api.get('/fines/my').then((r) => r.data.data as IFine[]),
  });

  const fines = data || [];
  const pendingFines = fines.filter((f) => f.status === 'pending');
  const totalPending = pendingFines.reduce((s, f) => s + f.amount, 0);

  return (
    <PatronLayout title="My Fines" subtitle="Outstanding and resolved fines">
      {totalPending > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(totalPending)}</p>
            <p className="text-sm text-red-600 dark:text-red-400">{pendingFines.length} outstanding fine{pendingFines.length > 1 ? 's' : ''} — please visit the library to pay</p>
          </div>
        </div>
      )}

      <Card className="p-6">
        {fines.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400">No fines on your account</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-navy-700">
            {fines.map((fine) => {
              const book = fine.bookId as unknown as { title: string };
              return (
                <div key={fine._id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-sm text-stone-800 dark:text-stone-100">{book?.title || 'Unknown Book'}</p>
                    <p className="text-xs text-stone-400 mt-0.5 capitalize">{fine.reason} — {formatDate(fine.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-lg text-stone-900 dark:text-stone-50">{formatCurrency(fine.amount)}</p>
                    <Badge variant={fine.status === 'paid' ? 'success' : fine.status === 'waived' ? 'default' : 'overdue'}>
                      {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PatronLayout>
  );
}
