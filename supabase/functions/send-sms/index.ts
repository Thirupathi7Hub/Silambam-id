// Supabase Edge Function: send-sms
// ──────────────────────────────────────────────────────────────────────────────
// Deploy this to your Supabase project:
//   1. Go to https://supabase.com → Your Project → Edge Functions
//   2. Create a new function named exactly: send-sms
//   3. Paste this code in the editor
//   4. In Supabase → Settings → Edge Functions, add the secret:
//        FAST2SMS_API_KEY = <your Fast2SMS API key from fast2sms.com>
//   5. Deploy the function
// ──────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const FAST2SMS_API_KEY = Deno.env.get('FAST2SMS_API_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mobile, message } = await req.json();

    if (!mobile || !message) {
      return new Response(JSON.stringify({ error: 'mobile and message required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!FAST2SMS_API_KEY) {
      return new Response(JSON.stringify({ error: 'FAST2SMS_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Fast2SMS API
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',       // Quick Transactional route
        message: message,
        language: 'english',
        flash: 0,
        numbers: mobile,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.return === false) {
      throw new Error(data.message?.[0] || 'Fast2SMS API error');
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
