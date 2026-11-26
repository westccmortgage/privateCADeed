// Shared form helpers: phone/email validation and the lead-request client.

/** HTML `pattern` for phone inputs (the browser anchors it automatically). */
export const PHONE_PATTERN =
  "\\+[^0-9]*([0-9][^0-9]*){10,15}|[^0-9+]*(1[^0-9]*)?([0-9][^0-9]*){10}";

export const PHONE_HINT =
  "US number with 10 digits, or an international number starting with +";

const PHONE_RE = new RegExp(`^(?:${PHONE_PATTERN})$`);

export function isPhoneValid(v: string): boolean {
  const s = v.trim();
  return s === "" || PHONE_RE.test(s);
}

export function isEmailValid(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export const EMAIL_ERROR = "Please enter a valid email address, for example name@example.com.";
export const PHONE_ERROR = PHONE_HINT + ".";
export const NAME_ERROR = "Please enter your name.";

export type FailKind = "validation" | "service";

/** kind "validation": a message from our own API/AI engine; "service": network or server failure. */
export class RequestFailure extends Error {
  kind: FailKind;
  constructor(kind: FailKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

/**
 * POST JSON and return the parsed body. Throws RequestFailure:
 *  - "validation" for 4xx responses carrying our own `error` text,
 *  - "service" for network errors, 5xx (incl. 502 "not delivered") or unreadable replies.
 */
export async function postJson<T = Record<string, unknown>>(
  url: string,
  payload: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000),
    });
  } catch {
    throw new RequestFailure("service", "network");
  }
  let data: (Record<string, unknown> & { ok?: boolean; error?: unknown }) | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.ok && data && data.ok !== false) return data as T;
  if (res.status >= 400 && res.status < 500 && typeof data?.error === "string") {
    throw new RequestFailure("validation", data.error);
  }
  throw new RequestFailure("service", "server");
}
