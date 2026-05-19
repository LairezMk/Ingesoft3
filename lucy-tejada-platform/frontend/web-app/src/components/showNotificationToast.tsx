import React from "react";
import toast from "react-hot-toast";
import type { StoredNotification } from "@/services/notificationService";

export const showNotificationToast = (note: StoredNotification, durationMs = 5500) => {
  toast.custom(
    (t) => (
      <div
        className={
          "pointer-events-auto w-[360px] max-w-[90vw] overflow-hidden rounded-2xl border " +
          "border-dark-200/70 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-xl"
        }
        style={{
          opacity: t.visible ? 1 : 0,
          transform: `translateY(${t.visible ? 0 : 6}px)`,
          transition: "all 200ms ease",
        }}
      >
        <div className="p-4 flex gap-3">
          <div className="mt-0.5">
            <span
              className={
                "inline-flex h-9 w-9 items-center justify-center rounded-xl " +
                (note.kind === "success"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : note.kind === "error"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                    : note.kind === "warning"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                      : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200")
              }
            >
              🔔
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-dark-900 dark:text-dark-50 truncate">{note.title}</p>
            {note.message && (
              <p className="mt-1 text-sm text-dark-600 dark:text-dark-300 leading-snug line-clamp-3">
                {note.message}
              </p>
            )}
            {note.link && (
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = note.link!;
                }}
                className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-500"
              >
                Ver más
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="h-9 w-9 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="h-1 bg-dark-100 dark:bg-dark-700">
          <div className="toast-progress h-full bg-primary-500" style={{ animationDuration: `${durationMs}ms` }} />
        </div>
      </div>
    ),
    { duration: durationMs, position: "top-right" }
  );
};
