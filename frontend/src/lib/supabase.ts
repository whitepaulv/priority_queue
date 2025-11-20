/**
 * Supabase client configuration.
 * Exports a configured Supabase client instance.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase credentials are valid
const hasValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('PASTE') && 
  !supabaseAnonKey.includes('PASTE') &&
  supabaseUrl.startsWith('http')

// Create Supabase client only if credentials are valid
// Otherwise, export null and useTasks hook will use localStorage fallback
let supabase: SupabaseClient<any, 'public', any> | null = null

if (hasValidCredentials) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
    console.log('✅ Supabase client initialized')
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error)
    console.warn('⚠️ App will use localStorage fallback.')
    supabase = null
  }
} else {
  console.warn(
    '⚠️ Missing or incomplete Supabase environment variables. App will use localStorage fallback.'
  )
}

/**
 * Supabase client instance.
 * Use this to interact with Supabase services (database, auth, storage, etc.)
 * Will be null if credentials are missing/invalid - useTasks hook handles fallback.
 */
export { supabase }

