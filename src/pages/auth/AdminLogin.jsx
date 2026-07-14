// Admin Login Page — Dedicated secure login for TNSA administrators
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInWithEmail } from '@/firebase/auth';
import { getUserById } from '@/firebase/firestore';
import { loginSchema } from '@/utils/validators';
import { GoldButton, InputField } from '@/components/ui';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await signInWithEmail(data.email, data.password);
      const user   = await getUserById(result.user.uid);

      if (user?.role !== 'admin') {
        // Signed in but not an admin — sign out and show error
        const { supabase } = await import('@/supabase/config');
        await supabase.auth.signOut();
        toast.error('Access denied. This login is for administrators only.');
        return;
      }

      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      const msg = err.message?.toLowerCase().includes('invalid login')
        ? 'Invalid email or password'
        : err.message?.toLowerCase().includes('email not confirmed')
        ? 'Please confirm your email before logging in'
        : err.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Background decorations — darker red-ish tint to differentiate from member login */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4AF37, transparent)', transform: 'translate(40%,-40%)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4AF37, transparent)', transform: 'translate(-40%,40%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 0 40px rgba(212,175,55,0.12)',
            }}
          >
            <ShieldCheck size={38} style={{ color: '#D4AF37' }} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gold-gradient">Admin Portal</h1>
          <p className="text-white/40 text-sm mt-1">Tamilnadu Silambattam Association</p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
            🔒 Restricted Access
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card-gold p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">Administrator Sign In</h2>
            <p className="text-white/40 text-sm mt-1">Only authorized admin accounts can access this portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Admin Email"
              type="email"
              placeholder="admin@tnsa.org"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">
                Password <span className="text-gold">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-gold pl-10 pr-12 ${errors.password ? 'border-red-500/60' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-gold transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">⚠ {errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-gold/70 hover:text-gold transition-colors">
                Forgot password?
              </Link>
            </div>

            <GoldButton type="submit" loading={loading} fullWidth size="lg" icon={<ShieldCheck size={16} />}>
              Sign In as Admin
            </GoldButton>
          </form>

          {/* Divider */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-center text-xs text-white/30">
              Not an admin?{' '}
              <Link to="/login" className="text-gold/60 hover:text-gold transition-colors font-medium">
                Member Login →
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2024 Tamilnadu Silambattam Association. Regd.No:232/1980
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
