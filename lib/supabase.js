import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Clé publique (lecture seule grâce aux règles RLS de la base).
export const supabase = url && key ? createClient(url, key) : null;
