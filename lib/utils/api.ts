/**
 * Small typed wrapper around POST + JSON fetch, shared by the client features
 * that call our API routes (reflection analysis, companion chat). Centralises
 * the request shape and error handling so call sites stay declarative.
 */
export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`);
  }
  return (await res.json()) as T;
}
