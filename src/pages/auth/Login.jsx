// Login Page — Premium black/gold auth page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInWithEmail, signInWithGoogle } from '@/firebase/auth';
import { getUserById } from '@/firebase/firestore';
import { loginSchema } from '@/utils/validators';
import { GoldButton, InputField, GoldDivider } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
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

          <GoldDivider label="or continue with" />

          {/* Google Sign In */}
          <GoldButton
            variant="ghost"
            fullWidth
            loading={googleLoading}
            onClick={handleGoogle}
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            Continue with Google
          </GoldButton>

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
