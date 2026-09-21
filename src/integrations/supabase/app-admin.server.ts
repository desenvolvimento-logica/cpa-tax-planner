import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const APP_SUPABASE_URL = 'https://olyvjnqmrzkziirzbmhi.supabase.co';

export function appAdminClient(): SupabaseClient<Database> {
  const key = process.env['TAXPLANNER_SUPABASE_SERVICE_ROLE_KEY'];
  if (!key) {
    throw new Error('TAXPLANNER_SUPABASE_SERVICE_ROLE_KEY não configurada.');
  }
  return createClient<Database>(APP_SUPABASE_URL, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
