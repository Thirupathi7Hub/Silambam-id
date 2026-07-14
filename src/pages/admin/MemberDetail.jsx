// Admin Member Detail & Edit Page
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, User, Phone, MapPin, Building2, Shield, Calendar, CreditCard, Check, Edit3, Trash2, Download, Printer, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserById, updateUser, deleteUser } from '@/firebase/firestore';
import { uploadMemberPhoto, deleteMemberPhoto } from '@/firebase/storage';
import { profileUpdateSchema } from '@/utils/validators';
import AdminLayout from '@/layouts/AdminLayout';
import { GoldButton, InputField, SelectField, TextareaField, Avatar, Badge, GlassCard } from '@/components/ui';
import { CATEGORIES, POSITIONS } from '@/constants/app';
import { formatDate } from '@/utils/helpers';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { VALID_TILL_YEAR, APP_PHONE, APP_EMAIL, APP_INSTAGRAM, APP_FACEBOOK } from '@/constants/app';

import { CardFront, CardBack } from '@/pages/user/MembershipCard';
import { sendApprovalWhatsApp } from '@/services/whatsapp';

const DOWNLOAD_SCALE = 2.470588;


const AdminMemberDetail = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true');
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);

  const frontRef = useRef(null);
  const backRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileUpdateSchema)
  });

  const fetchMember = async () => {
    try {
      setLoading(true);
      const data = await getUserById(uid);
      if (!data) {
        toast.error('Member not found');
        navigate('/admin/members');
        return;
      }
      setMember(data);
      reset(data);
    } catch (err) {
      toast.error('Failed to load member info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [uid]);

  const handleUpdate = async (data) => {
    try {
      await updateUser(uid, data);
      toast.success('Member details updated');
      setEditing(false);
      fetchMember();
    } catch (err) {
      toast.error('Failed to update details');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMemberPhoto(file, uid, setPhotoProgress);
      await updateUser(uid, { photoURL: url });
      toast.success('Photo updated');
      fetchMember();
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      setPhotoProgress(0);
    }
  };

  const handleDeletePhoto = async () => {
    if (window.confirm('Delete photo?')) {
      try {
        await deleteMemberPhoto(uid);
        await updateUser(uid, { photoURL: '' });
        toast.success('Photo deleted');
        fetchMember();
      } catch (err) {
        toast.error('Failed to delete photo');
      }
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateUser(uid, { status });
      toast.success(`Status updated to ${status}`);

      // Send WhatsApp approval notification when admin approves
      if (status === 'active' && member?.mobile) {
        const result = await sendApprovalWhatsApp(
          member.mobile,
          member.name,
          member.membershipId
        );
        if (result.success) {
          toast.success(`✅ WhatsApp notification sent to ${member.mobile}`);
        } else {
          toast(`⚠️ Status updated but WhatsApp notification failed`, { icon: '⚠️' });
        }
      }

      fetchMember();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteUser(uid);
        toast.success('Member soft deleted');
        navigate('/admin/members');
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };
  const captureCard = useCallback(async (ref) => {
    if (!ref.current) return null;
    return html2canvas(ref.current, {
      scale: 1, // Already scaled to high-res in markup
      backgroundColor: null,
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
  }, []);

  const downloadCard = useCallback(async (side = 'front') => {
    const ref = side === 'front' ? frontRef : backRef;
    setDownloading(true);
    try {
      const canvas = await captureCard(ref);
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `TNSA-${member?.membershipId || 'Card'}-${side}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(`${side === 'front' ? 'Front' : 'Back'} downloaded!`);
    } catch {
      toast.error('Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  }, [member, captureCard]);

  const printCard = useCallback(async () => {
    setDownloading(true);
    try {
      const [fc, bc] = await Promise.all([
        captureCard(frontRef),
        captureCard(backRef),
      ]);
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>TNSA Membership Card — ${member?.membershipId}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#f0f0f0; display:flex; flex-direction:column;
                 align-items:center; gap:20px; padding:20px; }
          img { display:block; border-radius:12px; width:320px;
                box-shadow:0 4px 20px rgba(0,0,0,0.3); }
          p { font-family:sans-serif; font-size:11px; color:#888;
              text-align:center; margin-top:-12px; }
          @media print { body { background:white; padding:8px; gap:12px; }
                          img { width:280px; } }
        </style></head><body>
        <img src="${fc.toDataURL('image/png')}" />
        <p>Front Side</p>
        <img src="${bc.toDataURL('image/png')}" />
        <p>Back Side</p>
        <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1000);}</script>
        </body></html>
      `);
      win.document.close();
    } catch {
      toast.error('Print failed');
    } finally {
      setDownloading(false);
    }
  }, [member, captureCard]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-4">
          <ArrowLeft className="text-white/40 cursor-pointer" onClick={() => navigate('/admin/members')} />
          <div className="h-20 w-full shimmer rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 shimmer rounded-xl" />
            <div className="h-64 shimmer rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 py-6 space-y-6 pb-20 max-w-5xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/members')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 border border-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Member Details</h1>
            <p className="text-xs text-white/50">{member?.membershipId || 'Profile'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Info / Status */}
          <div className="space-y-6 lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <h2 className="text-base font-bold text-white">Profile Details</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="text-xs text-gold flex items-center gap-1 font-semibold touch-target">
                    <Edit3 size={12} /> Edit Detail
                  </button>
                ) : (
                  <button onClick={() => setEditing(false)} className="text-xs text-white/50 hover:text-white font-medium touch-target">
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Name" disabled={!editing} required {...register('name')} error={errors.name?.message} />
                  <InputField label="Father's Name" disabled={!editing} required {...register('fatherName')} error={errors.fatherName?.message} />
                  <InputField label="Mobile" disabled={!editing} required {...register('mobile')} error={errors.mobile?.message} maxLength={10} />
                  <InputField label="Club Name" disabled={!editing} required {...register('clubName')} error={errors.clubName?.message} />
                  <SelectField label="Category" disabled={!editing} required options={CATEGORIES} {...register('category')} error={errors.category?.message} />
                  <SelectField label="Position" disabled={!editing} required options={POSITIONS} {...register('position')} error={errors.position?.message} />
                </div>
                <TextareaField label="Address" disabled={!editing} required {...register('address')} error={errors.address?.message} />
                
                {editing && (
                  <GoldButton type="submit" fullWidth icon={<Check size={16} />}>Save Changes</GoldButton>
                )}
              </form>
            </GlassCard>

            {/* Account Status management */}
            <GlassCard className="p-6">
              <h2 className="text-base font-bold text-white mb-4">Account Control</h2>
              <div className="flex flex-wrap gap-3">
                <GoldButton variant={member?.status === 'active' ? 'gold' : 'ghost'} onClick={() => handleStatusChange('active')}>Set Active</GoldButton>
                <GoldButton variant={member?.status === 'inactive' ? 'gold' : 'ghost'} onClick={() => handleStatusChange('inactive')}>Set Inactive</GoldButton>
                <GoldButton variant={member?.status === 'pending' ? 'gold' : 'ghost'} onClick={() => handleStatusChange('pending')}>Set Pending</GoldButton>
                <GoldButton variant="danger" onClick={handleDeleteUser} icon={<Trash2 size={16} />}>Delete User</GoldButton>
              </div>
            </GlassCard>
          </div>

          {/* Column 2: Photo upload & membership card preview/download */}
          <div className="space-y-6">
            <GlassCard className="p-6 flex flex-col items-center gap-4 text-center">
              <Avatar src={member?.photoURL} name={member?.name} size="2xl" />
              <div>
                <h3 className="text-white font-bold">{member?.name}</h3>
                <Badge variant={member?.status}>{member?.status}</Badge>
              </div>
              <div className="flex gap-2 w-full">
                <label className="btn-ghost flex-1 touch-target text-xs flex items-center justify-center gap-2 cursor-pointer py-2 rounded-xl">
                  <span>{uploading ? `Uploading...` : 'Change Photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
                {member?.photoURL && (
                  <button onClick={handleDeletePhoto} className="btn-ghost text-red-400 border-red-500/20 px-3 rounded-xl hover:bg-red-400/5">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </GlassCard>

            {/* Offline Off-screen Card rendering */}
            <div style={{ position:'fixed', left:'-9999px', top:0, pointerEvents:'none', zIndex:-1 }}>
              <CardFront ref={frontRef} member={member} scale={DOWNLOAD_SCALE} />
              <CardBack ref={backRef} member={member} scale={DOWNLOAD_SCALE} />
            </div>

            {/* Dynamic Card Actions */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Membership Card</h3>
              <div className="flex flex-col gap-2">
                <GoldButton fullWidth onClick={() => downloadCard('front')} loading={downloading} icon={<Download size={14} />}>Download Front</GoldButton>
                <GoldButton fullWidth variant="ghost" onClick={() => downloadCard('back')} icon={<Download size={14} />}>Download Back</GoldButton>
                <GoldButton fullWidth variant="ghost" onClick={printCard} icon={<Printer size={14} />}>Print Card</GoldButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMemberDetail;
