import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const rememberKey = "bb_auth_remember";
const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(url && publishableKey);
}

export function setRememberMe(remember: boolean) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(rememberKey, remember ? "1" : "0");
  }
}

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env.local file.",
    );
  }
  if (typeof window === "undefined") {
    throw new Error("The browser Supabase client cannot be used on the server.");
  }
  client ??= createBrowserClient(url!, publishableKey!);
  return client;
}
