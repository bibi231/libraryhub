const FINE_PER_DAY = 50; // ₦50/day

export function calculateOverdueFine(dueDate: Date, returnDate: Date = new Date()): number {
  if (returnDate <= dueDate) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / msPerDay);
  return daysOverdue * FINE_PER_DAY;
}

export function getDaysOverdue(dueDate: Date): number {
  const now = new Date();
  if (now <= dueDate) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((now.getTime() - dueDate.getTime()) / msPerDay);
}
