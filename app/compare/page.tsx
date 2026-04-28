"use client";

import { CompareMetricDefinitions } from "@/components/compare/compare-metric-definitions";
import { ComparePillarTable } from "@/components/compare/compare-pillar-table";
import { CompareRadar } from "@/components/compare/compare-radar";
import { CompareScoreGuideBar } from "@/components/compare/compare-score-guide-bar";
import { BenchmarkPanel, type BenchmarkData } from "@/components/evaluate/benchmark-panel";
import { QuadrantChart } from "@/components/evaluate/quadrant-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { computePillarScores, type PillarScores } from "@/lib/compare-pillars";
import { useEffect, useMemo, useState } from "react";

type Evaluation = {
  id: string;
  title: string;
  company_name: string;
  theme_selected: string;
  company_narrative: string | null;
  inputs_json: Record<string, unknown>;
  scores_json: {
    esg_score: number;
    esg_grade: string;
    investment_score: number | null;
    investment_grade: string | null;
    ai_responsibility: number;
    research_quadrant: string;
  } | null;
};

function portfolioPillarAverages(bm: BenchmarkData | null): PillarScores | null {
  if (!bm || bm.count < 1) return null;
  return {
    governance: bm.avg_governance_pillar ?? null,
    transparency: bm.avg_transparency_pillar ?? null,
    privacy: bm.avg_privacy_pillar ?? null,
    environmental: bm.avg_environmental_pillar ?? null,
  };
}

export default function ComparePage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Evaluation[]>("/api/evaluations"),
      apiFetch<BenchmarkData>("/api/portfolio/benchmarks"),
    ])
      .then(([evals, bm]) => {
        const withScores = evals.filter((e) => e.scores_json);
        setEvaluations(withScores);
        setBenchmarks(bm);
        if (withScores.length > 0) setSelectedId(withScores[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = evaluations.find((e) => e.id === selectedId);
  const scores = selected?.scores_json;

  const proposalPillars = useMemo(
    () => (selected ? computePillarScores(selected.inputs_json) : null),
    [selected],
  );

  const portfolioPillars = useMemo(() => portfolioPillarAverages(benchmarks), [benchmarks]);

  const portfolioRowForTable: PillarScores = portfolioPillars ?? {
    governance: null,
    transparency: null,
    privacy: null,
    environmental: null,
  };

  const proposalSubtitle = useMemo(() => {
    if (!selected) return null;
    const parts = [selected.theme_selected];
    const nar = selected.company_narrative?.trim();
    if (nar) parts.push(nar.length > 160 ? `${nar.slice(0, 157)}…` : nar);
    return parts.join(" — ") || null;
  }, [selected]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12">
        <div className="size-4 animate-spin rounded-full border-2 border-theme-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground">Decision Lab</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Benchmark Comparison</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Compare any saved evaluation against the portfolio benchmark. Pillar scores are derived from the same saved
          inputs as the scoring engine; the radar contrasts your selection with portfolio-wide pillar averages.
        </p>
      </div>

      <CompareMetricDefinitions />
      <CompareScoreGuideBar />

      {evaluations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No saved evaluations yet. Run an evaluation first, then come back here to compare.
          </CardContent>
        </Card>
      )}

      {evaluations.length > 0 && (
        <>
          <Card className="border-invest-earth/50">
            <CardHeader>
              <CardTitle className="text-base">Select evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedId} onValueChange={(v) => setSelectedId(v ?? "")}>
                <SelectTrigger className="w-full max-w-md" title="Select an evaluation to compare against the portfolio benchmark">
                  <SelectValue placeholder="Pick an evaluation…" />
                </SelectTrigger>
                <SelectContent side="bottom" alignItemWithTrigger={false}>
                  {evaluations.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.company_name} — {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {scores && selected && proposalPillars && (
            <>
              <CompareRadar
                proposalLabel={selected.company_name}
                portfolioLabel="Portfolio average"
                proposal={proposalPillars}
                portfolio={portfolioPillars}
              />

              <ComparePillarTable
                proposalName={selected.company_name}
                proposalSubtitle={proposalSubtitle}
                proposalPillars={proposalPillars}
                companies={benchmarks?.companies ?? []}
                portfolioRow={portfolioRowForTable}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-invest-success/5 to-transparent p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ESG</p>
                      <p className="mt-1 text-3xl font-bold text-invest-success">{scores.esg_grade}</p>
                      <p className="text-xs text-muted-foreground">{scores.esg_score} / 100</p>
                    </div>
                    <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-blue-500/5 to-transparent p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Investment</p>
                      <p className="mt-1 text-3xl font-bold text-blue-600">{scores.investment_grade ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {scores.investment_score != null ? `${scores.investment_score} / 100` : "Not computed"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-purple-500/5 to-transparent p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Resp</p>
                      <p className="mt-1 text-3xl font-bold text-purple-600">{scores.ai_responsibility.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">of 100</p>
                    </div>
                  </div>

                  {benchmarks && benchmarks.count > 0 && (
                    <BenchmarkPanel
                      esg={scores.esg_score}
                      investment={scores.investment_score}
                      aiResp={scores.ai_responsibility}
                      benchmarks={benchmarks}
                    />
                  )}

                  {benchmarks && benchmarks.count === 0 && (
                    <Card>
                      <CardContent className="py-6 text-center text-sm text-muted-foreground">
                        No portfolio benchmarks yet. Evaluate portfolio companies from the{" "}
                        <a href="/portfolio" className="font-medium text-theme-primary underline-offset-4 hover:underline">
                          Portfolio page
                        </a>{" "}
                        to build benchmark data.
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-5">
                  <QuadrantChart
                    ai={scores.ai_responsibility}
                    inv={scores.investment_score}
                    label={scores.research_quadrant}
                    company={selected.company_name}
                    benchmarks={benchmarks?.companies}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
