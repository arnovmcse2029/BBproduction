/**
 * Centralised HTTP client for the future Node.js / Express API.
 *
 * Set VITE_API_BASE_URL (e.g. https://api.example.com/v1) to switch every
 * service from local demo data to the real backend. Never put database
 * credentials or Razorpay secret keys in frontend code.
 */
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export const isBackendConnected = API_BASE_URL.length > 0;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.sessionStorage.getItem("bb_admin_token") : null;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new ApiError(await res.text().catch(() => res.statusText), res.status);
  return (await res.json()) as T;
}
