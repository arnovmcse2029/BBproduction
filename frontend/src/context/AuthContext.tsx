import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { authService, toAuthUserFromIdentity } from "@/services/auth.service";
import type {
  AuthUser,
  CustomerAddress,
  LoginCredentials,
  RegisterPayload,
  UpdateProfileInput,
} from "@/types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  addresses: CustomerAddress[];
  profileError: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  signInWithGoogle: (redirectTo: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (changes: UpdateProfileInput) => Promise<AuthUser>;
  getCurrentUser: () => Promise<AuthUser | null>;
  requestPasswordReset: (email: string) => Promise<string>;
  updatePassword: (password: string) => Promise<void>;
  addAddress: (
    input: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">,
  ) => Promise<AuthUser>;
  updateAddress: (
    addressId: string,
    input: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">,
  ) => Promise<AuthUser>;
  deleteAddress: (addressId: string) => Promise<AuthUser>;
  setDefaultAddress: (addressId: string) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    let active = true;
    let revision = 0;
    const supabase = getSupabase();
    const restoreSession = (session: Session | null) => {
      const currentRevision = ++revision;
      if (!session) {
        setUser(null);
        setProfileError(null);
        setIsLoading(false);
        return;
      }
      const sessionUser = toAuthUserFromIdentity(session.user);
      setUser(sessionUser);
      setProfileError(null);
      window.setTimeout(() => {
        void authService
          .getUserFromSession(session.user)
          .then((current) => {
            if (active && currentRevision === revision) {
              setUser(current);
              setProfileError(null);
            }
          })
          .catch((error: unknown) => {
            if (active && currentRevision === revision) {
              console.error("Unable to restore the customer session.", error);
              setProfileError(
                error instanceof Error ? error.message : "Unable to load your customer profile.",
              );
              toast.error(
                "You are signed in, but your saved customer profile could not be loaded.",
              );
              setUser(sessionUser);
            }
          })
          .finally(() => {
            if (active && currentRevision === revision) setIsLoading(false);
          });
      }, 0);
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) restoreSession(session);
    });

    void supabase.auth
      .getSession()
      .then(({ data: sessionData, error }) => {
        if (error) throw error;
        if (active && revision === 0) restoreSession(sessionData.session);
      })
      .catch((error: unknown) => {
        console.error("Unable to initialize the customer session.", error);
        if (active && revision === 0) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const nextUser = await authService.login(credentials);
    setUser(nextUser);
    setProfileError(null);
    return nextUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const nextUser = await authService.register(payload);
    setUser(nextUser);
    setProfileError(null);
    return nextUser;
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo: string) => {
    await authService.signInWithGoogle(redirectTo);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setProfileError(null);
  }, []);

  const updateProfile = useCallback(
    async (changes: UpdateProfileInput) => {
      if (!user?.id) throw new Error("You need to be logged in to update your profile.");
      const nextUser = await authService.updateProfile(user.id, changes);
      setUser(nextUser);
      setProfileError(null);
      return nextUser;
    },
    [user?.id],
  );

  const getCurrentUser = useCallback(async () => {
    const current = await authService.getCurrentUser();
    setUser(current);
    setProfileError(null);
    return current;
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return authService.requestPasswordReset(email);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    await authService.updatePassword(password);
  }, []);

  const addAddress = useCallback(
    async (input: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">) => {
      if (!user?.id) throw new Error("You need to be logged in to add an address.");
      const nextUser = await authService.addAddress(user.id, input);
      setUser(nextUser);
      setProfileError(null);
      return nextUser;
    },
    [user?.id],
  );

  const updateAddress = useCallback(
    async (addressId: string, input: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">) => {
      if (!user?.id) throw new Error("You need to be logged in to update an address.");
      const nextUser = await authService.updateAddress(user.id, addressId, input);
      setUser(nextUser);
      setProfileError(null);
      return nextUser;
    },
    [user?.id],
  );

  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!user?.id) throw new Error("You need to be logged in to delete an address.");
      const nextUser = await authService.deleteAddress(user.id, addressId);
      setUser(nextUser);
      setProfileError(null);
      return nextUser;
    },
    [user?.id],
  );

  const setDefaultAddress = useCallback(
    async (addressId: string) => {
      if (!user?.id) throw new Error("You need to be logged in to set a default address.");
      const nextUser = await authService.setDefaultAddress(user.id, addressId);
      setUser(nextUser);
      setProfileError(null);
      return nextUser;
    },
    [user?.id],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      addresses: user?.addresses ?? [],
      profileError,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      signInWithGoogle,
      logout,
      updateProfile,
      getCurrentUser,
      requestPasswordReset,
      updatePassword,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    }),
    [
      user,
      profileError,
      isLoading,
      login,
      register,
      signInWithGoogle,
      logout,
      updateProfile,
      getCurrentUser,
      requestPasswordReset,
      updatePassword,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    ],
  );

  useEffect(() => {
    if (isLoading || !user || typeof window === "undefined") return;
    const redirectTo = authService.consumeOAuthRedirect();
    if (redirectTo) window.location.replace(redirectTo);
  }, [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
