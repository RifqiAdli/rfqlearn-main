export type QuestionType = "multiple_choice" | "essay";

export interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options: string[] | null;
  correct_answer: string | null;
  explanation: string;
}

export interface AnswerRecord {
  questionId: number;
  answer: string;
  correct?: boolean;
  score?: number; // 0-100 for essays
  feedback?: string;
}

export interface SetupConfig {
  jenjang: string;
  kelas: string;
  semester: string;
  mapel: string;
  jumlah: number;
  tipe: "pilihan_ganda" | "esai" | "campuran";
  kesulitan: "mudah" | "sedang" | "sulit" | "acak";
  topik: string;
  bahasa: "id" | "en";
}

export interface Suggestion {
  tip: string;
  reason: string;
}

export interface SessionRecord {
  id: string;
  date: string;
  config: SetupConfig;
  questions: Question[];
  answers: AnswerRecord[];
  scorePct: number;
  correctCount: number;
  totalCount: number;
  durationMs: number;
  suggestions: Suggestion[];
  certificate: boolean;
}

export interface AppSettings {
  name: string;
  defaultLang: "id" | "en";
}
