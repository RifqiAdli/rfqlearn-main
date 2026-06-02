import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Modal } from "@/components/Modal";
import { gradeLabel } from "@/utils/grading";
import { computeStreak, deleteSession, getHistory } from "@/utils/storage";
import type { SessionRecord } from "@/types/rfqlearn";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "Riwayat — rfqlearn" }, { name: "description", content: "Riwayat sesi latihanmu." }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<SessionRecord[]>(() =>
    typeof window === "undefined" ? [] : getHistory(),
  );
  const [filterMapel, setFilterMapel] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [detail, setDetail] = useState<SessionRecord | null>(null);

  const mapelOptions = useMemo(() => Array.from(new Set(history.map((h) => h.config.mapel))), [history]);
  const jenjangOptions = useMemo(() => Array.from(new Set(history.map((h) => h.config.jenjang))), [history]);

  const filtered = history.filter(
    (h) =>
      (!filterMapel || h.config.mapel === filterMapel) &&
      (!filterJenjang || h.config.jenjang === filterJenjang),
  );

  const stats = useMemo(() => {
    if (!history.length) return { total: 0, avg: 0, top: "-", streak: 0 };
    const avg = Math.round(history.reduce((a, b) => a + b.scorePct, 0) / history.length);
    const counts: Record<string, number> = {};
    history.forEach((h) => (counts[h.config.mapel] = (counts[h.config.mapel] || 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
    return { total: history.length, avg, top, streak: computeStreak(history) };
  }, [history]);

  function confirmDelete() {
    if (!toDelete) return;
    deleteSession(toDelete);
    setHistory(getHistory());
    setToDelete(null);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="heading-brutal text-4xl">Riwayat Belajar</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Sesi" value={String(stats.total)} />
        <Stat label="Rata-rata" value={`${stats.avg}`} suffix="/100" />
        <Stat label="Top Mapel" value={stats.top} />
        <Stat label="Streak" value={`${stats.streak}`} suffix="hari" />
      </div>

      <div className="card-brutal bg-white p-4 flex flex-wrap gap-3 items-end">
        <div>
          <div className="text-xs font-bold uppercase mb-1">Filter Mapel</div>
          <select className="input-brutal" value={filterMapel} onChange={(e) => setFilterMapel(e.target.value)}>
            <option value="">Semua</option>
            {mapelOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs font-bold uppercase mb-1">Filter Jenjang</div>
          <select className="input-brutal" value={filterJenjang} onChange={(e) => setFilterJenjang(e.target.value)}>
            <option value="">Semua</option>
            {jenjangOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-brutal bg-[var(--muted)] p-8 text-center">
          <div className="heading-brutal text-2xl mb-2">Belum ada riwayat</div>
          <p>Mulai sesi pertama dari menu Latihan.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const g = gradeLabel(s.scorePct);
            return (
              <div key={s.id} className="card-brutal bg-white p-4 flex gap-4">
                <div
                  className="w-16 h-16 flex items-center justify-center heading-brutal text-3xl border-[3px] border-black"
                  style={{ background: g.color, color: "#fff" }}
                >
                  {g.label}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="heading-brutal text-xl truncate">{s.config.mapel}</div>
                  <div className="text-sm opacity-80">
                    {s.config.jenjang} · {s.config.kelas} · {s.scorePct}/100
                  </div>
                  <div className="text-xs opacity-60">
                    {new Date(s.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="btn-brutal-sm" onClick={() => setDetail(s)}>
                      Detail
                    </button>
                    <button className="btn-brutal-sm" onClick={() => setToDelete(s.id)}>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Hapus sesi?">
        <p className="mb-4">Sesi ini akan dihapus permanen dari perangkatmu.</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-brutal btn-brutal-ghost" onClick={() => setToDelete(null)}>
            Batal
          </button>
          <button className="btn-brutal btn-brutal-danger" onClick={confirmDelete}>
            Hapus
          </button>
        </div>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.config.mapel}` : ""}>
        {detail && (
          <div className="space-y-3 text-sm">
            <div>
              <b>Skor:</b> {detail.scorePct}/100 · <b>Benar:</b> {detail.correctCount}/{detail.totalCount}
            </div>
            <div>
              <b>Konfigurasi:</b> {detail.config.jenjang} · {detail.config.kelas} · {detail.config.semester}
            </div>
            <div>
              <b>Tanggal:</b> {new Date(detail.date).toLocaleString("id-ID")}
            </div>
            <div className="border-t-2 border-black pt-3">
              <b>Saran AI:</b>
              {detail.suggestions.length ? (
                <ul className="list-disc pl-5 mt-1">
                  {detail.suggestions.map((s, i) => (
                    <li key={i}>{s.tip}</li>
                  ))}
                </ul>
              ) : (
                <span className="opacity-70"> — tidak ada</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="card-brutal bg-[var(--primary)] p-4">
      <div className="text-xs font-bold uppercase tracking-widest">{label}</div>
      <div className="heading-brutal text-4xl leading-none mt-1">
        {value}
        {suffix && <span className="text-base ml-1 font-bold">{suffix}</span>}
      </div>
    </div>
  );
}
