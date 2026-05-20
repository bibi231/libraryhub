import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/Card';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export function AdminDashboardPage() {
  const { data: overview } = useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: () => api.get('/reports/overview').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: circulation } = useQuery({
    queryKey: ['reports', 'circulation'],
    queryFn: () => api.get('/reports/circulation').then((r) => r.data.data),
  });

  const { data: popular } = useQuery({
    queryKey: ['reports', 'popular'],
    queryFn: () => api.get('/reports/popular?period=30').then((r) => r.data.data),
  });

  const { data: overdueData } = useQuery({
    queryKey: ['borrows', 'overdue'],
    queryFn: () => api.get('/borrows/overdue').then((r) => r.data.data),
  });

  const overdue = overdueData?.slice(0, 5) || [];

  const circulationChart = (() => {
    if (!circulation) return [];
    const borrowMap = new Map(circulation.borrows?.map((b: { _id: string; borrows: number }) => [b._id, b.borrows]) || []);
    const returnMap = new Map(circulation.returns?.map((r: { _id: string; returns: number }) => [r._id, r.returns]) || []);
    const allDates = [...new Set([...borrowMap.keys(), ...returnMap.keys()])].sort() as string[];
    return allDates.slice(-14).map((date) => ({
      date: (date as string).slice(5),
      borrows: borrowMap.get(date) || 0,
      returns: returnMap.get(date) || 0,
    }));
  })();

  return (
    <AdminLayout title="Dashboard" subtitle="Library overview">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Books" value={overview?.totalBooks || 0} icon={<BookOpen className="w-5 h-5" />} accentColor="indigo" />
        <StatCard title="Active Patrons" value={overview?.totalPatrons || 0} icon={<Users className="w-5 h-5" />} accentColor="teal" />
        <StatCard title="Books Out" value={overview?.activeBorrows || 0} icon={<ArrowLeftRight className="w-5 h-5" />} accentColor="terracotta" />
        <StatCard title="Overdue" value={overview?.overdueCount || 0} icon={<AlertTriangle className="w-5 h-5" />} accentColor="amber" />
        <StatCard title="Pending Fines" value={formatCurrency(overview?.totalPendingFines || 0)} icon={<DollarSign className="w-5 h-5" />} accentColor="terracotta" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Circulation Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Circulation (14 days)</h2>
            <TrendingUp className="w-4 h-4 text-stone-300" />
          </div>
          {circulationChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={circulationChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Line type="monotone" dataKey="borrows" stroke="#4F46E5" strokeWidth={2} dot={false} name="Borrows" />
                <Line type="monotone" dataKey="returns" stroke="#0D9488" strokeWidth={2} dot={false} name="Returns" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-stone-400 text-sm">No circulation data</div>
          )}
        </Card>

        {/* Popular Books */}
        <Card className="p-6">
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50 mb-5">Most Popular</h2>
          <div className="space-y-3">
            {(popular || []).slice(0, 6).map((book: { _id: string; title: string; count: number }, i: number) => (
              <div key={book._id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-300 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-700 dark:text-stone-200 truncate">{book.title}</p>
                  <div className="mt-1 h-1.5 bg-stone-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, (book.count / ((popular?.[0]?.count || 1))) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-stone-400 flex-shrink-0">{book.count}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/reports" className="mt-4 block text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Full Report →
          </Link>
        </Card>

        {/* Overdue table */}
        <Card className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Overdue Books</h2>
            <Link to="/admin/borrows?status=overdue" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          {overdue.length === 0 ? (
            <p className="text-center text-stone-400 py-8 text-sm">No overdue books</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-400 border-b border-stone-100 dark:border-navy-700">
                    <th className="pb-3 font-medium">Patron</th>
                    <th className="pb-3 font-medium">Book</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium text-right">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 dark:divide-navy-700">
                  {overdue.map((b: { _id: string; patronId: { firstName: string; lastName: string; libraryCardNumber: string }; bookId: { title: string }; dueDate: string; fine: number }) => (
                    <tr key={b._id} className="hover:bg-stone-50 dark:hover:bg-navy-700">
                      <td className="py-3">
                        <p className="font-medium text-stone-800 dark:text-stone-100">{b.patronId?.firstName} {b.patronId?.lastName}</p>
                        <p className="text-xs text-stone-400 font-mono">{b.patronId?.libraryCardNumber}</p>
                      </td>
                      <td className="py-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">{b.bookId?.title}</td>
                      <td className="py-3 text-red-500 text-xs">{formatDate(b.dueDate)}</td>
                      <td className="py-3 text-right font-medium text-red-600">{formatCurrency(b.fine)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
