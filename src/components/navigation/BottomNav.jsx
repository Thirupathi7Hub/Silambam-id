// Bottom Navigation — Mobile-first sticky nav with gold active state
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/firebase/auth';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home'    },
  { to: '/card',      icon: CreditCard,      label: 'Card'    },
  { to: '/profile',   icon: User,            label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const { userData } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav"
      style={{
        background: 'rgba(17, 17, 17, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-safe" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-4 py-1 touch-target min-w-[64px]"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -inset-2 rounded-xl"
                    style={{ background: 'rgba(212, 175, 55, 0.12)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  style={{ color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.45)' }}
                  className="relative z-10 transition-colors duration-200"
                />
              </motion.div>
              <span
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}
              >
                {label}
              </span>
            </NavLink>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-1 touch-target min-w-[64px]"
        >
          <LogOut size={22} className="text-white/45 hover:text-red-400 transition-colors duration-200" />
          <span className="text-xs font-medium text-white/40">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
