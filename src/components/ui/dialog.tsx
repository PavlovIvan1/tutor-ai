"use client";

import { type ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: ReactNode;
  className?: string;
}

/**
 * Модалка daisyUI (класс `modal modal-open`, управляемая стейтом) —
 * сохраняет прежнюю API-поверхность shadcn-версии.
 */
export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="modal modal-open"
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
    >
      <div className={cn("modal-box", className)}>
        <button
          aria-label="Закрыть"
          className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
          onClick={() => onOpenChange(false)}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export const DialogTrigger = () => null;
export const DialogClose = () => null;
export const DialogPortal = ({ children }: { children: ReactNode }) => <>{children}</>;
export const DialogOverlay = () => null;

/** Обёртка контента модалки (совместимость с прежним shadcn API). */
export function DialogContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("max-w-lg", className)}>{children}</div>;
}

export const DialogHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
);

export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className="text-lg font-semibold leading-none" {...props} />;
}

export function DialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="text-sm text-base-content/70" {...props} />;
}
