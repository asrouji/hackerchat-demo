import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing env variables for Supabase')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
