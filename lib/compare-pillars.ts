/**
 * Four-axis pillar scores (0–100) for compare / benchmark views.
 *
 * Keep in sync with: projects/invest-nl/backend/app/services/compare_pillars.py
 */

export type PillarScores = {
  governance: number | null;
  transparency: number | null;
  privacy: number | null;
  environmental: number | null;
};

const STATUS_NA = "na";
const STATUS_NO_INFO = "no_info";

export function isSkippedStatus(st: string | null | undefined): boolean {
  return st === STATUS_NA || st === STATUS_NO_INFO;
}

export function unpackInputsPayload(raw: Record<string, unknown>): {
  values: Record<string, unknown>;
  factorStatus: Record<string, string>;
} {
  const vals = raw.values;
  if (vals && typeof vals === "object" && !Array.isArray(vals)) {
    const status = raw.factor_status;
    const outStatus: Record<string, string> = {};
    if (status && typeof status === "object" && !Array.isArray(status)) {
      for (const [k, v] of Object.entries(status)) {
        if (typeof k === "string") outStatus[k] = String(v);
      }
    }
    return { values: { ...(vals as Record<string, unknown>) }, factorStatus: outStatus };
  }
  return { values: { ...raw }, factorStatus: {} };
}

const DEFAULTS: Record<string, number> = {
  pol: 72,
  bdiv: 40,
  ceo: 0,
  whistleblower: 3,
  audit_quality: 3,
  ai_governance: 3,
  transparency: 3,
  explainability: 3,
  data_ethics: 3,
  model_robustness: 3,
  algo_bias: 2,
  safety_testing: 3,
  data_privacy: 3,
  cybersecurity: 3,
  data_quality: 3,
  regulatory_compliance: 3,
  egy: 3,
  circ: 3,
  ghg: 3,
  biodiversity: 3,
  renewable_pct: 3,
  ghg_intensity: 3,
  wat: 2,
  crm: 0,
};

function skipped(status: Record<string, string>, key: string): boolean {
  return isSkippedStatus(status[key]);
}

function f(v: Record<string, unknown>, key: string): number {
  const d = DEFAULTS[key] ?? 3;
  const x = v[key];
  if (x === null || x === undefined) return d;
  return Number(x);
}

function i(v: Record<string, unknown>, key: string): number {
  const d = Math.trunc(DEFAULTS[key] ?? 0);
  const x = v[key];
  if (x === null || x === undefined) return d;
  return Math.trunc(Number(x));
}

function slider0_100(v: Record<string, unknown>, status: Record<string, string>, key: string): number | null {
  if (skipped(status, key)) return null;
  const val = f(v, key);
  return ((val - 1) / 4) * 100;
}

function sliderInv0_100(v: Record<string, unknown>, status: Record<string, string>, key: string): number | null {
  if (skipped(status, key)) return null;
  const val = f(v, key);
  return ((5 - val) / 4) * 100;
}

function mean(parts: number[]): number | null {
  if (!parts.length) return null;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

/** Same thresholds as backend `score_to_grade` (scoring.py). */
export function scoreToGrade(s: number | null | undefined): string | null {
  if (s == null || Number.isNaN(s)) return null;
  const x = Math.round(s);
  if (x >= 90) return "A+";
  if (x >= 80) return "A";
  if (x >= 72) return "B+";
  if (x >= 62) return "B";
  if (x >= 52) return "C+";
  if (x >= 42) return "C";
  if (x >= 30) return "D";
  return "F";
}

export function pillarBandLabel(score: number | null | undefined): string | null {
  if (score == null || Number.isNaN(score)) return null;
  if (score >= 70) return "Strong";
  if (score >= 45) return "Moderate";
  return "Weak";
}

const PILLAR_LABELS: Record<keyof PillarScores, string> = {
  governance: "Governance",
  transparency: "Transparency",
  privacy: "Privacy",
  environmental: "Environmental",
};

export function strengthGapFromPillars(p: PillarScores): { strength: string | null; gap: string | null } {
  const entries = (Object.keys(PILLAR_LABELS) as (keyof PillarScores)[])
    .map((k) => ({ k, v: p[k] }))
    .filter((x): x is { k: keyof PillarScores; v: number } => x.v != null && !Number.isNaN(x.v));
  if (entries.length < 2) return { strength: null, gap: null };
  let maxK = entries[0].k;
  let minK = entries[0].k;
  let maxV = entries[0].v;
  let minV = entries[0].v;
  for (const e of entries) {
    if (e.v > maxV) {
      maxV = e.v;
      maxK = e.k;
    }
    if (e.v < minV) {
      minV = e.v;
      minK = e.k;
    }
  }
  return {
    strength: PILLAR_LABELS[maxK],
    gap: PILLAR_LABELS[minK],
  };
}

export function compositeGradeFromPillars(p: PillarScores): string | null {
  const vals = [p.governance, p.transparency, p.privacy, p.environmental].filter(
    (x): x is number => x != null && !Number.isNaN(x),
  );
  if (!vals.length) return null;
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  return scoreToGrade(m);
}

export function computePillarScores(rawInputs: Record<string, unknown> | null | undefined): PillarScores {
  const raw = rawInputs && typeof rawInputs === "object" ? rawInputs : {};
  const { values: v, factorStatus: status } = unpackInputsPayload(raw);

  const govParts: number[] = [];
  if (!skipped(status, "pol")) govParts.push(f(v, "pol"));
  if (!skipped(status, "bdiv")) govParts.push(f(v, "bdiv"));
  if (!skipped(status, "ceo")) govParts.push((1 - i(v, "ceo")) * 100);
  for (const k of ["whistleblower", "audit_quality", "ai_governance"] as const) {
    const p = slider0_100(v, status, k);
    if (p != null) govParts.push(p);
  }

  const transParts: number[] = [];
  for (const k of ["transparency", "explainability", "data_ethics", "model_robustness", "safety_testing"] as const) {
    const p = slider0_100(v, status, k);
    if (p != null) transParts.push(p);
  }
  {
    const p = sliderInv0_100(v, status, "algo_bias");
    if (p != null) transParts.push(p);
  }

  const privParts: number[] = [];
  for (const k of ["data_privacy", "cybersecurity", "data_quality", "regulatory_compliance"] as const) {
    const p = slider0_100(v, status, k);
    if (p != null) privParts.push(p);
  }

  const envParts: number[] = [];
  for (const k of ["egy", "circ", "ghg", "biodiversity", "renewable_pct", "ghg_intensity"] as const) {
    const p = slider0_100(v, status, k);
    if (p != null) envParts.push(p);
  }
  {
    const p = sliderInv0_100(v, status, "wat");
    if (p != null) envParts.push(p);
  }
  if (!skipped(status, "crm")) envParts.push((1 - i(v, "crm")) * 100);

  return {
    governance: mean(govParts),
    transparency: mean(transParts),
    privacy: mean(privParts),
    environmental: mean(envParts),
  };
}
