"use client";

import { FactorCard, type FactorAnswerGroup } from "@/components/evaluate/factor-card";
import { Forest } from "@/components/evaluate/forest";
import { FrameworkPanel } from "@/components/evaluate/framework-panel";
import { QuadrantChart } from "@/components/evaluate/quadrant-chart";
import { ScoreLive } from "@/components/evaluate/score-live";
import { VoteBars } from "@/components/evaluate/vote-bars";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { FACTOR_SECTIONS } from "@/lib/factor-rows";
import { suggestTheme } from "@/lib/theme-match";
import { INVEST_THEMES, type InvestThemeId } from "@/lib/themes";
import type { FactorAnswerStatus } from "@/lib/factor-status";
import { DEFAULT_SCORE_INPUTS, type ScoreInputs } from "@/lib/score-types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BenchmarkPanel, type BenchmarkData } from "@/components/evaluate/benchmark-panel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

type ScoreResponse = {
  scores: Record<string, unknown>;
  forest_colors: string[];
};

const STEPS = [
  { label: "Company", icon: "1" },
  { label: "Scope", icon: "2" },
  { label: "Due Diligence", icon: "3" },
  { label: "Results", icon: "4" },
] as const;

function sectionAnswerGroup(sectionId: string): FactorAnswerGroup {
  if (sectionId === "gatekeeper") return "gate";
  const investmentPillars = ["financial", "market", "technology", "team", "legal", "risk_exit"];
  if (investmentPillars.includes(sectionId)) return "investment";
  return "esg";
}

function buildFactorStatusPayload(
  status: Partial<Record<keyof ScoreInputs, FactorAnswerStatus>>,
): Record<string, FactorAnswerStatus> {
  const out: Record<string, FactorAnswerStatus> = {};
  for (const [k, v] of Object.entries(status)) {
    if (v === "na" || v === "no_info") out[k] = v;
  }
  return out;
}

function gradeColor(grade: string | null | undefined): string {
  if (!grade) return "text-muted-foreground";
  if (grade.startsWith("A")) return "text-invest-success";
  if (grade.startsWith("B")) return "text-blue-600";
  if (grade.startsWith("C")) return "text-invest-warning";
  return "text-invest-danger";
}

