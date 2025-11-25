import { createClient } from '@supabase/supabase-js';

// NOTE: In a real environment, these are pulled from import.meta.env
// For this demo, we use placeholders that the user must replace.
// We use a fallback empty object for env to prevent crashes if import.meta.env is undefined.
const env = (import.meta as any).env || {};

// createClient throws an error if the URL is not a valid HTTP/HTTPS URL.
// We use a dummy valid URL as a fallback so the app can load and show the setup instructions
// instead of crashing immediately.
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);