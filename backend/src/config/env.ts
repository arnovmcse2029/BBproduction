import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY; backend cannot start securely.");
  process.exit(1);
}

export const env = {
  port: process.env.PORT ?? "5000",
  frontendUrl: process.env.FRONTEND_URL ?? "*",
  supabaseUrl,
  supabaseAnonKey,
};
