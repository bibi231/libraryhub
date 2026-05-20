import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import type { IBook } from '@libraryhub/shared';

function getEmbedUrl(url?: string): string {
  if (!url) return '';
  const archiveMatch = url.match(/archive\.org\/details\/([^/?]+)/);
  if (archiveMatch) return `https://archive.org/embed/${archiveMatch[1]}`;
  if (url.includes('gutenberg.org')) return url;
  return url;
}

export function EbookReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();

  const { data, isLoading } = useQuery<{ data: { data: { book: IBook } } }>({
    queryKey: ['book', bookId],
    queryFn: () => api.get(`/books/${bookId}`),
  });

  const book = data?.data?.data?.book;
  const readerUrl = book?.ebookUrl || book?.digitalUrl;
  const embedUrl = getEmbedUrl(readerUrl);
  const isGutenberg = readerUrl?.includes('gutenberg.org');

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <div className="bg-navy-900 border-b border-navy-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/ebooks"
            className="text-stone-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-4 bg-navy-700" />
          {isLoading ? (
            <Skeleton className="h-4 w-48 bg-navy-700" />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-white font-medium text-sm truncate max-w-xs">{book?.title}</span>
              <span className="text-stone-500 text-xs hidden sm:block flex-shrink-0">
                by {book?.authors.join(', ')}
              </span>
            </div>
          )}
        </div>
        {readerUrl && (
          <a
            href={readerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Full Screen
          </a>
        )}
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isGutenberg ? (
          // Gutenberg doesn't allow iframing — show a reader redirect page
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-5">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">{book?.title}</h2>
            <p className="text-stone-400 text-sm mb-2">by {book?.authors.join(', ')}</p>
            <p className="text-stone-500 text-sm mb-8 max-w-md">
              This e-book is hosted on Project Gutenberg. Click below to read it in a new tab — it's completely free.
            </p>
            <a
              href={readerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Read on Project Gutenberg
            </a>
            <Link to="/ebooks" className="mt-4 text-stone-500 hover:text-stone-300 text-sm transition-colors">
              ← Back to E-Books
            </Link>
          </div>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full"
            style={{ height: 'calc(100vh - 57px)' }}
            title={book?.title}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-12 h-12 text-stone-600 mb-4" />
            <p className="text-stone-400 mb-4">No online reader available for this book.</p>
            <Link to="/ebooks" className="text-indigo-400 hover:text-indigo-300 text-sm">
              ← Back to E-Books
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
