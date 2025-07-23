import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing REACT_APP_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign in the admin user
const signInAdmin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.REACT_APP_SUPABASE_ADMIN_EMAIL,
    password: process.env.REACT_APP_SUPABASE_ADMIN_PASSWORD,
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};

// Call signIn immediately
signInAdmin().catch(console.error);
