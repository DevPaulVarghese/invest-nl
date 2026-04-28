"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { PillarScores } from "@/lib/compare-pillars";
import { useMemo } from "react";
import { Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart, Tooltip } from "recharts";

const AXIS_COLORS = ["#a855f7", "#3b82f6", "var(--invest-success)", "#f97316"] as const;

type AxisRow = {
  axis: string;
  proposalVis: number;
  portfolioVis: number;
  rawProposal: number | null;
  rawPortfolio: number | null;
};

function vis(n: number | null | undefined): number {
  if (n == null || Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

const chartConfig = {
  proposalVis: { label: "Proposal", color: "var(--invest-success)" },
  portfolioVis: { label: "Portfolio avg.", color: "#60a5fa" },
} satisfies ChartConfig;

type Props = {
  proposalLabel: string;
  portfolioLabel: string;
  proposal: PillarScores;
  portfolio: PillarScores | null;
};

export function CompareRadar({ proposalLabel, portfolioLabel, proposal, portfolio }: Props) {
  const data = useMemo((): AxisRow[] => {
    const axes: { key: keyof PillarScores; label: string }[] = [
      { key: "governance", label: "Governance" },
      { key: "transparency", label: "Transparency" },
      { key: "privacy", label: "Privacy" },
      { key: "environmental", label: "Environmental" },
    ];
    return axes.map(({ key, label }) => {
      const rp = proposal[key];
      const rv = portfolio?.[key] ?? null;
      return {
        axis: label,
        proposalVis: vis(rp),
        portfolioVis: vis(rv),
        rawProposal: rp,
        rawPortfolio: rv,
      };
    });
  }, [proposal, portfolio]);

  const hasProposal = data.some((d) => d.rawProposal != null);
  const hasPortfolio = data.some((d) => d.rawPortfolio != null);

  if (!hasProposal && !hasPortfolio) {
    return (
      <Card className="border-invest-earth/50">
        <CardHeader>
          <CardTitle className="text-base">Pillar radar</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Not enough non-skipped inputs to draw pillar scores for this comparison.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-invest-earth/50">
      <CardHeader>
        <CardTitle className="text-base">Pillar radar</CardTitle>
        <p className="text-xs text-muted-foreground">
          Two series: your selected evaluation vs portfolio pillar averages. Vertices at the mid-ring (50) indicate a
          pillar could not be computed from inputs (all contributing factors skipped).
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[360px] w-full max-w-md">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid className="stroke-border/60" />
            <PolarAngleAxis
              dataKey="axis"
              tick={({ x, y, payload, index, textAnchor }) => (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  fill={AXIS_COLORS[index % AXIS_COLORS.length]}
                  fontSize={11}
                  fontWeight={600}
                  dy={0.1}
                >
                  {String(payload.value)}
                </text>
              )}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as AxisRow;
                return (
                  <div className="min-w-[10rem] rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-lg">
                    <p className="font-semibold text-foreground">{row.axis}</p>
                    <ul className="mt-2 space-y-1.5">
                      {hasProposal ? (
                        <li className="flex justify-between gap-6">
                          <span className="text-muted-foreground">{proposalLabel}</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {row.rawProposal == null ? "— (chart uses 50)" : `${row.rawProposal.toFixed(1)} / 100`}
                          </span>
                        </li>
                      ) : null}
                      {hasPortfolio ? (
                        <li className="flex justify-between gap-6">
                          <span className="text-muted-foreground">{portfolioLabel}</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {row.rawPortfolio == null ? "— (chart uses 50)" : `${row.rawPortfolio.toFixed(1)} / 100`}
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                );
              }}
            />
            {hasProposal ? (
              <Radar
                name={proposalLabel}
                dataKey="proposalVis"
                stroke="var(--invest-success)"
                fill="var(--invest-success)"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ) : null}
            {hasPortfolio ? (
              <Radar
                name={portfolioLabel}
                dataKey="portfolioVis"
                stroke="#60a5fa"
                fill="#60a5fa"
                fillOpacity={0.08}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 2 }}
              />
            ) : null}
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => <span className="text-muted-foreground">{value}</span>}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
