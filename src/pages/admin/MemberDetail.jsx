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

// ── Shared Card Elements (Duplicate for admin rendering off-screen) ──
const CardFront = React.forwardRef(({ member }, ref) => (
  <div ref={ref} style={{ width:'340px', height:'520px', background:'#000', borderRadius:'16px', overflow:'hidden', position:'relative', fontFamily:'Georgia, serif', flexShrink: 0 }}>
    <div style={{ position:'absolute', top:10, left:10, width:40, height:40, borderTop:'2px solid #D4AF37', borderLeft:'2px solid #D4AF37', borderRadius:'4px 0 0 0' }} />
    <div style={{ position:'absolute', top:10, right:10, width:40, height:40, borderTop:'2px solid #D4AF37', borderRight:'2px solid #D4AF37', borderRadius:'0 4px 0 0' }} />
    <div style={{ position:'absolute', bottom:10, left:10, width:40, height:40, borderBottom:'2px solid #D4AF37', borderLeft:'2px solid #D4AF37', borderRadius:'0 0 0 4px' }} />
    <div style={{ position:'absolute', bottom:10, right:10, width:40, height:40, borderBottom:'2px solid #D4AF37', borderRight:'2px solid #D4AF37', borderRadius:'0 0 4px 0' }} />
    <div style={{ padding:'20px 20px 16px', display:'flex', flexDirection:'column', height:'100%', position:'relative', zIndex:1 }}>
      <div style={{ textAlign:'center', marginBottom:'10px' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', border:'2px solid #D4AF37', margin:'0 auto 8px', background:'rgba(212,175,55,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'bold', color:'#D4AF37' }}>TNSA</div>
        <div style={{ color:'#D4AF37', fontSize:'11px', fontWeight:'bold', letterSpacing:'1px', lineHeight:'1.3' }}>TAMILNADU SILAMBATTAM ASSOCIATION</div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'9px', fontStyle:'italic', marginTop:'2px' }}>( Regd.No:232/1980 )</div>
        <div style={{ background:'linear-gradient(135deg, #D4AF37, #A88B2A)', borderRadius:'6px', padding:'4px 8px', margin:'6px 0', fontSize:'8px', color:'#000', textAlign:'center', lineHeight:'1.4' }}>Address : #41, Natesan Nagar, 3rd main road, Virugambakkam, Chennai - 92</div>
        <div style={{ color:'#ffffff', fontSize:'14px', fontWeight:'900', letterSpacing:'1px', marginTop:'4px' }}>TNSA - MEMBERSHIP CARD</div>
      </div>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'12px' }}>
        <div style={{ width:90, height:90, borderRadius:'50%', border:'3px solid #D4AF37', overflow:'hidden', background:'rgba(212,175,55,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {member?.photoURL ? <img src={member.photoURL} alt="Member" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ color:'#D4AF37', fontSize:'24px', fontWeight:'bold' }}>{member?.name?.[0] || '?'}</span>}
        </div>
      </div>
      <div style={{ flex:1, paddingLeft:'8px' }}>
        {[
          ['Name', member?.name],
          ['Membership ID', member?.membershipId],
          ['District', member?.district],
          ['Date Of Birth', member?.dob ? formatDate(member.dob) : '—'],
          ['Gender', member?.gender],
          ['Aadhar', member?.aadhaar ? `XXXX XXXX ${member.aadhaar.slice(-4)}` : '—'],
          ['Category', member?.category],
        ].map(([label, value]) => (
          <div key={label} style={{ display:'flex', alignItems:'baseline', marginBottom:'5px', gap:'6px' }}>
            <span style={{ color:'#ffffff', fontSize:'10px', fontStyle:'italic', minWidth:'82px', flexShrink:0 }}>{label}</span>
            <span style={{ color:'#D4AF37', fontSize:'10px' }}>:</span>
            <span style={{ color:'#ffffff', fontSize:'10px', fontWeight:'500', flex:1 }}>{value || '—'}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'flex-end', marginTop:'4px' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'18px', fontFamily:'cursive', marginBottom:'2px' }}>Rly</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'8px', borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:'2px' }}>President - TNSA</div>
        </div>
      </div>
    </div>
  </div>
));
CardFront.displayName = 'CardFront';

