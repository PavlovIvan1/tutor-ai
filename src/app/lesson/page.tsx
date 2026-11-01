import { StartLesson } from "@/components/lesson/StartLesson";
import { AuthGate } from "@/components/layout/AuthGate";

export default function NewLessonPage() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Новый урок</h1>
      <AuthGate><StartLesson /></AuthGate>
    </main>
  );
}
