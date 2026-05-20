import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { IBorrow, PaginatedResponse } from '@libraryhub/shared';

export function AdminBorrowsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<IBorrow | null>(null);
  const [patronId, setPatronId] = useState('');
  const [bookIds, setBookIds] = useState('');
  const [returnCondition, setReturnCondition] = useState('good');

  const { data, isLoading } = useQuery<{ data: { data: PaginatedResponse<IBorrow> } }>({
    queryKey: ['activeBorrows', page],
    queryFn: () => api.get(`/borrows/active?page=${page}&limit=20`),
  });

  const checkout = useMutation({
    mutationFn: (payload: { patronId: string; bookIds: string[] }) => api.post('/borrows/checkout', payload),
    onSuccess: () => {
      toast.success('Books checked out');
      qc.invalidateQueries({ queryKey: ['activeBorrows'] });
      setCheckoutOpen(false);
      setPatronId(''); setBookIds('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const returnBook = useMutation({
    mutationFn: ({ borrowId, condition }: { borrowId: string; condition: string }) =>
      api.post('/borrows/return', { borrowId, condition }),
    onSuccess: (res) => {
      const fine = res.data.data.fine;
      toast.success(fine > 0 ? `Returned. Fine: ${formatCurrency(fine)}` : 'Book returned successfully');
      qc.invalidateQueries({ queryKey: ['activeBorrows'] });
      setReturnOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const borrows = data?.data?.data?.data || [];
  const totalPages = data?.data?.data?.totalPages || 1;

  return (
    <AdminLayout
      title="Borrows & Returns"
      subtitle="Manage book checkouts and returns"
      actions={
        <div className="flex gap-2">
          <Button icon={<ArrowLeftRight className="w-4 h-4" />} onClick={() => setCheckoutOpen(true)}>Checkout</Button>
          <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={() => setReturnOpen(true)}>Process Return</Button>
        </div>
      }
    >
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-navy-700">
              <tr className="text-left text-xs text-stone-500 dark:text-stone-400">
                <th className="px-4 py-3 font-medium">Patron</th>
                <th className="px-4 py-3 font-medium">Book</th>
                <th className="px-4 py-3 font-medium">Borrow Date</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-navy-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-stone-100 dark:bg-navy-700 animate-pulse rounded" /></td></tr>
                ))
              ) : borrows.map((b) => {
                const patron = b.patronId as unknown as { firstName: string; lastName: string; libraryCardNumber: string };
                const book = b.bookId as unknown as { title: string };
                const isOverdue = new Date(b.dueDate) < new Date() && b.status !== 'returned';
                return (
                  <tr key={b._id} className={`hover:bg-stone-50/50 dark:hover:bg-navy-700/50 ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800 dark:text-stone-100">{patron?.firstName} {patron?.lastName}</p>
                      <p className="text-xs font-mono text-stone-400">{patron?.libraryCardNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">{book?.title}</td>
                    <td className="px-4 py-3 text-xs text-stone-500">{formatDate(b.borrowDate)}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-stone-500'}`}>{formatDate(b.dueDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={isOverdue ? 'overdue' : 'borrowed'}>{isOverdue ? 'Overdue' : 'Active'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="secondary" icon={<RotateCcw className="w-3.5 h-3.5" />}
                        onClick={() => { setSelectedBorrow(b); setReturnOpen(true); }}
                      >Return</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-stone-100 dark:border-navy-700">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      {/* Checkout Modal */}
      <Modal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Checkout Books" size="md">
        <div className="space-y-4">
          <Input label="Patron Library Card Number or ID" value={patronId} onChange={(e) => setPatronId(e.target.value)} placeholder="LIB-2024-00003 or MongoDB ID" />
          <Input label="Book ID(s) (comma-separated)" value={bookIds} onChange={(e) => setBookIds(e.target.value)} placeholder="book_id_1, book_id_2" />
          <p className="text-xs text-stone-400">Loan period: 14 days. Renewable once for 7 additional days.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setCheckoutOpen(false)} className="flex-1">Cancel</Button>
            <Button
              className="flex-1"
              loading={checkout.isPending}
              onClick={() => checkout.mutate({
                patronId,
                bookIds: bookIds.split(',').map((id) => id.trim()).filter(Boolean),
              })}
            >Checkout</Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={returnOpen} onClose={() => { setReturnOpen(false); setSelectedBorrow(null); }} title="Process Return" size="md">
        <div className="space-y-4">
          {selectedBorrow && (
            <div className="p-3 bg-stone-50 dark:bg-navy-700 rounded-xl text-sm">
              <p className="font-medium">{(selectedBorrow.bookId as unknown as { title: string })?.title}</p>
              <p className="text-stone-400 text-xs mt-0.5">Borrow ID: {selectedBorrow._id}</p>
            </div>
          )}
          {!selectedBorrow && (
            <Input label="Borrow ID" placeholder="Enter the borrow record ID" onChange={() => {}} />
          )}
          <Select
            label="Book Condition on Return"
            value={returnCondition}
            onChange={(e) => setReturnCondition(e.target.value)}
            options={[
              { value: 'good', label: 'Good' },
              { value: 'fair', label: 'Fair' },
              { value: 'poor', label: 'Poor' },
              { value: 'damaged', label: 'Damaged' },
            ]}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setReturnOpen(false); setSelectedBorrow(null); }} className="flex-1">Cancel</Button>
            <Button
              className="flex-1"
              loading={returnBook.isPending}
              onClick={() => {
                if (selectedBorrow) {
                  returnBook.mutate({ borrowId: selectedBorrow._id, condition: returnCondition });
                }
              }}
            >Process Return</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
