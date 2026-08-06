import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client Supabase TANPA session/cookie — hanya untuk data publik katalog.
// Aman dipakai di dalam `unstable_cache` (tidak bergantung pada request).
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}