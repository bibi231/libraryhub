import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, Book, Users, ArrowLeftRight,
  Calendar, DollarSign, BarChart3, ChevronLeft, ChevronRight,
  Bell, LogOut, Settings, Menu,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/catalog', icon: Book, label: 'Catalog' },
  { path: '/admin/borrows', icon: ArrowLeftRight, label: 'Borrows & Returns' },
  { path: '/admin/reservations', icon: Calendar, label: 'Reservations' },
  { path: '/admin/patrons', icon: Users, label: 'Patrons' },
  { path: '/admin/fines', icon: DollarSign, label: 'Fines' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(path: string, exact = false) {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  }

  return (
    <aside className={`flex flex-col ${collapsed ? 'w-16' : 'w-64'} h-screen bg-white dark:bg-navy-800 border-r border-stone-100 dark:border-navy-700 transition-all duration-200 fixed left-0 top-0 z-30`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100 dark:border-navy-700">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-serif font-bold text-stone-900 dark:text-white">LibraryHub</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-navy-700 text-stone-400 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label, exact }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(path, exact)
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-navy-700 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive(path, exact) ? 'text-indigo-600' : ''}`} />
            {!collapsed && <span>{label}</span>}
            {isActive(path, exact) && !collapsed && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </Link>
        ))}
      </nav>

      {/* User / bottom */}
      <div className="border-t border-stone-100 dark:border-navy-700 p-3 space-y-1">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-stone-400 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-navy-700 hover:text-red-600 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
