"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import type { ReactNode } from "react";

const VARIANTS: Record<string, string> = {
  default: "btn-primary",
  destructive: "btn-error",
  outline: "btn-outline",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  link: "btn-link",
};

const SIZES: Record<string, string> = { default: "", sm: "btn-sm", lg: "btn-lg", icon: "btn-sm px-3" };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  children?: ReactNode;
}

/** Кнопка на daisyUI `btn`: та же API-поверхность, что раньше. */
export function Button({ variant = "default", size = "default", className = "", ...props }: ButtonProps) {
  const cls = ["btn", VARIANTS[variant] ?? VARIANTS.default, SIZES[size] ?? "", className].join(" ");
  return <button className={cls} {...props} />;
}

/** Кнопка-ссылка (замена asChild из shadcn) для next/link. */
export function LinkButton({
  variant = "default", size = "default", className = "", children, href,
}: ButtonProps & { href: string }) {
  const cls = ["btn", VARIANTS[variant] ?? VARIANTS.default, SIZES[size] ?? "", className].join(" ");
  return <a href={href} className={cls}>{children}</a>;
}

// Re-export для обратной совместимости с местами, где локальная state не нужна
export function useButtonLoading(): [boolean, (v: boolean) => void] {
  const [v, setV] = useState(false);
  return [v, setV];
}
