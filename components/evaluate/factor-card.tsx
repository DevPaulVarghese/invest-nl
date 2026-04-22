"use client";

import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FactorAnswerStatus } from "@/lib/factor-status";
import { isSkippedFactorStatus } from "@/lib/factor-status";
import type { FactorRow } from "@/lib/factor-rows";
import type { ScoreInputs } from "@/lib/score-types";
import { useState } from "react";

export type FactorAnswerGroup = "gate" | "esg" | "investment";

type Props = {
  row: FactorRow;
  value: number;
  onValueChange: (key: keyof ScoreInputs, value: number) => void;
  answerGroup: FactorAnswerGroup;
  factorStatus: FactorAnswerStatus | undefined;
  onFactorStatusChange: (key: keyof ScoreInputs, status: FactorAnswerStatus) => void;
};

export function FactorCard({
  row,
  value,
  onValueChange,
  answerGroup,
  factorStatus,
  onFactorStatusChange,
}: Props) {
  const [showExplanation, setShowExplanation] = useState(true);
  const skipped = isSkippedFactorStatus(factorStatus);
  const dynamicLabel = skipped ? "— Excluded from score (renormalised)" : row.dynamicResult(value);

  return (
    <div className="flex flex-col rounded-lg border border-border/60 bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground leading-snug">{row.label}</h4>
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="shrink-0 rounded-md border border-border/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {showExplanation ? "Hide" : "Info"}
        </button>
      </div>

      {answerGroup !== "gate" && (
        <div className="mb-3 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {answerGroup === "investment" ? "Optional — investment DD" : "ESG / responsible AI"}
          </p>
          <Select
            value={factorStatus ?? "answered"}
            onValueChange={(v) => onFactorStatusChange(row.key, v as FactorAnswerStatus)}
          >
            <SelectTrigger className="h-8 text-xs" title="How this factor is used in scoring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="answered">Answered (use value below)</SelectItem>
              <SelectItem value="na">Not applicable</SelectItem>
              <SelectItem value="no_info">No information available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {showExplanation && (
        <p className="mb-3 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {row.explanation}
        </p>
      )}

      <div className={`mb-3 ${skipped ? "pointer-events-none opacity-40" : ""}`}>
        {row.type === "slider" && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Slider
                value={[value]}
                min={row.min}
                max={row.max}
                step={row.step}
                onValueChange={(v) => {
                  const n = Array.isArray(v) ? v[0] : v;
                  onValueChange(row.key, n);
                }}
                className="flex-1"
                disabled={skipped}
              />
              <span className="min-w-[3ch] text-right text-sm font-semibold tabular-nums">{value}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{row.min}</span>
              <span>{row.max}</span>
            </div>
          </div>
        )}
        {row.type === "select" && row.options && (
          <Select
            value={String(value)}
            onValueChange={(v) => onValueChange(row.key, Number(v))}
            disabled={skipped}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {row.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Formula</p>
        <p className="text-xs text-muted-foreground">{row.formula}</p>
        <div className="rounded-md bg-muted/60 px-2.5 py-1.5">
          <p className="text-xs font-medium text-foreground">{dynamicLabel}</p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-1 flex-col space-y-1.5 border-t border-border/40 pt-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Derivation</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{row.derivation}</p>

        <div className="mt-auto border-t border-border/40 pt-2">
          <a
            href={row.source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.source.favicon}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0"
              loading="lazy"
            />
            {row.source.label}
          </a>
        </div>
      </div>
    </div>
  );
}
