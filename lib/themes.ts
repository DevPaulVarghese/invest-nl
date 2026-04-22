export const INVEST_THEMES = [
  { id: "AGRIFOOD", label: "Agrifood" },
  { id: "BIOBASED", label: "Biobased & Circular economy" },
  { id: "TECH", label: "Deep tech" },
  { id: "ENERGY", label: "Energy" },
  { id: "HEALTH", label: "Life Sciences & Health" },
  { id: "GENERAL", label: "General" },
] as const;

export type InvestThemeId = (typeof INVEST_THEMES)[number]["id"];

export const FINANCING_FILTERS = [
  { id: "all", label: "All financing" },
  { id: "direct", label: "Direct funding" },
  { id: "indirect", label: "Indirect financing" },
] as const;
