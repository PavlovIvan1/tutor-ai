import { create } from "zustand";

/**
 * Контекст ученика накапливается в стейте за сессию
 * и отправляется в БД ОДНИМ батчем после генерации ДЗ
 * (сбережение 1 CPU: нет избыточных запросов).
 */
interface StudentState {
  studentId: number | null;
  studentName: string;
  notes: string; // накопленные заметки текущей сессии
  completedTopics: string[]; // пройденные темы (новые добавляются сюда)
  pendingErrors: string[]; // новые ошибки найденные нейроном (до батча)
  pendingTopics: string[]; // новые завершённые темы (до батча)
  load: (id: number, name: string, notes: string, topics: string[]) => void;
  appendNotes: (fragment: string) => void;
  addPendingErrors: (errors: string[]) => void;
  addPendingTopics: (topics: string[]) => void;
  flushTo: (payload: { notes: string; completedTopics: string[] }) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  studentId: null,
  studentName: "",
  notes: "",
  completedTopics: [],
  pendingErrors: [],
  pendingTopics: [],
  load: (id, name, notes, topics) =>
    set({ studentId: id, studentName: name, notes, completedTopics: topics, pendingErrors: [], pendingTopics: [] }),
  appendNotes: (fragment) => set((s) => ({ notes: `${s.notes}${s.notes ? "\n" : ""}${fragment}` })),
  addPendingErrors: (errors) => set((s) => ({ pendingErrors: [...s.pendingErrors, ...errors] })),
  addPendingTopics: (topics) => set((s) => ({ pendingTopics: [...s.pendingTopics, ...topics] })),
  flushTo: async ({ notes, completedTopics }) => {
    const id = get().studentId;
    if (!id) return;
    await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, completedTopics }),
    });
    set({ notes, completedTopics, pendingErrors: [], pendingTopics: [] });
  },
}));
