"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PILLARS = [
  {
    title: "Governance",
    summary:
      "Board quality, diversity, leadership accountability, whistleblower culture, audit rigour, and AI oversight — normalised from policy scores and structured governance sliders.",
    tags: ["Policy mix", "Board & CEO", "Whistleblower", "Audit", "AI governance"],
  },
  {
    title: "Transparency & model governance",
    summary:
      "Explainability, disclosure posture, data ethics, model robustness, safety testing, and algorithmic bias (inverted so higher bias reduces the pillar).",
    tags: ["Explainability", "Disclosure", "Robustness", "Bias ↓", "Safety tests"],
  },
  {
    title: "Privacy & data security",
    summary:
      "Privacy practices, cyber resilience, data quality, and regulatory alignment — framed around GDPR-style expectations and ISO / SOC narratives in due diligence.",
    tags: ["Privacy", "Cyber", "Data quality", "Compliance"],
  },
  {
    title: "Environmental impact",
    summary:
      "Energy, circularity, GHG, biodiversity, renewables share, intensity metrics, water stress (inverted intensity), and CRM-style controversy flags.",
    tags: ["Energy", "GHG", "Water ↓", "Biodiversity", "CRM flag"],
  },
] as const;

export function CompareMetricDefinitions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PILLARS.map((p) => (
        <Card key={p.title} className="border-invest-earth/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">{p.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p className="leading-relaxed">{p.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground/90"
                >
                  {t}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
