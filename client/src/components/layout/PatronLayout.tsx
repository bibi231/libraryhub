import React from 'react';
import { PublicHeader } from './PublicHeader';
import { motion } from 'framer-motion';

interface PatronLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function PatronLayout({ children, title, subtitle }: PatronLayoutProps) {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
      <PublicHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">{title}</h1>
            {subtitle && <p className="mt-1 text-stone-500 dark:text-stone-400">{subtitle}</p>}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
