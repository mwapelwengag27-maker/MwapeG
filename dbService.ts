import { supabase } from './supabaseClient.ts';

// Helper to convert camelCase keys to snake_case for Supabase
const toSnakeCase = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
};

// Helper to convert snake_case keys back to camelCase for the App
const toCamelCase = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/([-_][a-z])/g, group =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
    result[camelKey] = obj[key];
  }
  return result;
};

// Local storage fallback helper
const getLocal = (table: string) => {
  const data = localStorage.getItem(`ebenezer_${table}`);
  return data ? JSON.parse(data) : null;
};

const setLocal = (table: string, data: any) => {
  localStorage.setItem(`ebenezer_${table}`, JSON.stringify(data));
};

export const db = {
  async fetchAll(table: string) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`Supabase API error [${table}]:`, error.message);
        return getLocal(table) || [];
      }
      if (data) {
        setLocal(table, data.map(toCamelCase));
        return data.map(toCamelCase);
      }
      return [];
    } catch (err) {
      console.warn(`Supabase network failure [${table}]. Falling back to local data.`);
      return getLocal(table) || [];
    }
  },

  async upsert(table: string, data: any) {
    // Optimistic UI: Save to local storage first
    setLocal(table, data);

    try {
      const payload = Array.isArray(data) 
        ? data.map(toSnakeCase) 
        : toSnakeCase(data);
        
      const { error } = await supabase.from(table).upsert(payload);
      if (error) {
        console.warn(`Supabase Sync Warning [${table}]:`, error.message);
      }
    } catch (err) {
      console.warn(`Supabase Offline [${table}]: Data preserved locally.`);
    }
  },

  async delete(table: string, id: string) {
    // Update local storage first
    const current = getLocal(table) || [];
    setLocal(table, current.filter((item: any) => item.id !== id));

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error(`Supabase Delete Error [${table}]:`, error.message);
        throw error;
      }
    } catch (err) {
      console.warn(`Supabase Offline Delete [${table}]: Removed locally.`);
    }
  }
};