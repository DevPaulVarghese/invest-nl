"use client";

import { apiBase } from "@/lib/api";
import { useEffect, useState } from "react";

type Pillar = { id: string; title: string; description: string; factor_count?: number };

type FrameworkPayload = {
  version?: string;
  description?: string;
  pillars?: Pillar[];
};

export function FrameworkPanel() {
  const [data, setData] = useState<FrameworkPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`${apiBase()}/api/framework`, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = (await res.json()) as FrameworkPayload;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load framework (is the API running?)");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (!data?.pillars?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading due-diligence framework from the API…
      </p>
    );
  }

  return (
    <details open className="group rounded-xl border border-invest-earth bg-card/60">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-invest-clay marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          Framework v{data.version ?? "1"} — {data.pillars.length} pillars, 56 factors
          <span className="text-xs font-normal text-muted-foreground group-open:hidden">
            — click to expand
          </span>
          <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
            — click to collapse
          </span>
        </span>
      </summary>
      <div className="border-t border-invest-earth px-4 pb-4 pt-2">
        {data.description && (
          <p className="mb-3 text-sm text-muted-foreground">{data.description}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.pillars.map((p) => (
            <div key={p.id} className="rounded-lg border border-border/40 bg-muted/30 p-3">
              <p className="text-xs font-semibold text-foreground">{p.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{p.description}</p>
              {p.factor_count != null && (
                <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                  {p.factor_count} factor{p.factor_count !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
