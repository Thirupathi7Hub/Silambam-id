// Admin Sidebar — Desktop sidebar + mobile drawer
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BarChart3, Settings,
  LogOut, Menu, X, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/firebase/auth';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui';

const NAV_ITEMS = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/members',  icon: Users,           label: 'Members'   },
  { to: '/admin/reports',  icon: BarChart3,       label: 'Reports'   },
  { to: '/admin/settings', icon: Settings,        label: 'Settings'  },
];

const SidebarContent = ({ onClose }) => {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-dark-900 font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F0C940)' }}
          >
            TN
          </div>
          <div>
            <p className="text-sm font-bold text-white">TNSA Admin</p>
            <p className="text-xs text-white/40">Management Portal</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="ml-auto text-white/40 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin profile + logout */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
          <Avatar src={userData?.photoURL} name={userData?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userData?.name || 'Admin'}</p>
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-gold" />
              <p className="text-xs text-gold">Administrator</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-400/5"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const AdminSidebar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0"
        style={{
          background: '#111111',
          borderRight: '1px solid rgba(212, 175, 55, 0.1)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile: Hamburger trigger */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center text-white"
        style={{ background: 'rgba(17,17,17,0.9)', border: '1px solid rgba(212,175,55,0.2)' }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden"
              style={{ background: '#111111', borderRight: '1px solid rgba(212,175,55,0.1)' }}
            >
              <SidebarContent onClose={() => setDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
