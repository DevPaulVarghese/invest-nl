import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiBase } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

type ScopeJson = {
  ticket_m_eur?: number;
  instrument?: string;
  horizon_years?: number;
  co_investor?: string;
  staging?: string;
  expected_irr?: number;
  use_of_proceeds?: string;
  founding_date?: string;
  num_employees?: number;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  company_url?: string;
};

type ScoresJson = {
  esg_score?: number;
  esg_grade?: string;
  investment_score?: number;
  investment_grade?: string;
  ai_responsibility?: number;
  research_quadrant?: string;
  recommendations?: string;
  investment_thesis?: string;
  votes?: { invest: number; watch: number; skip: number };
};

type EvaluationDetail = {
  id: string;
  title: string;
  company_name: string;
  theme_selected: string;
  company_narrative: string | null;
  scope_json: ScopeJson | null;
  inputs_json: Record<string, unknown>;
  scores_json: ScoresJson | null;
  pros: string | null;
  cons: string | null;
  quadrant_label: string | null;
  created_at: string;
};

function DetailRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/30 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function ScoreCard({ label, grade, score, color }: { label: string; grade: string; score: number; color: string }) {
  return (
    <div className={`rounded-xl border border-border/50 bg-gradient-to-br ${color} p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{grade}</p>
      <p className="text-xs text-muted-foreground">{score} / 100</p>
    </div>
  );
}

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`${apiBase()}/api/evaluations/${id}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`Failed to load evaluation: ${res.status}`);
  }
  const ev = (await res.json()) as EvaluationDetail;
  const scope = ev.scope_json;
  const scores = ev.scores_json;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{ev.company_name}</span>
      </nav>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{ev.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(ev.created_at).toLocaleString()} · Theme: {ev.theme_selected}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Profile */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <DetailRow label="Company Name" value={ev.company_name} />
            <DetailRow label="Theme" value={ev.theme_selected} />
            {scope?.founding_date && (
              <DetailRow label="Founded" value={new Date(scope.founding_date).toLocaleDateString()} />
            )}
            <DetailRow label="Employees" value={scope?.num_employees} />
            {scope?.company_url && (
              <div className="flex items-baseline justify-between gap-4 border-b border-border/30 py-2">
                <span className="text-xs text-muted-foreground">Website</span>
                <a
                  href={scope.company_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {scope.company_url.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            <DetailRow label="Contact Person" value={scope?.contact_person} />
            {scope?.contact_email && (
              <div className="flex items-baseline justify-between gap-4 border-b border-border/30 py-2">
                <span className="text-xs text-muted-foreground">Email</span>
                <a
                  href={`mailto:${scope.contact_email}`}
                  className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {scope.contact_email}
                </a>
              </div>
            )}
            <DetailRow label="Telephone" value={scope?.contact_phone} />
          </CardContent>
        </Card>

        {/* Investment Scope */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Investment Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {scope?.ticket_m_eur != null && (
              <DetailRow label="Ticket Size" value={`€${scope.ticket_m_eur}M`} />
            )}
            <DetailRow label="Instrument" value={scope?.instrument} />
            {scope?.horizon_years != null && (
              <DetailRow label="Horizon" value={`${scope.horizon_years} years`} />
            )}
            <DetailRow label="Co-Investor" value={scope?.co_investor} />
            <DetailRow label="Staging" value={scope?.staging} />
            {scope?.expected_irr != null && (
              <DetailRow label="Expected IRR" value={`${scope.expected_irr}%`} />
            )}
            <DetailRow label="Use of Proceeds" value={scope?.use_of_proceeds} />
          </CardContent>
        </Card>
      </div>

      {ev.company_narrative && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Narrative</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {ev.company_narrative}
          </CardContent>
        </Card>
      )}

      {scores && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {scores.esg_grade && scores.esg_score != null && (
              <ScoreCard label="ESG Score" grade={scores.esg_grade} score={scores.esg_score} color="from-invest-success/5" />
            )}
            {scores.investment_grade && scores.investment_score != null && (
              <ScoreCard label="Investment Score" grade={scores.investment_grade} score={scores.investment_score} color="from-blue-500/5" />
            )}
            {scores.ai_responsibility != null && (
              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-purple-500/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Responsibility</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{scores.ai_responsibility.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">of 100</p>
              </div>
            )}
            {scores.research_quadrant && (
              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-invest-warning/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quadrant</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{scores.research_quadrant}</p>
                {ev.quadrant_label && ev.quadrant_label !== scores.research_quadrant && (
                  <p className="text-xs text-muted-foreground">{ev.quadrant_label}</p>
                )}
              </div>
            )}
          </div>

          {scores.votes && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Vote Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  {(["invest", "watch", "skip"] as const).map((key) => {
                    const pct = scores.votes![key];
                    const colors = { invest: "bg-invest-success", watch: "bg-invest-warning", skip: "bg-invest-danger" };
                    return (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className={`inline-block size-3 rounded-full ${colors[key]}`} />
                        <span className="capitalize text-muted-foreground">{key}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {(ev.pros || ev.cons) && (
        <div className="grid gap-4 md:grid-cols-2">
          {ev.pros && (
            <Card className="border-green-600/30 bg-green-600/5">
              <CardHeader>
                <CardTitle className="text-sm text-green-700 dark:text-green-500">Strengths</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                {ev.pros}
              </CardContent>
            </Card>
          )}
          {ev.cons && (
            <Card className="border-invest-danger/30 bg-invest-danger/5">
              <CardHeader>
                <CardTitle className="text-sm text-invest-danger">Risks & Concerns</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                {ev.cons}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {scores?.recommendations && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-sm text-blue-600">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">{scores.recommendations}</pre>
          </CardContent>
        </Card>
      )}

      {scores?.investment_thesis && (
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="text-sm text-purple-600">Investment Thesis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-foreground">{scores.investment_thesis}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link
          href="/evaluate"
          className="inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:bg-foreground/90"
        >
          New evaluation
        </Link>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
