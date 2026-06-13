/**
 * Small typed wrapper around POST + JSON fetch, shared by the client features
 * that call our API routes (reflection analysis, companion chat). Centralises
 * the request shape and error handling so call sites stay declarative.
 */

/**
 * Thrown when an API route responds with a non-2xx status. Carries the status
 * and the server's user-safe `{ error }` message (e.g. the rate-limit notice)
 * so call sites can show it directly instead of a generic fallback.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Surface the server's safe error message when present; the API routes
    // only ever return generic, non-sensitive strings (never stack traces).
    let message = "Something went wrong. Please try again.";
    try {
      const data = (await res.json()) as { error?: unknown };
      if (typeof data?.error === "string" && data.error.trim()) {
        message = data.error;
      }
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}
