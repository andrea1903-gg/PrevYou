import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://fgnukfiycyidqwylgpqj.supabase.co';
const supabaseAnonKey = 'sb_publishable_VAk7Wv22dt3wKag62M01PQ_RUPfTD7D';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});