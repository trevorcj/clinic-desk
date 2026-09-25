"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (options: {
    message: string;
    type?: "success" | "error" | "info";
    action?: { label: string; onClick: () => void };
  }) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      message,
      type = "info",
      action,
    }: {
      message: string;
      type?: "success" | "error" | "info";
      action?: { label: string; onClick: () => void };
    }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, action }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-16 md:top-6 right-4 md:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-2 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center justify-between gap-3 bg-white text-slate-900 border border-slate-900/10 px-4 py-3 rounded-md text-sm animate-in fade-in slide-in-from-top-4 duration-200">
            <span className="font-normal leading-snug">{t.message}</span>
            <div className="flex items-center gap-2 shrink-0">
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="text-xs uppercase font-semibold tracking-wide underline underline-offset-2 hover:opacity-70 cursor-pointer">
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-text-primary/70 hover:text-text-primary cursor-pointer p-0.5 transition-colors"
                aria-label="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
