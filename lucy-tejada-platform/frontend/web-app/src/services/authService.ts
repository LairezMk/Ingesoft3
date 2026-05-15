/**
 * ============================================
 * AUTH SERVICE - SERVICIOS DE AUTENTICACIÓN
 * ============================================
 */

import { deleteApp, initializeApp, FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ApiResponse } from './api';
import { firebaseAuth, firebaseConfig, firebaseDb, isFirebaseConfigured } from './firebase';
import { createCallable } from './firebaseFunctions';
import { type AppRole } from '@/utils/rbac';
import { MOCK_MODE, mockApi, storage } from './mockApi';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user: {
    id: string;
    email: string;
    name?: string;
    role: AppRole;
    profile?: {
      firstName: string;
      lastName: string;
      phone?: string;
      identification?: string;
    };
    status?: string;
    permissions?: string[];
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  documentNumber?: string;
}

export interface CreateTeacherAccountRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  specialties: string[];
  yearsExperience: number;
  status: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const adminEmails = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean)
);

const DEMO_ADMIN_EMAIL = 'samuel.herrera@utp.edu.co';
const DEMO_ADMIN_PASSWORD = 'Lucy123.';
const ROLE_PREFIX_REGEX = /^\[(ADMIN|DOCENTE|ESTUDIANTE|VISITANTE)\]\s*/i;

const getRoleForEmail = (email?: string | null): AppRole => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return 'ESTUDIANTE';
  }

  if (adminEmails.has(normalizedEmail)) {
    return 'ADMIN';
  }

  const teachers = storage.get<Array<{ email?: string }>>('teachers') || [];
  const isTeacher = teachers.some(
    (teacher) => teacher.email?.trim().toLowerCase() === normalizedEmail
  );

  if (isTeacher) {
    return 'DOCENTE';
  }

  return 'ESTUDIANTE';
};

const buildDisplayName = (role: AppRole, firstName: string, lastName: string) =>
  `[${role}] ${`${firstName} ${lastName}`.trim()}`.trim();

const parseDisplayName = (displayName?: string | null) => {
  if (!displayName) {
    return {
      role: null as AppRole | null,
      firstName: '',
      lastName: '',
      fullName: '',
    };
  }

  const roleMatch = displayName.match(ROLE_PREFIX_REGEX);
  const detectedRole = roleMatch?.[1]?.toUpperCase() as AppRole | undefined;
  const cleanName = displayName.replace(ROLE_PREFIX_REGEX, '').trim();
  const [firstName = '', ...rest] = cleanName.split(/\s+/).filter(Boolean);
  const lastName = rest.join(' ');

  return {
    role: detectedRole ?? null,
    firstName,
    lastName,
    fullName: cleanName,
  };
};

const saveLocalAuthProfile = (profile: Record<string, unknown>) => {
  const current = storage.get<Record<string, unknown>[]>('user_profiles') || [];
  const filtered = current.filter(
    (item) =>
      String(item.email || '').toLowerCase() !== String(profile.email || '').toLowerCase()
  );
  storage.set('user_profiles', [profile, ...filtered]);
};

const getLocalAuthProfile = (email?: string | null) => {
  if (!email) return null;
  const current =
    storage.get<Record<string, unknown>[]>('user_profiles') ||
    storage.get<Record<string, unknown>[]>('auth_profiles') ||
    [];
  return (
    current.find(
      (item) => String(item.email || '').toLowerCase() === email.toLowerCase()
    ) || null
  );
};

