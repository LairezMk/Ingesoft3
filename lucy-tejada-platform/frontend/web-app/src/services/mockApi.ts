/**
 * ============================================
 * STORAGE HELPERS - Firestore-backed cache
 * ============================================
 */
import {
  deleteKeyFromFirestore,
  initializeFirestoreCache,
  removeLocalCache,
  syncKeyToFirestore,
  writeLocalCache,
} from "./firestoreSync";

// Clave base para localStorage
const STORAGE_PREFIX = "lucy_tejada_";

// Helper para guardar en localStorage
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    writeLocalCache(key, value);
    void syncKeyToFirestore(key, value).catch((error) => {
      console.error(`Error sincronizando ${key} en Firestore:`, error);
    });
  },

  remove: (key: string): void => {
    removeLocalCache(key);
    void deleteKeyFromFirestore(key).catch((error) => {
      console.error(`Error eliminando ${key} en Firestore:`, error);
    });
  },

  clear: (): void => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },
};

export const initializeRealDataLayer = async () => {
  await initializeFirestoreCache();
};
