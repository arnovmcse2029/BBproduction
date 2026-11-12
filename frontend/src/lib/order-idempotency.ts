const STORAGE_KEY = "bb_pending_order_attempt_v1";
let keyGeneration: Promise<void> = Promise.resolve();

interface PendingAttempt {
  fingerprint: string;
  key: string;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashOrderPayload(payload: unknown): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(new Uint8Array(digest));
}

export async function getOrderIdempotencyKey(payload: unknown): Promise<string> {
  const fingerprint = await hashOrderPayload(payload);
  const result = keyGeneration.then(() => getOrCreateKey(fingerprint));
  keyGeneration = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function getOrCreateKey(fingerprint: string) {
  const attempts = readPendingAttempts();
  const existing = attempts.find((attempt) => attempt.fingerprint === fingerprint);
  if (existing) return existing.key;

  const key = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...attempts, { fingerprint, key }]));
  return key;
}

export function clearOrderIdempotencyKey(key: string) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const attempts = readPendingAttempts().filter((attempt) => attempt.key !== key);
  if (attempts.length === 0) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}

function readPendingAttempts(): PendingAttempt[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    const entries = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && "fingerprint" in parsed && "key" in parsed
        ? [parsed]
        : [];
    return entries.filter(
      (entry): entry is PendingAttempt =>
        typeof entry === "object" &&
        entry !== null &&
        "fingerprint" in entry &&
        typeof entry.fingerprint === "string" &&
        /^[0-9a-f]{64}$/i.test(entry.fingerprint) &&
        "key" in entry &&
        typeof entry.key === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entry.key),
    );
  } catch {
    return [];
  }
}
