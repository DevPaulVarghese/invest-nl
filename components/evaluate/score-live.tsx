"use client";

type Props = {
  esgScore: number | null;
  esgGrade: string | null;
  investScore: number | null;
  investGrade: string | null;
  aiScore: number | null;
  quadrant: string | null;
};

function gradeColor(grade: string | null): string {
  if (!grade) return "text-muted-foreground";
  if (grade.startsWith("A")) return "text-invest-success";
  if (grade.startsWith("B")) return "text-blue-600";
  if (grade.startsWith("C")) return "text-invest-warning";
  return "text-invest-danger";
}

function ScoreRing({ value, max, color, size = 56 }: { value: number; max: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}

export function ScoreLive({ esgScore, esgGrade, investScore, investGrade, aiScore, quadrant }: Props) {
  return (
    <div className="rounded-xl border border-invest-earth bg-card/80 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live scores</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <ScoreRing value={esgScore ?? 0} max={100} color="var(--invest-success)" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{esgScore ?? "–"}</span>
          </div>
          <span className="text-[10px] font-medium uppercase text-muted-foreground">ESG</span>
          <span className={`text-sm font-bold ${gradeColor(esgGrade)}`}>{esgGrade ?? "–"}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <ScoreRing value={investScore ?? 0} max={100} color="var(--theme-primary)" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{investScore ?? "–"}</span>
          </div>
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Investment</span>
          <span className={`text-sm font-bold ${gradeColor(investGrade)}`}>{investGrade ?? "–"}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <ScoreRing value={aiScore ?? 0} max={100} color="#6366f1" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{aiScore?.toFixed(0) ?? "–"}</span>
          </div>
          <span className="text-[10px] font-medium uppercase text-muted-foreground">AI Resp.</span>
          <span className="text-xs font-medium text-muted-foreground">{quadrant ?? "–"}</span>
        </div>
      </div>
    </div>
  );
}
