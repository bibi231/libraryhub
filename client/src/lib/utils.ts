import { type ClassValue, clsx } from 'clsx';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDaysUntilDue(dueDate: string | Date): number {
  return differenceInDays(new Date(dueDate), new Date());
}

export function getDueDateColor(dueDate: string | Date): string {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return 'text-red-600';
  if (days <= 2) return 'text-red-500';
  if (days <= 5) return 'text-amber-500';
  return 'text-teal-600';
}

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function generateBookPlaceholder(title: string): string {
  const colors = ['4F46E5', 'C2410C', '0D9488', '7C3AED', 'DB2777', '059669'];
  const colorIndex = title.charCodeAt(0) % colors.length;
  const initials = title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[colorIndex]}&color=fff&size=200&font-size=0.4&bold=true`;
}

export function clsx2(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
