import { storage } from "@/services/mockApi";
import type { AppRole } from "@/utils/rbac";

export type NotificationKind = "success" | "error" | "warning" | "info";

export interface StoredNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message?: string;
  createdAt: string; // ISO
  link?: string;
  audience?: {
    roles?: AppRole[];
    emails?: string[];
    broadcast?: boolean;
  };
  toastShownBy?: string[];
  readBy?: string[];
}

const NOTIFICATIONS_KEY = "app_notifications";

const getPrincipal = (email?: string | null) => (email ? email.toLowerCase() : "VISITANTE");

const appliesTo = (note: StoredNotification, role: AppRole, principal: string) => {
  const audience = note.audience;
  if (!audience) return true;
  if (audience.broadcast) return true;
  if (audience.emails?.some((e) => e.toLowerCase() === principal)) return true;
  if (audience.roles?.includes(role)) return true;
  return false;
};

export const listStoredNotifications = (): StoredNotification[] => {
  return storage.get<StoredNotification[]>(NOTIFICATIONS_KEY) || [];
};

export const publishNotification = (
  input: Omit<StoredNotification, "id" | "createdAt" | "toastShownBy" | "readBy">
) => {
  const all = listStoredNotifications();
  const note: StoredNotification = {
    ...input,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    toastShownBy: [],
    readBy: [],
  };
  storage.set(NOTIFICATIONS_KEY, [note, ...all].slice(0, 200));
  return note;
};

export const getNotificationsForUser = (role: AppRole, email?: string | null) => {
  const principal = getPrincipal(email);
  return listStoredNotifications()
    .filter((n) => appliesTo(n, role, principal))
    .map((n) => ({
      ...n,
      toastShownBy: n.toastShownBy || [],
      readBy: n.readBy || [],
    }));
};

export const markToastShown = (ids: string[], email?: string | null) => {
  if (ids.length === 0) return;
  const principal = getPrincipal(email);
  const all = listStoredNotifications();
  const updated = all.map((n) => {
    if (!ids.includes(n.id)) return n;
    const toastShownBy = new Set([...(n.toastShownBy || []), principal]);
    return { ...n, toastShownBy: Array.from(toastShownBy) };
  });
  storage.set(NOTIFICATIONS_KEY, updated);
};

export const markRead = (id: string, email?: string | null) => {
  const principal = getPrincipal(email);
  const all = listStoredNotifications();
  const updated = all.map((n) => {
    if (n.id !== id) return n;
    const readBy = new Set([...(n.readBy || []), principal]);
    return { ...n, readBy: Array.from(readBy) };
  });
  storage.set(NOTIFICATIONS_KEY, updated);
};

export const markAllRead = (role: AppRole, email?: string | null) => {
  const principal = getPrincipal(email);
  const all = listStoredNotifications();
  const updated = all.map((n) => {
    if (!appliesTo(n, role, principal)) return n;
    const readBy = new Set([...(n.readBy || []), principal]);
    return { ...n, readBy: Array.from(readBy) };
  });
  storage.set(NOTIFICATIONS_KEY, updated);
};
