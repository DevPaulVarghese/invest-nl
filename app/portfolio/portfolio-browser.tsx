"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { INVEST_THEMES } from "@/lib/themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type PortfolioRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  theme: string;
  financing_path: string | null;
  logo_url: string | null;
  detail_path: string | null;
};

export function PortfolioBrowser() {
  const [theme, setTheme] = useState<string>("all");
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams();
    if (theme !== "all") q.set("theme", theme);
    void (async () => {
      try {
        const data = await apiFetch<PortfolioRow[]>(`/api/portfolio?${q.toString()}`);
        setRows(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, [theme]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Topic</p>
          <Select value={theme} onValueChange={(v) => setTheme(v ?? "all")}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="All topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {INVEST_THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error} — start Postgres, run migrations, and seed (see README in repo root if added).
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((c) => (
          <Link key={c.id} href={`/portfolio/${c.slug}`} className="group block">
            <Card className="h-full border-invest-earth bg-invest-cloud/80 transition hover:border-theme-primary">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="relative size-20 overflow-hidden rounded-2xl bg-white p-1">
                    {c.logo_url ? (
                      <Image
                        src={c.logo_url}
                        alt={c.name}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Logo
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-base font-semibold leading-snug group-hover:underline">
                    {c.name}
                  </h2>
                  {c.description && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
                  )}
                </div>
                <Badge className="w-fit bg-foreground text-background">
                  {INVEST_THEMES.find((t) => t.id === c.theme)?.label ?? c.theme}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
