"use client";

type Votes = { invest: number; watch: number; skip: number };

export function VoteBars({ votes }: { votes: Votes }) {
  const items = [
    { label: "Invest", pct: votes.invest, bg: "bg-invest-success", ring: "ring-invest-success/20" },
    { label: "Watch", pct: votes.watch, bg: "bg-invest-warning", ring: "ring-invest-warning/20" },
    { label: "Skip", pct: votes.skip, bg: "bg-invest-danger", ring: "ring-invest-danger/20" },
  ] as const;

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ label, pct, bg, ring }) => (
        <div key={label} className="flex items-center gap-3 text-sm">
          <span className="w-14 text-xs font-medium text-muted-foreground">{label}</span>
          <div className={`relative h-7 flex-1 overflow-hidden rounded-lg bg-muted ring-1 ${ring}`}>
            <div
              className={`flex h-full items-center justify-end rounded-lg px-2.5 text-xs font-bold text-white transition-all duration-500 ${bg}`}
              style={{ width: `${Math.max(pct, 3)}%` }}
            >
              {pct > 5 && <span>{pct}%</span>}
            </div>
            {pct <= 5 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                {pct}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
