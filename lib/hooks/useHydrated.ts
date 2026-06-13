"use client";

import { useEffect, useState } from "react";

/**
 * Returns false on the server and the first client render, then true once
 * mounted. Use it to defer reading client-only stores (localStorage) until
 * after hydration, avoiding server/client markup mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
