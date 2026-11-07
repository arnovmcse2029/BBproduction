import type { RestaurantSettings } from "@/types";
import { http, isBackendConnected } from "./api";
import { delay, mockDb } from "./mock-db";

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
    await delay(300);
    // shortcut: client-side preview mode when backend is offline. Production authentication is verified server-side with bcrypt & JWT.
    const cleanEmail = email.trim().toLowerCase();
    sessionStorage.setItem(SESSION_KEY, cleanEmail);
    return { email: cleanEmail };
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
    if (isBackendConnected)
      return http<RestaurantSettings>("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(s),
      });
    await delay();
    mockDb.setSettings(s);
    return s;
  },
};
