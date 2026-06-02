import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createGroq } from '@ai-sdk/groq';

function getModel() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");
  const groq = createGroq({ apiKey: key });
  return groq('llama-3.3-70b-versatile'); // Bisa juga pakai llama-3.3-70b-versatile
}

function truncate(value: string, max = 600) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function getMessage(value: unknown) {
  return value instanceof Error ? value.message : typeof value === "string" ? value : "Unknown error";
}

function summarizeAiFailure(err: unknown) {
  const message = getMessage(err);
  const lower = message.toLowerCase();
  if (lower.includes("429") || lower.includes("rate limit")) {
    return {
      title: "AI sedang terlalu sibuk",
      reason: "Permintaan ke AI kena batas sementara. Coba regenerasi lagi sebentar.",
      detail: truncate(message),
      raw: "",
    };
  }
  if (lower.includes("402") || lower.includes("credit") || lower.includes("quota")) {
    return {
      title: "Kuota AI tidak cukup",
      reason: "Layanan AI menolak request karena kuota/kredit tidak tersedia.",
      detail: truncate(message),
      raw: "",
    };
  }
  if (lower.includes("google_generative_ai_api_key")) {
    return {
      title: "Kunci AI belum aktif",
      reason: "GOOGLE_GENERATIVE_AI_API_KEY belum dikonfigurasi di environment.",
      detail: truncate(message),
      raw: "",
    };
  }
  return {
    title: "AI gagal membuat soal",
    reason: "Request AI gagal diproses sebelum soal valid berhasil dibuat.",
    detail: truncate(message),
    raw: "",
  };
}

function parseJsonFromText(text: string): unknown {
  const stripped = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    const arrayMatch = stripped.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    const objectMatch = stripped.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    throw new Error("Tidak ada JSON valid dalam respons AI");
  }
}

