import { StudentList } from "@/components/students/StudentList";
import { AuthGate } from "@/components/layout/AuthGate";

export default function StudentsPage() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Ученики</h1>
      <p className="mb-6 text-sm text-base-content/60">
        Кликните на карточку, чтобы начать урок с этим учеником.
      </p>
      <AuthGate><StudentList /></AuthGate>
    </main>
  );
}
