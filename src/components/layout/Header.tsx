"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface User { id: number; name: string; email: string }

const NAV = [
  { href: "/", label: "Дашборд" },
  { href: "/students", label: "Ученики" },
  { href: "/lessons", label: "Уроки" },
  { href: "/settings", label: "Настройки" },
  { href: "/help", label: "Справка" },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .finally(() => setLoaded(true));
  }, []);

  const showNav = loaded && user;
  const showLogin = loaded && !user && pathname !== "/login";

  return (
    <header className="navbar sticky top-0 z-40 bg-base-100/95 backdrop-blur min-h-14 h-14 px-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-base font-bold tracking-tight transition-opacity hover:opacity-70">
            Tutor
          </Link>
          {showNav && (
            <nav className="flex gap-1">
              {NAV.map((n) => {
                const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                return (
                  <Link key={n.href} href={n.href}
                    className={cn("px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                      active
                        ? "bg-primary text-primary-content font-medium shadow-sm"
                        : "text-base-content/60 hover:bg-base-300/40 hover:text-base-content")}>
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showNav && <span className="text-sm text-base-content/70">{user?.name}</span>}
          {showLogin && <LinkButton size="sm" href="/login">Войти</LinkButton>}
        </div>
      </div>
    </header>
  );
}
