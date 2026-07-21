// Register Page — Multi-step registration with progress indicator
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Users, Building2, ChevronRight, ChevronLeft, Upload, X, Check, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerWithEmail } from '@/firebase/auth';
import { createUser, generateMembershipId } from '@/firebase/firestore';
import { uploadMemberPhoto } from '@/firebase/storage';
import { personalDetailsSchema, associationDetailsSchema } from '@/utils/validators';
import { DISTRICTS, getDistrictCode } from '@/constants/districts';
import { CATEGORIES, POSITIONS, GENDERS } from '@/constants/app';
import { GoldButton, InputField, SelectField, TextareaField, ProgressBar, GoldDivider } from '@/components/ui';

const DRAFT_KEY = 'tnsa_registration_draft';
const STEPS = ['Personal', 'Association', 'Photo', 'Review'];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [photo, setPhoto]           = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData]     = useState({});

  // Step 1 form
  const step1 = useForm({ resolver: zodResolver(personalDetailsSchema), mode: 'onBlur' });
  // Step 2 form
  const step2 = useForm({ resolver: zodResolver(associationDetailsSchema), mode: 'onBlur' });

  // Load draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.step1) step1.reset(parsed.step1);
        if (parsed.step2) step2.reset(parsed.step2);
        if (parsed.formData) setFormData(parsed.formData);
        toast('Draft restored!', { icon: '📝' });
      }
    } catch {}
  }, []);

  // Auto-save draft
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        step1: step1.getValues(),
        step2: step2.getValues(),
        formData,
      }));
    } catch {}
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be less than 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleStep1 = async (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    saveDraft();
    setStep(2);
  };

  const handleStep2 = async (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    saveDraft();
    setStep(3);
  };

  const handleStep3 = () => {
    if (!photo) { toast.error('Please upload your passport photo'); return; }
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const allData = { ...formData };
      const districtCode = getDistrictCode(allData.district);
      if (!districtCode) throw new Error('Invalid district selected');

      // 1. Register with Firebase Auth
      const email    = allData.email;
      const password = allData.aadhaar.slice(-6) + '@Tnsa'; // default password = last 6 of aadhaar + @Tnsa
      const cred = await registerWithEmail(email, password);
      const uid  = cred.user.uid;

      // 2. Generate Membership ID
      const membershipId = await generateMembershipId(districtCode);

      // 3. Upload photo
      let photoURL = '';
      if (photo) {
        photoURL = await uploadMemberPhoto(photo, uid, setUploadProgress);
      }

      // 4. Create Firestore user doc
      await createUser(uid, {
        uid,
        membershipId,
        name:         allData.name,
        fatherName:   allData.fatherName,
        dob:          allData.dob,
        gender:       allData.gender,
        aadhaar:      allData.aadhaar,
        mobile:       allData.mobile,
        email:        allData.email,
        address:      allData.address,
        district:     allData.district,
        districtCode,
        clubName:     allData.clubName,
        category:     allData.category,
        position:     allData.position,
        photoURL,
        role:         'user',
        status:       'pending',
      });

      // 5. Clear draft
      localStorage.removeItem(DRAFT_KEY);

      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please login.');
      } else {
        toast.error(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center:        { x: 0, opacity: 1 },
    exit:  (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-6 flex flex-col items-center">
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4AF37, transparent)', transform: 'translate(30%, -30%)' }} />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Swords size={24} style={{ color: '#D4AF37' }} />
          </div>
          <h1 className="text-2xl font-bold text-gold-gradient">Join TNSA</h1>
          <p className="text-white/50 text-xs mt-1">Member Registration</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar current={step} total={4} labels={STEPS} />
        </div>

        {/* Form card */}
        <div className="glass-card-gold overflow-hidden">
          <AnimatePresence mode="wait" custom={1}>
            {/* ── Step 1: Personal Details ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User size={18} className="text-gold" /> Personal Details
                </h2>
                <form onSubmit={step1.handleSubmit(handleStep1)} className="space-y-4">
                  <InputField label="Full Name" placeholder="Your full name" icon={<User size={14} />}
                    error={step1.formState.errors.name?.message} required
                    {...step1.register('name')} />
                  <InputField label="Father's Name" placeholder="Father's full name" icon={<User size={14} />}
                    error={step1.formState.errors.fatherName?.message} required
                    {...step1.register('fatherName')} />
                  <InputField label="Date of Birth" type="date" icon={<Calendar size={14} />}
                    error={step1.formState.errors.dob?.message} required
                    {...step1.register('dob')} />
                  <SelectField label="Gender" options={GENDERS} placeholder="Select gender"
                    error={step1.formState.errors.gender?.message} required
                    {...step1.register('gender')} />
                  <InputField label="Aadhaar Number" placeholder="12-digit Aadhaar" maxLength={12}
                    icon={<CreditCard size={14} />} error={step1.formState.errors.aadhaar?.message} required
                    {...step1.register('aadhaar')} />
                  <InputField label="Mobile Number" placeholder="10-digit mobile" maxLength={10}
                    icon={<Phone size={14} />} error={step1.formState.errors.mobile?.message} required
                    {...step1.register('mobile')} />
                  <InputField label="Email Address" type="email" placeholder="your@email.com"
                    icon={<Mail size={14} />} error={step1.formState.errors.email?.message} required
                    {...step1.register('email')} />
                  <TextareaField label="Address" placeholder="Your full address" rows={3}
                    error={step1.formState.errors.address?.message} required
                    {...step1.register('address')} />
                  <GoldButton type="submit" fullWidth size="lg"
                    icon={<ChevronRight size={16} />}>
                    Next: Association Details
                  </GoldButton>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: Association Details ── */}
            {step === 2 && (() => {
              const selectedPosition = step2.watch('position');
              const isClubOptional = selectedPosition?.toLowerCase().includes('president');
              return (
                <motion.div key="step2" custom={1} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25 }} className="p-6 space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 size={18} className="text-gold" /> Association Details
                  </h2>
                  <form onSubmit={step2.handleSubmit(handleStep2)} className="space-y-4">
                    <SelectField label="District" options={DISTRICTS.map(d => ({ value: d.name, label: `${d.name} (${d.code})` }))}
                      placeholder="Select your district" error={step2.formState.errors.district?.message} required
                      {...step2.register('district')} />
                    <SelectField label="Position in TNSA" options={POSITIONS} placeholder="Select position"
                      error={step2.formState.errors.position?.message} required
                      {...step2.register('position')} />
                    <InputField label={isClubOptional ? "Club Name (Optional)" : "Club Name"} placeholder={isClubOptional ? "Your club name (optional)" : "Your club name"} icon={<Building2 size={14} />}
                      error={step2.formState.errors.clubName?.message} required={!isClubOptional}
                      {...step2.register('clubName')} />
                    <SelectField label="Category" options={CATEGORIES} placeholder="Select category"
                      error={step2.formState.errors.category?.message} required
                      {...step2.register('category')} />
                    <div className="flex gap-3">
                      <GoldButton type="button" variant="ghost" fullWidth onClick={() => setStep(1)}
                        icon={<ChevronLeft size={16} />}>Back</GoldButton>
                      <GoldButton type="submit" fullWidth icon={<ChevronRight size={16} />}>Next</GoldButton>
                    </div>
                  </form>
                </motion.div>
              );
            })()}

            {/* ── Step 3: Photo Upload ── */}
            {step === 3 && (
              <motion.div key="step3" custom={1} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="p-6 space-y-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload size={18} className="text-gold" /> Passport Photo
                </h2>
                <p className="text-white/50 text-sm">Upload a clear passport-size photo (max 5MB)</p>

                {/* Photo upload area */}
                <div className="flex flex-col items-center gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview"
                        className="w-32 h-32 rounded-2xl object-cover border-2 border-gold/50" />
                      <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-gold/30 hover:border-gold/60
                      flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gold/5">
                      <Upload size={28} className="text-gold/50 mb-2" />
                      <span className="text-xs text-white/40 text-center px-2">Tap to upload photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  )}

                  <div className="w-full text-xs text-white/40 space-y-1 text-center">
                    <p>• Clear face, white/light background</p>
                    <p>• JPEG/PNG format, max 5MB</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <GoldButton variant="ghost" fullWidth onClick={() => setStep(2)} icon={<ChevronLeft size={16} />}>Back</GoldButton>
                  <GoldButton fullWidth onClick={handleStep3} icon={<ChevronRight size={16} />}>Next</GoldButton>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Review & Submit ── */}
            {step === 4 && (
              <motion.div key="step4" custom={1} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Check size={18} className="text-gold" /> Review & Submit
                </h2>

                {/* Photo preview */}
                {photoPreview && (
                  <div className="flex justify-center">
                    <img src={photoPreview} alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-gold/40" />
                  </div>
                )}

                {/* Review data */}
                <div className="space-y-2 text-sm">
                  {[
                    ['Name', formData.name],
                    ['Father Name', formData.fatherName],
                    ['Date of Birth', formData.dob],
                    ['Gender', formData.gender],
                    ['Mobile', formData.mobile],
                    ['Email', formData.email],
                    ['District', formData.district],
                    ['Position', formData.position],
                    ['Club Name', formData.clubName],
                    ['Category', formData.category],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50">{label}</span>
                      <span className="text-white font-medium text-right max-w-[60%]">{value || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Note about password */}
                <div className="bg-gold/10 border border-gold/20 rounded-xl p-3 text-xs text-gold/80">
                  <p className="font-semibold mb-1">📌 Default Password</p>
                  <p>Your default password is the last 6 digits of your Aadhaar + @Tnsa<br/>
                  Example: <span className="font-bold">9012@Tnsa</span></p>
                  <p className="mt-1 text-white/40">Change it after first login.</p>
                </div>

                {loading && uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Uploading photo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-gradient rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <GoldButton variant="ghost" fullWidth onClick={() => setStep(3)} icon={<ChevronLeft size={16} />}>Back</GoldButton>
                  <GoldButton fullWidth loading={loading} onClick={handleFinalSubmit}
                    icon={<Check size={16} />}>Submit Registration</GoldButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/50 text-sm mt-4">
          Already a member?{' '}
          <Link to="/login" className="text-gold font-semibold hover:text-gold-light">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
