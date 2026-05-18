export type AppRole = "ADMIN" | "DOCENTE" | "ESTUDIANTE" | "VISITANTE";

const LEGACY_ROLE_MAP: Record<string, AppRole> = {
  AUXILIAR_ADMINISTRATIVO: "ADMIN",
  OFICINA_JURIDICA: "ADMIN",
  TECNICO_OPERATIVO: "ADMIN",
  OPERARIO_LOGISTICO: "ADMIN",
};

export const normalizeRole = (role?: string | null): AppRole | null => {
  if (!role) return null;
  const normalized = role.toUpperCase();
  if (normalized === "ADMIN" || normalized === "DOCENTE" || normalized === "ESTUDIANTE" || normalized === "VISITANTE") {
    return normalized;
  }
  return LEGACY_ROLE_MAP[normalized] ?? null;
};

export const hasRoleAccess = (role: string | null | undefined, allowedRoles: AppRole[]) => {
  const normalized = normalizeRole(role);
  return !!normalized && allowedRoles.includes(normalized);
};

export const getDefaultRouteForRole = (role: string | null | undefined) => {
  const normalized = normalizeRole(role);
  if (normalized === "VISITANTE" || !normalized) return "/";
  if (normalized === "ADMIN" || normalized === "DOCENTE" || normalized === "ESTUDIANTE") {
    return "/dashboard";
  }
  return "/";
};

export const getRoleLabel = (role: string | null | undefined) => {
  const normalized = normalizeRole(role);
  if (normalized === "ADMIN") return "Administrador";
  if (normalized === "DOCENTE") return "Docente";
  if (normalized === "ESTUDIANTE") return "Estudiante";
  if (normalized === "VISITANTE") return "Visitante";
  return "Usuario";
};