function extractArray(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    for (const key of ["questions", "data", "items", "soal", "result"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  throw new Error("Respons AI bukan array dan tidak mengandung array yang dikenali");
}

const SetupSchema = z.object({
  jenjang: z.string(),
  kelas: z.string(),
  semester: z.string(),
  mapel: z.string(),
  jumlah: z.number().int().min(1).max(30),
  tipe: z.enum(["pilihan_ganda", "esai", "campuran"]),
  kesulitan: z.enum(["mudah", "sedang", "sulit", "acak"]),
  topik: z.string().optional().default(""),
  bahasa: z.enum(["id", "en"]),
});

const RawQuestionSchema = z.object({
  id: z.number().optional(),
  number: z.number().optional(),
  question: z.string(),
  type: z.enum(["multiple_choice", "essay"]).optional(),
  options: z.array(z.string()).nullable().optional(),
  correct_answer: z.string().nullable().optional(),
  explanation: z.string(),
});

function normalizeQuestions(rawQuestions: z.infer<typeof RawQuestionSchema>[]) {
  return rawQuestions.map((q, index) => {
    const options = q.options?.length ? q.options : null;
    const inferredType = q.type ?? (options ? "multiple_choice" : "essay");
    return {
      id: q.id ?? q.number ?? index + 1,
      question: q.question,
      type: inferredType,
      options: inferredType === "multiple_choice" ? options : null,
      correct_answer: inferredType === "multiple_choice" ? q.correct_answer ?? null : null,
      explanation: q.explanation,
    };
  });
}

export const generateQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SetupSchema.parse(input))
  .handler(async ({ data }) => {
    const tipeMap = {
      pilihan_ganda: "multiple choice",
      esai: "essay",
      campuran: "mixed (multiple choice and essay)",
    };
    const langMap = { id: "Bahasa Indonesia", en: "English" };

    const prompt = `You are an expert Indonesian curriculum teacher.
Generate ${data.jumlah} ${tipeMap[data.tipe]} questions for:
- Jenjang: ${data.jenjang}
- Kelas: ${data.kelas}, Semester: ${data.semester}
- Mata Pelajaran: ${data.mapel}
- Difficulty: ${data.kesulitan}
- Topic focus: ${data.topik || "general curriculum"}
- Language: ${langMap[data.bahasa]}

Return ONLY a raw JSON array (no markdown, no explanation, no extra text).
For every item use: number, question, type, options, correct_answer, explanation.
For multiple_choice: type="multiple_choice", provide 4 options prefixed "A. ", "B. ", "C. ", "D. " and correct_answer as "A"/"B"/"C"/"D".
For essay: type="essay", set options=null and correct_answer=null (a model answer in explanation).
Always include a concise explanation.`;

    let rawText = "";
    try {
      const { text } = await generateText({
        model: getModel(),
        prompt,
      });
      rawText = text;

      const parsed = parseJsonFromText(text);
      const arr = extractArray(parsed);
      const validated = z.array(RawQuestionSchema).parse(arr);

      return { ok: true as const, error: "", failure: null, questions: normalizeQuestions(validated) };
    } catch (err) {
      console.error("generateQuestions failed:", err);
      const failure = summarizeAiFailure(err);
      if (rawText && !failure.raw) {
        failure.raw = truncate(rawText, 800);
      }
      return { ok: false as const, error: failure.title, failure, questions: [] };
    }
  });

const GradeInput = z.object({
  mapel: z.string(),
  jenjang: z.string(),
  kelas: z.string(),
  items: z.array(
    z.object({
      id: z.number(),
      question: z.string(),
      user_answer: z.string(),
      model_answer: z.string().optional().default(""),
    }),
  ),
});

const GradesSchema = z.object({
  grades: z.array(
    z.object({
      id: z.number(),
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
  ),
});

export const gradeAnswers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GradeInput.parse(input))
  .handler(async ({ data }) => {
    const prompt = `You are grading student essay answers for ${data.mapel}, ${data.jenjang} ${data.kelas}.
Grade each answer from 0–100 and give brief, constructive feedback in Bahasa Indonesia.
Return ONLY a raw JSON object with this shape: { "grades": [ { "id": number, "score": number, "feedback": string } ] }
No markdown, no extra text.

Items (JSON):
${JSON.stringify(data.items, null, 2)}`;

    try {
      const { text } = await generateText({
        model: getModel(),
        prompt,
      });

      const parsed = parseJsonFromText(text);
      const validated = GradesSchema.parse(parsed);

      return { ok: true as const, grades: validated.grades };
    } catch (err) {
      console.error("gradeAnswers failed:", err);
      return { ok: false as const, error: err instanceof Error ? err.message : "Unknown error", grades: [] };
    }
  });

const SuggestInput = z.object({
  mapel: z.string(),
  jenjang: z.string(),
  kelas: z.string(),
  scorePct: z.number(),
  wrong: z.array(z.string()),
});

const SuggestionsSchema = z.object({
  suggestions: z.array(z.object({ tip: z.string(), reason: z.string() })).min(1).max(6),
});

export const getSuggestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SuggestInput.parse(input))
  .handler(async ({ data }) => {
    const prompt = `Berdasarkan hasil kuis ${data.mapel} ${data.jenjang} ${data.kelas}:
- Skor: ${data.scorePct}%
- Soal yang salah/lemah:
${data.wrong.map((w, i) => `${i + 1}. ${w}`).join("\n") || "(tidak ada)"}

Berikan 3–5 saran belajar spesifik dan actionable dalam Bahasa Indonesia.
Return ONLY a raw JSON object: { "suggestions": [ { "tip": string, "reason": string } ] }
No markdown, no extra text.`;

    try {
      const { text } = await generateText({
        model: getModel(),
        prompt,
      });

      const parsed = parseJsonFromText(text);
      const validated = SuggestionsSchema.parse(parsed);

      return { ok: true as const, suggestions: validated.suggestions };
    } catch (err) {
      console.error("getSuggestions failed:", err);
      return { ok: false as const, error: err instanceof Error ? err.message : "Unknown error", suggestions: [] };
    }
  });