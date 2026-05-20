import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { IFine, PaginatedResponse } from '@libraryhub/shared';

export function AdminFinesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data } = useQuery<{ data: { data: PaginatedResponse<IFine> } }>({
    queryKey: ['allFines', page, status],
    queryFn: () => api.get('/fines', { params: { page, limit: 20, status } }),
  });

  const payFine = useMutation({
    mutationFn: (id: string) => api.put(`/fines/${id}/pay`),
    onSuccess: () => { toast.success('Fine marked as paid'); qc.invalidateQueries({ queryKey: ['allFines'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const waiveFine = useMutation({
    mutationFn: (id: string) => api.put(`/fines/${id}/waive`),
    onSuccess: () => { toast.success('Fine waived'); qc.invalidateQueries({ queryKey: ['allFines'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const fines = data?.data?.data?.data || [];
  const totalPages = data?.data?.data?.totalPages || 1;

  return (
    <AdminLayout title="Fines Management" subtitle="View and manage patron fines">
      <div className="mb-4 max-w-xs">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'waived', label: 'Waived' },
          ]}
          placeholder="All Fines"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-navy-700">
              <tr className="text-left text-xs text-stone-500">
                <th className="px-4 py-3 font-medium">Patron</th>
                <th className="px-4 py-3 font-medium">Book</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-navy-700">
              {fines.map((fine) => {
                const patron = fine.patronId as unknown as { firstName: string; lastName: string; libraryCardNumber: string };
                const book = fine.bookId as unknown as { title: string };
                return (
                  <tr key={fine._id} className="hover:bg-stone-50/50 dark:hover:bg-navy-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800 dark:text-stone-100">{patron?.firstName} {patron?.lastName}</p>
                      <p className="text-xs font-mono text-stone-400">{patron?.libraryCardNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">{book?.title}</td>
                    <td className="px-4 py-3 text-stone-500 capitalize">{fine.reason}</td>
                    <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-50">{formatCurrency(fine.amount)}</td>
                    <td className="px-4 py-3 text-xs text-stone-400">{formatDate(fine.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={fine.status === 'paid' ? 'success' : fine.status === 'waived' ? 'default' : 'overdue'}>
                        {fine.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fine.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="secondary" icon={<Check className="w-3.5 h-3.5 text-teal-600" />} onClick={() => payFine.mutate(fine._id)}>Paid</Button>
                          <Button size="sm" variant="ghost" icon={<X className="w-3.5 h-3.5 text-stone-400" />} onClick={() => waiveFine.mutate(fine._id)}>Waive</Button>
                        </div>
                      )}
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
    </AdminLayout>
  );
}
