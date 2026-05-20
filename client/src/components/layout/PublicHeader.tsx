import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Bell, User, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function PublicHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleDark() {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-navy-900/95 backdrop-blur-sm border-b border-stone-100 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-stone-900 dark:text-white group-hover:text-indigo-600 transition-colors">
              LibraryHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/catalog" className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-navy-800 hover:text-stone-900 dark:hover:text-white transition-all">
              Catalog
            </Link>
            <Link to="/catalog?format=ebook" className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-navy-800 hover:text-stone-900 dark:hover:text-white transition-all">
              E-Books
            </Link>
            {isAuthenticated && user?.role !== 'patron' && (
              <Link to="/admin" className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-navy-800 transition-all">
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-navy-800 text-stone-500 dark:text-stone-400 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link to="/catalog" className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-navy-800 text-stone-500 dark:text-stone-400 transition-colors">
              <Search className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-navy-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.firstName[0]}{user?.lastName[0]}
                    </div>
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-200 hidden sm:block">
                      {user?.firstName}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-navy-800 rounded-xl shadow-warm-lg border border-stone-100 dark:border-navy-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <Link to="/patron" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-navy-700 text-sm text-stone-700 dark:text-stone-200">
                        <User className="w-4 h-4" /> My Dashboard
                      </Link>
                      <button
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-navy-700 text-sm text-red-600 dark:text-red-400"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm"
                >
                  Get Card
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-navy-800 text-stone-500 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-stone-100 dark:border-navy-800">
            <Link to="/catalog" className="block px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-navy-800">Catalog</Link>
            <Link to="/catalog?format=ebook" className="block px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-navy-800">E-Books</Link>
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-lg text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-navy-800">Sign In</Link>
                <Link to="/register" className="block px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-stone-50 dark:hover:bg-navy-800">Get Library Card</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