const persistUserProfile = async (
  uid: string,
  profile: Record<string, unknown>
) => {
  saveLocalAuthProfile(profile);

  if (!firebaseDb) return;

  try {
    await setDoc(
      doc(firebaseDb, 'user_profiles', uid),
      {
        ...profile,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Firestore is optional for now; local fallback keeps the app usable.
  }
};

const loadPersistedProfile = async (uid: string, email?: string | null) => {
  if (firebaseDb) {
    try {
      const snapshot = await getDoc(doc(firebaseDb, 'user_profiles', uid));
      if (snapshot.exists()) {
        return snapshot.data() as Record<string, unknown>;
      }
    } catch {
      // Firestore may be disabled; local fallback handles it.
    }
  }

  return getLocalAuthProfile(email);
};

const toLoginUser = async (user: FirebaseUser): Promise<LoginResponse['user']> => {
  const parsedDisplayName = parseDisplayName(user.displayName);
  const persistedProfile = await loadPersistedProfile(user.uid, user.email);
  const role =
    persistedProfile?.role && typeof persistedProfile.role === 'string'
      ? (persistedProfile.role as AppRole)
      : parsedDisplayName.role || getRoleForEmail(user.email);

  const firstName =
    typeof persistedProfile?.firstName === 'string'
      ? persistedProfile.firstName
      : parsedDisplayName.firstName;
  const lastName =
    typeof persistedProfile?.lastName === 'string'
      ? persistedProfile.lastName
      : parsedDisplayName.lastName;

  return {
    id: user.uid,
    email: user.email ?? '',
    name:
      parsedDisplayName.fullName ||
      `${firstName} ${lastName}`.trim() ||
      undefined,
    role,
    profile:
      firstName || lastName
        ? {
            firstName,
            lastName,
            phone:
              typeof persistedProfile?.phone === 'string'
                ? persistedProfile.phone
                : undefined,
            identification:
              typeof persistedProfile?.documentNumber === 'string'
                ? persistedProfile.documentNumber
                : undefined,
          }
        : undefined,
  };
};

const buildBaseResponse = (path: string) => ({
  timestamp: new Date().toISOString(),
  path,
  requestId: 'firebase',
});

const getFirebaseErrorMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'El usuario no existe.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/invalid-credential':
        return 'Credenciales inválidas.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta de nuevo en unos minutos.';
      case 'auth/invalid-email':
        return 'El correo es inválido.';
      default:
        return error.message || 'Ha ocurrido un error inesperado.';
    }
  }

  return 'Ha ocurrido un error inesperado.';
};

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    if (
      data.email.trim().toLowerCase() === DEMO_ADMIN_EMAIL &&
      data.password === DEMO_ADMIN_PASSWORD
    ) {
      if (isFirebaseConfigured && firebaseAuth) {
        try {
          const adminCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            DEMO_ADMIN_EMAIL,
            DEMO_ADMIN_PASSWORD
          );
          await persistUserProfile(adminCredential.user.uid, {
            uid: adminCredential.user.uid,
            email: DEMO_ADMIN_EMAIL,
            role: 'ADMIN',
            firstName: 'Samuel',
            lastName: 'Herrera',
          });
          const accessToken = await adminCredential.user.getIdToken();
          const user = await toLoginUser(adminCredential.user);

          return {
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
              accessToken,
              refreshToken: adminCredential.user.refreshToken,
              user,
            },
            ...buildBaseResponse('/auth/login'),
          };
        } catch (error) {
          const message = getFirebaseErrorMessage(error);
          const isMissingAccount =
            message.includes('El usuario no existe') ||
            message.includes('Credenciales inválidas');

          if (!isMissingAccount) {
            return {
              success: false,
              message,
              ...buildBaseResponse('/auth/login'),
            };
          }

          try {
            const adminCredential = await createUserWithEmailAndPassword(
              firebaseAuth,
              DEMO_ADMIN_EMAIL,
              DEMO_ADMIN_PASSWORD
            );
            await updateProfile(adminCredential.user, {
              displayName: buildDisplayName('ADMIN', 'Samuel', 'Herrera'),
            });
            await persistUserProfile(adminCredential.user.uid, {
              uid: adminCredential.user.uid,
              email: DEMO_ADMIN_EMAIL,
              role: 'ADMIN',
              firstName: 'Samuel',
              lastName: 'Herrera',
            });

            const accessToken = await adminCredential.user.getIdToken();
            const user = await toLoginUser(adminCredential.user);

            return {
              success: true,
              message: 'Inicio de sesión exitoso',
              data: {
                accessToken,
                refreshToken: adminCredential.user.refreshToken,
                user,
              },
              ...buildBaseResponse('/auth/login'),
            };
          } catch (creationError) {
            return {
              success: false,
              message: getFirebaseErrorMessage(creationError),
              ...buildBaseResponse('/auth/login'),
            };
          }
        }
      }
    }

    if (MOCK_MODE || !isFirebaseConfigured || !firebaseAuth) {
      return mockApi.login(data.email, data.password) as Promise<ApiResponse<LoginResponse>>;
    }

    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        data.email,
        data.password
      );
      const accessToken = await credential.user.getIdToken();
      const user = await toLoginUser(credential.user);

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          accessToken,
          refreshToken: credential.user.refreshToken,
          user,
        },
        ...buildBaseResponse('/auth/login'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/login'),
      };
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async (_allDevices = false): Promise<ApiResponse> => {
    if (MOCK_MODE || !isFirebaseConfigured || !firebaseAuth) {
      return mockApi.logout();
    }

    try {
      await signOut(firebaseAuth);
      return {
        success: true,
        message: 'Sesión cerrada',
        ...buildBaseResponse('/auth/logout'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/logout'),
      };
    }
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: async (): Promise<ApiResponse<LoginResponse["user"]>> => {
    if (MOCK_MODE || !isFirebaseConfigured || !firebaseAuth) {
      return mockApi.getCurrentUser() as Promise<ApiResponse<LoginResponse["user"]>>;
    }

    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'No hay usuario autenticado.',
        ...buildBaseResponse('/auth/me'),
      };
    }

    return {
      success: true,
      message: 'Usuario obtenido',
      data: await toLoginUser(currentUser),
      ...buildBaseResponse('/auth/me'),
    };
  },

  /**
   * Renovar tokens
   */
  refreshTokens: async (
    refreshToken: string,
  ): Promise<ApiResponse<LoginResponse>> => {
    if (MOCK_MODE || !isFirebaseConfigured || !firebaseAuth) {
      const user = storage.get<LoginResponse['user']>('user');
      const tokens = storage.get<{
        accessToken: string;
        refreshToken: string;
      }>('tokens');

      if (!user || !tokens) {
        return {
          success: false,
          message: 'No hay usuario autenticado.',
          ...buildBaseResponse('/auth/refresh'),
        };
      }

      return {
        success: true,
        message: 'Token renovado',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || refreshToken,
          user,
        },
        ...buildBaseResponse('/auth/refresh'),
      };
    }

    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'No hay usuario autenticado.',
        ...buildBaseResponse('/auth/refresh'),
      };
    }

    try {
      const accessToken = await currentUser.getIdToken(true);
      return {
        success: true,
        message: 'Token renovado',
        data: {
          accessToken,
          refreshToken: currentUser.refreshToken || refreshToken,
          user: await toLoginUser(currentUser),
        },
        ...buildBaseResponse('/auth/refresh'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/refresh'),
      };
    }
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    if (MOCK_MODE || !isFirebaseConfigured || !firebaseAuth) {
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        ...buildBaseResponse('/auth/change-password'),
      };
    }

    if (!firebaseAuth.currentUser) {
      return {
        success: false,
        message: 'No hay usuario autenticado.',
        ...buildBaseResponse('/auth/change-password'),
      };
    }

    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden.',
        ...buildBaseResponse('/auth/change-password'),
      };
    }

    try {
      await updatePassword(firebaseAuth.currentUser, data.newPassword);
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        ...buildBaseResponse('/auth/change-password'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/change-password'),
      };
    }
  },

  /**
   * Validar token
   */
  validateToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    if (MOCK_MODE || !isFirebaseConfigured || !firebaseAuth) {
      const valid = Boolean(storage.get('user'));
      return {
        success: true,
        message: valid ? 'Token válido' : 'Token inválido',
        data: { valid },
        ...buildBaseResponse('/auth/validate'),
      };
    }

    const valid = Boolean(firebaseAuth.currentUser);
    return {
      success: true,
      message: valid ? 'Token válido' : 'Token inválido',
      data: { valid },
      ...buildBaseResponse('/auth/validate'),
    };
  },

  register: async (
    data: RegisterRequest
  ): Promise<ApiResponse<LoginResponse>> => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      return {
        success: false,
        message: 'Firebase no está configurado para registro.',
        ...buildBaseResponse('/auth/register'),
      };
    }

    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden.',
        ...buildBaseResponse('/auth/register'),
      };
    }

    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        data.email.trim(),
        data.password
      );

      await updateProfile(credential.user, {
        displayName: buildDisplayName(
          'ESTUDIANTE',
          data.firstName.trim(),
          data.lastName.trim()
        ),
      });

      const profile = {
        uid: credential.user.uid,
        email: data.email.trim().toLowerCase(),
        role: 'ESTUDIANTE',
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || '',
        documentNumber: data.documentNumber?.trim() || '',
      };

      await persistUserProfile(credential.user.uid, profile);

      const students = storage.get<Record<string, unknown>[]>('students') || [];
      storage.set('students', [
        {
          id: credential.user.uid,
          documentType: 'CC',
          documentNumber: profile.documentNumber || String(Date.now()).slice(-8),
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          enrollmentStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
        ...students.filter(
          (student) =>
            String(student.email || '').toLowerCase() !== profile.email.toLowerCase()
        ),
      ]);

      const accessToken = await credential.user.getIdToken();
      const user = await toLoginUser(credential.user);

      return {
        success: true,
        message: 'Registro exitoso',
        data: {
          accessToken,
          refreshToken: credential.user.refreshToken,
          user,
        },
        ...buildBaseResponse('/auth/register'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/register'),
      };
    }
  },

  createTeacherAccount: async (
    data: CreateTeacherAccountRequest
  ): Promise<ApiResponse<{ teacherId: string }>> => {
    if (!isFirebaseConfigured) {
      return {
        success: false,
        message: 'Firebase no está configurado para crear docentes.',
        ...buildBaseResponse('/auth/create-teacher'),
      };
    }

    const createTeacherWithFunction = createCallable<
      CreateTeacherAccountRequest,
      { teacherId: string; message?: string }
    >('createTeacherAccount');

    if (createTeacherWithFunction) {
      try {
        const result = await createTeacherWithFunction({
          ...data,
          email: data.email.trim().toLowerCase(),
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          documentNumber: data.documentNumber.trim(),
        });

        const teacherId = result.data.teacherId;
        const teachers = storage.get<Record<string, unknown>[]>('teachers') || [];
        storage.set('teachers', [
          {
            id: teacherId,
            firebaseUid: teacherId,
            documentType: data.documentType,
            documentNumber: data.documentNumber.trim(),
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            specialties: data.specialties,
            yearsExperience: data.yearsExperience,
            status: data.status,
            createdAt: new Date().toISOString(),
          },
          ...teachers.filter(
            (teacher) =>
              String(teacher.email || '').toLowerCase() !== data.email.trim().toLowerCase()
          ),
        ]);

        return {
          success: true,
          message: result.data.message || 'Docente creado correctamente en Firebase.',
          data: {
            teacherId,
          },
          ...buildBaseResponse('/auth/create-teacher'),
        };
      } catch (error) {
        if (!(error instanceof FirebaseError)) {
          return {
            success: false,
            message: 'No se pudo crear el docente con Cloud Functions.',
            ...buildBaseResponse('/auth/create-teacher'),
          };
        }
      }
    }

    const secondaryApp = initializeApp(
      firebaseConfig,
      `teacher-creator-${Date.now()}`
    );
    const secondaryAuth = getAuth(secondaryApp);

    try {
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        data.email.trim(),
        data.password
      );

      await updateProfile(credential.user, {
        displayName: buildDisplayName(
          'DOCENTE',
          data.firstName.trim(),
          data.lastName.trim()
        ),
      });

      const teacherProfile = {
        uid: credential.user.uid,
        email: data.email.trim().toLowerCase(),
        role: 'DOCENTE',
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        documentType: data.documentType,
        documentNumber: data.documentNumber.trim(),
        specialties: data.specialties,
        yearsExperience: data.yearsExperience,
        status: data.status,
      };

      await persistUserProfile(credential.user.uid, teacherProfile);

      const teachers = storage.get<Record<string, unknown>[]>('teachers') || [];
      storage.set('teachers', [
        {
          id: credential.user.uid,
          firebaseUid: credential.user.uid,
          documentType: data.documentType,
          documentNumber: data.documentNumber.trim(),
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          specialties: data.specialties,
          yearsExperience: data.yearsExperience,
          status: data.status,
          createdAt: new Date().toISOString(),
        },
        ...teachers.filter(
          (teacher) =>
            String(teacher.email || '').toLowerCase() !== data.email.trim().toLowerCase()
        ),
      ]);

      await signOut(secondaryAuth);

      return {
        success: true,
        message: 'Docente creado correctamente en Firebase.',
        data: {
          teacherId: credential.user.uid,
        },
        ...buildBaseResponse('/auth/create-teacher'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/create-teacher'),
      };
    } finally {
      await deleteApp(secondaryApp).catch(() => undefined);
    }
  },
};

export default authService;
