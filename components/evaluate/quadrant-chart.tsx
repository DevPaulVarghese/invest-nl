"use client";

type BenchmarkDot = {
  company_name: string;
  ai_responsibility: number;
  investment_score: number;
};

export function QuadrantChart({
  ai,
  inv,
  label,
  company,
  benchmarks,
}: {
  ai: number;
  inv: number | null;
  label: string;
  company: string;
  benchmarks?: BenchmarkDot[];
}) {
  if (inv == null) {
    return (
      <div className="rounded-xl border border-invest-earth bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">Research quadrant</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Plot needs an investment score. Mark at least one investment due-diligence factor as answered, or the
          quadrant stays unavailable.
        </p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">Label: {label}</p>
      </div>
    );
  }

  const W = 340;
  const H = 260;
  const PAD = { top: 24, right: 20, bottom: 28, left: 20 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toX = (v: number) => PAD.left + (v / 100) * plotW;
  const toY = (v: number) => PAD.top + (1 - v / 100) * plotH;
  const midX = toX(50);
  const midY = toY(50);

  const x = toX(ai);
  const y = toY(inv);

  const gridLines = [20, 40, 60, 80];

  return (
    <div className="rounded-xl border border-invest-earth bg-card p-4">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Research Quadrant
      </p>
      <p className="mb-3 text-center text-[10px] text-muted-foreground">
        AI Responsibility vs Investment Attractiveness
      </p>
      <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Four quadrant placement"
        >
          <defs>
            <linearGradient id="qWinWin" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--invest-success)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--invest-success)" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="qCaution" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--invest-warning)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--invest-warning)" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="qDecline" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--invest-danger)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--invest-danger)" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="qImpact" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Quadrant fills */}
          <rect x={PAD.left} y={PAD.top} width={midX - PAD.left} height={midY - PAD.top} fill="url(#qCaution)" rx="4" />
          <rect x={midX} y={PAD.top} width={PAD.left + plotW - midX} height={midY - PAD.top} fill="url(#qWinWin)" rx="4" />
          <rect x={PAD.left} y={midY} width={midX - PAD.left} height={PAD.top + plotH - midY} fill="url(#qDecline)" rx="4" />
          <rect x={midX} y={midY} width={PAD.left + plotW - midX} height={PAD.top + plotH - midY} fill="url(#qImpact)" rx="4" />

          {/* Grid lines */}
          {gridLines.map((v) => (
            <g key={v}>
              <line x1={toX(v)} y1={PAD.top} x2={toX(v)} y2={PAD.top + plotH} stroke="currentColor" className="text-border" strokeWidth="0.3" strokeDasharray="3,3" />
              <line x1={PAD.left} y1={toY(v)} x2={PAD.left + plotW} y2={toY(v)} stroke="currentColor" className="text-border" strokeWidth="0.3" strokeDasharray="3,3" />
            </g>
          ))}

          {/* Axis dividers */}
          <line x1={midX} y1={PAD.top - 4} x2={midX} y2={PAD.top + plotH + 4} stroke="currentColor" className="text-border" strokeWidth="0.8" />
          <line x1={PAD.left - 4} y1={midY} x2={PAD.left + plotW + 4} y2={midY} stroke="currentColor" className="text-border" strokeWidth="0.8" />

          {/* Quadrant labels */}
          <text x={(PAD.left + midX) / 2} y={PAD.top + (midY - PAD.top) * 0.45} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--invest-warning)" opacity={0.7}>Caution</text>
          <text x={(midX + PAD.left + plotW) / 2} y={PAD.top + (midY - PAD.top) * 0.45} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--invest-success)" opacity={0.7}>Win-win</text>
          <text x={(PAD.left + midX) / 2} y={midY + (PAD.top + plotH - midY) * 0.55} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--invest-danger)" opacity={0.7}>Decline</text>
          <text x={(midX + PAD.left + plotW) / 2} y={midY + (PAD.top + plotH - midY) * 0.55} textAnchor="middle" fontSize="11" fontWeight="600" fill="#6366f1" opacity={0.7}>Impact-first</text>

          {/* Axis labels */}
          <text x={W / 2} y={PAD.top - 10} textAnchor="middle" fontSize="8" fill="currentColor" className="text-muted-foreground">High investment attractiveness ↑</text>
          <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="currentColor" className="text-muted-foreground">Low investment attractiveness ↓</text>
          <text x={PAD.left - 4} y={H / 2} fontSize="7" fill="currentColor" className="text-muted-foreground" textAnchor="end" dominantBaseline="middle">Low AI</text>
          <text x={PAD.left + plotW + 4} y={H / 2} fontSize="7" fill="currentColor" className="text-muted-foreground" textAnchor="start" dominantBaseline="middle">High AI</text>

          {/* Benchmark dots */}
          {benchmarks?.map((b) => {
            const bx = toX(b.ai_responsibility);
            const by = toY(b.investment_score);
            const shortName = b.company_name.length > 14 ? `${b.company_name.slice(0, 13)}…` : b.company_name;
            return (
              <g key={b.company_name}>
                <circle cx={bx} cy={by} r="5" fill="currentColor" className="text-muted-foreground" opacity={0.25} />
                <circle cx={bx} cy={by} r="3" fill="currentColor" className="text-muted-foreground" opacity={0.5} />
                <text x={bx} y={by - 9} textAnchor="middle" fontSize="7" fill="currentColor" className="text-muted-foreground" opacity={0.7}>{shortName}</text>
              </g>
            );
          })}

          {/* Main proposal dot with glow */}
          <circle cx={x} cy={y} r="12" fill="var(--invest-success)" opacity={0.15} />
          <circle cx={x} cy={y} r="8" fill="var(--invest-success)" opacity={0.85} filter="url(#glow)" />
          <circle cx={x} cy={y} r="3" fill="white" opacity={0.9} />
          <text x={x} y={y - 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor" className="text-foreground">
            {company.length > 18 ? `${company.slice(0, 17)}…` : company}
          </text>

          {/* Crosshair lines from dot to axes */}
          <line x1={x} y1={y} x2={x} y2={PAD.top + plotH} stroke="var(--invest-success)" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.4} />
          <line x1={PAD.left} y1={y} x2={x} y2={y} stroke="var(--invest-success)" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.4} />
        </svg>
      </div>

      {/* Legend and labels */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-invest-success/15 px-3 py-1 text-xs font-semibold text-invest-success">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>AI Responsibility: <strong className="text-foreground">{ai.toFixed(0)}</strong></span>
          <span className="text-border">|</span>
          <span>Investment Score: <strong className="text-foreground">{inv.toFixed(0)}</strong></span>
        </div>
        {benchmarks && benchmarks.length > 0 && (
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-invest-success shadow-sm shadow-invest-success/50" /> This proposal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-muted-foreground/40" /> Portfolio companies
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
