import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const getServerCustomer = createServerFn({ method: "GET" }).handler(async () => {
  if (!process.env["VITE_SUPABASE_URL"] || !process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) {
    return null;
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (error.name === "AuthSessionMissingError" || error.status === 401) return null;
    throw new Error(`Unable to verify your sign-in session: ${error.message}`);
  }
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
});

export async function requireCustomer(returnTo: string) {
  const customer = await getServerCustomer();
  if (!customer) {
    throw redirect({
      to: "/login",
      search: { redirect: returnTo },
    });
  }
}
