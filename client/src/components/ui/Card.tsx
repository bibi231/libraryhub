import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  accentColor?: 'indigo' | 'terracotta' | 'teal';
  hover?: boolean;
}

const accentColors = {
  indigo: 'border-l-indigo-600',
  terracotta: 'border-l-terracotta-600',
  teal: 'border-l-teal-600',
};

export function Card({ children, className = '', accent, accentColor = 'indigo', hover }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-navy-800 rounded-2xl shadow-warm border border-stone-100 dark:border-navy-700 ${accent ? `border-l-4 ${accentColors[accentColor]}` : ''} ${hover ? 'hover:shadow-warm-lg transition-shadow duration-200 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: 'indigo' | 'terracotta' | 'teal' | 'amber';
  subtitle?: string;
  change?: { value: number; positive: boolean };
}

const statAccents = {
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  terracotta: 'bg-orange-100 text-terracotta-600 dark:bg-orange-900/30 dark:text-orange-400',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

export function StatCard({ title, value, icon, accentColor = 'indigo', subtitle, change }: StatCardProps) {
  return (
    <Card accent accentColor={accentColor === 'amber' ? 'teal' : accentColor}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
            <p className="mt-1 font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">
              {value}
            </p>
            {subtitle && <p className="mt-1 text-xs text-stone-400">{subtitle}</p>}
            {change && (
              <p className={`mt-1 text-xs font-medium ${change.positive ? 'text-teal-600' : 'text-red-500'}`}>
                {change.positive ? '↑' : '↓'} {Math.abs(change.value)}% this month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${statAccents[accentColor]}`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}
