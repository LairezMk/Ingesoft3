import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { normalizeRole } from "@/utils/rbac";
import { getNotificationsForUser, markToastShown, type StoredNotification } from "@/services/notificationService";
import { showNotificationToast } from "@/components/showNotificationToast";

const isToastShown = (note: StoredNotification, principal: string) =>
  (note.toastShownBy || []).some((p) => p === principal);

export const useNotificationSync = () => {
  const { user } = useAuthStore();
  const { setNotifications } = useUIStore();

  useEffect(() => {
    const role = normalizeRole(user?.role) ?? "VISITANTE";
    const email = user?.email ?? null;
    const principal = email ? email.toLowerCase() : "VISITANTE";

    const sync = () => {
      const notes = getNotificationsForUser(role, email);
      setNotifications(
        notes.map((n) => ({
          id: n.id,
          type: n.kind,
          title: n.title,
          message: n.message,
          timestamp: n.createdAt,
          link: n.link,
          read: (n.readBy || []).includes(principal),
        }))
      );

      const toToast = notes
        .filter((n) => !isToastShown(n, principal))
        .slice(0, 5);

      if (toToast.length > 0) {
        toToast.forEach((n) => showNotificationToast(n));
        markToastShown(
          toToast.map((n) => n.id),
          email
        );
      }
    };

    sync();
    const interval = window.setInterval(sync, 5000);
    return () => window.clearInterval(interval);
  }, [setNotifications, user?.email, user?.role]);
};
