// AdminLayout — Sidebar + main content area
import React from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/navigation/AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-primary flex">
      <AdminSidebar />
      <motion.main
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 min-h-screen overflow-auto"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default AdminLayout;
