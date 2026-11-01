import Link from "next/link";

const FAQ = [
  {
    q: "Как работает AI-анализ урока?",
    a: "Во время урока (или после него) Tutor получает звук, сжимает его прямо в браузере и отправляет на транскрипцию. Затем модель o3-mini анализирует реплики ученика: находит новые ошибки, обновляет контекст и заметки, а также отмечает пройденные темы — вся история учитывается в следующих домашках.",
  },
  {
    q: "Безопасны ли мои аудиозаписи?",
    a: "Да. Аудио сжимается локально, на сервере не хранится и не сохраняется на диск: буфер очищается сразу после транскрипции. Данные учеников видны только вашей учетной записи.",
  },
  {
    q: "Можно ли пользоваться без настройки ключей?",
    a: "Да. API-ключ OpenRouter задается переменными окружения на сервере заранее. Ничего настраивать самому не нужно — при желании вы всегда можете сменить модель на странице «Настройки».",
  },
  {
    q: "Какие языки поддерживаются?",
    a: "Транскрипция ориентирована на английский (реплики ученика на английском), интерфейс — на русском. Голоса на других языках также распознаются Whisper, но методика ДЗ рассчитана на английский.",
  },
  {
    q: "Что такое минуты транскрипции?",
    a: "Минуты — это суммарная длительность уроков, которые вы отправляете в расшифровку. В тарифах указан месячный лимит минут; суммарно урока можно записать сколько угодно, отправка — по вашему выбору.",
  },
  {
    q: "Можно ли экспортировать данные ученика?",
    a: "Каждая домашка скачивается как файл Word (.docx). Полный экспорт контекста ученика в CSV появится в ближайших обновлениях.",
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-2xl p-6 md:p-8">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Справка</h1>
      <p className="mb-6 text-sm text-base-content/60">Частые вопросы и поддержка.</p>

      <div className="grid gap-3">
        {FAQ.map((f) => (
          <div key={f.q} className="collapse collapse-arrow rounded-xl border border-base-300 bg-base-100 shadow-sm">
            <input type="checkbox" defaultChecked={f.q === FAQ[0].q} />
            <div className="collapse-title text-md font-medium">{f.q}</div>
            <div className="collapse-content">
              <p className="text-sm text-base-content/60">{f.a}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-primary text-primary-content p-6">
        <h2 className="font-semibold">Остались вопросы?</h2>
        <p className="mt-1 text-sm text-primary-content/80">
          Напишите нам — ответим в течение 24 часов:{" "}
          <a href="mailto:support@tutor.app" className="underline transition-opacity hover:opacity-80">
            support@tutor.app
          </a>
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-base-content/60">
        <Link href="/" className="transition-colors hover:text-base-content">← Вернуться на дашборд</Link>
      </p>
    </main>
  );
}
