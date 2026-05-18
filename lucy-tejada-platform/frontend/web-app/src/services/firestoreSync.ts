import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { firebaseDb } from "./firebase";

const STORAGE_PREFIX = "lucy_tejada_";

const syncedCollections = new Set([
  "students",
  "teachers",
  "programs",
  "groups",
  "enrollments",
  "venues",
  "reservations",
  "contracts",
  "maintenance_records",
  "attendance_records",
  "evaluations",
  "user_profiles",
]);

const localOnlyKeys = new Set(["user", "tokens", "venue_calendar_dates"]);

const serialize = (value: unknown) => JSON.stringify(value);

export const writeLocalCache = (key: string, value: unknown) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, serialize(value));
  } catch (error) {
    console.error("Error guardando caché local:", error);
  }
};

export const removeLocalCache = (key: string) => {
  localStorage.removeItem(STORAGE_PREFIX + key);
};

const resolveDocId = (item: Record<string, unknown>, index: number) => {
  if (typeof item.id === "string" && item.id.length > 0) return item.id;
  if (typeof item.uid === "string" && item.uid.length > 0) return item.uid;
  if (typeof item.email === "string" && item.email.length > 0) {
    return item.email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  }
  return `${Date.now()}_${index}`;
};

const persistCollection = async (key: string, value: unknown) => {
  if (!firebaseDb || !syncedCollections.has(key) || !Array.isArray(value)) {
    return;
  }

  const db = firebaseDb;
  const existingSnapshot = await getDocs(collection(db, key));
  const existingIds = new Set(existingSnapshot.docs.map((snapshot) => snapshot.id));
  const nextIds = new Set<string>();
  const batch = writeBatch(db);

  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const record = entry as Record<string, unknown>;
    const recordId = resolveDocId(record, index);
    nextIds.add(recordId);
    batch.set(doc(db, key, recordId), { ...record, id: recordId }, { merge: true });
  });

  existingIds.forEach((existingId) => {
    if (!nextIds.has(existingId)) {
      batch.delete(doc(db, key, existingId));
    }
  });

  await batch.commit();
};

const hydrateCollection = async (key: string) => {
  if (!firebaseDb || !syncedCollections.has(key)) return;
  const snapshot = await getDocs(collection(firebaseDb, key));
  const items = snapshot.docs.map((item) => item.data());
  writeLocalCache(key, items);
};

export const initializeFirestoreCache = async () => {
  if (!firebaseDb) return;

  await Promise.all([...syncedCollections].map((key) => hydrateCollection(key)));
};

export const syncKeyToFirestore = async (key: string, value: unknown) => {
  if (!firebaseDb || localOnlyKeys.has(key)) return;
  await persistCollection(key, value);
};

export const deleteKeyFromFirestore = async (key: string) => {
  if (!firebaseDb || !syncedCollections.has(key)) return;
  const db = firebaseDb;
  const snapshot = await getDocs(collection(db, key));
  await Promise.all(snapshot.docs.map((entry) => deleteDoc(doc(db, key, entry.id))));
};