const CardBack = React.forwardRef(({ member }, ref) => {
  const verifyUrl = `${window.location.origin}/verify/${member?.membershipId}`;
  return (
    <div ref={ref} style={{ width:'340px', height:'520px', background:'#000', borderRadius:'16px', overflow:'hidden', position:'relative', fontFamily:'Georgia, serif', flexShrink:0 }}>
      <div style={{ position:'absolute', top:10, left:10, width:40, height:40, borderTop:'2px solid #D4AF37', borderLeft:'2px solid #D4AF37', borderRadius:'4px 0 0 0' }} />
      <div style={{ position:'absolute', top:10, right:10, width:40, height:40, borderTop:'2px solid #D4AF37', borderRight:'2px solid #D4AF37', borderRadius:'0 4px 0 0' }} />
      <div style={{ position:'absolute', bottom:10, left:10, width:40, height:40, borderBottom:'2px solid #D4AF37', borderLeft:'2px solid #D4AF37', borderRadius:'0 0 0 4px' }} />
      <div style={{ position:'absolute', bottom:10, right:10, width:40, height:40, borderBottom:'2px solid #D4AF37', borderRight:'2px solid #D4AF37', borderRadius:'0 0 4px 0' }} />
      <div style={{ padding:'20px', display:'flex', flexDirection:'column', height:'100%', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:'14px' }}>
          <div style={{ color:'#D4AF37', fontSize:'11px', fontWeight:'bold', letterSpacing:'1px' }}>TAMILNADU SILAMBATTAM ASSOCIATION</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'9px', fontStyle:'italic' }}>( Regd.No:232/1980 )</div>
        </div>
        <div style={{ marginBottom:'14px' }}>
          {[
            ['Father Name', member?.fatherName],
            ['Club Name', member?.clubName],
            ['Position in TNSA', member?.position],
            ['Contact Number', member?.mobile],
            ['Address', member?.address],
          ].map(([label, value]) => (
            <div key={label} style={{ display:'flex', marginBottom:'8px', gap:'6px', alignItems:'flex-start' }}>
              <span style={{ color:'#ffffff', fontSize:'10px', fontStyle:'italic', minWidth:'96px', flexShrink:0 }}>{label}</span>
              <span style={{ color:'#D4AF37', fontSize:'10px', flexShrink:0 }}>:</span>
              <span style={{ color:'#ffffff', fontSize:'10px', flex:1, lineHeight:'1.3' }}>{value || '—'}</span>
            </div>
          ))}
        </div>
        <div style={{ border:'1px solid #D4AF37', borderRadius:'8px', padding:'10px', marginBottom:'12px', fontSize:'8px', color:'rgba(255,255,255,0.75)', lineHeight:'1.6', textAlign:'justify' }}>
          I agree to abide by and be bound by the Constitution, Rules, Regulations, Code of Conduct, and Disciplinary Procedures of the <span style={{ color:'#D4AF37' }}>Tamil Nadu Silambattam Association (TNSA)</span> and the <span style={{ color:'#D4AF37' }}>Indian Silambam Federation (ISF)</span>, as amended from time to time.
        </div>
        <div style={{ display:'flex', justify:'center', justifyContent:'center', marginBottom:'10px' }}>
          <div style={{ background:'white', padding:'6px', borderRadius:'8px' }}>
            <QRCodeSVG value={verifyUrl} size={60} level="M" />
          </div>
        </div>
        <div style={{ marginBottom:'8px', fontSize:'8px', color:'rgba(255,255,255,0.6)', textAlign:'center', lineHeight:'1.8' }}>
          <div>   {APP_PHONE} &nbsp;|&nbsp; 📷 {APP_INSTAGRAM} &nbsp;|&nbsp; fb {APP_FACEBOOK}</div>
          <div>✉ {APP_EMAIL}</div>
        </div>
        <div style={{ textAlign:'center', marginTop:'auto' }}>
          <div style={{ color:'#D4AF37', fontSize:'13px', fontWeight:'bold', letterSpacing:'2px', borderTop:'1px solid rgba(212,175,55,0.3)', paddingTop:'8px' }}>VALID TILL : {VALID_TILL_YEAR}</div>
        </div>
      </div>
    </div>
  );
});
CardBack.displayName = 'CardBack';

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

  const downloadCard = useCallback(async (side = 'front') => {
    const ref = side === 'front' ? frontRef : backRef;
    if (!ref.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: '#000000',
        useCORS: true,
        allowTaint: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `TNSA-Card-${member?.membershipId}-${side}.png`;
      link.href = url;
      link.click();
      toast.success('Downloaded successfully');
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  }, [member]);

  const printCard = useCallback(async () => {
    try {
      const frontCanvas = await html2canvas(frontRef.current, { scale: 2, backgroundColor:'#000', useCORS:true });
      const backCanvas = await html2canvas(backRef.current, { scale: 2, backgroundColor:'#000', useCORS:true });
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>TNSA Card - ${member?.membershipId}</title>
        <style>body { margin:0; display:flex; flex-direction:column; align-items:center; gap:20px; padding:20px; } img { border-radius:16px; max-width:340px; }</style></head><body>
        <img src="${frontCanvas.toDataURL()}" />
        <img src="${backCanvas.toDataURL()}" />
        <script>window.onload = () => { window.print(); window.close(); }</script>
        </body></html>
      `);
      win.document.close();
    } catch {
      toast.error('Print failed');
    }
  }, [member]);

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
              <CardFront ref={frontRef} member={member} />
              <CardBack ref={backRef} member={member} />
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
