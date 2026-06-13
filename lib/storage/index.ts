import { PersistenceService } from "./persistence-service";
import { resolveDefaultStore } from "./kv-store";

export { PersistenceService, SCHEMA_VERSION } from "./persistence-service";
export {
  MemoryStore,
  LocalStorageStore,
  type KeyValueStore,
} from "./kv-store";

let singleton: PersistenceService | null = null;

/**
 * Access the app-wide persistence service. Uses localStorage in the browser
 * and an in-memory store during SSR. Tests can construct their own
 * `new PersistenceService(new MemoryStore())` instead of using this.
 */
export function getStorage(): PersistenceService {
  if (!singleton) {
    singleton = new PersistenceService(resolveDefaultStore());
  }
  return singleton;
}
