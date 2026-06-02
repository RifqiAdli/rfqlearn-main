import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { Certificate } from "@/components/Certificate";
import { ScoreCard } from "@/components/ScoreCard";
import { useApp } from "@/context/AppContext";
import { getSuggestions } from "@/lib/ai.functions";
import type { Suggestion } from "@/types/rfqlearn";
import { formatDuration } from "@/utils/grading";
import { getSettings, saveSession } from "@/utils/storage";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [{ title: "Hasil Latihan — rfqlearn" }, { name: "description", content: "Lihat skor, pembahasan, dan saran AI." }],
  }),
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const { currentSession, setCurrentSession, setSetupConfig } = useApp();
  const suggestFn = useServerFn(getSuggestions);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [name, setName] = useState("");
  const certRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!currentSession) {
      navigate({ to: "/setup" });
      return;
    }
    setName(getSettings().name);

    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      try {
        const wrong = currentSession.answers
          .filter((a) => !a.correct)
          .map((a) => currentSession.questions.find((q) => q.id === a.questionId)?.question || "");
        const res = await suggestFn({
          data: {
            mapel: currentSession.config.mapel,
            jenjang: currentSession.config.jenjang,
            kelas: currentSession.config.kelas,
            scorePct: currentSession.scorePct,
            wrong: wrong.slice(0, 8),
          },
        });
        const sugs = res.ok ? res.suggestions : [];
        setSuggestions(sugs);
        // Persist with suggestions
        const final = { ...currentSession, suggestions: sugs };
        saveSession(final);
        setCurrentSession(final);
      } catch (e) {
        console.error(e);
        saveSession(currentSession);
      } finally {
        setSuggestLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentSession) return null;
  const s = currentSession;

  async function downloadCertificate() {
    if (!certRef.current) return;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#FFE500" });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`sertifikat-rfqlearn-${s.config.mapel}.pdf`);
  }

  function retry(sameConfig: boolean) {
    if (sameConfig) {
      setSetupConfig(s.config);
      setCurrentSession(null);
      navigate({ to: "/quiz" });
    } else {
      setCurrentSession(null);
      navigate({ to: "/setup" });
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="heading-brutal text-4xl">Hasil Latihan</h1>

      <ScoreCard
        scorePct={s.scorePct}
        correct={s.correctCount}
        total={s.totalCount}
        duration={formatDuration(s.durationMs)}
      />

      <div>
        <h2 className="heading-brutal text-2xl mb-3">Review Soal</h2>
        <div className="space-y-3">
          {s.questions.map((q, i) => {
            const ans = s.answers.find((a) => a.questionId === q.id);
            const correct = ans?.correct;
            const open = openIdx === i;
            return (
              <div
                key={q.id}
                className="border-[3px] border-black bg-white shadow-[4px_4px_0_#111]"
                style={{ borderLeftWidth: 8, borderLeftColor: correct ? "#16a34a" : "#dc2626" }}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="text-xs uppercase font-bold tracking-widest opacity-70">
                      Soal {i + 1} · {correct ? "Benar" : "Salah"}
                    </div>
                    <div className="font-medium line-clamp-1">{q.question}</div>
                  </div>
                  <span className="heading-brutal text-xl">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div className="p-4 border-t-[3px] border-black space-y-3 text-sm">
                    <p className="whitespace-pre-wrap">{q.question}</p>
                    {q.type === "multiple_choice" && q.options && (
                      <div className="space-y-1">
                        {q.options.map((o) => (
                          <div key={o} className="font-mono">
                            {o}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="border-2 border-black p-3 bg-[var(--muted)]">
                        <div className="text-xs font-bold uppercase">Jawabanmu</div>
                        <div className="whitespace-pre-wrap">{ans?.answer || "(kosong)"}</div>
                      </div>
                      {q.type === "multiple_choice" && (
                        <div className="border-2 border-black p-3 bg-[var(--primary)]">
                          <div className="text-xs font-bold uppercase">Jawaban Benar</div>
                          <div>{q.correct_answer}</div>
                        </div>
                      )}
                      {ans?.score !== undefined && (
                        <div className="border-2 border-black p-3 bg-[var(--primary)]">
                          <div className="text-xs font-bold uppercase">Skor</div>
                          <div className="heading-brutal text-2xl">{ans.score}</div>
                        </div>
                      )}
                    </div>
                    {ans?.feedback && (
                      <div className="border-2 border-black p-3 bg-white">
                        <div className="text-xs font-bold uppercase mb-1">Feedback AI</div>
                        <p>{ans.feedback}</p>
                      </div>
                    )}
                    <div className="border-2 border-black p-3 bg-white">
                      <div className="text-xs font-bold uppercase mb-1">Pembahasan</div>
                      <p className="whitespace-pre-wrap">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="heading-brutal text-2xl mb-3">Saran AI</h2>
        <div className="card-brutal bg-[var(--muted)] p-5">
          {suggestLoading ? (
            <div className="text-sm">Menganalisis hasil belajarmu...</div>
          ) : suggestions.length ? (
            <ul className="space-y-3">
              {suggestions.map((sug, i) => (
                <li key={i} className="border-2 border-black bg-white p-3">
                  <div className="heading-brutal text-lg">→ {sug.tip}</div>
                  <p className="text-sm mt-1">{sug.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm">Tidak ada saran yang dihasilkan.</div>
          )}
        </div>
      </div>

      {s.certificate && (
        <div>
          <h2 className="heading-brutal text-2xl mb-3">Sertifikat</h2>
          <div className="overflow-x-auto print-area">
            <Certificate
              ref={certRef}
              name={name}
              mapel={s.config.mapel}
              jenjang={s.config.jenjang}
              kelas={s.config.kelas}
              scorePct={s.scorePct}
              date={new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-brutal" onClick={downloadCertificate}>
              ⬇ Unduh Sertifikat
            </button>
            {!name && (
              <div className="text-sm self-center opacity-80">
                Tip: set namamu di <a className="underline" href="/settings">Pengaturan</a>.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t-[3px] border-black">
        <button className="btn-brutal" onClick={() => retry(true)}>
          ↻ Ulangi Sesi Ini
        </button>
        <button className="btn-brutal btn-brutal-ghost" onClick={() => retry(false)}>
          + Latihan Baru
        </button>
        <button
          className="btn-brutal btn-brutal-ghost"
          onClick={() => navigate({ to: "/history" })}
        >
          Lihat Riwayat
        </button>
      </div>
    </section>
  );
}
