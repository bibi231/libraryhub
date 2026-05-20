export const BOOK_CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
  "Children's", 'Reference', 'Biography', 'Philosophy', 'Arts',
  'Religion', 'Law', 'Medicine', 'Business',
] as const;

export const BOOK_FORMATS = [
  { value: 'physical', label: 'Physical Book' },
  { value: 'ebook', label: 'E-Book' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'journal', label: 'Journal' },
  { value: 'magazine', label: 'Magazine' },
] as const;

export const BOOK_CONDITIONS = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' },
] as const;

export const ID_TYPES = [
  { value: 'NIN', label: 'NIN (National ID Number)' },
  { value: 'BVN', label: 'BVN (Bank Verification Number)' },
  { value: 'StudentID', label: 'Student ID' },
  { value: 'StaffID', label: 'Staff ID' },
] as const;
