import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create a real client if credentials are set
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a dummy client that won't crash the app
  // This allows the app to run in demo/guest mode without Supabase
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
