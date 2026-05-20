import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { BOOK_CATEGORIES, BOOK_FORMATS, BOOK_CONDITIONS } from '@/lib/constants';
import { generateBookPlaceholder } from '@/lib/utils';
import type { IBook, PaginatedResponse } from '@libraryhub/shared';

const emptyForm = {
  title: '', authors: '', isbn: '', publisher: '', publicationYear: '',
  category: 'Fiction', genre: '', format: 'physical', description: '',
  coverImage: '', totalCopies: '1', shelfLocation: '', condition: 'good',
  tags: '', digitalUrl: '', ebookUrl: '', audiobookUrl: '', mediaType: '',
};

export function AdminCatalogPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState<IBook | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isbnLoading, setIsbnLoading] = useState(false);

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  const { data, isLoading } = useQuery<{ data: { data: PaginatedResponse<IBook> } }>({
    queryKey: ['adminBooks', search, page],
    queryFn: () => api.get('/books', { params: { search, page, limit: 15 } }),
  });

  const createBook = useMutation({
    mutationFn: (book: Record<string, unknown>) => api.post('/books', book),
    onSuccess: () => { toast.success('Book created'); qc.invalidateQueries({ queryKey: ['adminBooks'] }); setModalOpen(false); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateBook = useMutation({
    mutationFn: ({ id, book }: { id: string; book: Record<string, unknown> }) => api.put(`/books/${id}`, book),
    onSuccess: () => { toast.success('Book updated'); qc.invalidateQueries({ queryKey: ['adminBooks'] }); setModalOpen(false); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteBook = useMutation({
    mutationFn: (id: string) => api.delete(`/books/${id}`),
    onSuccess: () => { toast.success('Book removed'); qc.invalidateQueries({ queryKey: ['adminBooks'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function openCreate() {
    setEditBook(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(book: IBook) {
    setEditBook(book);
    setForm({
      title: book.title, authors: book.authors.join(', '), isbn: book.isbn || '',
      publisher: book.publisher || '', publicationYear: book.publicationYear?.toString() || '',
      category: book.category, genre: book.genre?.join(', ') || '',
      format: book.format, description: book.description || '',
      coverImage: book.coverImage || '', totalCopies: book.totalCopies.toString(),
      shelfLocation: book.shelfLocation || '', condition: book.condition || 'good',
      tags: book.tags?.join(', ') || '', digitalUrl: book.digitalUrl || '',
      ebookUrl: book.ebookUrl || '', audiobookUrl: book.audiobookUrl || '',
      mediaType: book.mediaType || '',
    });
    setModalOpen(true);
  }

  async function handleIsbnLookup() {
    if (!form.isbn) return;
    setIsbnLoading(true);
    try {
      const { data } = await api.get(`/books/isbn/${form.isbn}`);
      const d = data.data;
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        authors: d.authors?.join(', ') || f.authors,
        publisher: d.publisher || f.publisher,
        publicationYear: d.publicationYear?.toString() || f.publicationYear,
        description: d.description || f.description,
        coverImage: d.coverImage || f.coverImage,
      }));
      toast.success('Book details fetched from Open Library');
    } catch {
      toast.error('Book not found on Open Library');
    } finally {
      setIsbnLoading(false);
    }
  }

  function handleSubmit() {
    const payload = {
      ...form,
      authors: form.authors.split(',').map((a) => a.trim()).filter(Boolean),
      genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      totalCopies: parseInt(form.totalCopies) || 1,
      publicationYear: form.publicationYear ? parseInt(form.publicationYear) : undefined,
    };
    if (editBook) {
      updateBook.mutate({ id: editBook._id, book: payload });
    } else {
      createBook.mutate(payload);
    }
  }

  const books = data?.data?.data?.data || [];
  const totalPages = data?.data?.data?.totalPages || 1;

  return (
    <AdminLayout
      title="Catalog Management"
      subtitle="Add, edit, and manage library books"
      actions={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Book</Button>}
    >
      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search books..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-navy-700">
              <tr className="text-left text-xs text-stone-500 dark:text-stone-400">
                <th className="px-4 py-3 font-medium">Book</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Copies</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-navy-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-stone-100 dark:bg-navy-700 animate-pulse rounded" /></td></tr>
                ))
              ) : books.map((book) => (
                <tr key={book._id} className="hover:bg-stone-50/50 dark:hover:bg-navy-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={book.coverImage || generateBookPlaceholder(book.title)} alt="" className="w-8 h-10 rounded object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = generateBookPlaceholder(book.title); }} />
                      <div>
                        <p className="font-medium text-stone-800 dark:text-stone-100 max-w-xs truncate">{book.title}</p>
                        <p className="text-xs text-stone-400">{book.authors.join(', ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="indigo">{book.category}</Badge></td>
                  <td className="px-4 py-3 text-stone-500 dark:text-stone-400 capitalize">{book.format}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${book.availableCopies === 0 ? 'text-red-500' : 'text-teal-600'}`}>
                      {book.totalCopies >= 999 ? '∞' : `${book.availableCopies}/${book.totalCopies}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={book.availableCopies > 0 ? 'available' : 'borrowed'}>
                      {book.totalCopies >= 999 ? 'Digital' : book.availableCopies > 0 ? 'Available' : 'All Out'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => openEdit(book)}>Edit</Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5" />} className="text-red-500 hover:text-red-600" onClick={() => { if (confirm('Remove this book?')) deleteBook.mutate(book._id); }}>Remove</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-stone-100 dark:border-navy-700">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editBook ? 'Edit Book' : 'Add New Book'} size="xl">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input label="ISBN" value={form.isbn} onChange={(e) => update('isbn', e.target.value)} placeholder="978-0-..." className="font-mono" />
            </div>
            <div className="mt-6">
              <Button variant="secondary" onClick={handleIsbnLookup} loading={isbnLoading} size="sm">
                Lookup
              </Button>
            </div>
          </div>
          <Input label="Title *" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Book title" required />
          <Input label="Authors (comma-separated) *" value={form.authors} onChange={(e) => update('authors', e.target.value)} placeholder="Author 1, Author 2" required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category *" value={form.category} onChange={(e) => update('category', e.target.value)} options={BOOK_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <Select label="Format *" value={form.format} onChange={(e) => update('format', e.target.value)} options={BOOK_FORMATS.map((f) => ({ value: f.value, label: f.label }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Copies" type="number" value={form.totalCopies} onChange={(e) => update('totalCopies', e.target.value)} min="0" />
            <Input label="Publisher" value={form.publisher} onChange={(e) => update('publisher', e.target.value)} />
            <Input label="Year" type="number" value={form.publicationYear} onChange={(e) => update('publicationYear', e.target.value)} placeholder="2024" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Shelf Location" value={form.shelfLocation} onChange={(e) => update('shelfLocation', e.target.value)} placeholder="A1-001" />
            <Select label="Condition" value={form.condition} onChange={(e) => update('condition', e.target.value)} options={BOOK_CONDITIONS.map((c) => ({ value: c.value, label: c.label }))} />
          </div>
          <Input label="Cover Image URL" value={form.coverImage} onChange={(e) => update('coverImage', e.target.value)} placeholder="https://..." />
          {form.format === 'ebook' && (
            <>
              <Input label="E-Book URL (Gutenberg / Archive.org)" value={form.ebookUrl} onChange={(e) => update('ebookUrl', e.target.value)} placeholder="https://www.gutenberg.org/files/..." />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Media Type" value={form.mediaType} onChange={(e) => update('mediaType', e.target.value)} placeholder="gutenberg / archive / external" />
                <Input label="Digital URL (legacy)" value={form.digitalUrl} onChange={(e) => update('digitalUrl', e.target.value)} placeholder="https://..." />
              </div>
            </>
          )}
          {form.format === 'audiobook' && (
            <>
              <Input label="Audiobook URL (LibriVox / Archive.org)" value={form.audiobookUrl} onChange={(e) => update('audiobookUrl', e.target.value)} placeholder="https://librivox.org/..." />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Media Type" value={form.mediaType} onChange={(e) => update('mediaType', e.target.value)} placeholder="librivox / archive / external" />
                <Input label="Digital URL (legacy)" value={form.digitalUrl} onChange={(e) => update('digitalUrl', e.target.value)} placeholder="https://..." />
              </div>
            </>
          )}
          <Textarea label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Book synopsis..." />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="nigeria, fiction, classic" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button
              loading={createBook.isPending || updateBook.isPending}
              onClick={handleSubmit}
              className="flex-1"
            >
              {editBook ? 'Save Changes' : 'Add Book'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
