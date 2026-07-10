// User Dashboard — Member home page with profile summary, quick actions
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Download, User, MapPin, Shield, Clock, ChevronRight, Star, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/layouts/AppLayout';
import { GlassCard, GoldButton, Badge, Avatar, StatsCard } from '@/components/ui';
import { formatDate, maskAadhaar } from '@/utils/helpers';
import { VALID_TILL_YEAR } from '@/constants/app';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const statusColor = userData?.status === 'active' ? 'active' : 'inactive';

  return (
    <AppLayout showProfile={false}>
      <div className="space-y-5 pb-4">
        {/* ── Hero Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
          }}
        >
          {/* Gold corner decorations */}
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 60%)' }} />

          <div className="relative z-10">
            {/* Greeting */}
            <p className="text-white/50 text-xs mb-4">
              {greeting}, <span className="text-gold font-semibold">{userData?.name?.split(' ')[0] || 'Member'}</span>
            </p>

            {/* Profile row */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={userData?.photoURL} name={userData?.name} size="xl" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{userData?.name || 'Loading...'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusColor}>
                    {userData?.status === 'active' ? '● Active' : '● Inactive'}
                  </Badge>
                  <Badge variant="gold">{userData?.category || 'Member'}</Badge>
                </div>
              </div>
            </div>

            {/* Membership ID */}
            <div className="rounded-xl p-3 mb-4"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-xs text-white/40 mb-1">Membership ID</p>
              <p className="text-xl font-bold text-gold tracking-wider">{userData?.membershipId || '—'}</p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <MapPin size={14} />, label: 'District', value: userData?.district },
                { icon: <Trophy size={14} />, label: 'Position', value: userData?.position },
                { icon: <Shield size={14} />, label: 'Club', value: userData?.clubName },
                { icon: <Clock size={14} />, label: 'Valid Till', value: `${VALID_TILL_YEAR}` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-white/40">
                    {icon}
                    <span className="text-xs">{label}</span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <GoldButton fullWidth onClick={() => navigate('/card')}
            icon={<CreditCard size={16} />} size="md">
            View Card
          </GoldButton>
          <GoldButton fullWidth variant="ghost" onClick={() => navigate('/profile')}
            icon={<User size={16} />} size="md">
            Edit Profile
          </GoldButton>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <StatsCard
            icon={<Star size={18} />}
            label="Member Since"
            value={formatDate(userData?.createdAt, 'MMM yyyy')}
            color="gold"
          />
          <StatsCard
            icon={<Shield size={18} />}
            label="Valid Through"
            value={`Dec ${VALID_TILL_YEAR}`}
            color="green"
          />
        </motion.div>

        {/* ── Personal Info Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card-gold p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Personal Information</h3>
            <button onClick={() => navigate('/profile')} className="text-xs text-gold/70 flex items-center gap-1">
              Edit <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Father Name', value: userData?.fatherName },
              { label: 'Date of Birth', value: formatDate(userData?.dob) },
              { label: 'Gender', value: userData?.gender },
              { label: 'Aadhaar', value: maskAadhaar(userData?.aadhaar) },
              { label: 'Mobile', value: userData?.mobile },
              { label: 'Email', value: userData?.email },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                <span className="text-white/40">{label}</span>
                <span className="text-white text-right max-w-[55%] truncate">{value || '—'}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Address ── */}
        {userData?.address && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-gold" /> Address
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">{userData.address}</p>
          </motion.div>
        )}

        {/* TNSA tagline */}
        <p className="text-center text-white/20 text-xs py-2">
          Tamilnadu Silambattam Association • Regd.No:232/1980
        </p>
      </div>
    </AppLayout>
  );
};

export default UserDashboard;
