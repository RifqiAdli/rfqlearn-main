import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { LoadingScreen } from "@/components/LoadingScreen";
import { useApp } from "@/context/AppContext";
import { generateQuestions, gradeAnswers } from "@/lib/ai.functions";
import type { AnswerRecord, Question, SessionRecord } from "@/types/rfqlearn";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [{ title: "Latihan — rfqlearn" }, { name: "description", content: "Kerjakan soal latihan." }],
  }),
  component: QuizPage,
});

function QuizPage() {
  const navigate = useNavigate();
  const { setupConfig, setCurrentSession } = useApp();
  const generateFn = useServerFn(generateQuestions);
  const gradeFn = useServerFn(gradeAnswers);

  const [phase, setPhase] = useState<"loading" | "answering" | "grading" | "error">("loading");
  const [error, setError] = useState<string>("");
  const [errorReason, setErrorReason] = useState<string>("");
  const [errorDetail, setErrorDetail] = useState<string>("");
  const [rawAiResponse, setRawAiResponse] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [idx, setIdx] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const ranRef = useRef(false);

  async function loadQuestions() {
    if (!setupConfig) {
      navigate({ to: "/setup" });
      return;
    }
    setPhase("loading");
    setError("");
    setErrorReason("");
    setErrorDetail("");
    setRawAiResponse("");
    setAnswers({});
    setIdx(0);
    try {
      const res = await generateFn({ data: setupConfig });
      if (!res.ok || !res.questions.length) {
        setError(res.ok ? "Soal kosong" : res.failure?.title || res.error);
        setErrorReason(res.ok ? "AI merespons, tapi tidak mengirim satu pun soal." : res.failure?.reason || "AI gagal membuat soal valid.");
        setErrorDetail(res.ok ? "questions.length = 0" : res.failure?.detail || res.error);
        setRawAiResponse(res.ok ? "" : res.failure?.raw || "");
        setPhase("error");
        return;
      }
      setQuestions(res.questions);
      startTimeRef.current = Date.now();
      setPhase("answering");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal generate soal");
      setErrorReason("Terjadi error saat halaman kuis memanggil backend AI.");
      setErrorDetail(e instanceof Error ? e.message : "Unknown client error");
      setRawAiResponse("");
      setPhase("error");
    }
  }

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function finish() {
    if (!setupConfig) return;
    setPhase("grading");
    const durationMs = Date.now() - startTimeRef.current;

    // Build answer records, score MC immediately
    const records: AnswerRecord[] = questions.map((q) => {
      const ua = answers[q.id] || "";
      if (q.type === "multiple_choice") {
        return {
          questionId: q.id,
          answer: ua,
          correct: !!q.correct_answer && ua.trim().toUpperCase() === q.correct_answer.trim().toUpperCase(),
        };
      }
      return { questionId: q.id, answer: ua };
    });

    // Grade essays via AI
    const essayItems = questions
      .filter((q) => q.type === "essay")
      .map((q) => ({
        id: q.id,
        question: q.question,
        user_answer: answers[q.id] || "",
        model_answer: q.explanation,
      }));

    if (essayItems.length) {
      try {
        const res = await gradeFn({
          data: {
            mapel: setupConfig.mapel,
            jenjang: setupConfig.jenjang,
            kelas: setupConfig.kelas,
            items: essayItems,
          },
        });
        if (res.ok) {
          for (const g of res.grades) {
            const r = records.find((x) => x.questionId === g.id);
            if (r) {
              r.score = g.score;
              r.feedback = g.feedback;
              r.correct = g.score >= 60;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    const totalCount = questions.length;
    const sum = records.reduce((acc, r) => {
      if (r.score !== undefined) return acc + r.score;
      return acc + (r.correct ? 100 : 0);
    }, 0);
    const scorePct = Math.round(sum / totalCount);
    const correctCount = records.filter((r) => r.correct).length;

    const session: SessionRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      config: setupConfig,
      questions,
      answers: records,
      scorePct,
      correctCount,
      totalCount,
      durationMs,
      suggestions: [],
      certificate: scorePct >= 60,
    };
    setCurrentSession(session);
    navigate({ to: "/result" });
  }

  if (phase === "loading") return <LoadingScreen />;
  if (phase === "grading") return <LoadingScreen message="AI sedang menilai jawabanmu..." />;
  if (phase === "error") {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="card-brutal bg-white p-6">
          <h2 className="heading-brutal text-2xl mb-2">Gagal Memuat Soal</h2>
          <div className="mb-5 space-y-3 text-sm">
            <div className="border-[3px] border-black bg-[var(--destructive)] p-3 font-bold text-[var(--destructive-foreground)] shadow-[3px_3px_0_#111]">
              {error}
            </div>
            {errorReason && (
              <p>
                <span className="font-bold">Alasan:</span> {errorReason}
              </p>
            )}
            {errorDetail && (
              <p className="break-words bg-[var(--muted)] border-[2px] border-black p-3">
                <span className="font-bold">Detail:</span> {errorDetail}
              </p>
            )}
            {rawAiResponse && (
              <details className="border-[2px] border-black bg-white p-3">
                <summary className="cursor-pointer font-bold">Lihat respons mentah AI</summary>
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs">{rawAiResponse}</pre>
              </details>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-brutal" onClick={loadQuestions}>
              Regenerasi Soal
            </button>
            <button className="btn-brutal btn-brutal-ghost" onClick={() => navigate({ to: "/setup" })}>
              Kembali ke Setup
            </button>
          </div>
        </div>
      </section>
    );
  }


  const q = questions[idx];
  const total = questions.length;
  const answered = answers[q.id] !== undefined && answers[q.id] !== "";

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-3">
        <div className="chip-brutal">
          Soal {idx + 1} / {total}
        </div>
        <div className="chip-brutal bg-[var(--primary)]">{q.type === "multiple_choice" ? "Pilihan Ganda" : "Esai"}</div>
      </div>
      <div className="h-3 border-[3px] border-black bg-white mb-6">
        <div className="h-full bg-[var(--primary)]" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div key={q.id} className="slide-enter card-brutal bg-white p-6 md:p-8">
        <p className="text-lg font-medium mb-6 whitespace-pre-wrap">{q.question}</p>

        {q.type === "multiple_choice" && q.options && (
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const selected = answers[q.id] === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: letter }))}
                  className={`w-full text-left p-4 border-[3px] border-black flex gap-3 items-start ${
                    selected ? "bg-[var(--primary)] shadow-[6px_6px_0_#111] -translate-x-0.5 -translate-y-0.5" : "bg-white shadow-[3px_3px_0_#111] hover:bg-[var(--muted)]"
                  }`}
                >
                  <span className="heading-brutal text-2xl">{letter}</span>
                  <span className="flex-1">{opt.replace(/^[A-D]\.\s*/, "")}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.type === "essay" && (
          <textarea
            className="input-brutal min-h-[180px]"
            placeholder="Tulis jawabanmu di sini..."
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
          />
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          className="btn-brutal btn-brutal-ghost"
          onClick={() => setIdx((i) => Math.max(i - 1, 0))}
          disabled={idx === 0}
        >
          ← Sebelumnya
        </button>
        {idx < total - 1 ? (
          <button className="btn-brutal" onClick={() => setIdx((i) => i + 1)} disabled={!answered}>
            Selanjutnya →
          </button>
        ) : (
          <button className="btn-brutal" onClick={finish} disabled={!answered}>
            Selesai & Nilai
          </button>
        )}
      </div>
    </section>
  );
}
