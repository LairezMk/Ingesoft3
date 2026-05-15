import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/https";

initializeApp();

const db = getFirestore();
const auth = getAuth();

type AppRole = "ADMIN" | "DOCENTE" | "ESTUDIANTE" | "VISITANTE";

const sanitizeRole = (value: unknown): AppRole | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (
    normalized === "ADMIN" ||
    normalized === "DOCENTE" ||
    normalized === "ESTUDIANTE" ||
    normalized === "VISITANTE"
  ) {
    return normalized;
  }
  return null;
};

const ensureAdmin = async (uid?: string) => {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const snapshot = await db.collection("user_profiles").doc(uid).get();
  const role = sanitizeRole(snapshot.data()?.role);
  if (role !== "ADMIN") {
    throw new HttpsError("permission-denied", "Solo un administrador puede realizar esta acción.");
  }
};

export const createTeacherAccount = onCall(async (request) => {
  await ensureAdmin(request.auth?.uid);

  const data = request.data as Record<string, unknown>;
  const email = String(data.email ?? "").trim().toLowerCase();
  const password = String(data.password ?? "");
  const firstName = String(data.firstName ?? "").trim();
  const lastName = String(data.lastName ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const documentType = String(data.documentType ?? "").trim();
  const documentNumber = String(data.documentNumber ?? "").trim();
  const yearsExperience = Number(data.yearsExperience ?? 0);
  const status = String(data.status ?? "ACTIVE").trim().toUpperCase();
  const specialties = Array.isArray(data.specialties)
    ? data.specialties.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!email || !password || !firstName || !lastName || !documentNumber) {
    throw new HttpsError("invalid-argument", "Faltan datos obligatorios para crear el docente.");
  }

  const userRecord = await auth.createUser({
    email,
    password,
    displayName: `[DOCENTE] ${firstName} ${lastName}`.trim(),
  });

  await db.collection("user_profiles").doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email,
      role: "DOCENTE",
      firstName,
      lastName,
      phone,
      documentType,
      documentNumber,
      specialties,
      yearsExperience,
      status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection("teachers").doc(userRecord.uid).set(
    {
      id: userRecord.uid,
      firebaseUid: userRecord.uid,
      email,
      firstName,
      lastName,
      phone,
      documentType,
      documentNumber,
      specialties,
      yearsExperience,
      status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    teacherId: userRecord.uid,
    message: "Docente creado correctamente.",
  };
});
