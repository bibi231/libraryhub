import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, BookOpen, Users, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';

const COLORS = ['#4F46E5', '#0D9488', '#C2410C', '#7C3AED', '#DB2777', '#059669'];

export function AdminReportsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: circulation } = useQuery({
    queryKey: ['reports', 'circulation', from, to],
    queryFn: () => api.get('/reports/circulation', { params: { from, to } }).then((r) => r.data.data),
  });

  const { data: inventory } = useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () => api.get('/reports/inventory').then((r) => r.data.data),
  });

  const { data: popular } = useQuery({
    queryKey: ['reports', 'popular'],
    queryFn: () => api.get('/reports/popular?period=30').then((r) => r.data.data),
  });

  const { data: patronActivity } = useQuery({
    queryKey: ['reports', 'patron-activity', from, to],
    queryFn: () => api.get('/reports/patron-activity', { params: { from, to } }).then((r) => r.data.data),
  });

  const circulationData = (() => {
    if (!circulation) return [];
    const bMap = new Map(circulation.borrows?.map((b: { _id: string; borrows: number }) => [b._id, b.borrows]) || []);
    const rMap = new Map(circulation.returns?.map((r: { _id: string; returns: number }) => [r._id, r.returns]) || []);
    const dates = [...new Set([...bMap.keys(), ...rMap.keys()])].sort() as string[];
    return dates.map((d) => ({ date: d.slice(5), borrows: bMap.get(d) || 0, returns: rMap.get(d) || 0 }));
  })();

  const categoryData = inventory?.byCategory?.map((c: { _id: string; count: number }) => ({
    name: c._id, value: c.count,
  })) || [];

  function exportCSV() {
    window.open('/api/reports/export/overdue?format=csv', '_blank');
  }

  return (
    <AdminLayout
      title="Reports & Analytics"
      actions={<Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={exportCSV}>Export CSV</Button>}
    >
      {/* Date filter */}
      <div className="flex gap-4 mb-6">
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="max-w-xs" />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="max-w-xs" />
      </div>

      <div className="space-y-6">
        {/* Circulation */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Circulation</h2>
          </div>
          {circulationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={circulationData}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Legend />
                <Area type="monotone" dataKey="borrows" stroke="#4F46E5" fill="url(#colorBorrows)" strokeWidth={2} name="Borrows" />
                <Area type="monotone" dataKey="returns" stroke="#0D9488" fill="url(#colorReturns)" strokeWidth={2} name="Returns" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-stone-400">No data for this period</div>
          )}
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category distribution */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Books by Category</h2>
            </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-stone-400">No data</div>
            )}
          </Card>

          {/* Popular books */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-terracotta-600" />
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Popular This Month</h2>
            </div>
            {popular?.length > 0 ? (
              <div className="space-y-2">
                {popular.slice(0, 8).map((book: { _id: string; title: string; count: number }, i: number) => (
                  <div key={book._id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-300 w-4">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-700 dark:text-stone-200 truncate">{book.title}</p>
                      <div className="mt-0.5 h-1.5 bg-stone-100 dark:bg-navy-700 rounded-full overflow-hidden">
                        <div className="h-full bg-terracotta-600 rounded-full" style={{ width: `${Math.min(100, (book.count / (popular[0]?.count || 1)) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0">{book.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-stone-400">No data</div>
            )}
          </Card>
        </div>

        {/* Most active patrons */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-teal-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Most Active Patrons</h2>
          </div>
          {patronActivity?.mostActive?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-400 border-b border-stone-100 dark:border-navy-700">
                    <th className="pb-3 font-medium">Patron</th>
                    <th className="pb-3 font-medium">Card</th>
                    <th className="pb-3 font-medium text-right">Borrows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 dark:divide-navy-700">
                  {patronActivity.mostActive.map((p: { _id: string; name: string; email: string; libraryCardNumber: string; count: number }) => (
                    <tr key={p._id}>
                      <td className="py-3">
                        <p className="font-medium text-stone-800 dark:text-stone-100">{p.name}</p>
                        <p className="text-xs text-stone-400">{p.email}</p>
                      </td>
                      <td className="py-3 font-mono text-xs text-stone-500">{p.libraryCardNumber}</td>
                      <td className="py-3 text-right font-bold text-indigo-600">{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-stone-400 py-8 text-sm">No data for this period</p>
          )}
        </Card>

        {/* Inventory */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Low Stock Alert</h2>
          </div>
          {inventory?.lowStock?.length > 0 ? (
            <div className="space-y-2">
              {inventory.lowStock.map((b: { _id: string; title: string; authors: string[]; availableCopies: number; totalCopies: number }) => (
                <div key={b._id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{b.title}</p>
                    <p className="text-xs text-stone-400">{b.authors?.join(', ')}</p>
                  </div>
                  <span className={`text-sm font-bold ${b.availableCopies === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {b.availableCopies}/{b.totalCopies}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-400 py-4 text-sm">No low-stock books</p>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
