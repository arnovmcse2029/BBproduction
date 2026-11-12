import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  configured: false,
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => mocks.configured,
  getSupabase: () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
      getSession: mocks.getSession,
    },
    rpc: mocks.rpc,
  }),
}));

import { adminService } from "@/services/admin.service";

describe("admin authorization", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mocks.configured = false;
    mocks.signInWithPassword.mockReset();
    mocks.signOut.mockReset().mockResolvedValue({ error: null });
    mocks.getSession.mockReset();
    mocks.rpc.mockReset();
  });

  it("does not grant access when Supabase is unavailable, even with a stored email", async () => {
    window.sessionStorage.setItem("bb_admin_session", "admin@example.com");

    await expect(adminService.verifyCurrentSession()).rejects.toThrow(
      "Administrator access requires a configured Supabase connection.",
    );
    await expect(adminService.login("admin@example.com", "password")).rejects.toThrow(
      "Administrator access requires a configured Supabase connection.",
    );
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects a signed-in customer when the trusted admin RPC returns false", async () => {
    mocks.configured = true;
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { email: "customer@example.com" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: false, error: null });

    await expect(adminService.login(" Customer@Example.com ", "password")).rejects.toThrow(
      "This account is not authorized to access restaurant administration.",
    );
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "customer@example.com",
      password: "password",
    });
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it("propagates invalid credential and admin-verification errors", async () => {
    mocks.configured = true;
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials." },
    });
    await expect(adminService.login("user@example.com", "wrong")).rejects.toThrow(
      "Invalid login credentials.",
    );

    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { email: "user@example.com" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "Admin check unavailable." } });
    await expect(adminService.login("user@example.com", "password")).rejects.toThrow(
      "Admin check unavailable.",
    );
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it("does not verify a session that is missing or belongs to a non-admin", async () => {
    mocks.configured = true;
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(adminService.verifyCurrentSession()).resolves.toBeNull();
    expect(mocks.rpc).not.toHaveBeenCalled();

    mocks.getSession.mockResolvedValue({
      data: { session: { user: { email: "customer@example.com" } } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    await expect(adminService.verifyCurrentSession()).resolves.toBeNull();
  });

  it("propagates Supabase session lookup and sign-out failures", async () => {
    mocks.configured = true;
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Session lookup failed." },
    });
    await expect(adminService.verifyCurrentSession()).rejects.toThrow("Session lookup failed.");

    mocks.signOut.mockResolvedValue({ error: { message: "Sign-out failed." } });
    await expect(adminService.logout()).rejects.toThrow("Sign-out failed.");
  });
});
