// App Router — Protected routes, lazy loading, role guards
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

// ── Lazy-loaded pages ──
const Login        = lazy(() => import('@/pages/auth/Login'));
const AdminLogin   = lazy(() => import('@/pages/auth/AdminLogin'));
const Register     = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const AdminSetup   = lazy(() => import('@/pages/auth/AdminSetup'));

const UserDashboard     = lazy(() => import('@/pages/user/Dashboard'));
const UserProfile       = lazy(() => import('@/pages/user/Profile'));
const MembershipCard    = lazy(() => import('@/pages/user/MembershipCard'));

const AdminDashboard    = lazy(() => import('@/pages/admin/Dashboard'));
const AdminMembers      = lazy(() => import('@/pages/admin/Members'));
const AdminMemberDetail = lazy(() => import('@/pages/admin/MemberDetail'));
const AdminReports      = lazy(() => import('@/pages/admin/Reports'));
const AdminSettings     = lazy(() => import('@/pages/admin/Settings'));

const VerifyMember = lazy(() => import('@/pages/verify/VerifyMember'));
const NotFound     = lazy(() => import('@/pages/NotFound'));

// ── Member Route: authenticated non-admin users ──
// Also blocks admins from accidentally landing on user pages
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />; // admin on user page → push to admin
  return children;
};

// ── Admin Route: confirmed admins only ──
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Public Route: /login and /register — redirect logged-in users ──
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isLoggedIn) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return children;
};

// ── Admin Public Route: /admin/login only ──
// Only redirects to /admin if the user is CONFIRMED as an admin (isAdmin = true).
// If user is logged in but NOT admin, it stays on the page so AdminLogin
// can detect them and show "Access denied".
const AdminPublicRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isLoggedIn && isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/verify/:membershipId" element={<VerifyMember />} />
        <Route path="/setup"    element={<AdminSetup />} />

        {/* ── Auth ── */}
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/admin/login"     element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* ── User ── */}
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/card"      element={<PrivateRoute><MembershipCard /></PrivateRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin"                  element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/members"          element={<AdminRoute><AdminMembers /></AdminRoute>} />
        <Route path="/admin/members/:uid"     element={<AdminRoute><AdminMemberDetail /></AdminRoute>} />
        <Route path="/admin/reports"          element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/settings"         element={<AdminRoute><AdminSettings /></AdminRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
