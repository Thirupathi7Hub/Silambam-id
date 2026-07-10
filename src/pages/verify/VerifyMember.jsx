// QR Code Verification Page — Checks member validity
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Award, Swords, ArrowLeft, Calendar, UserCheck } from 'lucide-react';
import { getUserByMembershipId } from '@/firebase/firestore';
import { formatDate } from '@/utils/helpers';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { VALID_TILL_YEAR } from '@/constants/app';

const VerifyMember = () => {
  const { membershipId } = useParams();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true);
        const user = await getUserByMembershipId(membershipId);
        setMember(user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [membershipId]);

  if (loading) {
    return <LoadingScreen message="Verifying credentials..." />;
  }

  const isValid = member && member.status === 'active';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-5 py-8 relative overflow-hidden">
      {/* Background glow depends on verification state */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: isValid
            ? 'radial-gradient(circle, #22c55e, transparent)'
            : 'radial-gradient(circle, #ef4444, transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* TNSA branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2 bg-white/5 border border-white/10">
            <Swords size={20} className="text-gold" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">TNSA Online Verification</h1>
          <p className="text-xs text-white/40">Tamilnadu Silambattam Association</p>
        </div>

        {/* Verification Card */}
        <div
          className="rounded-2xl border p-6 text-center space-y-6"
          style={{
            background: 'rgba(17, 17, 17, 0.9)',
            borderColor: isValid ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
            boxShadow: isValid
              ? '0 10px 30px -10px rgba(34, 197, 94, 0.2)'
              : '0 10px 30px -10px rgba(239, 68, 68, 0.2)',
          }}
        >
          {isValid ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
                <ShieldCheck size={36} />
              </div>
              <div>
                <span className="bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Verified Active Member
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <ShieldAlert size={36} />
              </div>
              <div>
                <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Invalid Membership
                </span>
              </div>
            </div>
          )}

          {/* Member info */}
          {member ? (
            <div className="space-y-4 border-t border-b border-white/5 py-4 text-left">
              {/* Photo preview */}
              {member.photoURL && (
                <div className="flex justify-center mb-2">
                  <img
                    src={member.photoURL}
                    alt="Verified Member"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gold/40"
                  />
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Member Name</span>
                  <span className="text-white font-semibold">{member.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">ID Number</span>
                  <span className="text-gold font-bold">{member.membershipId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">District</span>
                  <span className="text-white font-medium">{member.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Category</span>
                  <span className="text-white font-medium">{member.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Position</span>
                  <span className="text-white font-medium">{member.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Valid Till</span>
                  <span className="text-white font-semibold">{VALID_TILL_YEAR}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/50 py-4">
              Membership ID <span className="text-gold font-bold">{membershipId}</span> is not registered in our central database.
            </p>
          )}

          {/* Footer tagline */}
          <div className="text-xs text-white/30">
            {isValid ? (
              <p>✓ Central registry verification successful.</p>
            ) : (
              <p>⚠ Please scan a valid TNSA-issued card.</p>
            )}
          </div>
        </div>

        {/* Back Link */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white mt-6 transition-all"
        >
          <ArrowLeft size={12} />
          Go to Portal Login
        </Link>
      </motion.div>
    </div>
  );
};

export default VerifyMember;
