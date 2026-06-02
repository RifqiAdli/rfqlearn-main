export function gradeLabel(scorePct: number): { label: string; color: string } {
  if (scorePct >= 85) return { label: "A", color: "#16a34a" };
  if (scorePct >= 75) return { label: "B", color: "#65a30d" };
  if (scorePct >= 60) return { label: "C", color: "#ca8a04" };
  if (scorePct >= 45) return { label: "D", color: "#ea580c" };
  return { label: "E", color: "#dc2626" };
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}
