// Notification Service — Email via EmailJS + SMS via Fast2SMS (both 100% browser-side)
// ─────────────────────────────────────────────────────────────────────────────
// SETUP — Add these 4 keys to your .env file (and Vercel Environment Variables):
//
//   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx   ← from emailjs.com dashboard
//   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx ← from emailjs.com dashboard
//   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx   ← from emailjs.com account
//   VITE_FAST2SMS_API_KEY=xxxxxxxxxxxxxxx     ← from fast2sms.com Dev API
//
// HOW TO GET KEYS:
//   Email → https://www.emailjs.com (free, 200 emails/month)
//   SMS   → https://www.fast2sms.com (free credits on signup)
// ─────────────────────────────────────────────────────────────────────────────

import emailjs from '@emailjs/browser';
import { VALID_TILL_YEAR } from '@/constants/app';

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const FAST2SMS_API_KEY    = import.meta.env.VITE_FAST2SMS_API_KEY;

// ── Email Notification ────────────────────────────────────────────────────────
export const sendApprovalEmail = async (member) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS env vars not configured. Skipping email.');
    return { success: false, error: 'EmailJS not configured' };
  }

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email:      member.email,
        member_name:   member.name,
        membership_id: member.membershipId,
        district:      member.district,
        club_name:     member.clubName,
        valid_till:    `December ${VALID_TILL_YEAR}`,
        login_url:     `${window.location.origin}/login`,
      },
      EMAILJS_PUBLIC_KEY
    );
    return { success: true };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err.message };
  }
};

// ── SMS Notification (Direct browser → Fast2SMS REST API) ─────────────────────
export const sendApprovalSMS = async (member) => {
  if (!FAST2SMS_API_KEY) {
    console.warn('VITE_FAST2SMS_API_KEY not configured. Skipping SMS.');
    return { success: false, error: 'Fast2SMS not configured' };
  }

  const mobile = (member.mobile || '').replace(/\D/g, '').slice(-10);
  if (mobile.length !== 10) {
    console.warn('Invalid mobile number, skipping SMS:', member.mobile);
    return { success: false, error: 'Invalid mobile number' };
  }

  const message =
    `Dear ${member.name}, your TNSA Membership (ID: ${member.membershipId}) has been APPROVED! Login to download your digital ID card: ${window.location.origin}/login - TNSA`;

  try {
    const params = new URLSearchParams({
      route:    'q',
      message,
      language: 'english',
      flash:    '0',
      numbers:  mobile,
    });

    const response = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?${params.toString()}`,
      {
        method:  'GET',
        headers: { authorization: FAST2SMS_API_KEY },
      }
    );

    const data = await response.json();

    if (!response.ok || data.return === false) {
      throw new Error(data.message?.[0] || 'Fast2SMS API error');
    }

    return { success: true };
  } catch (err) {
    console.error('SMS send failed:', err);
    return { success: false, error: err.message };
  }
};

// ── Combined: email + SMS ─────────────────────────────────────────────────────
export const sendApprovalNotifications = async (member) => {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendApprovalEmail(member),
    sendApprovalSMS(member),
  ]);

  return {
    email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false },
    sms:   smsResult.status  === 'fulfilled'  ? smsResult.value  : { success: false },
  };
};
