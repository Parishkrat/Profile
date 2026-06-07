import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Missing Supabase keys in .env");
}

// Public client — for auth (signUp, signInWithPassword, getUser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — bypasses RLS, for server-side DB queries
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
