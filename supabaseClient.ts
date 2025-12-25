import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdmhpscqsrgqkrsalgvz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWhwc2Nxc3JncWtyc2FsZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjEwOTUsImV4cCI6MjA4MjAzNzA5NX0.z_lfj2vXAjVY_wVa34_bkDS0TGiIefhsNQG7Z7Y8IiM';

let supabaseInstance: any;

try {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    throw new Error("Invalid Supabase configuration");
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.warn("Supabase connection skipped or failed. Using local storage mode.", e);
  
  // Chainable Mock Factory
  const createMock = () => {
    const mock: any = {
      select: () => Promise.resolve({ data: [], error: null }),
      upsert: () => Promise.resolve({ error: null }),
      delete: () => mock,
      eq: () => Promise.resolve({ data: [], error: null }),
      from: () => mock,
      order: () => mock,
      limit: () => mock
    };
    return mock;
  };
  
  supabaseInstance = createMock();
}

export const supabase = supabaseInstance;