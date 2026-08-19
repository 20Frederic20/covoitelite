"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "success";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const btnVariantClass =
    variant === "danger"
      ? "bg-danger text-white hover:bg-danger/90"
      : variant === "warning"
        ? "bg-warning text-black hover:bg-warning/90"
        : "bg-night text-on-night hover:bg-night/90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-[20px] border border-line bg-surface p-6 shadow-lift space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                variant === "danger"
                  ? "bg-danger-soft text-danger"
                  : variant === "warning"
                    ? "bg-warning-soft text-warning"
                    : "bg-brand-soft text-brand-dark"
              }`}
            >
              <AlertTriangle size={20} />
            </span>
            <h3 id="modal-title" className="text-base font-bold text-ink">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-alt hover:text-ink"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-slate">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline btn-sm min-h-[38px] px-4 text-xs font-bold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn btn-sm min-h-[38px] px-4 text-xs font-bold ${btnVariantClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
