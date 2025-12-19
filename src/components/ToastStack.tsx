import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";

const ToastStack = () => {
  const toasts = useStore((state) => state.toasts);
  const removeToast = useStore((state) => state.removeToast);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    toasts.forEach((toast) => {
      if (timers.current[toast.id]) {
        return;
      }
      const timeout = window.setTimeout(() => {
        removeToast(toast.id);
        delete timers.current[toast.id];
      }, 3000);
      timers.current[toast.id] = timeout;
    });
  }, [removeToast, toasts]);

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((timeout) => window.clearTimeout(timeout));
      timers.current = {};
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md ${
            toast.variant === "error"
              ? "border-rose-200 bg-rose-500/90"
              : "border-emerald-200 bg-emerald-500/90"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastStack;
