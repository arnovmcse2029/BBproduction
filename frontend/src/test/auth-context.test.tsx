import { render, screen, waitFor } from "@testing-library/react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
  getUserFromSession: vi.fn(),
  consumeOAuthRedirect: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
  }),
  isSupabaseConfigured: () => true,
}));

vi.mock("@/services/auth.service", () => ({
  authService: {
    getUserFromSession: mocks.getUserFromSession,
    consumeOAuthRedirect: mocks.consumeOAuthRedirect,
  },
  toAuthUserFromIdentity: (user: Session["user"]) => ({
    id: user.id,
    firstName: "",
    lastName: "",
    email: user.email ?? "",
    mobile: "",
    addresses: [],
    createdAt: user.created_at,
    updatedAt: user.created_at,
  }),
}));

import { AuthProvider, useAuth } from "@/context/AuthContext";

function AuthState() {
  const { isAuthenticated, isLoading, user } = useAuth();
  return <p>{isLoading ? "loading" : isAuthenticated ? user?.id : "signed out"}</p>;
}

function makeSession(): Session {
  return {
    access_token: "access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: 1893456000,
    refresh_token: "refresh-token",
    user: {
      id: "customer-1",
      app_metadata: { provider: "google", providers: ["google"] },
      user_metadata: {},
      aud: "authenticated",
      created_at: "2026-01-01T00:00:00.000Z",
      email: "customer@example.com",
    },
  };
}

describe("AuthProvider session lifecycle", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.onAuthStateChange.mockReset();
    mocks.unsubscribe.mockReset();
    mocks.getUserFromSession.mockReset();
    mocks.consumeOAuthRedirect.mockReset().mockReturnValue(null);
    mocks.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: mocks.unsubscribe } },
    }));
  });

  it("restores a persisted session from Supabase on startup", async () => {
    const session = makeSession();
    mocks.getSession.mockResolvedValue({ data: { session }, error: null });
    mocks.getUserFromSession.mockResolvedValue({ id: "customer-1" });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("customer-1")).toBeInTheDocument());
    expect(mocks.getSession).toHaveBeenCalledOnce();
    expect(mocks.onAuthStateChange).toHaveBeenCalledOnce();
    expect(mocks.getUserFromSession).toHaveBeenCalledWith(session.user);
  });

  it("updates from auth changes and unsubscribes on cleanup", async () => {
    const listeners: Array<(event: AuthChangeEvent, session: Session | null) => void> = [];
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.onAuthStateChange.mockImplementation(
      (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        listeners.push(callback);
        return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
      },
    );
    mocks.getUserFromSession.mockResolvedValue({ id: "customer-1" });

    const { unmount } = render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("signed out")).toBeInTheDocument());
    listeners[0]?.("SIGNED_IN", makeSession());
    await waitFor(() => expect(screen.getByText("customer-1")).toBeInTheDocument());

    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });

  it("keeps the Supabase-authenticated user visible if profile retrieval fails", async () => {
    const session = makeSession();
    mocks.getSession.mockResolvedValue({ data: { session }, error: null });
    mocks.getUserFromSession.mockRejectedValue(new Error("Profile table is unavailable."));

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("customer-1")).toBeInTheDocument());
  });
});
