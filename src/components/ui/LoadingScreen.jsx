// LoadingScreen — Full-screen loading with TNSA branding
import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-50">
      {/* Logo area */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {/* TNSA Logo / Initial */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-2 border-transparent"
            style={{
              background: 'linear-gradient(#0a0a0a, #0a0a0a) padding-box, linear-gradient(135deg, #D4AF37, #F0C940, #A88B2A) border-box',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gold-gradient">TN</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gold-gradient tracking-wide">TNSA</h1>
          <p className="text-white/50 text-sm mt-1 font-light">Tamilnadu Silambattam Association</p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #D4AF37, #F0C940)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <p className="text-white/40 text-sm">{message}</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
