
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Production configuration with fallback to build-time environment values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vcrqdjsbydrdmfxeblxb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_PWy68NpHYHP9_jpODURMeA_Q63OKs-9";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});