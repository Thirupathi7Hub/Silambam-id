// Supabase Client Configuration
// ─────────────────────────────────────────────────────────────
// 1. Go to https://supabase.com → New Project
// 2. Settings → API → copy Project URL and anon/public key
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('❌ Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export default supabase;
