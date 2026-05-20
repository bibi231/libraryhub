import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Clock, Calendar, DollarSign, Bookmark, CreditCard, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { PatronLayout } from '@/components/layout/PatronLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, getDaysUntilDue, getDueDateColor, formatCurrency, generateBookPlaceholder } from '@/lib/utils';
import type { IBorrow, IReservation, IFine } from '@libraryhub/shared';

export function PatronDashboardPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: borrowsData } = useQuery({
    queryKey: ['myBorrows'],
    queryFn: () => api.get('/borrows/my').then((r) => r.data.data as IBorrow[]),
  });

  const { data: reservationsData } = useQuery({
    queryKey: ['myReservations'],
    queryFn: () => api.get('/reservations/my').then((r) => r.data.data as IReservation[]),
  });

  const { data: finesData } = useQuery({
    queryKey: ['myFines'],
    queryFn: () => api.get('/fines/my').then((r) => r.data.data as IFine[]),
  });

  const renew = useMutation({
    mutationFn: (id: string) => api.put(`/borrows/${id}/renew`),
    onSuccess: () => { toast.success('Renewed successfully'); qc.invalidateQueries({ queryKey: ['myBorrows'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const borrows = borrowsData || [];
  const reservations = reservationsData || [];
  const fines = finesData || [];
  const pendingFines = fines.filter((f) => f.status === 'pending');
  const totalFines = pendingFines.reduce((sum, f) => sum + f.amount, 0);

  return (
    <PatronLayout title={`Hello, ${user?.firstName}`} subtitle="Manage your library account">
      {/* Library card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white mb-8 shadow-warm-lg"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-indigo-200" />
              <span className="text-indigo-200 text-sm">Library Card</span>
            </div>
            <p className="font-serif text-xl font-bold">{user?.firstName} {user?.lastName}</p>
            <p className="font-mono text-indigo-200 text-sm tracking-wider mt-1">{user?.libraryCardNumber}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex gap-6 mt-5 text-sm">
          <div><p className="text-indigo-200">Books Out</p><p className="font-bold text-lg">{borrows.length}</p></div>
          <div><p className="text-indigo-200">Reservations</p><p className="font-bold text-lg">{reservations.filter((r) => ['pending', 'ready'].includes(r.status as string)).length}</p></div>
          <div><p className="text-indigo-200">Fines</p><p className={`font-bold text-lg ${totalFines > 0 ? 'text-red-300' : 'text-white'}`}>{formatCurrency(totalFines)}</p></div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Currently Borrowed */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50">Currently Borrowed</h2>
              <Link to="/patron/history" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View history</Link>
            </div>
            {borrows.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                <p className="text-stone-400">No books currently borrowed</p>
                <Link to="/catalog">
                  <Button variant="secondary" className="mt-4" size="sm">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {borrows.map((borrow) => {
                  const book = borrow.bookId as unknown as { title: string; authors: string[]; coverImage: string; _id: string };
                  const daysLeft = getDaysUntilDue(borrow.dueDate);
                  const color = getDueDateColor(borrow.dueDate);
                  return (
                    <div key={borrow._id} className="flex gap-4 p-4 bg-stone-50 dark:bg-navy-700 rounded-xl">
                      <img
                        src={book.coverImage || generateBookPlaceholder(book.title)}
                        alt={book.title}
                        className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = generateBookPlaceholder(book.title); }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/books/${book._id}`}>
                          <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm hover:text-indigo-600 transition-colors truncate">{book.title}</h3>
                        </Link>
                        <p className="text-xs text-stone-400 mt-0.5">{book.authors?.join(', ')}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                          </div>
                          <span className="text-xs text-stone-400">Due {formatDate(borrow.dueDate)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {borrow.renewals < borrow.maxRenewals && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<RefreshCw className="w-3.5 h-3.5" />}
                            onClick={() => renew.mutate(borrow._id)}
                            loading={renew.isPending}
                          >
                            Renew
                          </Button>
                        )}
                        {borrow.status === 'overdue' && (
                          <Badge variant="overdue">Overdue</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Reservations */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Reservations</h2>
              <Calendar className="w-4 h-4 text-stone-300" />
            </div>
            {reservations.filter((r) => ['pending', 'ready'].includes(r.status as string)).length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-4">No active reservations</p>
            ) : (
              <div className="space-y-3">
                {reservations.filter((r) => ['pending', 'ready'].includes(r.status as string)).slice(0, 3).map((res) => {
                  const book = res.bookId as unknown as { title: string; _id: string };
                  return (
                    <div key={res._id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${res.status === 'ready' ? 'bg-teal-500' : 'bg-amber-400'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{book.title}</p>
                        <Badge variant={res.status === 'ready' ? 'available' : 'borrowed'} className="mt-1">
                          {res.status === 'ready' ? '✓ Ready for pickup' : `#${res.waitlistPosition} in queue`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Fines */}
          {pendingFines.length > 0 && (
            <Card className="p-5" accent accentColor="terracotta">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">Outstanding Fines</h2>
                <DollarSign className="w-4 h-4 text-terracotta-600" />
              </div>
              <p className="text-3xl font-serif font-bold text-red-600">{formatCurrency(totalFines)}</p>
              <p className="text-xs text-stone-400 mt-1">{pendingFines.length} unpaid fine{pendingFines.length > 1 ? 's' : ''}</p>
              <Link to="/patron/fines">
                <Button variant="danger" size="sm" className="mt-4 w-full">View & Pay Fines</Button>
              </Link>
            </Card>
          )}

          {/* Quick links */}
          <Card className="p-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50 mb-3">Quick Access</h2>
            <div className="space-y-2">
              {[
                { to: '/catalog', icon: BookOpen, label: 'Browse Catalog' },
                { to: '/patron/reading-list', icon: Bookmark, label: 'Reading List' },
                { to: '/patron/history', icon: Clock, label: 'Borrow History' },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-50 dark:hover:bg-navy-700 transition-colors">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PatronLayout>
  );
}
