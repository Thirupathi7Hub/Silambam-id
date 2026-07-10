// Admin System Settings Page
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, Shield, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSettings, updateSettings } from '@/firebase/firestore';
import { settingsSchema } from '@/utils/validators';
import AdminLayout from '@/layouts/AdminLayout';
import { GoldButton, InputField } from '@/components/ui';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(settingsSchema),
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      reset({
        organizationName: data.organizationName || 'Tamilnadu Silambattam Association',
        validityYear: parseInt(data.validityYear) || 2027,
      });
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateSettings(data);
      toast.success('System settings updated');
      loadSettings();
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-4">
          <div className="h-6 w-32 shimmer rounded" />
          <div className="h-48 w-full shimmer rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 py-6 space-y-6 pb-20 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-sm text-white/50">Manage association membership rules and global variables</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="glass-card-gold p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Settings size={18} className="text-gold" />
              Global Configuration
            </h3>

            <InputField
              label="Organization Name"
              required
              {...register('organizationName')}
              error={errors.organizationName?.message}
            />

            <InputField
              label="Card Validity Year"
              type="number"
              required
              {...register('validityYear', { valueAsNumber: true })}
              error={errors.validityYear?.message}
              hint="Controls the 'VALID TILL' year printed on new membership cards"
            />
          </div>

          <div className="flex justify-end">
            <GoldButton type="submit" loading={saving} icon={<Check size={16} />}>
              Save Settings
            </GoldButton>
          </div>
        </form>

        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-3 text-xs text-white/50">
          <Info size={16} className="text-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">📌 System Information</p>
            <p>Changing validity settings applies to all future generated digital cards immediately. Existing profiles will display the newly set year on their next card rendering session.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
