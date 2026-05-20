import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })));
const CatalogPage = lazy(() => import('@/pages/public/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const BookDetailPage = lazy(() => import('@/pages/public/BookDetailPage').then((m) => ({ default: m.BookDetailPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

const PatronDashboardPage = lazy(() => import('@/pages/patron/PatronDashboardPage').then((m) => ({ default: m.PatronDashboardPage })));
const PatronHistoryPage = lazy(() => import('@/pages/patron/PatronHistoryPage').then((m) => ({ default: m.PatronHistoryPage })));
const PatronFinesPage = lazy(() => import('@/pages/patron/PatronFinesPage').then((m) => ({ default: m.PatronFinesPage })));
const ReadingListPage = lazy(() => import('@/pages/patron/ReadingListPage').then((m) => ({ default: m.ReadingListPage })));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminCatalogPage = lazy(() => import('@/pages/admin/AdminCatalogPage').then((m) => ({ default: m.AdminCatalogPage })));
const AdminBorrowsPage = lazy(() => import('@/pages/admin/AdminBorrowsPage').then((m) => ({ default: m.AdminBorrowsPage })));
const AdminReservationsPage = lazy(() => import('@/pages/admin/AdminReservationsPage').then((m) => ({ default: m.AdminReservationsPage })));
const AdminPatronsPage = lazy(() => import('@/pages/admin/AdminPatronsPage').then((m) => ({ default: m.AdminPatronsPage })));
const AdminFinesPage = lazy(() => import('@/pages/admin/AdminFinesPage').then((m) => ({ default: m.AdminFinesPage })));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-navy-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Loading...</p>
      </div>
    </div>
  );
}

function RequireAuth({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && user?.role === 'patron') {
    return <Navigate to="/patron" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { refreshUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Patron */}
        <Route path="/patron" element={<RequireAuth><PatronDashboardPage /></RequireAuth>} />
        <Route path="/patron/history" element={<RequireAuth><PatronHistoryPage /></RequireAuth>} />
        <Route path="/patron/fines" element={<RequireAuth><PatronFinesPage /></RequireAuth>} />
        <Route path="/patron/reading-list" element={<RequireAuth><ReadingListPage /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboardPage /></RequireAuth>} />
        <Route path="/admin/catalog" element={<RequireAuth adminOnly><AdminCatalogPage /></RequireAuth>} />
        <Route path="/admin/borrows" element={<RequireAuth adminOnly><AdminBorrowsPage /></RequireAuth>} />
        <Route path="/admin/reservations" element={<RequireAuth adminOnly><AdminReservationsPage /></RequireAuth>} />
        <Route path="/admin/patrons" element={<RequireAuth adminOnly><AdminPatronsPage /></RequireAuth>} />
        <Route path="/admin/fines" element={<RequireAuth adminOnly><AdminFinesPage /></RequireAuth>} />
        <Route path="/admin/reports" element={<RequireAuth adminOnly><AdminReportsPage /></RequireAuth>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
