import React, { useState, useRef, useEffect } from 'react';
import { Bell, BookOpen, Clock, AlertCircle, DollarSign, Bell as BellIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { INotification, NotificationType } from '@libraryhub/shared';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  reservation_ready: <BookOpen className="w-4 h-4 text-teal-600" />,
  due_reminder: <Clock className="w-4 h-4 text-amber-500" />,
  overdue: <AlertCircle className="w-4 h-4 text-red-500" />,
  waitlist_update: <BookOpen className="w-4 h-4 text-indigo-600" />,
  fine: <DollarSign className="w-4 h-4 text-red-500" />,
  new_arrival: <BookOpen className="w-4 h-4 text-indigo-600" />,
};

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=10').then((r) => r.data.data),
    enabled: isAuthenticated && open,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (!isAuthenticated) return null;

  const unread = countData?.count || 0;
  const notifications: INotification[] = notifData?.data || [];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-navy-700 text-stone-500 dark:text-stone-400 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-800 rounded-2xl shadow-warm-xl border border-stone-100 dark:border-navy-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-navy-700">
            <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-400">
                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-navy-700 cursor-pointer border-b border-stone-50 dark:border-navy-700 last:border-0 ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {typeIcons[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-stone-800 dark:text-stone-100' : 'text-stone-700 dark:text-stone-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-stone-300 mt-1">{formatRelative(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
