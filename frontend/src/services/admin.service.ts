import type { RestaurantSettings } from "@/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { SEED_SETTINGS } from "@/data/mock";

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Administrator access requires a configured Supabase connection.");
  }
  return getSupabase();
}

function hasValidOrderAmountPrecision(value: number) {
  return value <= 99999999.99 && Number(value.toFixed(2)) === value;
}

export const adminService = {
  async login(email: string, password: string): Promise<{ email: string }> {
    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error || !data.user) throw new Error(error?.message ?? "Unable to sign in.");

    const { data: isAdmin, error: roleError } = await supabase.rpc("is_restaurant_admin");
    if (roleError || isAdmin !== true) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw new Error(signOutError.message);
      throw new Error(
        roleError?.message ?? "This account is not authorized to access restaurant administration.",
      );
    }

    return { email: data.user.email ?? email.trim().toLowerCase() };
  },
  async logout() {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw new Error(error.message);
  },
  async verifyCurrentSession(): Promise<string | null> {
    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!data.session?.user.email) {
      return null;
    }
    const { data: isAdmin, error: roleError } = await supabase.rpc("is_restaurant_admin");
    if (roleError) throw new Error(roleError.message);
    return isAdmin === true ? data.session.user.email : null;
  },
  async getSettings(): Promise<RestaurantSettings> {
    const { data, error } = await requireSupabase()
      .from("restaurant_settings")
      .select("config")
      .eq("id", true)
      .single();
    if (error) throw new Error(error.message);
    return {
      ...SEED_SETTINGS,
      ...(data.config as Partial<RestaurantSettings>),
    };
  },
  async saveSettings(s: RestaurantSettings): Promise<RestaurantSettings> {
    if (
      !Number.isFinite(s.deliveryFee) ||
      s.deliveryFee < 0 ||
      !hasValidOrderAmountPrecision(s.deliveryFee) ||
      !Number.isFinite(s.freeDeliveryAbove) ||
      s.freeDeliveryAbove < 0 ||
      !hasValidOrderAmountPrecision(s.freeDeliveryAbove) ||
      !Number.isFinite(s.minOrderValue) ||
      s.minOrderValue < 0 ||
      !hasValidOrderAmountPrecision(s.minOrderValue)
    ) {
      throw new Error(
        "Delivery fee and order thresholds must be non-negative amounts with at most two decimal places.",
      );
    }

    const { error } = await requireSupabase()
      .from("restaurant_settings")
      .upsert({ id: true, config: s }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return s;
  },
};
