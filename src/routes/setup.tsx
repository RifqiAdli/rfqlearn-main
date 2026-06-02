import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useApp } from "@/context/AppContext";
import type { SetupConfig } from "@/types/rfqlearn";
import {
  JENJANG_OPTIONS,
  KELAS_BY_JENJANG,
  MAPEL_BY_JENJANG,
  SEMESTER_OPTIONS,
  JUMLAH_OPTIONS,
  TIPE_OPTIONS,
  KESULITAN_OPTIONS,
  type Jenjang as JenjangType,
} from "@/utils/curriculum";
import { getSettings } from "@/utils/storage";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Konfigurasi Latihan — rfqlearn" },
      { name: "description", content: "Atur jenjang, kelas, mata pelajaran, dan tipe soal." },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { setSetupConfig } = useApp();
  const [step, setStep] = useState(1);
  const [jenjang, setJenjang] = useState<JenjangType | null>(null);
  const [kelas, setKelas] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [mapel, setMapel] = useState<string>("");
  const [jumlah, setJumlah] = useState<number>(10);
  const [tipe, setTipe] = useState<SetupConfig["tipe"]>("pilihan_ganda");
  const [kesulitan, setKesulitan] = useState<SetupConfig["kesulitan"]>("sedang");
  const [topik, setTopik] = useState("");
  const [bahasa, setBahasa] = useState<"id" | "en">(() => getSettings().defaultLang);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const canNext =
    (step === 1 && !!jenjang) ||
    (step === 2 && !!kelas && !!semester) ||
    (step === 3 && !!mapel) ||
    step === 4;

  function start() {
    if (!jenjang) return;
    const config: SetupConfig = {
      jenjang,
      kelas,
      semester,
      mapel,
      jumlah,
      tipe,
      kesulitan,
      topik,
      bahasa,
    };
    setSetupConfig(config);
    navigate({ to: "/quiz" });
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="heading-brutal text-4xl">Latihan Baru</h1>
        <div className="chip-brutal">Langkah {step} / 5</div>
      </div>

      <div className="h-3 border-[3px] border-black bg-white mb-8">
        <div className="h-full bg-[var(--primary)]" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      <div key={step} className="slide-enter card-brutal bg-white p-6 md:p-8 min-h-[280px]">
        {step === 1 && (
          <div>
            <h2 className="heading-brutal text-2xl mb-4">1. Pilih Jenjang</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {JENJANG_OPTIONS.map((j) => (
                <OptionCard
                  key={j.id}
                  selected={jenjang === j.id}
                  onClick={() => {
                    setJenjang(j.id as JenjangType);
                    setKelas("");
                    setMapel("");
                  }}
                  title={j.label}
                  sub={j.sub}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && jenjang && (
          <div className="space-y-6">
            <div>
              <h2 className="heading-brutal text-2xl mb-3">2. Kelas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {KELAS_BY_JENJANG[jenjang].map((k) => (
                  <OptionCard key={k} selected={kelas === k} onClick={() => setKelas(k)} title={k} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="heading-brutal text-2xl mb-3">Semester</h2>
              <div className="grid grid-cols-2 gap-2">
                {SEMESTER_OPTIONS.map((s) => (
                  <OptionCard key={s} selected={semester === s} onClick={() => setSemester(s)} title={s} />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && jenjang && (
          <div>
            <h2 className="heading-brutal text-2xl mb-3">3. Mata Pelajaran</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MAPEL_BY_JENJANG[jenjang].map((m) => (
                <OptionCard key={m} selected={mapel === m} onClick={() => setMapel(m)} title={m} />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="heading-brutal text-2xl">4. Konfigurasi Soal</h2>

            <Field label="Jumlah Soal">
              <div className="flex flex-wrap gap-2">
                {JUMLAH_OPTIONS.map((n) => (
                  <ChipBtn key={n} selected={jumlah === n} onClick={() => setJumlah(n)}>
                    {n}
                  </ChipBtn>
                ))}
              </div>
            </Field>

            <Field label="Tipe Soal">
              <div className="flex flex-wrap gap-2">
                {TIPE_OPTIONS.map((t) => (
                  <ChipBtn key={t.id} selected={tipe === t.id} onClick={() => setTipe(t.id)}>
                    {t.label}
                  </ChipBtn>
                ))}
              </div>
            </Field>

            <Field label="Tingkat Kesulitan">
              <div className="flex flex-wrap gap-2">
                {KESULITAN_OPTIONS.map((k) => (
                  <ChipBtn key={k.id} selected={kesulitan === k.id} onClick={() => setKesulitan(k.id)}>
                    {k.label}
                  </ChipBtn>
                ))}
              </div>
            </Field>

            <Field label="Fokus Topik (opsional)">
              <input
                className="input-brutal"
                placeholder="cth: SPLDV, persamaan kuadrat"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
              />
            </Field>

            <Field label="Bahasa Soal">
              <div className="flex gap-2">
                <ChipBtn selected={bahasa === "id"} onClick={() => setBahasa("id")}>
                  Indonesia
                </ChipBtn>
                <ChipBtn selected={bahasa === "en"} onClick={() => setBahasa("en")}>
                  English
                </ChipBtn>
              </div>
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="heading-brutal text-2xl">Ringkasan</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Summary k="Jenjang" v={jenjang || "-"} />
              <Summary k="Kelas" v={kelas} />
              <Summary k="Semester" v={semester} />
              <Summary k="Mapel" v={mapel} />
              <Summary k="Jumlah" v={String(jumlah)} />
              <Summary k="Tipe" v={TIPE_OPTIONS.find((t) => t.id === tipe)?.label ?? tipe} />
              <Summary k="Kesulitan" v={KESULITAN_OPTIONS.find((k) => k.id === kesulitan)?.label ?? kesulitan} />
              <Summary k="Bahasa" v={bahasa === "id" ? "Indonesia" : "English"} />
              {topik && <Summary k="Topik" v={topik} />}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button className="btn-brutal btn-brutal-ghost" onClick={back} disabled={step === 1}>
          ← Kembali
        </button>
        {step < 5 ? (
          <button className="btn-brutal" onClick={next} disabled={!canNext}>
            Lanjut →
          </button>
        ) : (
          <button className="btn-brutal" onClick={start}>
            Mulai Latihan ▶
          </button>
        )}
      </div>
    </section>
  );
}

function OptionCard({
  selected,
  onClick,
  title,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 border-[3px] border-black transition-all ${
        selected ? "bg-[var(--primary)] shadow-[6px_6px_0_#111] -translate-x-0.5 -translate-y-0.5" : "bg-white shadow-[4px_4px_0_#111] hover:bg-[var(--muted)]"
      }`}
    >
      <div className="heading-brutal text-xl">{title}</div>
      {sub && <div className="text-sm opacity-80">{sub}</div>}
    </button>
  );
}

function ChipBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 border-[3px] border-black font-bold uppercase tracking-wide ${
        selected ? "bg-[var(--primary)] shadow-[4px_4px_0_#111]" : "bg-white shadow-[2px_2px_0_#111]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest mb-2">{label}</div>
      {children}
    </div>
  );
}

function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-2 border-black p-3 bg-[var(--muted)]">
      <div className="text-xs uppercase font-bold tracking-widest opacity-70">{k}</div>
      <div className="font-bold">{v}</div>
    </div>
  );
}
