"use client";

export function CompareScoreGuideBar() {
  return (
    <div className="rounded-xl border border-invest-earth/50 bg-card p-4">
      <p className="text-xs font-semibold text-foreground">Score bands</p>
      <div className="mt-3 flex h-9 w-full overflow-hidden rounded-lg text-[10px] font-semibold uppercase tracking-wide text-white">
        <div
          className="flex flex-1 items-center justify-center bg-invest-danger/90"
          title="Weak: pillar proxy roughly below mid-scale confidence"
        >
          Weak 0–44
        </div>
        <div className="flex flex-[1.25] items-center justify-center bg-invest-warning/90">Moderate 45–69</div>
        <div className="flex flex-1 items-center justify-center bg-invest-success/90">Strong 70–100</div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Estimated from saved evaluation inputs (factor sliders and policy scores). Skipped factors (N / no info) are
        excluded from each pillar average, matching the live scoring engine.
      </p>
    </div>
  );
}
