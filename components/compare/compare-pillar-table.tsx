"use client";

import type { BenchmarkCompany } from "@/components/evaluate/benchmark-panel";
import {
  compositeGradeFromPillars,
  pillarBandLabel,
  type PillarScores,
  strengthGapFromPillars,
} from "@/lib/compare-pillars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PILLAR_KEYS: (keyof PillarScores)[] = ["governance", "transparency", "privacy", "environmental"];

const PILLAR_HEAD: Record<keyof PillarScores, string> = {
  governance: "Governance",
  transparency: "Transparency",
  privacy: "Privacy",
  environmental: "Environmental",
};

const MISSING_TITLE =
  "This pillar could not be estimated because every contributing factor was skipped (N/A or no information).";

function PillarBar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-1.5 w-full max-w-[7rem] overflow-hidden rounded-full bg-muted/60">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: tone }}
      />
    </div>
  );
}

function PillarCell({ value, tone }: { value: number | null | undefined; tone: string }) {
  if (value == null || Number.isNaN(value)) {
    return (
      <td className="min-w-[5.5rem] py-2 pr-2 align-top" title={MISSING_TITLE}>
        <span className="text-muted-foreground">—</span>
      </td>
    );
  }
  const band = pillarBandLabel(value);
  return (
    <td className="min-w-[6.5rem] py-2 pr-2 align-top">
      <div className="flex max-w-[7.5rem] flex-col gap-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className="font-mono text-[11px] font-semibold tabular-nums text-foreground">{value.toFixed(0)}</span>
          <span className="text-[9px] font-medium text-muted-foreground">{band}</span>
        </div>
        <PillarBar value={value} tone={tone} />
      </div>
    </td>
  );
}

const TONES = ["#a855f7", "#3b82f6", "var(--invest-success)", "#f97316"] as const;

type Props = {
  proposalName: string;
  proposalSubtitle: string | null;
  proposalPillars: PillarScores;
  companies: BenchmarkCompany[];
  portfolioRow: PillarScores;
};

export function ComparePillarTable({
  proposalName,
  proposalSubtitle,
  proposalPillars,
  companies,
  portfolioRow,
}: Props) {
  const proposalGrade = compositeGradeFromPillars(proposalPillars);
  const proposalSG = strengthGapFromPillars(proposalPillars);

  return (
    <Card className="border-invest-earth/50">
      <CardHeader>
        <CardTitle className="text-base">Pillar comparison</CardTitle>
        <p className="text-xs text-muted-foreground">
          Governance, transparency, privacy, and environmental proxies (0–100) derived from the same saved inputs as
          the scoring engine. Composite grade uses the mean of available pillars and the same letter thresholds as ESG
          / investment grades.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Company & context</th>
                {PILLAR_KEYS.map((k, i) => (
                  <th key={k} className="pb-2 pr-2 font-medium" style={{ color: TONES[i] }}>
                    {PILLAR_HEAD[k]}
                  </th>
                ))}
                <th className="pb-2 pr-2 font-medium">Grade</th>
                <th className="pb-2 font-medium">Strength / gap</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-invest-success/25 bg-invest-success/5 font-medium text-foreground">
                <td className="py-2 pr-3 align-top">
                  <div className="font-semibold">{proposalName}</div>
                  <div className="text-[10px] font-normal text-muted-foreground">Proposal</div>
                  {proposalSubtitle ? (
                    <p className="mt-1 line-clamp-2 max-w-[14rem] text-[10px] font-normal text-muted-foreground">
                      {proposalSubtitle}
                    </p>
                  ) : null}
                </td>
                {PILLAR_KEYS.map((k, i) => (
                  <PillarCell key={k} value={proposalPillars[k]} tone={TONES[i]} />
                ))}
                <td className="py-2 pr-2 align-top font-mono text-sm">{proposalGrade ?? "—"}</td>
                <td className="py-2 align-top text-[10px] text-muted-foreground">
                  {proposalSG.strength && proposalSG.gap ? (
                    <>
                      <span className="text-foreground">↑ {proposalSG.strength}</span>
                      <span className="mx-1">·</span>
                      <span>↓ {proposalSG.gap}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              {companies.map((c) => {
                const p: PillarScores = {
                  governance: c.governance_pillar ?? null,
                  transparency: c.transparency_pillar ?? null,
                  privacy: c.privacy_pillar ?? null,
                  environmental: c.environmental_pillar ?? null,
                };
                const g = compositeGradeFromPillars(p);
                const sg = strengthGapFromPillars(p);
                const subtitle = [c.theme_selected, c.slug].filter(Boolean).join(" · ");
                return (
                  <tr key={c.slug} className="border-b border-border/50 text-muted-foreground">
                    <td className="py-2 pr-3 align-top">
                      <div className="font-medium text-foreground">{c.company_name}</div>
                      <div className="text-[10px]">{subtitle}</div>
                    </td>
                    {PILLAR_KEYS.map((k, i) => (
                      <PillarCell key={k} value={p[k]} tone={TONES[i]} />
                    ))}
                    <td className="py-2 pr-2 align-top font-mono text-sm text-foreground">{g ?? "—"}</td>
                    <td className="py-2 align-top text-[10px]">
                      {sg.strength && sg.gap ? (
                        <>
                          <span className="text-foreground">↑ {sg.strength}</span>
                          <span className="mx-1">·</span>
                          <span>↓ {sg.gap}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="font-semibold text-foreground">
                <td className="pt-3 pr-3 align-top">Portfolio average</td>
                {PILLAR_KEYS.map((k, i) => (
                  <PillarCell key={k} value={portfolioRow[k]} tone={TONES[i]} />
                ))}
                <td className="pt-3 pr-2 align-top font-mono text-sm">
                  {compositeGradeFromPillars(portfolioRow) ?? "—"}
                </td>
                <td className="pt-3 align-top text-[10px] font-normal text-muted-foreground">
                  {(() => {
                    const sg = strengthGapFromPillars(portfolioRow);
                    return sg.strength && sg.gap ? (
                      <>
                        <span className="text-foreground">↑ {sg.strength}</span>
                        <span className="mx-1">·</span>
                        <span>↓ {sg.gap}</span>
                      </>
                    ) : (
                      "—"
                    );
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
