import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/Navbar";
import { getHistory } from "@/utils/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "rfqlearn — Belajar. Latihan. Lulus." },
      { name: "description", content: "Latihan soal AI per jenjang, kelas, dan mata pelajaran. Dapatkan feedback dan sertifikat." },
      { property: "og:title", content: "rfqlearn — Belajar. Latihan. Lulus." },
      { property: "og:description", content: "Platform belajar bertenaga AI." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    setCount(getHistory().length);
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-6">
          <div className="chip-brutal">v1 · powered by ai</div>
          <h1 className="text-6xl md:text-8xl">
            <Wordmark className="text-7xl md:text-9xl" />
          </h1>
          <p className="heading-brutal text-3xl md:text-5xl">
            Belajar. Latihan. <span className="bg-[var(--primary)] px-2 border-[3px] border-black">Lulus.</span>
          </p>
          <p className="text-lg max-w-xl">
            Generate soal latihan kurikulum Indonesia secara instan. Jawab, dapatkan feedback AI, dan
            kumpulkan sertifikat untuk setiap kelulusan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/setup" className="btn-brutal no-underline text-lg">
              Mulai Latihan →
            </Link>
            <Link to="/history" className="btn-brutal btn-brutal-ghost no-underline">
              Lihat Riwayat
            </Link>
          </div>
          {count !== null && (
            <div className="inline-block card-brutal bg-[var(--muted)] px-4 py-2 mt-2">
              <span className="font-bold">{count}</span> sesi tersimpan di perangkat ini
            </div>
          )}
        </div>
        <div className="card-brutal bg-[var(--primary)] p-6 rotate-[-1deg]">
          <div className="heading-brutal text-2xl mb-2">Cara Pakai</div>
          <ol className="list-decimal pl-5 space-y-2 font-medium">
            <li>Pilih jenjang & mapel</li>
            <li>Atur jumlah & tipe soal</li>
            <li>Kerjakan & dapatkan feedback</li>
            <li>Unduh sertifikat (skor ≥ 60)</li>
          </ol>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-16">
        <Feature title="AI Generator" desc="Soal dibuat sesuai jenjang, kelas, dan topik fokusmu." />
        <Feature title="Feedback Instan" desc="Pembahasan tiap soal + saran belajar personal." />
        <Feature title="Sertifikat" desc="Lulus dengan skor ≥ 60? Cetak sertifikatmu." />
      </div>
    </section>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card-brutal bg-white p-5">
      <div className="heading-brutal text-xl mb-1">{title}</div>
      <p className="text-sm">{desc}</p>
    </div>
  );
}
