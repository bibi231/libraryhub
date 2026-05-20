import React from 'react';

type BadgeVariant = 'available' | 'borrowed' | 'overdue' | 'reserved' | 'default' | 'success' | 'warning' | 'error' | 'indigo';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  available: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  borrowed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  reserved: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  default: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  success: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function BookAvailabilityBadge({ available, total }: { available: number; total: number }) {
  if (total >= 999) return <Badge variant="available">Digital — Unlimited</Badge>;
  if (available === 0) return <Badge variant="borrowed">All Copies Borrowed</Badge>;
  if (available <= 1) return <Badge variant="warning">Last Copy</Badge>;
  return <Badge variant="available">{available} of {total} Available</Badge>;
}
