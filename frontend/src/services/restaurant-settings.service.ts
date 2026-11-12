import { getSupabase } from "@/lib/supabase";
import { validateOrderSettings } from "@/lib/pricing";
import type { RestaurantSettings } from "@/types";
import { SEED_SETTINGS } from "@/data/mock";

export interface CheckoutSettings {
  settings: RestaurantSettings;
  updatedAt: string;
}

export const restaurantSettingsService = {
  async getCheckoutSettings(): Promise<CheckoutSettings> {
    const { data, error } = await getSupabase()
      .from("restaurant_settings")
      .select("config, updated_at")
      .eq("id", true)
      .single();
    if (error) throw new Error(error.message);
    if (
      typeof data.config !== "object" ||
      data.config === null ||
      Array.isArray(data.config) ||
      typeof data.updated_at !== "string" ||
      !Number.isFinite(Date.parse(data.updated_at))
    ) {
      throw new Error("Restaurant order settings are unavailable.");
    }

    validateOrderSettings(data.config);
    const config = data.config as Partial<RestaurantSettings>;
    const settings = { ...SEED_SETTINGS, ...config };
    return { settings, updatedAt: data.updated_at };
  },
};
