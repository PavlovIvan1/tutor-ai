import Link from "next/link";
import { PrivacySection } from "@/components/settings/PrivacySection";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { SubscriptionCard } from "@/components/settings/SubscriptionCard";
import { AuthGate } from "@/components/layout/AuthGate";

export default function SettingsPage() {
  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl p-6 md:p-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="mb-6 text-sm text-base-content/60">
          Управление аккаунтом и подпиской.{" "}
          <Link href="/admin" className="link link-hover text-primary">Админ-панель →</Link>
        </p>
        <div className="grid gap-5">
          <SubscriptionCard />
          <ProfileCard />
          <PrivacySection />
        </div>
      </main>
    </AuthGate>
  );
}
