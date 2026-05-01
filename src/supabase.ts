import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ontxsvcbwaejepvbrimf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udHhzdmNid2FlamVwdmJyaW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjAxNzgsImV4cCI6MjA5MjY5NjE3OH0.oss_PEY08X0r4XsQBbNX4iQBl_vjnJHg6LDgRxQ6dkg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
