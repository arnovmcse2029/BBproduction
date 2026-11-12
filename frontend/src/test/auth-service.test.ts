import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  getUser: vi.fn(),
  ensureCustomerProfile: vi.fn(),
  fromAddresses: vi.fn(),
  fromProfiles: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    auth: { signInWithOAuth: mocks.signInWithOAuth, getUser: mocks.getUser },
    rpc: mocks.ensureCustomerProfile,
    from: (table: string) => (table === "profiles" ? mocks.fromProfiles() : mocks.fromAddresses()),
  }),
  setRememberMe: vi.fn(),
}));

import { authService, sanitizeRedirectPath, toAuthUser } from "@/services/auth.service";

describe("Google sign-in", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mocks.signInWithOAuth.mockReset();
    mocks.fromAddresses.mockReset();
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn(),
    };
    query.order.mockReturnValueOnce(query).mockResolvedValue({ data: [], error: null });
    mocks.fromAddresses.mockReturnValue(query);
  });

  it("uses Supabase Google OAuth and remembers a safe return path", async () => {
    mocks.signInWithOAuth.mockResolvedValue({ error: null });

    await authService.signInWithGoogle("/checkout");

    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });
    expect(authService.consumeOAuthRedirect()).toBe("/checkout");
  });

  it("clears the pending return path when OAuth fails", async () => {
    mocks.signInWithOAuth.mockResolvedValue({ error: { message: "Google is unavailable." } });

    await expect(authService.signInWithGoogle("/checkout")).rejects.toThrow(
      "Google is unavailable.",
    );
    expect(authService.consumeOAuthRedirect()).toBeNull();
  });
});

describe("auth profile mapping", () => {
  it("ensures and retrieves the profile through the authenticated-user RPC", async () => {
    const user = {
      id: "google-user-id",
      email: "priya@example.com",
      app_metadata: { provider: "google", providers: ["google"] },
      user_metadata: { full_name: "Priya Sharma", picture: "https://example.com/priya.png" },
      aud: "authenticated",
      created_at: "2026-01-01T00:00:00.000Z",
    } satisfies User;
    mocks.ensureCustomerProfile.mockResolvedValue({
      data: [
        {
          id: user.id,
          full_name: "Priya Sharma",
          email: user.email,
          avatar_url: "https://example.com/priya.png",
          first_name: "Priya",
          last_name: "Sharma",
          mobile: "",
          addresses: [],
          default_address_id: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      error: null,
    });

    await expect(authService.getUserFromSession(user)).resolves.toMatchObject({
      id: user.id,
      firstName: "Priya",
      lastName: "Sharma",
      email: user.email,
      avatarUrl: "https://example.com/priya.png",
    });
    expect(mocks.ensureCustomerProfile).toHaveBeenCalledWith("ensure_customer_profile");
  });

  it("maps Google identity details into the existing customer user", () => {
    const user = toAuthUser(
      "",
      {
        id: "google-user-id",
        full_name: "Priya Sharma",
        first_name: "",
        last_name: "",
        mobile: "",
        addresses: [],
        default_address_id: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      {
        email: "priya@example.com",
        user_metadata: {
          full_name: "Priya Sharma",
          picture: "https://example.com/priya.png",
        },
      },
    );

    expect(user).toMatchObject({
      id: "google-user-id",
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya@example.com",
      avatarUrl: "https://example.com/priya.png",
    });
  });

  describe("profile updates", () => {
    it("updates only canonical profile columns available in the deployed schema", async () => {
      const user = {
        id: "user-1",
        email: "ada@example.com",
        user_metadata: {},
        app_metadata: {},
        aud: "authenticated",
        created_at: "2026-01-01T00:00:00.000Z",
      } satisfies User;
      mocks.getUser.mockResolvedValue({ data: { user }, error: null });
      const updateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: user.id }, error: null }),
      };
      mocks.fromProfiles.mockReturnValue(updateQuery);
      mocks.ensureCustomerProfile.mockResolvedValue({
        data: [
          {
            id: user.id,
            full_name: "Ada Bose",
            email: user.email,
            phone: "9876543210",
            default_address_id: null,
            created_at: user.created_at,
            updated_at: user.created_at,
          },
        ],
        error: null,
      });
      const addressQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };
      addressQuery.order.mockReturnValueOnce(addressQuery).mockResolvedValue({
        data: [],
        error: null,
      });
      mocks.fromAddresses.mockReturnValue(addressQuery);

      await authService.updateProfile(user.id, {
        firstName: "Ada",
        lastName: "Bose",
        mobile: "9876543210",
      });

      expect(updateQuery.update).toHaveBeenCalledWith({
        full_name: "Ada Bose",
        phone: "9876543210",
      });
    });
  });

  it("rejects external redirect targets", () => {
    expect(sanitizeRedirectPath("/checkout?from=cart")).toBe("/checkout?from=cart");
    expect(sanitizeRedirectPath("//example.com")).toBe("/");
    expect(sanitizeRedirectPath("/\\example.com")).toBe("/");
  });
});
