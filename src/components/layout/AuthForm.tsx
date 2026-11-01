"use client";

import { useState } from "react";
import { LoginForm } from "@/components/layout/AuthViews";
import { RegisterForm } from "@/components/layout/RegisterForm";

/** Комбинированная форма вход/регистрация (daisyUI). */
export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <div className="mx-auto max-w-sm py-12">
      {mode === "login"
        ? <LoginForm onSwitch={() => setMode("register")} />
        : <RegisterForm onSwitch={() => setMode("login")} />}
    </div>
  );
}
