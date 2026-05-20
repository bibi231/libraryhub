import User from '../models/User';

export async function generateLibraryCardNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await User.countDocuments();
  const padded = String(count + 1).padStart(5, '0');
  return `LIB-${year}-${padded}`;
}
