import { gradeLabel } from "@/utils/grading";

export function ScoreCard({
  scorePct,
  correct,
  total,
  duration,
}: {
  scorePct: number;
  correct: number;
  total: number;
  duration: string;
}) {
  const g = gradeLabel(scorePct);
  return (
    <div className="card-brutal bg-[var(--primary)] p-6 md:p-8 grid md:grid-cols-3 gap-6 items-center">
      <div>
        <div className="text-xs uppercase font-bold tracking-widest">Skor</div>
        <div className="heading-brutal text-7xl md:text-8xl leading-none">{scorePct}</div>
        <div className="text-sm font-bold">dari 100</div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div
          className="w-24 h-24 border-[3px] border-black flex items-center justify-center heading-brutal text-6xl"
          style={{ background: g.color, color: "#fff" }}
        >
          {g.label}
        </div>
        <div className="mt-2 text-sm font-bold uppercase">Grade</div>
      </div>
      <div className="space-y-1 text-sm">
        <div>
          <b>Benar:</b> {correct} / {total}
        </div>
        <div>
          <b>Salah:</b> {total - correct}
        </div>
        <div>
          <b>Waktu:</b> {duration}
        </div>
      </div>
    </div>
  );
}
