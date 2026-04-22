export type FactorAnswerStatus = "answered" | "na" | "no_info";

export const FACTOR_STATUS = {
  answered: "answered" as const,
  na: "na" as const,
  no_info: "no_info" as const,
};

export function isSkippedFactorStatus(s: FactorAnswerStatus | undefined): boolean {
  return s === "na" || s === "no_info";
}
