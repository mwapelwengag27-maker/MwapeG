
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

export const db = {
  async fetchAll(table: string) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Supabase Fetch Error [${table}]:`, error.message, error.details);
      return null;
    }
    return data ? data.map(toCamelCase) : [];
  },

  async upsert(table: string, data: any) {
    // If data is an array, map each item. If single object, convert it.
    const payload = Array.isArray(data) 
      ? data.map(toSnakeCase) 
      : toSnakeCase(data);
      
    const { error } = await supabase.from(table).upsert(payload);
    if (error) {
      console.error(`Supabase Upsert Error [${table}]:`, error.message, error.details);
      throw error;
    }
  },

  async delete(table: string, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Supabase Delete Error [${table}]:`, error.message, error.details);
      throw error;
    }
  }
};
