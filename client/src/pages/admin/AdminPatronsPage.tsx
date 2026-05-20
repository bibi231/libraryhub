import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { IUser, PaginatedResponse } from '@libraryhub/shared';

export function AdminPatronsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery<{ data: { data: PaginatedResponse<IUser> } }>({
    queryKey: ['patrons', search, page],
    queryFn: () => api.get('/users', { params: { role: 'patron', search, page, limit: 20 } }),
  });

  const toggleStatus = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/status`),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['patrons'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const patrons = data?.data?.data?.data || [];
  const totalPages = data?.data?.data?.totalPages || 1;

  return (
    <AdminLayout title="Patrons" subtitle="Manage library members">
      <div className="mb-4">
        <Input placeholder="Search by name, email, or card number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-navy-700">
              <tr className="text-left text-xs text-stone-500">
                <th className="px-4 py-3 font-medium">Patron</th>
                <th className="px-4 py-3 font-medium">Card Number</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Fines</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-navy-700">
              {patrons.map((patron) => (
                <tr key={patron._id} className="hover:bg-stone-50/50 dark:hover:bg-navy-700/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800 dark:text-stone-100">{patron.firstName} {patron.lastName}</p>
                    <p className="text-xs text-stone-400">{patron.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-600 dark:text-stone-300">{patron.libraryCardNumber}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{patron.phone}</td>
                  <td className="px-4 py-3">
                    <span className={patron.fineBalance > 0 ? 'text-red-600 font-medium' : 'text-teal-600'}>
                      {formatCurrency(patron.fineBalance || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">{formatDate(patron.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={patron.isActive ? 'available' : 'overdue'}>
                      {patron.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={patron.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      onClick={() => toggleStatus.mutate(patron._id)}
                    >
                      {patron.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
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
