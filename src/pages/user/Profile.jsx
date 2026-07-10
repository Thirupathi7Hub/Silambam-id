// User Profile Page — View & Edit member details and change profile photo
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, MapPin, Building2, Trophy, Award, Upload, X, ShieldAlert, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { updateUser } from '@/firebase/firestore';
import { uploadMemberPhoto, deleteMemberPhoto } from '@/firebase/storage';
import { profileUpdateSchema } from '@/utils/validators';
import AppLayout from '@/layouts/AppLayout';
import { GoldButton, InputField, SelectField, TextareaField, Avatar } from '@/components/ui';
import { CATEGORIES, POSITIONS } from '@/constants/app';

const UserProfile = () => {
  const { userData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: userData?.name || '',
      fatherName: userData?.fatherName || '',
      mobile: userData?.mobile || '',
      address: userData?.address || '',
      clubName: userData?.clubName || '',
      position: userData?.position || '',
      category: userData?.category || '',
    }
  });

  const onSubmit = async (data) => {
    try {
      await updateUser(userData.uid, data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadMemberPhoto(file, userData.uid, setPhotoProgress);
      await updateUser(userData.uid, { photoURL: url });
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      setPhotoProgress(0);
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      try {
        await deleteMemberPhoto(userData.uid);
        await updateUser(userData.uid, { photoURL: '' });
        toast.success('Photo removed');
      } catch (err) {
        toast.error('Failed to remove photo');
      }
    }
  };

  const cancelEdit = () => {
    reset({
      name: userData?.name || '',
      fatherName: userData?.fatherName || '',
      mobile: userData?.mobile || '',
      address: userData?.address || '',
      clubName: userData?.clubName || '',
      position: userData?.position || '',
      category: userData?.category || '',
    });
    setEditing(false);
  };

  return (
    <AppLayout title="Profile" showBack>
      <div className="space-y-5 pb-4">
        {/* Photo Card */}
        <div className="glass-card-gold p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar src={userData?.photoURL} name={userData?.name} size="2xl" />
            {userData?.photoURL && (
              <button
                onClick={handleRemovePhoto}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 w-7 h-7 rounded-full flex items-center justify-center border-2 border-bg-primary text-white shadow-lg transition-all"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">{userData?.name}</h2>
            <p className="text-xs text-gold font-medium mt-0.5">{userData?.membershipId}</p>
          </div>

          <label className="btn-ghost touch-target text-xs flex items-center gap-2 cursor-pointer py-2 px-4 border border-white/10 hover:border-gold/30 rounded-xl transition-all">
            <Upload size={14} className="text-gold" />
            <span>{uploading ? `Uploading ${photoProgress}%` : 'Upload New Photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>

        {/* Details Card */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white">Member Details</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gold font-semibold hover:text-gold-light transition-all touch-target"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="text-xs text-white/50 hover:text-white transition-all touch-target"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Full Name"
              icon={<User size={14} />}
              disabled={!editing}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <InputField
              label="Father's Name"
              icon={<User size={14} />}
              disabled={!editing}
              error={errors.fatherName?.message}
              required
              {...register('fatherName')}
            />

            <InputField
              label="Mobile Number"
              icon={<Phone size={14} />}
              disabled={!editing}
              error={errors.mobile?.message}
              required
              maxLength={10}
              {...register('mobile')}
            />

            <SelectField
              label="Category"
              disabled={!editing}
              options={CATEGORIES}
              error={errors.category?.message}
              required
              {...register('category')}
            />

            <SelectField
              label="Position"
              disabled={!editing}
              options={POSITIONS}
              error={errors.position?.message}
              required
              {...register('position')}
            />

            <InputField
              label="Club Name"
              icon={<Building2 size={14} />}
              disabled={!editing}
              error={errors.clubName?.message}
              required
              {...register('clubName')}
            />

            <TextareaField
              label="Address"
              disabled={!editing}
              error={errors.address?.message}
              required
              {...register('address')}
            />

            {/* Read-Only Fields */}
            <div className="pt-2 border-t border-white/5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="District"
                  value={userData?.district || ''}
                  disabled
                  readOnly
                />
                <InputField
                  label="Date of Birth"
                  value={userData?.dob || ''}
                  disabled
                  readOnly
                />
              </div>

              <InputField
                label="Aadhaar Number"
                value={userData?.aadhaar ? `XXXX XXXX ${userData.aadhaar.slice(-4)}` : ''}
                disabled
                readOnly
              />
            </div>

            {editing && (
              <GoldButton type="submit" fullWidth size="lg" icon={<Check size={16} />}>
                Save Changes
              </GoldButton>
            )}
          </form>
        </div>

        {/* Read-Only Notice */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-2.5 text-xs text-white/50">
          <ShieldAlert size={16} className="text-gold/60 flex-shrink-0 mt-0.5" />
          <p>
            For security, fields like <span className="text-white">District</span>, <span className="text-white">DOB</span>, and <span className="text-white">Aadhaar</span> cannot be edited online. Please contact TNSA HQ to modify these details.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
