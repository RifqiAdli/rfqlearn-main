import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Modal } from "@/components/Modal";
import type { AppSettings } from "@/types/rfqlearn";
import { clearHistory, getSettings, saveSettings } from "@/utils/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Pengaturan — rfqlearn" }, { name: "description", content: "Nama, bahasa default, dan reset riwayat." }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<AppSettings>({ name: "", defaultLang: "id" });
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setS(getSettings());
  }, []);

  function save() {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function doReset() {
    clearHistory();
    setConfirmReset(false);
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="heading-brutal text-4xl">Pengaturan</h1>

      <div className="card-brutal bg-white p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest mb-1 block">
            Nama (untuk sertifikat)
          </label>
          <input
            className="input-brutal"
            placeholder="Nama lengkap"
            value={s.name}
            onChange={(e) => setS({ ...s, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest mb-1 block">
            Bahasa Default Soal
          </label>
          <select
            className="input-brutal"
            value={s.defaultLang}
            onChange={(e) => setS({ ...s, defaultLang: e.target.value as "id" | "en" })}
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex gap-3 items-center">
          <button className="btn-brutal" onClick={save}>
            Simpan
          </button>
          {saved && <span className="chip-brutal bg-[var(--primary)]">Tersimpan ✓</span>}
        </div>
      </div>

      <div className="card-brutal bg-white p-6">
        <h2 className="heading-brutal text-xl mb-2">Zona Bahaya</h2>
        <p className="text-sm mb-4">Hapus semua riwayat sesi dari perangkat ini.</p>
        <button className="btn-brutal btn-brutal-danger" onClick={() => setConfirmReset(true)}>
          Reset Semua Riwayat
        </button>
      </div>

      <div className="card-brutal bg-[var(--muted)] p-4 text-sm">
        ℹ️ AI dijalankan via Lovable AI Gateway. Kamu <b>tidak perlu</b> memasukkan API key.
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset semua riwayat?">
        <p className="mb-4">Tindakan ini tidak bisa dibatalkan.</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-brutal btn-brutal-ghost" onClick={() => setConfirmReset(false)}>
            Batal
          </button>
          <button className="btn-brutal btn-brutal-danger" onClick={doReset}>
            Hapus Semua
          </button>
        </div>
      </Modal>
    </section>
  );
}
