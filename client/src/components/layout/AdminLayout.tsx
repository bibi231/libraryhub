import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleDark() {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 transition-all duration-200">
        {/* Top bar */}
        <header className="bg-white dark:bg-navy-800 border-b border-stone-100 dark:border-navy-700 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            {title && <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50">{title}</h1>}
            {subtitle && <p className="text-sm text-stone-400">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-navy-700 text-stone-400 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <NotificationBell />
          </div>
        </header>

        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
