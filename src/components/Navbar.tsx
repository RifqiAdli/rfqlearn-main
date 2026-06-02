import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-wordmark ${className}`}>
      rfqlear<span className="brand-last">n</span>
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-[var(--background)] border-b-[3px] border-black">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl no-underline text-black" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/setup" label="Latihan" />
          <NavLink to="/history" label="Riwayat" />
          <NavLink to="/settings" label="Pengaturan" />
        </nav>
        <button
          aria-label="Menu"
          className="md:hidden btn-brutal-sm"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t-[3px] border-black bg-[var(--muted)] px-4 py-3 flex flex-col gap-2">
          <NavLink to="/setup" label="Latihan" onClick={() => setOpen(false)} />
          <NavLink to="/history" label="Riwayat" onClick={() => setOpen(false)} />
          <NavLink to="/settings" label="Pengaturan" onClick={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}

function NavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-3 py-2 font-bold uppercase tracking-wide text-sm border-2 border-black no-underline text-black hover:bg-[var(--primary)] transition-colors"
      activeProps={{ className: "px-3 py-2 font-bold uppercase tracking-wide text-sm border-2 border-black no-underline text-black bg-[var(--primary)]" }}
    >
      {label}
    </Link>
  );
}
