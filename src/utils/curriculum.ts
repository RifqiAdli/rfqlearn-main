export type Jenjang = "SD" | "SMP" | "SMA" | "PT";

export const JENJANG_OPTIONS: { id: Jenjang; label: string; sub: string }[] = [
  { id: "SD", label: "SD", sub: "Kelas 1–6" },
  { id: "SMP", label: "SMP", sub: "Kelas 7–9" },
  { id: "SMA", label: "SMA/SMK", sub: "Kelas 10–12" },
  { id: "PT", label: "Perguruan Tinggi", sub: "Semester 1–8" },
];

export const KELAS_BY_JENJANG: Record<Jenjang, string[]> = {
  SD: ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
  SMP: ["Kelas 7", "Kelas 8", "Kelas 9"],
  SMA: ["Kelas 10", "Kelas 11", "Kelas 12"],
  PT: ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"],
};

export const MAPEL_BY_JENJANG: Record<Jenjang, string[]> = {
  SD: ["Matematika", "Bahasa Indonesia", "IPA", "IPS", "PKN"],
  SMP: ["Matematika", "IPA", "IPS", "Bahasa Indonesia", "Bahasa Inggris", "PKN"],
  SMA: [
    "Matematika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Sejarah",
    "Ekonomi",
    "Geografi",
    "Sosiologi",
  ],
  PT: ["Kalkulus", "Statistika", "Pemrograman", "Ekonomi", "Manajemen", "Hukum", "Akuntansi", "Fisika Dasar"],
};

export const SEMESTER_OPTIONS = ["Semester 1", "Semester 2"];
export const JUMLAH_OPTIONS = [5, 10, 15, 20];
export const TIPE_OPTIONS = [
  { id: "pilihan_ganda" as const, label: "Pilihan Ganda" },
  { id: "esai" as const, label: "Esai" },
  { id: "campuran" as const, label: "Campuran" },
];
export const KESULITAN_OPTIONS = [
  { id: "mudah" as const, label: "Mudah" },
  { id: "sedang" as const, label: "Sedang" },
  { id: "sulit" as const, label: "Sulit" },
  { id: "acak" as const, label: "Acak" },
];
