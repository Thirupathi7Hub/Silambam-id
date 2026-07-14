// Supabase Edge Function — send-whatsapp
// Sends a WhatsApp notification to a member when their ID card is approved.
// Deploy: supabase functions deploy send-whatsapp
// Secrets needed:
//   WHATSAPP_TOKEN           — Meta permanent access token
//   WHATSAPP_PHONE_NUMBER_ID — Meta WhatsApp sender Phone Number ID
//   WHATSAPP_TEMPLATE_NAME   — Approved template name (default: "tnsa_approval")

const TEMPLATE_NAME = Deno.env.get('WHATSAPP_TEMPLATE_NAME') || 'tnsa_approval';

Deno.serve(async (req: Request) => {
  // CORS headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mobile, memberName, membershipId } = await req.json();

    if (!mobile || !memberName || !membershipId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: mobile, memberName, membershipId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = Deno.env.get('WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!token || !phoneNumberId) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp credentials not configured in Supabase secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number — ensure it starts with country code (91 for India)
    let toNumber = mobile.replace(/\D/g, ''); // strip non-digits
    if (toNumber.length === 10) {
      toNumber = '91' + toNumber; // prefix Indian country code
    }

    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    // Send WhatsApp template message.
    // The template "tnsa_approval" must be created and approved in your Meta Business Manager.
    // Template body example:
    //   "Dear {{1}}, your TNSA Membership ID {{2}} has been approved! 
    //    Login at https://silambam-id.vercel.app to view and download your digital ID card."
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toNumber,
      type: 'template',
      template: {
        name: TEMPLATE_NAME,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: memberName },
              { type: 'text', text: membershipId },
            ],
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta WhatsApp API error:', data);
      return new Response(
        JSON.stringify({ error: 'WhatsApp API error', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.messages?.[0]?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
