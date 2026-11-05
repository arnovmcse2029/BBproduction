import type { RestaurantSettings } from "@/types";
import { http, isBackendConnected } from "./api";
import { delay, mockDb } from "./mock-db";

/** Demo-only credentials. This is NOT secure authentication — replace with the backend login. */
export const DEMO_ADMIN = { email: "admin@biriyanibabu.demo", password: "demo1234" };

const SESSION_KEY = "bb_admin_session";

// Planned endpoints: POST /admin/login, GET /admin/settings, PUT /admin/settings
export const adminService = {
  async login(email: string, password: string): Promise<{ email: string }> {
    if (isBackendConnected) {
      const res = await http<{ token: string; email: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem("bb_admin_token", res.token);
      sessionStorage.setItem(SESSION_KEY, res.email);
      return { email: res.email };
    }
    await delay(400);
    if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
      throw new Error("Those details don't match the demo login.");
    }
    sessionStorage.setItem(SESSION_KEY, email);
    return { email };
  },
  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("bb_admin_token");
  },
  currentSession(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SESSION_KEY);
  },
  async getSettings(): Promise<RestaurantSettings> {
    if (isBackendConnected) return http<RestaurantSettings>("/settings");
    return mockDb.getSettings();
  },
  async saveSettings(s: RestaurantSettings): Promise<RestaurantSettings> {
    if (isBackendConnected) return http<RestaurantSettings>("/admin/settings", { method: "PUT", body: JSON.stringify(s) });
    await delay();
    mockDb.setSettings(s);
    return s;
  },
};
