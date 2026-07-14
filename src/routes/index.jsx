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

// ── Auth Guard: Redirect to login if not authenticated ──
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// ── Admin Guard: Only admin can access ──
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (!isAdmin)   return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Public Guard: Redirect logged-in users to their dashboard ──
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isLoggedIn) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
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
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/admin/login"    element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
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
