"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeacherAccount = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/https");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const auth = (0, auth_1.getAuth)();
const sanitizeRole = (value) => {
    if (typeof value !== "string")
        return null;
    const normalized = value.trim().toUpperCase();
    if (normalized === "ADMIN" ||
        normalized === "DOCENTE" ||
        normalized === "ESTUDIANTE" ||
        normalized === "VISITANTE") {
        return normalized;
    }
    return null;
};
const ensureAdmin = async (uid) => {
    if (!uid) {
        throw new https_1.HttpsError("unauthenticated", "Debes iniciar sesión.");
    }
    const snapshot = await db.collection("user_profiles").doc(uid).get();
    const role = sanitizeRole(snapshot.data()?.role);
    if (role !== "ADMIN") {
        throw new https_1.HttpsError("permission-denied", "Solo un administrador puede realizar esta acción.");
    }
};
exports.createTeacherAccount = (0, https_1.onCall)(async (request) => {
    await ensureAdmin(request.auth?.uid);
    const data = request.data;
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
        throw new https_1.HttpsError("invalid-argument", "Faltan datos obligatorios para crear el docente.");
    }
    const userRecord = await auth.createUser({
        email,
        password,
        displayName: `[DOCENTE] ${firstName} ${lastName}`.trim(),
    });
    await db.collection("user_profiles").doc(userRecord.uid).set({
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
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    await db.collection("teachers").doc(userRecord.uid).set({
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
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    return {
        teacherId: userRecord.uid,
        message: "Docente creado correctamente.",
    };
});
