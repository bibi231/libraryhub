import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, ArrowRight, Users, BookMarked, TrendingUp, Star, Clock, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { BookCard } from '@/components/catalog/BookCard';
import { SearchBar } from '@/components/catalog/SearchBar';
import type { IBook } from '@libraryhub/shared';

const testimonials = [
  { name: 'Adaora Nnadi', role: 'University Student', text: 'LibraryHub transformed my study experience. I can reserve books before others even know they\'re available!', rating: 5 },
  { name: 'Babatunde Adeyemi', role: 'Entrepreneur', text: 'The digital collection is incredible. I finished three business books this month without leaving my office.', rating: 5 },
  { name: 'Chisom Okafor', role: 'Teacher', text: 'My students love browsing the children\'s section. The interface is so easy, even they can use it independently.', rating: 5 },
];

export function LandingPage() {
  const { data: newArrivals } = useQuery<{ data: { data: IBook[] } }>({
    queryKey: ['newArrivals'],
    queryFn: () => api.get('/books/new-arrivals'),
  });

  const { data: popular } = useQuery<{ data: { data: IBook[] } }>({
    queryKey: ['popularBooks'],
    queryFn: () => api.get('/books/popular'),
  });

  const { data: overview } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get('/reports/overview').then((r) => r.data.data),
  });

  const books = newArrivals?.data?.data || [];
  const popularBooks = popular?.data?.data || [];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-cream-50 dark:from-navy-900 dark:to-navy-800" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium mb-6">
              <BookMarked className="w-4 h-4" />
              Now with E-Books & Audiobooks
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-stone-900 dark:text-stone-50 leading-tight text-balance">
              Discover, Reserve,
              <br />
              <span className="text-indigo-600">Read — All Online</span>
            </h1>
            <p className="mt-6 text-xl text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
              Your complete public library, digitized. Search thousands of books, reserve your copy, and pick it up at your convenience.
            </p>

            {/* Main CTA Search */}
            <div className="mt-10 max-w-2xl mx-auto">
              <SearchBar size="lg" placeholder="Search books, authors, topics..." autoNavigate />
              <p className="mt-3 text-sm text-stone-400">
                Popular:{' '}
                {['Chinua Achebe', 'Chimamanda Adichie', 'Clean Code', 'African History'].map((q, i) => (
                  <span key={q}>
                    <Link to={`/catalog?search=${encodeURIComponent(q)}`} className="text-indigo-600 hover:text-indigo-700 font-medium">{q}</Link>
                    {i < 3 && <span className="text-stone-300 mx-1">·</span>}
                  </span>
                ))}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/catalog" className="btn-primary text-base px-8 py-3 rounded-xl inline-flex items-center gap-2 justify-center">
                <BookOpen className="w-5 h-5" />
                Browse Catalog
              </Link>
              <Link to="/register" className="btn-secondary text-base px-8 py-3 rounded-xl inline-flex items-center gap-2 justify-center">
                Get Free Library Card
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-stone-100 dark:border-navy-800 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { icon: BookOpen, value: overview?.totalBooks ? `${overview.totalBooks.toLocaleString()}+` : '30,000+', label: 'Books & Resources' },
              { icon: Users, value: overview?.totalPatrons ? `${overview.totalPatrons.toLocaleString()}+` : '5,000+', label: 'Active Members' },
              { icon: TrendingUp, value: overview?.activeBorrows ? `${overview.activeBorrows.toLocaleString()}+` : '1,200+', label: 'Books Borrowed Monthly' },
            ].map(({ icon: Icon, value, label }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-50">{value}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-50">How It Works</h2>
          <p className="mt-3 text-stone-500 dark:text-stone-400">Get started in three simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: '🎫',
              title: 'Register',
              desc: 'Create your free account and receive a unique digital Library Card in under 2 minutes.',
            },
            {
              step: '02',
              icon: '🔍',
              title: 'Browse & Reserve',
              desc: 'Search our catalog, filter by category or format, and reserve your copy with one click.',
            },
            {
              step: '03',
              icon: '📚',
              title: 'Read',
              desc: 'Pick up physical books at the library, or read E-Books and Audiobooks instantly online.',
            },
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-navy-800 rounded-2xl p-8 shadow-warm border border-stone-100 dark:border-navy-700 relative"
            >
              <div className="absolute top-4 right-4 font-serif text-5xl font-bold text-stone-50 dark:text-navy-700 select-none">
                {item.step}
              </div>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">{item.title}</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {books.length > 0 && (
        <section className="py-16 bg-white dark:bg-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">New Arrivals</h2>
                <p className="mt-1 text-stone-500 dark:text-stone-400">Fresh additions to the collection</p>
              </div>
              <Link to="/catalog?sort=createdAt" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {books.map((book) => (
                  <div key={book._id} className="w-44 flex-shrink-0">
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Books */}
      {popularBooks.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">Most Popular</h2>
              <p className="mt-1 text-stone-500 dark:text-stone-400">What members are reading this month</p>
            </div>
            <Link to="/catalog?sort=popularity" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularBooks.slice(0, 10).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-white">What Members Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-indigo-200 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-serif font-bold text-white">LibraryHub</span>
              </div>
              <p className="text-sm">Your Library, Digitized. Open to all, free for life.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Browse</h4>
              <ul className="space-y-2 text-sm">
                {['All Books', 'E-Books', 'Audiobooks', 'New Arrivals', 'Popular'].map((l) => (
                  <li key={l}><Link to="/catalog" className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Account</h4>
              <ul className="space-y-2 text-sm">
                {['Login', 'Register', 'My Dashboard', 'My Borrows', 'Fines'].map((l) => (
                  <li key={l}><Link to="/login" className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Library Hours</h4>
              <ul className="space-y-1 text-sm">
                <li>Mon–Fri: 8am – 8pm</li>
                <li>Sat: 9am – 6pm</li>
                <li>Sun: 10am – 4pm</li>
                <li className="mt-3">
                  <a href="mailto:info@libraryhub.ng" className="hover:text-white transition-colors">info@libraryhub.ng</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-6 text-center text-xs text-stone-600">
            © {new Date().getFullYear()} LibraryHub. Built with ❤️ for the community.
          </div>
        </div>
      </footer>
    </div>
  );
}
