import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), single: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ from: mocks.from }),
}));

import { restaurantSettingsService } from "@/services/restaurant-settings.service";

describe("checkout restaurant settings", () => {
  beforeEach(() => {
    mocks.from.mockReset();
    mocks.single.mockReset();
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mocks.single,
    };
    mocks.from.mockReturnValue(query);
  });

  it("loads admin-managed order settings and retains safe defaults for display-only settings", async () => {
    mocks.single.mockResolvedValue({
      data: {
        config: {
          isOpen: true,
          acceptingOrders: true,
          codEnabled: true,
          deliveryFee: 65,
          freeDeliveryAbove: 750,
          minOrderValue: 200,
        },
        updated_at: "2026-11-11T09:00:00.000Z",
      },
      error: null,
    });

    const result = await restaurantSettingsService.getCheckoutSettings();

    expect(mocks.from).toHaveBeenCalledWith("restaurant_settings");
    expect(result.settings.deliveryFee).toBe(65);
    expect(result.settings.freeDeliveryAbove).toBe(750);
    expect(result.settings.minOrderValue).toBe(200);
    expect(result.settings.offers).toBeDefined();
    expect(result.updatedAt).toBe("2026-11-11T09:00:00.000Z");
  });

  it("fails closed when settings are missing or invalid", async () => {
    mocks.single.mockResolvedValueOnce({ data: null, error: { message: "no settings row" } });
    await expect(restaurantSettingsService.getCheckoutSettings()).rejects.toThrow(
      "no settings row",
    );

    mocks.single.mockResolvedValueOnce({
      data: {
        config: { isOpen: true, acceptingOrders: true, codEnabled: true },
        updated_at: "2026-11-11T09:00:00.000Z",
      },
      error: null,
    });
    await expect(restaurantSettingsService.getCheckoutSettings()).rejects.toThrow("invalid");

    mocks.single.mockResolvedValueOnce({
      data: {
        config: { isOpen: true, acceptingOrders: true, codEnabled: true, deliveryFee: -1 },
        updated_at: "2026-11-11T09:00:00.000Z",
      },
      error: null,
    });
    await expect(restaurantSettingsService.getCheckoutSettings()).rejects.toThrow("invalid");
  });
});
