import { createClient } from "@supabase/supabase-js";
import { runtimeConfig } from "@/lib/runtimeConfig";

export const supabase = createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseAnonKey);
