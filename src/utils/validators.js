// Zod validation schemas for all TNSA forms
import { z } from 'zod';

// ── Step 1: Personal Details ──
export const personalDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, and basic punctuation'),

  fatherName: z
    .string()
    .min(2, "Father's name must be at least 2 characters")
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters and spaces'),

  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const date = new Date(val);
      const now  = new Date();
      const minAge = new Date();
      minAge.setFullYear(now.getFullYear() - 5);
      return date < minAge;
    }, 'Member must be at least 5 years old')
    .refine((val) => {
      const date = new Date(val);
      const now  = new Date();
      const maxAge = new Date();
      maxAge.setFullYear(now.getFullYear() - 100);
      return date > maxAge;
    }, 'Invalid date of birth'),

  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),

  aadhaar: z
    .string()
    .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'),

  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),

  email: z
    .string()
    .email('Enter a valid email address')
    .max(150, 'Email is too long'),

  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(300, 'Address is too long'),
});

// ── Step 2: Association Details ──
export const associationDetailsSchema = z.object({
  district: z
    .string()
    .min(1, 'Please select a district'),

  clubName: z
    .string()
    .min(2, 'Club name must be at least 2 characters')
    .max(100, 'Club name is too long'),

  position: z
    .string()
    .min(1, 'Please select a position'),

  category: z
    .string()
    .min(1, 'Please select a category'),
});

// ── Full Registration Schema ──
export const registrationSchema = personalDetailsSchema.merge(associationDetailsSchema);

// ── Login Schema ──
export const loginSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

// ── Profile Update Schema ──
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100),

  fatherName: z
    .string()
    .min(2, "Father's name required")
    .max(100),

  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),

  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(300),

  clubName: z
    .string()
    .min(2, 'Club name required')
    .max(100),

  position: z.string().min(1, 'Position required'),
  category: z.string().min(1, 'Category required'),
});

// ── Settings Schema ──
export const settingsSchema = z.object({
  organizationName: z.string().min(2, 'Organization name required'),
  validityYear: z
    .number()
    .int()
    .min(new Date().getFullYear(), `Year must be ${new Date().getFullYear()} or later`)
    .max(2050, 'Year seems too far in the future'),
});

// ── Password Reset Schema ──
export const passwordResetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});
