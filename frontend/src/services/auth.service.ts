import type { User } from "@supabase/supabase-js";
import { getSupabase, setRememberMe } from "@/lib/supabase";
import type {
  AuthUser,
  CustomerAddress,
  LoginCredentials,
  RegisterPayload,
  UpdateProfileInput,
} from "@/types/auth.types";

export class EmailConfirmationRequired extends Error {
  constructor() {
    super("Check your email to confirm your account, then log in.");
    this.name = "EmailConfirmationRequired";
  }
}

type ProfileRow = {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  addresses?: CustomerAddress[] | null;
  default_address_id: string | null;
  created_at: string;
  updated_at: string;
};

type AddressRow = {
  id: string;
  house_building: string;
  street: string;
  locality: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: CustomerAddress["addressType"];
  is_default: boolean;
};

const formatPhone = (phone: string) =>
  phone.replace(/\s+/g, "").replace(/^\+91/, "").replace(/[^\d]/g, "");

export const isValidIndianPhone = (phone: string) => /^[6-9]\d{9}$/.test(formatPhone(phone));
export const isValidPinCode = (pin: string) => /^[1-9]\d{5}$/.test(pin.trim());

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const oauthRedirectKey = "bb_oauth_redirect";

export function sanitizeRedirectPath(target: unknown): string {
  if (typeof target !== "string" || !target.startsWith("/") || target.startsWith("//")) return "/";
  try {
    const url = new URL(target, "https://biriyani-babu.invalid");
    return url.origin === "https://biriyani-babu.invalid"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/";
  } catch {
    return "/";
  }
}

const makeFullAddress = (address: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">) => {
  const parts = [
    address.house,
    address.street,
    address.locality,
    address.landmark,
    `${address.city}, ${address.state}`,
    `PIN ${address.pincode}`,
  ].filter(Boolean);
  return parts.join(", ");
};

function toCustomerAddress(row: AddressRow): CustomerAddress {
  const address = {
    house: row.house_building,
    street: row.street,
    locality: row.locality,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    addressType: row.address_type,
  };
  return {
    ...address,
    ...(row.landmark ? { landmark: row.landmark } : {}),
    id: row.id,
    isDefault: row.is_default,
    fullAddress: makeFullAddress({
      ...address,
      ...(row.landmark ? { landmark: row.landmark } : {}),
    }),
  };
}

function addressFields(address: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">) {
  const required = [address.house, address.street, address.locality, address.city, address.state];
  if (required.some((value) => !value.trim())) {
    throw new Error("Please complete all required address fields.");
  }
  if (!isValidPinCode(address.pincode)) {
    throw new Error("Enter a valid 6-digit Indian PIN code.");
  }

  return {
    house_building: address.house.trim(),
    street: address.street.trim(),
    locality: address.locality.trim(),
    landmark: address.landmark?.trim() || null,
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
    address_type: address.addressType,
  };
}

const toAddress = (
  address: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">,
  index = 0,
): CustomerAddress => {
  const landmark = address.landmark?.trim();
  return {
    house: address.house,
    street: address.street,
    locality: address.locality,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    addressType: address.addressType,
    ...(landmark ? { landmark } : {}),
    ...(address.latitude != null ? { latitude: address.latitude } : {}),
    ...(address.longitude != null ? { longitude: address.longitude } : {}),
    id: `addr_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`,
    isDefault: false,
    fullAddress: makeFullAddress(address),
  };
};

