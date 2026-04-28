"use client";

import Link from "next/link";

export type BenchmarkCompany = {
  company_name: string;
  slug: string;
  logo_url: string | null;
  theme_selected?: string | null;
  esg_score: number;
  investment_score: number | null;
  ai_responsibility: number;
  quadrant_label: string | null;
  governance_pillar?: number | null;
  transparency_pillar?: number | null;
  privacy_pillar?: number | null;
  environmental_pillar?: number | null;
};

export type BenchmarkData = {
  companies: BenchmarkCompany[];
  avg_esg: number;
  avg_investment: number;
  avg_ai_responsibility: number;
  count: number;
  avg_governance_pillar?: number | null;
  avg_transparency_pillar?: number | null;
  avg_privacy_pillar?: number | null;
  avg_environmental_pillar?: number | null;
};

type Props = {
  esg: number;
  investment: number | null;
  aiResp: number;
  benchmarks: BenchmarkData;
};

function ScoreBar({
  label,
  value,
  avg,
  min,
  max,
  color,
}: {
  label: string;
  value: number;
  avg: number;
  min: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(value, 100);
  const avgPct = Math.min(avg, 100);
  const diff = value - avg;
  const diffLabel =
    Math.abs(diff) < 1 ? "At portfolio average" : diff > 0 ? `+${diff.toFixed(1)} above avg` : `${diff.toFixed(1)} below avg`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value.toFixed(0)} vs avg {avg.toFixed(0)}
        </span>
      </div>
      <div className="relative h-5 overflow-hidden rounded-full bg-muted/60">
        {min < max && (
          <div
            className="absolute inset-y-0 rounded-full bg-muted/80"
            style={{ left: `${min}%`, width: `${max - min}%` }}
          />
        )}
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{ width: `${avgPct}%`, backgroundColor: color }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/60"
          style={{ left: `${avgPct}%` }}
          title={`Portfolio avg: ${avg.toFixed(1)}`}
        />
      </div>
      <p
        className="text-[10px] font-medium"
        style={{ color: diff >= 0 ? "var(--invest-success)" : "var(--invest-danger)" }}
      >
        {diffLabel}
      </p>
    </div>
  );
}

export function BenchmarkPanel({ esg, investment, aiResp, benchmarks }: Props) {
  const esgScores = benchmarks.companies.map((c) => c.esg_score);
  const invScores = benchmarks.companies
    .map((c) => c.investment_score)
    .filter((x): x is number => x != null);
  const aiScores = benchmarks.companies.map((c) => c.ai_responsibility);

  const minMax = (arr: number[]) =>
    arr.length ? { min: Math.min(...arr), max: Math.max(...arr) } : { min: 0, max: 0 };

  const esgRange = minMax(esgScores);
  const invRange = invScores.length ? minMax(invScores) : { min: 0, max: 100 };
  const aiRange = minMax(aiScores);

  return (
    <div className="rounded-xl border border-invest-earth/50 bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Portfolio Benchmark</h3>
          <p className="text-xs text-muted-foreground">
            vs. {benchmarks.count} evaluated portfolio {benchmarks.count === 1 ? "company" : "companies"}
          </p>
        </div>
        <Link
          href="/compare"
          className="rounded-md border border-border/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          Full comparison →
        </Link>
      </div>
      <div className="space-y-4">
        <ScoreBar
          label="ESG Score"
          value={esg}
          avg={benchmarks.avg_esg}
          min={esgRange.min}
          max={esgRange.max}
          color="var(--invest-success)"
        />
        {investment != null ? (
          <ScoreBar
            label="Investment Score"
            value={investment}
            avg={benchmarks.avg_investment}
            min={invRange.min}
            max={invRange.max}
            color="#3b82f6"
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Investment score not shown — evaluate at least one investment-DD factor to compare with the portfolio.
          </p>
        )}
        <ScoreBar
          label="AI Responsibility"
          value={aiResp}
          avg={benchmarks.avg_ai_responsibility}
          min={aiRange.min}
          max={aiRange.max}
          color="#a855f7"
        />
      </div>
    </div>
  );
}
