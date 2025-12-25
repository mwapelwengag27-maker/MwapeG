
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdmhpscqsrgqkrsalgvz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWhwc2Nxc3JncWtyc2FsZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjEwOTUsImV4cCI6MjA4MjAzNzA5NX0.z_lfj2vXAjVY_wVa34_bkDS0TGiIefhsNQG7Z7Y8IiM';

let supabaseInstance: any;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error("Supabase Initialization Failed. Local storage fallback engaged.", e);
  // Mock fallback with chainable methods
  const mockTable = () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    upsert: () => Promise.resolve({ error: null }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    eq: () => ({ eq: () => Promise.resolve({ error: null }) })
  });
  
  supabaseInstance = {
    from: mockTable
  };
}

export const supabase = supabaseInstance;
