import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '@/firebase/auth';
import { passwordResetSchema } from '@/utils/validators';
import { GoldButton, InputField } from '@/components/ui';

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error('Failed to send reset email. Check the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Swords size={28} style={{ color: '#D4AF37' }} />
          </div>
          <h1 className="text-2xl font-bold text-gold-gradient">Reset Password</h1>
          <p className="text-white/50 text-sm mt-1">TNSA Member Portal</p>
        </div>

        <div className="glass-card-gold p-6 space-y-5">
          {!sent ? (
            <>
              <div>
                <h2 className="text-lg font-bold text-white">Forgot your password?</h2>
                <p className="text-white/50 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputField label="Email Address" type="email" placeholder="your@email.com"
                  icon={<Mail size={16} />} error={errors.email?.message} required
                  {...register('email')} />
                <GoldButton type="submit" loading={loading} fullWidth size="lg">Send Reset Email</GoldButton>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto text-2xl">✉️</div>
              <h3 className="text-white font-bold">Check your email!</h3>
              <p className="text-white/50 text-sm">We've sent a password reset link to your email address.</p>
            </div>
          )}
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-gold transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
