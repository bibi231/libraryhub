import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import type { IReservation, PaginatedResponse } from '@libraryhub/shared';

export function AdminReservationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data } = useQuery<{ data: { data: PaginatedResponse<IReservation> } }>({
    queryKey: ['allReservations', page, status],
    queryFn: () => api.get('/reservations', { params: { page, limit: 20, status } }),
  });

  const fulfill = useMutation({
    mutationFn: (id: string) => api.put(`/reservations/${id}/fulfill`),
    onSuccess: () => { toast.success('Reservation fulfilled'); qc.invalidateQueries({ queryKey: ['allReservations'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.delete(`/reservations/${id}`),
    onSuccess: () => { toast.success('Reservation cancelled'); qc.invalidateQueries({ queryKey: ['allReservations'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const reservations = data?.data?.data?.data || [];
  const totalPages = data?.data?.data?.totalPages || 1;

  return (
    <AdminLayout title="Reservations" subtitle="Manage book reservations and waitlists">
      <div className="mb-4 max-w-xs">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'pending', label: 'Pending (Waitlist)' },
            { value: 'ready', label: 'Ready for Pickup' },
            { value: 'fulfilled', label: 'Fulfilled' },
            { value: 'expired', label: 'Expired' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          placeholder="All Reservations"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-navy-700">
              <tr className="text-left text-xs text-stone-500">
                <th className="px-4 py-3 font-medium">Patron</th>
                <th className="px-4 py-3 font-medium">Book</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-navy-700">
              {reservations.map((res) => {
                const patron = res.patronId as unknown as { firstName: string; lastName: string; libraryCardNumber: string };
                const book = res.bookId as unknown as { title: string };
                return (
                  <tr key={res._id} className="hover:bg-stone-50/50 dark:hover:bg-navy-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800 dark:text-stone-100">{patron?.firstName} {patron?.lastName}</p>
                      <p className="text-xs font-mono text-stone-400">{patron?.libraryCardNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">{book?.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={res.status === 'ready' ? 'available' : res.status === 'pending' ? 'borrowed' : 'default'}>
                        {res.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {res.waitlistPosition > 0 ? `#${res.waitlistPosition}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">
                      {res.expiresAt ? formatDate(res.expiresAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {res.status === 'ready' && (
                          <Button size="sm" variant="secondary" icon={<Check className="w-3.5 h-3.5 text-teal-600" />} onClick={() => fulfill.mutate(res._id)}>Fulfill</Button>
                        )}
                        {['pending', 'ready'].includes(res.status as string) && (
                          <Button size="sm" variant="ghost" icon={<X className="w-3.5 h-3.5" />} onClick={() => cancel.mutate(res._id)}>Cancel</Button>
                        )}
                      </div>
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
