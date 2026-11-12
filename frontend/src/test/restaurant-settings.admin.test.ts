import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), upsert: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ from: mocks.from }),
  isSupabaseConfigured: () => true,
}));

import { SEED_SETTINGS } from "@/data/mock";
import { adminService } from "@/services/admin.service";

describe("admin restaurant settings persistence", () => {
  beforeEach(() => {
    mocks.from.mockReset();
    mocks.upsert.mockReset().mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ upsert: mocks.upsert });
  });

  it("leaves pricing version updates to the database trigger", async () => {
    const settings = { ...SEED_SETTINGS, deliveryFee: 40.5 };

    await adminService.saveSettings(settings);

    expect(mocks.from).toHaveBeenCalledWith("restaurant_settings");
    expect(mocks.upsert).toHaveBeenCalledWith({ id: true, config: settings }, { onConflict: "id" });
    expect(mocks.upsert.mock.calls[0]?.[0]).not.toHaveProperty("updated_at");
  });

  it("rejects amounts with more than two decimal places", async () => {
    await expect(
      adminService.saveSettings({ ...SEED_SETTINGS, freeDeliveryAbove: 499.999 }),
    ).rejects.toThrow("at most two decimal places");
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
