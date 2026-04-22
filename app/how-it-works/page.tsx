import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Decision Lab</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">How the framework works</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Structured questionnaire and scoring for AI-for-good and impact-oriented investments. This page matches
          how the app and API behave today.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evaluation flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Company</strong> — narrative, theme, and profile fields (saved
              with the evaluation; they do not change numeric scores).
            </li>
            <li>
              <strong className="text-foreground">Scope</strong> — ticket, horizon, instrument, etc. (reporting only;
              not used in formulas).
            </li>
            <li>
              <strong className="text-foreground">Due diligence</strong> — all pillars in one step: gatekeeper,
              governance, AI &amp; data, environment, social/safety, SDG impact, then financial through risk/exit.
              ESG-related questions live here together with classic investment DD; there is no separate &quot;ESG
              after DD&quot; step unless you split it for process reasons outside the app.
            </li>
            <li>
              <strong className="text-foreground">Results</strong> — live scores, quadrant, forest, pros/cons, and
              generated text.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Optional factors and N/A</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Investment DD</strong> (financial, market, technology, team, legal,
            risk/exit): each factor can be set to <em>Not applicable</em> or <em>No information available</em>. Those
            rows are <strong>omitted</strong> from the investment score; the remaining answered factors are averaged
            with equal weight. If every investment factor is skipped, the investment score is not computed.
          </p>
          <p>
            <strong className="text-foreground">ESG and responsible-AI indicators</strong> (everything except the
            gatekeeper exclusion flag): you can mark <em>Not applicable</em> or <em>No information</em>. Both are
            treated the same in math: the factor is <strong>excluded</strong> and remaining ESG terms are scaled so
            total importance matches the full framework (renormalisation by term span). The exclusion/sanctions flag
            is always required and cannot be skipped.
          </p>
          <p>
            <strong className="text-foreground">AI responsibility</strong> uses a weighted blend of governance and AI
            risk factors; skipped inputs are removed and weights are renormalised to sum to 1.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scores and weighting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">ESG score (0–100)</p>
            <p className="mt-1">
              Starts at 50. Adds or subtracts fixed linear terms per input (e.g. RBC policy strength, dual-use risk).
              If the exclusion flag is triggered, ESG is forced to 0. When indicators are skipped, contributions from
              the remaining indicators are scaled using each term&apos;s maximum swing so the model stays comparable.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Investment score (50–100 or absent)</p>
            <p className="mt-1">
              Normalised 1–5 sliders: <code className="text-foreground">(v−1)/4</code> for &quot;higher is better&quot;
              factors and <code className="text-foreground">(5−v)/4</code> for inverse factors. The mean of all{" "}
              <em>answered</em> investment keys maps to <code className="text-foreground">50 + 50 × mean</code>.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">AI responsibility (0–100)</p>
            <p className="mt-1">
              Weighted composite (e.g. dual-use, weaponisation, AI governance, data ethics, bias, privacy,
              robustness, safety, explainability, RBC proxy from policy score). Skipped factors drop out and weights
              renormalise.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Votes and quadrant</p>
            <p className="mt-1">
              Invest / Watch / Skip percentages are derived from the <strong>ESG score</strong> only. The research
              quadrant uses AI responsibility (horizontal) vs investment score (vertical), with a midpoint at 50. If
              there is no investment score, the quadrant chart shows an explanatory placeholder instead of a plot.
            </p>
          </div>
          <p className="text-xs">
            The API also returns <code className="text-foreground">feature_weights</code>: for ESG, those numbers
            match the <strong>renormalisation spans</strong> for each named term (plus zeros for factors outside the
            ESG core sum). They are not a separate second scoring engine.
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-sm">
        <Link href="/evaluate" className="font-medium text-foreground underline-offset-4 hover:underline">
          Start an evaluation →
        </Link>
      </p>
    </div>
  );
}
