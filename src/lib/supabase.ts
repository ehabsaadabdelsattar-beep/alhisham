import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kucitrwhbaqhtunlqkbc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1Y2l0cndoYmFxaHR1bmxxa2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Nzk5MzMsImV4cCI6MjEwMTE1NTkzM30.67-l5S3AXZplw9eWL9FIyuvThY7U6teC3EOpGSqc8hc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

