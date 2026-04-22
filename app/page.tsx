import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { AnimatedTagline } from "@/components/invest-nl/animated-tagline";

type EvaluationSummary = {
  id: string;
  title: string;
  company_name: string;
  theme_selected: string;
  quadrant_label: string | null;
  created_at: string;
};

async function loadEvaluations(): Promise<EvaluationSummary[]> {
  try {
    return await apiFetch<EvaluationSummary[]>("/api/evaluations");
  } catch {
    return [];
  }
}

const features = [
  {
    title: "56 Due-Diligence Factors",
    body: "Comprehensive coverage across 12 pillars: governance, AI ethics, environmental, social, financial, market, technology, team, legal, and risk. Each question includes a detailed explanation.",
    accent: "from-invest-success/10",
  },
  {
    title: "Dynamic Scoring Engine",
    body: "ESG score, Investment score, and AI Responsibility index computed in real-time. See exactly how each slider adjustment affects the formulas as you fill in the assessment.",
    accent: "from-blue-500/10",
  },
  {
    title: "Research Quadrant",
    body: "Plot each opportunity on an AI-responsibility vs. investment-attractiveness matrix. Win-win, Impact-first, Caution, or Decline — instant visual classification.",
    accent: "from-purple-500/10",
  },
  {
    title: "500-Tree Forest",
    body: "Visual vote representation: green trees for Invest, amber for Watch, red for Skip. Based on the ESG score distribution and vote-allocation algorithm.",
    accent: "from-invest-warning/10",
  },
  {
    title: "Strategic Themes",
    body: "Map opportunities to investment themes: Agrifood, Biobased & Circular, Deep Tech, Energy, Life Sciences & Health. Auto-suggestion from narrative keywords.",
    accent: "from-theme-primary/10",
  },
];

export default async function HomePage() {
  const evaluations = await loadEvaluations();

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl border border-invest-earth/40 bg-gradient-to-br from-theme-primary/8 via-card to-invest-cloud p-8 sm:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Decision Lab
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Structured framework for
            <br />
            <AnimatedTagline /> investments
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Run comprehensive due-diligence assessments with 56 factors across 12 pillars.
            Each question comes with a detailed explanation, dynamic formula visualization,
            and real-time scoring.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/evaluate"
              className="inline-flex h-10 items-center rounded-lg bg-foreground px-5 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90"
            >
              Start evaluation
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-theme-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 size-60 rounded-full bg-invest-success/5 blur-3xl" />
      </section>

      <section>
        <h2 className="mb-6 text-lg font-bold tracking-tight text-foreground">What&apos;s inside</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-xl border border-invest-earth/40 bg-gradient-to-br ${f.accent} to-card p-5 transition hover:shadow-sm`}
            >
              <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Card className="border-invest-earth/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Evaluations</CardTitle>
            <Link
              href="/evaluate"
              className="inline-flex h-8 items-center rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition hover:bg-foreground/90"
            >
              + New
            </Link>
          </CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved evaluations yet — <Link href="/evaluate" className="font-medium text-muted-foreground underline-offset-4 hover:underline hover:text-foreground">start one</Link> to see results here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-4">Company</th>
                      <th className="pb-2 pr-4">Theme</th>
                      <th className="pb-2 pr-4">Quadrant</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((e) => (
                      <tr key={e.id} className="border-b border-border/40 last:border-0">
                        <td className="py-2.5 pr-4">
                          <Link
                            href={`/evaluations/${e.id}`}
                            className="font-medium text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
                          >
                            {e.company_name}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{e.theme_selected}</td>
                        <td className="py-2.5 pr-4">
                          {e.quadrant_label ? (
                            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                              {e.quadrant_label}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
