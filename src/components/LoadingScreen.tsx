export function LoadingScreen({ message = "AI sedang menyusun soal..." }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="brutal-bouncer" />
      <p className="heading-brutal text-2xl text-center">{message}</p>
      <p className="text-sm text-black/70">Mohon tunggu sebentar.</p>
    </div>
  );
}
