"use client";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminSql } from "@/components/admin/AdminSql";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { ModelsCard } from "@/components/admin/ModelsCard";
import { useAdminSession } from "@/components/admin/useAdminSession";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "users", label: "Пользователи" },
  { id: "sql", label: "SQL-консоль" },
  { id: "models", label: "Модели ИИ" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const { checked, isAdmin, refresh } = useAdminSession();
  const [tab, setTab] = useState<TabId>("overview");
  const [reloadKey, setReloadKey] = useState(0);
  const [spinning, setSpinning] = useState(false);

  if (!checked) {
    return <main className="py-20 flex justify-center"><span className="loading loading-dots loading-lg" /></main>;
  }
  if (!isAdmin) return <AdminLogin onSuccess={refresh} />;

  /** Перезагрузить данные текущей вкладки (ремонт содержимого + спин иконки). */
  const reload = () => {
    setSpinning(true);
    setReloadKey((k) => k + 1);
    setTimeout(() => setSpinning(false), 700);
  };

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Админ-панель</h1>
        <button
          onClick={reload}
          title="Обновить данные"
          aria-label="Обновить данные"
          className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-primary"
        >
          <RefreshCw className={cn("size-4", spinning && "animate-spin")} />
        </button>
      </div>
      <div role="tablist" className="tabs tabs-bordered mb-6">
        {TABS.map((t) => (
          <button key={t.id} role="tab" onClick={() => setTab(t.id)}
            className={cn("tab", tab === t.id && "tab-active")}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <AdminOverview key={`o-${reloadKey}`} />}
      {tab === "users" && <AdminUsers key={`u-${reloadKey}`} />}
      {tab === "sql" && <AdminSql key={`s-${reloadKey}`} />}
      {tab === "models" && <ModelsCard key={`m-${reloadKey}`} />}
    </main>
  );
}
