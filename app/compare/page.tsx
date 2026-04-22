"use client";

import { BenchmarkPanel, type BenchmarkData, type BenchmarkCompany } from "@/components/evaluate/benchmark-panel";
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
import { useEffect, useState } from "react";

type Evaluation = {
  id: string;
  title: string;
  company_name: string;
  scores_json: {
    esg_score: number;
    esg_grade: string;
    investment_score: number;
    investment_grade: string;
    ai_responsibility: number;
    research_quadrant: string;
  } | null;
};

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
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
          Decision Lab
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Benchmark Comparison
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Compare any saved evaluation against the portfolio benchmark. Portfolio
          benchmarks are built from evaluations linked to portfolio companies.
        </p>
      </div>

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

          {scores && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                {/* Score summary cards */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-invest-success/5 to-transparent p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ESG</p>
                    <p className="mt-1 text-3xl font-bold text-invest-success">{scores.esg_grade}</p>
                    <p className="text-xs text-muted-foreground">{scores.esg_score} / 100</p>
                  </div>
                  <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-blue-500/5 to-transparent p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Investment</p>
                    <p className="mt-1 text-3xl font-bold text-blue-600">{scores.investment_grade}</p>
                    <p className="text-xs text-muted-foreground">{scores.investment_score} / 100</p>
                  </div>
                  <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-purple-500/5 to-transparent p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Resp</p>
                    <p className="mt-1 text-3xl font-bold text-purple-600">{scores.ai_responsibility.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">of 100</p>
                  </div>
                </div>

                {/* Benchmark bars */}
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
                {/* Quadrant chart */}
                <QuadrantChart
                  ai={scores.ai_responsibility}
                  inv={scores.investment_score}
                  label={scores.research_quadrant}
                  company={selected?.company_name ?? ""}
                  benchmarks={benchmarks?.companies}
                />

                {/* Portfolio company table */}
                {benchmarks && benchmarks.companies.length > 0 && (
                  <Card className="border-invest-earth/50">
                    <CardHeader>
                      <CardTitle className="text-base">Portfolio Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border text-left text-muted-foreground">
                              <th className="pb-2 pr-3 font-medium">Company</th>
                              <th className="pb-2 pr-3 font-medium text-right">ESG</th>
                              <th className="pb-2 pr-3 font-medium text-right">Inv</th>
                              <th className="pb-2 pr-3 font-medium text-right">AI Resp</th>
                              <th className="pb-2 font-medium">Quadrant</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-invest-success/20 bg-invest-success/5 font-medium text-foreground">
                              <td className="py-2 pr-3">{selected?.company_name} (proposal)</td>
                              <td className="py-2 pr-3 text-right">{scores.esg_score}</td>
                              <td className="py-2 pr-3 text-right">{scores.investment_score}</td>
                              <td className="py-2 pr-3 text-right">{scores.ai_responsibility.toFixed(1)}</td>
                              <td className="py-2">{scores.research_quadrant}</td>
                            </tr>
                            {benchmarks.companies.map((c: BenchmarkCompany) => (
                              <tr key={c.slug} className="border-b border-border/40 text-muted-foreground">
                                <td className="py-2 pr-3">{c.company_name}</td>
                                <td className="py-2 pr-3 text-right">{c.esg_score.toFixed(0)}</td>
                                <td className="py-2 pr-3 text-right">{c.investment_score.toFixed(0)}</td>
                                <td className="py-2 pr-3 text-right">{c.ai_responsibility.toFixed(1)}</td>
                                <td className="py-2">{c.quadrant_label ?? "—"}</td>
                              </tr>
                            ))}
                            <tr className="font-medium text-foreground">
                              <td className="pt-2 pr-3">Portfolio Average</td>
                              <td className="pt-2 pr-3 text-right">{benchmarks.avg_esg.toFixed(0)}</td>
                              <td className="pt-2 pr-3 text-right">{benchmarks.avg_investment.toFixed(0)}</td>
                              <td className="pt-2 pr-3 text-right">{benchmarks.avg_ai_responsibility.toFixed(1)}</td>
                              <td className="pt-2">—</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
