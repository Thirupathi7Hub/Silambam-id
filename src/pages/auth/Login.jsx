// Login Page — Premium black/gold auth page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInWithEmail } from '@/firebase/auth';
import { getUserById } from '@/firebase/firestore';
import { loginSchema } from '@/utils/validators';
import { GoldButton, InputField } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await signInWithEmail(data.email, data.password);
      const user = await getUserById(result.user.uid);
      toast.success('Welcome back!');
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      // Supabase uses err.message instead of Firebase's err.code
      const msg = err.message?.toLowerCase().includes('invalid login')
        ? 'Invalid email or password'
        : err.message?.toLowerCase().includes('email not confirmed')
        ? 'Please confirm your email before logging in'
        : err.message?.toLowerCase().includes('user not found')
        ? 'No account found with this email'
        : err.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #D4AF37, transparent)', transform: 'translate(-50%, -50%)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #D4AF37, transparent)', transform: 'translate(50%, 50%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <Swords size={36} style={{ color: '#D4AF37' }} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gold-gradient">TNSA</h1>
          <p className="text-white/50 text-sm mt-1">Tamilnadu Silambattam Association</p>
        </div>

        {/* Form card */}
        <div className="glass-card-gold p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">Welcome Back</h2>
            <p className="text-white/50 text-sm mt-1">Sign in to your member account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Email Address"
              type="email"
              placeholder="your@email.com"
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

            <GoldButton type="submit" loading={loading} fullWidth size="lg">
              Sign In
            </GoldButton>
          </form>

          <p className="text-center text-sm text-white/50">
            New member?{' '}
            <Link to="/register" className="text-gold font-semibold hover:text-gold-light transition-colors">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2024 Tamilnadu Silambattam Association. Regd.No:232/1980
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
