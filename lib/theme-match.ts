import type { InvestThemeId } from "@/lib/themes";

const KEYWORDS: { theme: InvestThemeId; words: string[] }[] = [
  { theme: "AGRIFOOD", words: ["food", "protein", "farm", "crop", "cultivated", "meat", "agri"] },
  { theme: "BIOBASED", words: ["circular", "recycle", "bio", "textile", "leather", "battery", "water"] },
  { theme: "TECH", words: ["chip", "semiconductor", "gnss", "photonic", "quantum", "deep tech", "software"] },
  { theme: "ENERGY", words: ["energy", "charging", "ev", "hydrogen", "wind", "solar", "grid"] },
  { theme: "HEALTH", words: ["health", "medtech", "care", "patient", "diagnostic", "therapeutic"] },
];

export function suggestTheme(text: string): InvestThemeId {
  const t = text.toLowerCase();
  let best: InvestThemeId = "TECH";
  let score = 0;
  for (const row of KEYWORDS) {
    let s = 0;
    for (const w of row.words) {
      if (t.includes(w)) s += 1;
    }
    if (s > score) {
      score = s;
      best = row.theme;
    }
  }
  return best;
}