export function toAuthUser(
  email: string,
  row: ProfileRow,
  providerUser?: Pick<User, "email" | "user_metadata">,
): AuthUser {
  const metadata = providerUser?.user_metadata ?? {};
  const fullName =
    row.full_name?.trim() ||
    (typeof metadata["full_name"] === "string" ? metadata["full_name"] : "") ||
    (typeof metadata["name"] === "string" ? metadata["name"] : "");
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName =
    nameParts[0] ||
    row.first_name?.trim() ||
    (typeof metadata["first_name"] === "string" ? metadata["first_name"] : "") ||
    (typeof metadata["given_name"] === "string" ? metadata["given_name"] : "") ||
    "";
  const lastName =
    nameParts.slice(1).join(" ") ||
    row.last_name?.trim() ||
    (typeof metadata["last_name"] === "string" ? metadata["last_name"] : "") ||
    (typeof metadata["family_name"] === "string" ? metadata["family_name"] : "");
  const avatarUrl =
    row.avatar_url?.trim() ||
    (typeof metadata["avatar_url"] === "string" ? metadata["avatar_url"] : "") ||
    (typeof metadata["picture"] === "string" ? metadata["picture"] : "");
  return {
    id: row.id,
    firstName,
    lastName,
    email: providerUser?.email ?? (email || row.email || ""),
    ...(avatarUrl ? { avatarUrl } : {}),
    mobile: row.phone ?? row.mobile ?? "",
    addresses: row.addresses ?? [],
    ...(row.default_address_id ? { defaultAddressId: row.default_address_id } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toAuthUserFromIdentity(user: User): AuthUser {
  const timestamp = user.created_at || new Date().toISOString();
  return toAuthUser(
    user.email ?? "",
    {
      id: user.id,
      full_name: "",
      email: user.email ?? "",
      avatar_url: "",
      phone: "",
      first_name: "",
      last_name: "",
      mobile: "",
      addresses: [],
      default_address_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    user,
  );
}

function authError(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return new Error("Incorrect email or password.");
  }
  if (/already registered|already been registered/i.test(message)) {
    return new Error("An account with this email already exists.");
  }
  if (/email not confirmed/i.test(message)) {
    return new Error("Confirm your email before logging in.");
  }
  return new Error(message);
}

async function currentAuthUser() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error("You need to be logged in.");
  return data.user;
}

async function loadProfile(user: User): Promise<AuthUser> {
  const { data, error } = await getSupabase().rpc("ensure_customer_profile");
  if (error) {
    throw new Error(
      `Unable to retrieve your customer profile: ${error.message}. Apply supabase/profiles.sql in the Supabase SQL Editor.`,
    );
  }
  const profile = Array.isArray(data) ? data[0] : data;
  if (!profile) {
    throw new Error("Supabase did not return a customer profile for the authenticated user.");
  }
  const { data: addressRows, error: addressError } = await getSupabase()
    .from("addresses")
    .select(
      "id, house_building, street, locality, landmark, city, state, pincode, address_type, is_default",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (addressError) {
    throw new Error(
      `Unable to retrieve your saved addresses: ${addressError.message}. Apply the customer profile and address migration in Supabase.`,
    );
  }
  const addresses = ((addressRows ?? []) as AddressRow[]).map(toCustomerAddress);
  const defaultAddressId = addresses.find((address) => address.isDefault)?.id ?? null;
  return toAuthUser(
    user.email ?? "",
    {
      ...(profile as ProfileRow),
      addresses,
      default_address_id: defaultAddressId,
    },
    user,
  );
}

export const authService = {
  async signInWithGoogle(redirectTo: string): Promise<void> {
    const supabase = getSupabase();
    const safeRedirect = sanitizeRedirectPath(redirectTo);
    if (safeRedirect === "/") {
      window.sessionStorage.removeItem(oauthRedirectKey);
    } else {
      window.sessionStorage.setItem(oauthRedirectKey, safeRedirect);
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw new Error(error.message);
    } catch (error) {
      window.sessionStorage.removeItem(oauthRedirectKey);
      throw error;
    }
  },

  consumeOAuthRedirect(): string | null {
    const target = window.sessionStorage.getItem(oauthRedirectKey);
    window.sessionStorage.removeItem(oauthRedirectKey);
    if (!target) return null;
    const safeTarget = sanitizeRedirectPath(target);
    return safeTarget === "/" ? null : safeTarget;
  },

  getUserFromSession(user: User): Promise<AuthUser> {
    return loadProfile(user);
  },

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    setRememberMe(!!credentials.rememberMe);
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: normalizeEmail(credentials.email),
      password: credentials.password,
    });
    if (error || !data.user) throw authError(error?.message ?? "Unable to log in right now.");
    return loadProfile(data.user);
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();
    const mobile = formatPhone(payload.mobile);
    if (!firstName || !lastName) {
      throw new Error("Please complete all required personal details.");
    }
    if (!isValidIndianPhone(mobile)) {
      throw new Error("Enter a valid 10-digit Indian mobile number.");
    }

    const addressInput = {
      house: payload.address.house.trim(),
      street: payload.address.street.trim(),
      locality: payload.address.locality.trim(),
      city: payload.address.city.trim(),
      state: payload.address.state.trim(),
      pincode: payload.address.pincode.trim(),
      addressType: payload.address.addressType,
      ...(payload.address.landmark?.trim() ? { landmark: payload.address.landmark.trim() } : {}),
      ...(payload.address.latitude != null ? { latitude: payload.address.latitude } : {}),
      ...(payload.address.longitude != null ? { longitude: payload.address.longitude } : {}),
    };
    addressFields(addressInput);
    const address = toAddress(addressInput);
    address.isDefault = true;

    setRememberMe(!!payload.rememberMe);
    const { data, error } = await getSupabase().auth.signUp({
      email: normalizeEmail(payload.email),
      password: payload.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
          mobile,
          phone: mobile,
          addresses: [address],
          default_address_id: address.id,
        },
      },
    });
    if (error || !data.user) throw authError(error?.message ?? "Unable to create your account.");
    if (data.user.identities?.length === 0) {
      throw new Error("An account with this email already exists.");
    }
    if (!data.session) throw new EmailConfirmationRequired();
    return loadProfile(data.user);
  },

  async logout() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await getSupabase().auth.getUser();
    if (error) {
      if (error.name === "AuthSessionMissingError" || error.status === 401) return null;
      throw new Error(error.message);
    }
    if (!data.user) return null;
    return loadProfile(data.user);
  },

  async updateProfile(userId: string, changes: UpdateProfileInput): Promise<AuthUser> {
    const user = await currentAuthUser();
    if (user.id !== userId) throw new Error("You need to be logged in to update your profile.");
    const patch: Record<string, string> = {};
    if (changes.firstName !== undefined || changes.lastName !== undefined) {
      patch["full_name"] =
        `${changes.firstName?.trim() ?? ""} ${changes.lastName?.trim() ?? ""}`.trim();
    }
    if (changes.mobile !== undefined) {
      const phone = formatPhone(changes.mobile);
      if (phone && !isValidIndianPhone(phone)) {
        throw new Error("Enter a valid 10-digit Indian mobile number.");
      }
      patch["phone"] = phone;
    }
    if (Object.keys(patch).length === 0) return loadProfile(user);
    const { data, error } = await getSupabase()
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Your customer profile could not be found.");
    return loadProfile(user);
  },

  async requestPasswordReset(email: string): Promise<string> {
    const { error } = await getSupabase().auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
    return "If an account exists for that email, a reset link is on its way.";
  },

  async updatePassword(password: string) {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw new Error(error.message);
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<AuthUser> {
    const user = await currentAuthUser();
    if (user.id !== userId) throw new Error("You need to be logged in to set a default address.");
    const { error } = await getSupabase().rpc("set_customer_default_address", {
      p_address_id: addressId,
    });
    if (error) throw new Error(error.message);
    return loadProfile(user);
  },

  async addAddress(
    userId: string,
    input: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">,
  ): Promise<AuthUser> {
    const user = await currentAuthUser();
    if (user.id !== userId) throw new Error("You need to be logged in to add an address.");
    const profile = await loadProfile(user);
    const { error } = await getSupabase()
      .from("addresses")
      .insert({
        ...addressFields(input),
        user_id: user.id,
        is_default: profile.addresses.length === 0,
      });
    if (error) throw new Error(error.message);
    return loadProfile(user);
  },

  async updateAddress(
    userId: string,
    addressId: string,
    input: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress">,
  ): Promise<AuthUser> {
    const user = await currentAuthUser();
    if (user.id !== userId) throw new Error("You need to be logged in to update an address.");
    const { data, error } = await getSupabase()
      .from("addresses")
      .update(addressFields(input))
      .eq("id", addressId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("That saved address could not be found.");
    return loadProfile(user);
  },

  async deleteAddress(userId: string, addressId: string): Promise<AuthUser> {
    const user = await currentAuthUser();
    if (user.id !== userId) throw new Error("You need to be logged in to delete an address.");
    const { data, error } = await getSupabase()
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("That saved address could not be found.");
    return loadProfile(user);
  },
};
