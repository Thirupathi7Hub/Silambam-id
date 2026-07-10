import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Swords } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 text-center">
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
        <Swords size={40} className="text-gold/60" />
      </div>
      <div>
        <h1 className="text-6xl font-bold text-gold-gradient">404</h1>
        <h2 className="text-xl font-semibold text-white mt-2">Page Not Found</h2>
        <p className="text-white/50 text-sm mt-2 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Link to="/" className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-dark-900">
        <Home size={16} /> Back to Home
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
