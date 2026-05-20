export type UserRole = 'patron' | 'librarian' | 'admin';
export type IdType = 'NIN' | 'BVN' | 'StudentID' | 'StaffID';
export type BookFormat = 'physical' | 'ebook' | 'audiobook' | 'journal' | 'magazine';
export type BookCondition = 'good' | 'fair' | 'poor' | 'damaged';
export type BookCategory =
  | 'Fiction'
  | 'Non-Fiction'
  | 'Science'
  | 'Technology'
  | 'History'
  | "Children's"
  | 'Reference'
  | 'Biography'
  | 'Philosophy'
  | 'Arts'
  | 'Religion'
  | 'Law'
  | 'Medicine'
  | 'Business';

export type ReservationStatus = 'pending' | 'ready' | 'fulfilled' | 'expired' | 'cancelled';
export type BorrowStatus = 'active' | 'returned' | 'overdue';
export type FineStatus = 'pending' | 'paid' | 'waived';
export type FineReason = 'overdue' | 'damage' | 'lost';
export type NotificationType =
  | 'reservation_ready'
  | 'due_reminder'
  | 'overdue'
  | 'waitlist_update'
  | 'fine'
  | 'new_arrival';

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  idType: IdType;
  idNumber: string;
  libraryCardNumber: string;
  role: UserRole;
  favoriteCategories: string[];
  isActive: boolean;
  fineBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBook {
  _id: string;
  title: string;
  authors: string[];
  isbn: string;
  publisher: string;
  publicationYear: number;
  category: BookCategory;
  genre: string[];
  format: BookFormat;
  description: string;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  condition: BookCondition;
  tags: string[];
  digitalUrl?: string;
  totalBorrows: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IReservation {
  _id: string;
  patronId: string | IUser;
  bookId: string | IBook;
  status: ReservationStatus;
  waitlistPosition: number;
  reservedAt: string;
  expiresAt: string;
  fulfilledAt?: string;
  createdAt: string;
}

export interface IBorrow {
  _id: string;
  patronId: string | IUser;
  bookId: string | IBook;
  librarianId: string | IUser;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  renewals: number;
  maxRenewals: number;
  status: BorrowStatus;
  conditionAtBorrow: string;
  conditionAtReturn?: string;
  fine: number;
  finePaid: boolean;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedBookId?: string;
  relatedBorrowId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IFine {
  _id: string;
  patronId: string | IUser;
  borrowId: string | IBorrow;
  bookId: string | IBook;
  amount: number;
  reason: FineReason;
  status: FineStatus;
  paidAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: IUser;
  tokens: AuthTokens;
}
