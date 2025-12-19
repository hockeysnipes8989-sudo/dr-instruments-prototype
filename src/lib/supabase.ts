import { createClient } from "@supabase/supabase-js";

console.log("DEBUG - URL Present:", !!import.meta.env.VITE_SUPABASE_URL);
console.log("DEBUG - Key Present:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
