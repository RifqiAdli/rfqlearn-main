import { type ReactNode, useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="card-brutal bg-[var(--background)] w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="heading-brutal text-2xl mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
