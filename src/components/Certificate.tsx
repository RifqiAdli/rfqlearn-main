import { forwardRef } from "react";

interface Props {
  name: string;
  mapel: string;
  jenjang: string;
  kelas: string;
  scorePct: number;
  date: string;
}

export const Certificate = forwardRef<HTMLDivElement, Props>(function Certificate(
  { name, mapel, jenjang, kelas, scorePct, date },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        background: "#ffffff",
        padding: "24px",
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#111",
        maxWidth: 800,
        margin: "0 auto",
        // Bayangan lembut untuk pratinjau di layar (tidak akan terlihat kaku saat di-download PDF)
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)", 
      }}
    >
      {/* Bingkai Dalam Klasik */}
      <div
        style={{
          border: "3px solid #111",
          padding: "48px 56px",
          textAlign: "center",
          position: "relative",
          background: "#fafafa",
        }}
      >
        {/* Aksen Warna Brand di Atas */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FFE500",
            width: "120px",
            height: "8px",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            borderLeft: "3px solid #111",
            borderRight: "3px solid #111",
            borderBottom: "3px solid #111",
          }}
        />

        {/* Sub-header */}
        <div style={{ letterSpacing: 4, textTransform: "uppercase", fontSize: 14, color: "#666", marginBottom: 16, marginTop: 12 }}>
          Platform Evaluasi Akademik
        </div>

        {/* Judul Sertifikat */}
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 2, marginBottom: 32, color: "#111" }}>
          SERTIFIKAT KELULUSAN
        </div>

        <p style={{ fontSize: 16, color: "#444", marginBottom: 16 }}>
          Dengan bangga diberikan kepada:
        </p>

        {/* Nama Peserta */}
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 64,
            color: "#111",
            borderBottom: "2px solid #ccc",
            display: "inline-block",
            padding: "0 32px 8px 32px",
            marginBottom: 32,
            minWidth: "60%",
          }}
        >
          {name || "PESERTA"}
        </div>

        {/* Deskripsi */}
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 48px auto", color: "#333" }}>
          Atas dedikasi dan keberhasilannya dalam menyelesaikan evaluasi kompetensi pada mata pelajaran{" "}
          <b style={{ color: "#111", fontSize: 20 }}>{mapel}</b>{" "}
          untuk tingkat{" "}
          <b>
            {jenjang} — {kelas}
          </b>
          {" "}dengan hasil yang memuaskan.
        </p>

        {/* Footer (Nilai, Logo, & Tanggal) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40, padding: "0 24px" }}>
          
          {/* Lencana Skor (Badge) */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 8, color: "#555" }}>
              Skor Akhir
            </div>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#111",
                color: "#FFE500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 36,
                margin: "0 auto",
                border: "4px solid #FFE500",
                boxShadow: "0 0 0 2px #111",
              }}
            >
              {scorePct}
            </div>
          </div>

          {/* Watermark Logo Tengah */}
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#ddd", userSelect: "none" }}>
            RFQLEARN
          </div>

          {/* Garis Tanggal */}
          <div style={{ textAlign: "center", minWidth: 160 }}>
            <div style={{ fontSize: 18, fontWeight: 700, borderBottom: "2px solid #111", paddingBottom: 8, marginBottom: 8 }}>
              {date}
            </div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, color: "#555" }}>
              Tanggal Diterbitkan
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});