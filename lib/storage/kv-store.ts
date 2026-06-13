/**
 * Minimal key/value backend. The persistence service depends only on this
 * interface, so the underlying store (localStorage today, a remote DB later)
 * can be swapped without touching call sites.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** In-memory store used during SSR and in tests. */
export class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

/** Browser localStorage adapter with defensive guards around quota errors. */
export class LocalStorageStore implements KeyValueStore {
  constructor(private readonly backing: Storage) {}

  getItem(key: string): string | null {
    try {
      return this.backing.getItem(key);
    } catch {
      return null;
    }
  }
  setItem(key: string, value: string): void {
    try {
      this.backing.setItem(key, value);
    } catch {
      // Swallow quota / privacy-mode errors — persistence is best-effort.
    }
  }
  removeItem(key: string): void {
    try {
      this.backing.removeItem(key);
    } catch {
      /* no-op */
    }
  }
}

/**
 * Returns a localStorage-backed store in the browser, or an in-memory store
 * during SSR. The in-memory instance is shared per module load so repeated
 * calls within a render do not lose data.
 */
let ssrFallback: MemoryStore | null = null;

export function resolveDefaultStore(): KeyValueStore {
  if (typeof window !== "undefined" && window.localStorage) {
    return new LocalStorageStore(window.localStorage);
  }
  if (!ssrFallback) ssrFallback = new MemoryStore();
  return ssrFallback;
}
