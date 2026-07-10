// AppLayout — User-facing mobile-first layout
import React from 'react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';

const AppLayout = ({ children, title, showBack = false, showProfile = true, headerActions, noPadding = false }) => {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col max-w-lg mx-auto relative">
      <Header
        title={title}
        showBack={showBack}
        showProfile={showProfile}
        actions={headerActions}
      />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`flex-1 ${noPadding ? '' : 'px-4 py-4'} pb-24`}
      >
        {children}
      </motion.main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;
