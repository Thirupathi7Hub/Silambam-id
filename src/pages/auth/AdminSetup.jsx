// Admin Setup — One-time admin account creation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerWithEmail } from '@/firebase/auth';
import { createUser, getMemberCount } from '@/firebase/firestore';
import { GoldButton, InputField } from '@/components/ui';

const AdminSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', secret: '' });

  const SECRET_KEY = 'TNSA@Admin2024';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.secret !== SECRET_KEY) { toast.error('Invalid setup key'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const cred = await registerWithEmail(form.email, form.password);
      await createUser(cred.user.uid, {
        uid: cred.user.uid,
        name: form.name,
        email: form.email,
        role: 'admin',
        status: 'active',
        membershipId: 'ADMIN',
        district: 'Chennai',
        districtCode: 'CHE',
      });
      toast.success('Admin account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-3">
            <Shield size={28} className="text-gold" />
          </div>
          <h1 className="text-xl font-bold text-gold-gradient">Admin Setup</h1>
          <p className="text-white/40 text-xs mt-1">One-time administrator account creation</p>
        </div>
        <div className="glass-card-gold p-6 space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400">
            ⚠ This page is for initial setup only. Disable it after creating your admin account.
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Admin Name" placeholder="Your name" value={form.name}
              onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            <InputField label="Email" type="email" placeholder="admin@tnsa.org" value={form.email}
              onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            <InputField label="Password" type="password" placeholder="Min 8 characters" value={form.password}
              onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
            <InputField label="Setup Secret Key" type="password" placeholder="Enter setup key"
              icon={<Lock size={14} />} value={form.secret}
              onChange={e => setForm(p => ({...p, secret: e.target.value}))} required
              hint="Contact TNSA HQ for the setup key" />
            <GoldButton type="submit" fullWidth loading={loading} size="lg">Create Admin Account</GoldButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetup;
