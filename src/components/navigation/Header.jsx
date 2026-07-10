// Sticky Header for user pages
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';

const Header = ({ title, showBack = false, showProfile = true, actions }) => {
  const navigate = useNavigate();
  const { userData } = useAuth();

  return (
    <header
      className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
      style={{
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-gold hover:bg-white/5 transition-all touch-target"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div className="flex-1">
        {title ? (
          <h1 className="text-base font-semibold text-white">{title}</h1>
        ) : (
          <div>
            <p className="text-xs text-white/40 leading-none">Welcome back,</p>
            <h1 className="text-sm font-bold text-gold leading-tight">
              {userData?.name?.split(' ')[0] || 'Member'}
            </h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {showProfile && (
          <Avatar
            src={userData?.photoURL}
            name={userData?.name}
            size="sm"
          />
        )}
      </div>
    </header>
  );
};

export default Header;
