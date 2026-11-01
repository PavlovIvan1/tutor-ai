// Доменные типы приложения

export interface Student {
  id: number;
  name: string;
  notes: string;
  completed_topics: string[] | string; // парсится зависимо от контекста
  created_at: string;
}

export interface HomeworkParams {
  studentId: number;
  transcript: string;
  reviewCount: number; // 0..10
  newTopicCount: number; // 0..10
  newTopicName: string;
  imageTasksCount: 0 | 1 | 2;
  writingRequired: boolean;
  examFormat: "NONE" | "OGE" | "EGE" | "TOEFL" | "IELTS";
}

export interface HomeworkSync {
  new_errors_found: string[];
  topic_covered: string | null;
  /** Уровень CEFR, определённый по анализу урока (A1..C2) */
  level?: string | null;
  /** Уверенность нейросети в определении уровня */
  level_confidence?: "high" | "medium" | "low" | null;
  strong_areas?: string[];
  weak_areas?: string[];
  learning_priorities?: string[];
}

export interface HomeworkResult {
  lessonId: number;
  markdown: string;
  sync: HomeworkSync;
}

export type RecorderStatus = "idle" | "ready" | "recording" | "releasing";