function BurnChart({ ticket, horizon }: { ticket: number; horizon: number }) {
  if (!ticket || !horizon || horizon < 1) return null;
  const data = Array.from({ length: horizon + 1 }, (_, i) => ({
    year: `Year ${i}`,
    remaining: Math.round(ticket * (1 - i / horizon) * 100) / 100,
  }));

  const chartConfig = {
    remaining: { label: "Capital remaining (M€)", color: "var(--invest-success)" },
  } satisfies ChartConfig;

  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Projected Capital Deployment
      </p>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--invest-success)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--invest-success)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M€`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="remaining"
            stroke="var(--invest-success)"
            strokeWidth={2}
            fill="url(#burnGrad)"
            dot={{ r: 3, fill: "var(--invest-success)" }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

export function EvaluateWizard() {
  const searchParams = useSearchParams();
  const qPortfolioId = searchParams.get("portfolio_company_id");
  const qCompanyName = searchParams.get("company_name");
  const qTheme = searchParams.get("theme");

  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState(qCompanyName || "");
  const [foundingDate, setFoundingDate] = useState("");
  const [numEmployees, setNumEmployees] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [narrative, setNarrative] = useState("");
  const [theme, setTheme] = useState<InvestThemeId>((qTheme as InvestThemeId) || "TECH");
  const [ticket, setTicket] = useState("5");
  const [instrument, setInstrument] = useState("equity");
  const [horizon, setHorizon] = useState("5");
  const [coInvestor, setCoInvestor] = useState("");
  const [staging, setStaging] = useState("single");
  const [expectedIrr, setExpectedIrr] = useState("15");
  const [useOfProceeds, setUseOfProceeds] = useState("");
  const [inputs, setInputs] = useState<ScoreInputs>({ ...DEFAULT_SCORE_INPUTS });
  const [factorStatus, setFactorStatus] = useState<Partial<Record<keyof ScoreInputs, FactorAnswerStatus>>>({});
  const [preview, setPreview] = useState<ScoreResponse | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(FACTOR_SECTIONS[0].id);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData | null>(null);

  const suggested = useMemo(() => suggestTheme(narrative), [narrative]);

  useEffect(() => {
    apiFetch<BenchmarkData>("/api/portfolio/benchmarks")
      .then(setBenchmarks)
      .catch(() => {});
  }, []);

  const refreshPreview = useCallback(async () => {
    try {
      setError(null);
      const factor_status = buildFactorStatusPayload(factorStatus);
      const res = await apiFetch<ScoreResponse>("/api/score/preview", {
        method: "POST",
        body: JSON.stringify({ inputs, factor_status }),
      });
      setPreview(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
    }
  }, [inputs, factorStatus]);

  useEffect(() => {
    const t = setTimeout(() => {
      void refreshPreview();
    }, 300);
    return () => clearTimeout(t);
  }, [refreshPreview]);

  function patch(key: keyof ScoreInputs, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function patchFactorStatus(key: keyof ScoreInputs, status: FactorAnswerStatus) {
    setFactorStatus((prev) => {
      const next = { ...prev };
      if (status === "answered") delete next[key];
      else next[key] = status;
      return next;
    });
  }

  async function saveEvaluation() {
    setSaveStatus(null);
    setSavedId(null);
    try {
      const res = await apiFetch<{ id: string }>("/api/evaluations", {
        method: "POST",
        body: JSON.stringify({
          title: `${companyName} — draft`,
          company_name: companyName,
          theme_selected: theme,
          company_narrative: narrative,
          scope_json: {
            ticket_m_eur: Number(ticket),
            instrument,
            horizon_years: Number(horizon),
            co_investor: coInvestor || undefined,
            staging,
            expected_irr: Number(expectedIrr) || undefined,
            use_of_proceeds: useOfProceeds || undefined,
            founding_date: foundingDate || undefined,
            num_employees: numEmployees ? Number(numEmployees) : undefined,
            contact_person: contactPerson || undefined,
            contact_email: contactEmail || undefined,
            contact_phone: contactPhone || undefined,
            company_url: companyUrl || undefined,
          },
          inputs,
          factor_status: buildFactorStatusPayload(factorStatus),
          portfolio_company_id: qPortfolioId || undefined,
        }),
      });
      setSavedId(res.id);
      setSaveStatus("Saved successfully.");
    } catch (e) {
      setSaveStatus(e instanceof Error ? e.message : "Save failed");
    }
  }

  const scores = preview?.scores as
    | {
        esg_score: number;
        esg_grade: string;
        investment_score: number | null;
        investment_grade: string | null;
        votes: { invest: number; watch: number; skip: number };
        ai_responsibility: number;
        research_quadrant: string;
        legacy_quadrant: { label: string };
        pros: string;
        cons: string;
        recommendations: string;
        investment_thesis: string;
      }
    | undefined;

  function downloadJson() {
    const blob = new Blob(
      [JSON.stringify({ companyName, theme, inputs, factorStatus, scores: preview?.scores }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, "-")}-evaluation.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const currentSection = FACTOR_SECTIONS.find((s) => s.id === activeSection) ?? FACTOR_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
          Decision Lab
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Investment Evaluation
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          56 due-diligence factors across 12 pillars. Scores computed in real-time via the FastAPI backend.
          Each question includes an explanation and shows its dynamic contribution to the scoring formulas.
        </p>
      </div>

      <FrameworkPanel />

      {/* Step indicator */}
      <nav className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            title={`Go to step ${i + 1}: ${s.label}`}
            onClick={() => setStep(i)}
            className={`group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              step === i
                ? "bg-foreground text-background shadow-sm"
                : step > i
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                step === i
                  ? "bg-background/20"
                  : step > i
                    ? "bg-white/20"
                    : "bg-foreground/5"
              }`}
            >
              {step > i ? "✓" : s.icon}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </nav>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 0: Company */}
      {step === 0 && (
        <Card className="border-invest-earth/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold text-foreground">
                1
              </span>
              Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="co" className="text-sm font-medium" title="Legal name of the company being evaluated">
                Company name
              </Label>
              <Input
                id="co"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. NovaTech BV"
                title="Enter the full legal name of the company"
                className="max-w-md"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="founding" className="text-sm font-medium" title="Date the company was founded or incorporated">
                  Date of Founding
                </Label>
                <Input
                  id="founding"
                  type="date"
                  value={foundingDate}
                  onChange={(e) => setFoundingDate(e.target.value)}
                  title="Enter the company's date of founding"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees" className="text-sm font-medium" title="Total number of full-time employees">
                  Number of Employees
                </Label>
                <Input
                  id="employees"
                  type="number"
                  min={0}
                  value={numEmployees}
                  onChange={(e) => setNumEmployees(e.target.value)}
                  placeholder="e.g. 50"
                  title="Enter the total headcount"
                  className="max-w-md"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-person" className="text-sm font-medium" title="Primary contact person for this evaluation">
                  Contact Person
                </Label>
                <Input
                  id="contact-person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  title="Enter the name of the primary contact"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-sm font-medium" title="Email address of the primary contact">
                  Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. jane@company.com"
                  title="Enter the contact email address"
                  className="max-w-md"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-sm font-medium" title="Telephone number of the primary contact">
                  Telephone
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +31 6 1234 5678"
                  title="Enter the contact telephone number"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-url" className="text-sm font-medium" title="Company website URL">
                  Website URL
                </Label>
                <Input
                  id="company-url"
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="e.g. https://example.com"
                  title="Enter the company website"
                  className="max-w-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nar" className="text-sm font-medium" title="Free-text description used for theme auto-suggestion">
                Narrative
              </Label>
              <p className="text-xs text-muted-foreground">
                Describe the company&apos;s sector, product, AI use-case, and impact thesis. Keywords help
                auto-suggest a theme.
              </p>
              <Textarea
                id="nar"
                rows={5}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="e.g. AI-powered precision agriculture platform that reduces pesticide use by 40% using satellite imagery and drone data..."
                title="Describe the company, product, and impact thesis"
              />
              {suggested && (
                <p className="text-xs text-muted-foreground">
                  Suggested theme from keywords: <strong className="text-foreground">{suggested}</strong>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium" title="Primary strategic investment theme for classification">
                Strategic theme
              </Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as InvestThemeId)}>
                <SelectTrigger className="w-full max-w-md" title="Select the primary strategic investment theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" alignItemWithTrigger={false}>
                  {INVEST_THEMES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              title="Proceed to the Investment Scope step"
              onClick={() => setStep(1)}
              className="mt-2 bg-foreground text-background hover:bg-foreground/90"
            >
              Continue to Scope →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Scope */}
      {step === 1 && (
        <Card className="border-invest-earth/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold text-foreground">
                2
              </span>
              Investment Scope
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Define the financial parameters of the proposed investment. These fields are saved with the
              evaluation for reporting but do not affect scoring.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium" title="Total amount of capital to be deployed in millions of euros">
                  Ticket size (M€)
                </Label>
                <Input
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                  type="number"
                  min={0}
                  placeholder="5"
                  title="Investment amount in millions of euros"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium" title="The type of financial instrument for this investment">
                  Instrument
                </Label>
                <Select value={instrument} onValueChange={(v) => setInstrument(v ?? "equity")}>
                  <SelectTrigger className="w-full" title="Select the investment instrument type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" alignItemWithTrigger={false}>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                    <SelectItem value="fund">Fund</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="convertible">Convertible note</SelectItem>
                    <SelectItem value="grant">Grant / subsidy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium" title="Expected holding period before exit in years">
                  Horizon (years)
                </Label>
                <Input
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                  type="number"
                  min={1}
                  max={15}
                  placeholder="5"
                  title="Investment horizon in years (1-15)"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium" title="Whether capital is deployed in one tranche or staged over milestones">
                  Staging
                </Label>
                <Select value={staging} onValueChange={(v) => setStaging(v ?? "single")}>
                  <SelectTrigger className="w-full" title="Select capital deployment staging">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" alignItemWithTrigger={false}>
                    <SelectItem value="single">Single tranche</SelectItem>
                    <SelectItem value="milestone">Milestone-based tranches</SelectItem>
                    <SelectItem value="annual">Annual drawdown</SelectItem>
                    <SelectItem value="other">Other / TBD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium" title="Target internal rate of return for this investment">
                  Expected IRR (%)
                </Label>
                <Input
                  value={expectedIrr}
                  onChange={(e) => setExpectedIrr(e.target.value)}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="15"
                  title="Target IRR in percent"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium" title="Name of co-investing fund or entity, if any">
                  Co-investor (optional)
                </Label>
                <Input
                  value={coInvestor}
                  onChange={(e) => setCoInvestor(e.target.value)}
                  placeholder="e.g. EIF, KfW Capital"
                  title="Name of co-investing party, leave blank if none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium" title="Describe how the invested capital will be used">
                Use of proceeds
              </Label>
              <Textarea
                rows={3}
                value={useOfProceeds}
                onChange={(e) => setUseOfProceeds(e.target.value)}
                placeholder="e.g. 50% R&D, 30% go-to-market expansion, 20% working capital…"
                title="Breakdown of how the company plans to use the invested capital"
              />
            </div>

            <BurnChart ticket={Number(ticket) || 0} horizon={Number(horizon) || 0} />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                title="Go back to the Company Profile step"
                onClick={() => setStep(0)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                title="Proceed to the Due Diligence Factors step"
                onClick={() => setStep(2)}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Continue to Due Diligence →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Due Diligence Factors */}
      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <div className="space-y-1">
              {FACTOR_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    title={`${section.title} — ${section.rows.length} factors`}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                      isActive
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive ? "bg-background/20" : "bg-foreground/5"
                      }`}
                    >
                      {section.rows.length}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </div>

            <ScoreLive
              esgScore={scores?.esg_score ?? null}
              esgGrade={scores?.esg_grade ?? null}
              investScore={scores?.investment_score ?? null}
              investGrade={scores?.investment_grade ?? null}
              aiScore={scores?.ai_responsibility ?? null}
              quadrant={scores?.research_quadrant ?? null}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                title="Go back to the Scope step"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                title="View computed results"
                onClick={() => setStep(3)}
              >
                View Results
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-r from-foreground/5 to-transparent p-5">
              <h2 className="text-lg font-bold text-foreground">{currentSection.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {currentSection.definition}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {currentSection.rows.length} factor{currentSection.rows.length !== 1 ? "s" : ""} in this section.
                Click <strong>Info</strong> on any question for a detailed explanation.
              </p>
              {sectionAnswerGroup(activeSection) === "investment" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Financial, market, technology, team, legal, and exit factors are{" "}
                  <strong className="text-foreground">optional</strong> for the investment score. Use{" "}
                  <em>Not applicable</em> or <em>No information</em> to omit a factor; the score averages only
                  answered items.
                </p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {currentSection.rows.map((row) => (
                <FactorCard
                  key={row.key}
                  row={row}
                  value={inputs[row.key]}
                  onValueChange={patch}
                  answerGroup={sectionAnswerGroup(activeSection)}
                  factorStatus={factorStatus[row.key]}
                  onFactorStatusChange={patchFactorStatus}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              {(() => {
                const idx = FACTOR_SECTIONS.findIndex((s) => s.id === activeSection);
                const prev = idx > 0 ? FACTOR_SECTIONS[idx - 1] : null;
                const next = idx < FACTOR_SECTIONS.length - 1 ? FACTOR_SECTIONS[idx + 1] : null;
                return (
                  <>
                    {prev && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        title={`Go to previous section: ${prev.title}`}
                        onClick={() => setActiveSection(prev.id)}
                      >
                        ← Previous
                      </Button>
                    )}
                    {next && (
                      <Button
                        type="button"
                        size="sm"
                        title={`Go to next section: ${next.title}`}
                        onClick={() => setActiveSection(next.id)}
                        className="bg-foreground text-background hover:bg-foreground/90"
                      >
                        Next →
                      </Button>
                    )}
                    {!next && (
                      <Button
                        type="button"
                        title="Compute and view final results"
                        onClick={() => setStep(3)}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        View Results →
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && !scores && !error && (
        <div className="flex items-center gap-2 py-8">
          <div className="size-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <p className="text-sm text-muted-foreground">Computing scores…</p>
        </div>
      )}

      {step === 3 && scores && (
        <div className="space-y-6">
          {/* Score summary cards with explanations */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-invest-success/5 to-transparent p-5" title="ESG score: additive/subtractive model from a base of 50, clamped 0-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ESG Score</p>
              <p className={`mt-1 text-4xl font-bold ${gradeColor(scores.esg_grade)}`}>{scores.esg_grade}</p>
              <p className="mt-1 text-sm text-muted-foreground">{scores.esg_score} / 100</p>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                Derived from governance, environmental, social, and impact factors.
                Base of 50 ± weighted contributions. A+ = 90+, A = 80+, B+ = 70+, B = 60+, C = 40+, D &lt; 40.
                Higher is better.
              </p>
            </div>
            <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-blue-500/5 to-transparent p-5" title="Investment score: normalised average of 25 factors mapped to 50-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Investment Score</p>
              <p className={`mt-1 text-4xl font-bold ${gradeColor(scores.investment_grade)}`}>
                {scores.investment_grade ?? "—"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {scores.investment_score != null ? `${scores.investment_score} / 100` : "Not computed (all factors skipped)"}
              </p>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                Equal-weight average of up to 27 normalised factors (financial, market, tech, team, legal, risk;
                plus AI and GHG intensity where included), mapped to a 50–100 scale. Skipped factors are omitted and
                the mean is renormalised. A+ = 90+, A = 80+, B+ = 70+. Inverse factors flip the scale.
              </p>
            </div>
            <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-purple-500/5 to-transparent p-5" title="AI Responsibility: weighted composite of 9 AI-specific factors, 0-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Responsibility</p>
              <p className="mt-1 text-4xl font-bold text-purple-600">{scores.ai_responsibility.toFixed(0)}</p>
              <p className="mt-1 text-sm text-muted-foreground">of 100</p>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                Weighted composite: dual-use (20%), weaponisation (15%), AI governance (12%),
                RBC (10%), data ethics (10%), bias (10% inv.), privacy (8%), robustness (8%), safety (7%).
                Used as the X-axis of the research quadrant. 70+ is good.
              </p>
            </div>
            <div className="rounded-xl border border-invest-earth/50 bg-gradient-to-br from-invest-warning/5 to-transparent p-5" title="Research quadrant placement based on AI responsibility (X) vs investment score (Y)">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quadrant</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{scores.research_quadrant}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Legacy: {scores.legacy_quadrant?.label}
              </p>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                AI Resp (X) vs Inv Score (Y). Win-win = both high (target). Impact-first = high resp / lower inv.
                Caution = low resp / high inv. Decline = both low. Insufficient data = no investment score.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column: vote bars, forest, pros/cons */}
            <div className="space-y-5">
              <Card className="border-invest-earth/50">
                <CardHeader>
                  <CardTitle className="text-base" title="Vote split derived from the ESG score">Invest / Watch / Skip</CardTitle>
                </CardHeader>
                <CardContent>
                  <VoteBars votes={scores.votes} />
                </CardContent>
              </Card>

              <Card className="border-invest-earth/50">
                <CardHeader>
                  <CardTitle className="text-base" title="Visual representation of 500 votes as coloured dots">500-Tree Forest</CardTitle>
                </CardHeader>
                <CardContent>
                  {preview?.forest_colors && <Forest colors={preview.forest_colors} />}
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-invest-success" /> Invest
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-invest-warning" /> Watch
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-invest-danger" /> Skip
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-green-600/30 bg-green-600/5">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-700" title="Key strengths identified from the factor scores">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">{scores.pros}</pre>
                  </CardContent>
                </Card>
                <Card className="border-invest-danger/30 bg-invest-danger/5">
                  <CardHeader>
                    <CardTitle className="text-sm text-invest-danger" title="Key risks and concerns identified from the factor scores">Risks & Concerns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">{scores.cons}</pre>
                  </CardContent>
                </Card>
              </div>

              {scores.recommendations && (
                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardHeader>
                    <CardTitle className="text-sm text-blue-600" title="Actionable recommendations based on the evaluation findings">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">{scores.recommendations}</pre>
                  </CardContent>
                </Card>
              )}

              {scores.investment_thesis && (
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardHeader>
                    <CardTitle className="text-sm text-purple-600" title="Generated investment thesis summarising the opportunity">Investment Thesis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs leading-relaxed text-foreground">{scores.investment_thesis}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column: benchmark, quadrant chart, scoring explainer */}
            <div className="space-y-5">
              {benchmarks && benchmarks.count > 0 && (
                <BenchmarkPanel
                  esg={scores.esg_score}
                  investment={scores.investment_score}
                  aiResp={scores.ai_responsibility}
                  benchmarks={benchmarks}
                />
              )}

              <QuadrantChart
                ai={scores.ai_responsibility}
                inv={scores.investment_score}
                label={scores.research_quadrant}
                company={companyName}
                benchmarks={benchmarks?.companies}
              />

              {/* Scoring formula explanation */}
              <Card className="border-invest-earth/50">
                <CardHeader>
                  <CardTitle className="text-base" title="Detailed explanation of how each score is computed">How Scoring Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-xs text-muted-foreground">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">ESG Score (0–100)</p>
                    <p>
                      Starts at a base of 50. Each governance, environmental, social, and impact factor
                      adds or subtracts points based on its weight. Positive factors (strong policies,
                      energy efficiency, societal benefit) increase the score; negative factors (dual-use risk,
                      water intensity, controversies) decrease it. The exclusion flag zeroes the entire score.
                      Final result is clamped to 0–100.
                    </p>
                    <div className="rounded-md bg-muted/60 px-3 py-2 text-[11px]">
                      ESG = clamp(50 + Σ positive contributions − Σ negative penalties, 0, 100)
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      <span className="font-medium text-foreground">Why these weights?</span>{" "}
                      The additive/subtractive point system draws from the{" "}
                      <a href="https://mneguidelines.oecd.org/mneguidelines/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">OECD RBC Guidelines</a>{" "}
                      for governance factors, the{" "}
                      <a href="https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en" target="_blank" rel="noreferrer" className="underline hover:text-foreground">EU Taxonomy</a>{" "}
                      for environmental factors, and the{" "}
                      <a href="https://www.ohchr.org/en/publications/reference-publications/guiding-principles-business-and-human-rights" target="_blank" rel="noreferrer" className="underline hover:text-foreground">UN Guiding Principles</a>{" "}
                      for social/human-rights penalties.
                      Each factor&apos;s individual weight (e.g. RBC policy at 22 pts, dual-use at −28 pts) is
                      calibrated to the materiality ranking in its source framework — higher materiality = higher
                      weight. See each factor card&apos;s &quot;Derivation&quot; section for the specific rationale.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Investment Score (50–100)</p>
                    <p>
                      Averages 27 normalised 1–5 sliders covering financial, market, technology, team, legal,
                      and risk dimensions. Normal factors use (value−1)/4; inverse factors (where higher = worse)
                      use (5−value)/4. The average is mapped to a 50–100 scale.
                    </p>
                    <div className="rounded-md bg-muted/60 px-3 py-2 text-[11px]">
                      Inv = 50 + 50 × (1/N) × Σ norm(factor_i), where norm = (v−1)/4 or (5−v)/4 for inverse
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      <span className="font-medium text-foreground">Why equal weights?</span>{" "}
                      Investment factors use an equal-weight average because standard VC due-diligence practice
                      ({" "}
                      <a href="https://nvca.org/model-legal-documents/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">NVCA</a>,{" "}
                      <a href="https://ilpa.org/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">ILPA</a>)
                      treats each diligence dimension as independently material. Inverse factors (customer
                      concentration, key-person dependency, litigation, concentration risk) flip the scale
                      because higher values represent worse outcomes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">AI Responsibility (0–100)</p>
                    <p>
                      Weighted composite of 10 factors: dual-use risk (20 %), weaponisation (15 %), AI governance (12 %),
                      RBC policy (10 %), data ethics (9 %), algorithmic bias (9 %, inverse), data privacy (7 %),
                      model robustness (7 %), safety testing (6 %), and explainability (5 %). Used as the X-axis of the research quadrant.
                    </p>
                    <div className="rounded-md bg-muted/60 px-3 py-2 text-[11px]">
                      AI Resp = Σ(weight_i × norm(factor_i)) × 100, weights sum to 100 %
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      <span className="font-medium text-foreground">Why these component weights?</span>{" "}
                      The weights follow the{" "}
                      <a href="https://artificialintelligenceact.eu/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">EU AI Act</a>{" "}
                      risk hierarchy: dual-use/weaponisation (highest risk tier) carry 35 % combined,
                      governance and ethics factors carry 32 %, and technical safeguards carry 23 %. The{" "}
                      <a href="https://airc.nist.gov/home" target="_blank" rel="noreferrer" className="underline hover:text-foreground">NIST AI RMF</a>{" "}
                      MAP-MEASURE-MANAGE-GOVERN taxonomy informed the factor groupings.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Research Quadrant</p>
                    <p>
                      Maps AI Responsibility (X) vs. Investment Score (Y). Win-win = both high, Impact-first = high
                      responsibility / low investment, Caution = low responsibility / high investment,
                      Decline = both low. The target is the Win-win quadrant.
                    </p>
                    <div className="rounded-md bg-muted/60 px-3 py-2 text-[11px]">
                      Quadrant = f(AI Resp ≷ 50, Inv Score ≷ 75)
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      <span className="font-medium text-foreground">Threshold rationale:</span>{" "}
                      The midpoint split (50 for AI Responsibility, 75 for Investment) reflects that responsible
                      AI is a minimum bar (not aspirational), while investment attractiveness must exceed the
                      midpoint of its compressed 50–100 range to justify capital allocation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions card — below the two-column grid */}
          <Card className="border-invest-earth/50">
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  title="Save this evaluation to the database"
                  onClick={saveEvaluation}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Save evaluation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  title="Download the evaluation as a JSON file"
                  onClick={downloadJson}
                >
                  Export JSON
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  title="Go back and edit the due-diligence factor inputs"
                  onClick={() => setStep(2)}
                >
                  Edit factors
                </Button>
                
              </div>
              {saveStatus && (
                <p className="text-sm text-muted-foreground">
                  {saveStatus}{" "}
                  {savedId && (
                    <Link
                      href={`/evaluations/${savedId}`}
                      className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                      View saved evaluation →
                    </Link>
                  )}
                </p>
              )}
              <div className="border-t border-border pt-3">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  ← Back to dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
