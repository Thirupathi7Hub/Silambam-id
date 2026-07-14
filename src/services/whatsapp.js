// WhatsApp notification helper
// Calls the Supabase Edge Function 'send-whatsapp' securely from the browser.
import { supabase } from '@/supabase/config';

/**
 * Send a WhatsApp approval notification to a member.
 * @param {string} mobile - Member's 10-digit mobile number
 * @param {string} memberName - Member's full name
 * @param {string} membershipId - Member's Membership ID (e.g. ARL00004)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendApprovalWhatsApp = async (mobile, memberName, membershipId) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: { mobile, memberName, membershipId },
    });

    if (error) {
      console.error('WhatsApp notification error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('WhatsApp notification failed:', err);
    return { success: false, error: err.message };
  }
};
