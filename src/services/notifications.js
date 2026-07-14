// Notification Service — Email via EmailJS + SMS via Supabase Edge Function
// ─────────────────────────────────────────────────────────────────────────────
// SETUP REQUIRED:
//
// 1. EMAIL (EmailJS):
//    a. Create a free account at https://www.emailjs.com
//    b. Add a Gmail/Outlook email service → note the SERVICE_ID
//    c. Create an email template with these variables:
//         {{to_email}}, {{member_name}}, {{membership_id}},
//         {{district}}, {{club_name}}, {{valid_till}}, {{login_url}}
//    d. Note the TEMPLATE_ID and PUBLIC_KEY
//    e. Add to your .env:
//         VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
//         VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
//         VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
//
// 2. SMS (Supabase Edge Function):
//    a. Go to your Supabase project → Edge Functions
//    b. Create a new function named "send-sms"
//    c. Paste the code from: /supabase/functions/send-sms/index.ts
//    d. Set secret: FAST2SMS_API_KEY in Supabase dashboard (Settings → Edge Functions)
//    e. Add to your .env:
//         VITE_SUPABASE_FUNCTIONS_URL=https://omlpsbmwfqmajpdxxows.supabase.co/functions/v1
// ─────────────────────────────────────────────────────────────────────────────

import emailjs from '@emailjs/browser';
import { supabase } from '@/supabase/config';
import { VALID_TILL_YEAR } from '@/constants/app';

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const SUPABASE_FN_URL     = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

// ── Email Notification ────────────────────────────────────────────────────────
/**
 * Send an approval email to the member via EmailJS.
 * @param {Object} member - The member object with name, email, membershipId, district, clubName
 */
export const sendApprovalEmail = async (member) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS env vars not configured. Skipping email notification.');
    return { success: false, error: 'EmailJS not configured' };
  }

  try {
    const templateParams = {
      to_email:     member.email,
      member_name:  member.name,
      membership_id: member.membershipId,
      district:     member.district,
      club_name:    member.clubName,
      valid_till:   `December ${VALID_TILL_YEAR}`,
      login_url:    `${window.location.origin}/login`,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response.status);
    return { success: true };
  } catch (err) {
    console.error('EmailJS send failed:', err);
    return { success: false, error: err.message };
  }
};

// ── SMS Notification ──────────────────────────────────────────────────────────
/**
 * Send an approval SMS to the member via Supabase Edge Function.
 * @param {Object} member - The member object with name, mobile, membershipId
 */
export const sendApprovalSMS = async (member) => {
  if (!SUPABASE_FN_URL) {
    console.warn('Supabase URL not configured. Skipping SMS notification.');
    return { success: false, error: 'Supabase not configured' };
  }

  // Sanitize mobile number (10 digits, Indian)
  const mobile = (member.mobile || '').replace(/\D/g, '').slice(-10);
  if (mobile.length !== 10) {
    console.warn('Invalid mobile number, skipping SMS:', member.mobile);
    return { success: false, error: 'Invalid mobile number' };
  }

  const message = `Dear ${member.name}, your TNSA Membership has been APPROVED! Your ID: ${member.membershipId}. Login to download your digital card: ${window.location.origin}/login - TNSA`;

  try {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { mobile, message },
    });

    if (error) throw new Error(error.message);
    console.log('SMS sent successfully:', data);
    return { success: true };
  } catch (err) {
    console.error('SMS send failed:', err);
    return { success: false, error: err.message };
  }
};

// ── Combined Notification ─────────────────────────────────────────────────────
/**
 * Send both email and SMS approval notifications.
 * Returns { email: { success }, sms: { success } }
 */
export const sendApprovalNotifications = async (member) => {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendApprovalEmail(member),
    sendApprovalSMS(member),
  ]);

  return {
    email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false },
    sms:   smsResult.status === 'fulfilled'   ? smsResult.value   : { success: false },
  };
};
