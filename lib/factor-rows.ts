import type { ScoreInputs } from "@/lib/score-types";

export type FactorSource = {
  label: string;
  url: string;
  favicon: string;
};

export type FactorRow = {
  key: keyof ScoreInputs;
  label: string;
  explanation: string;
  formula: string;
  derivation: string;
  source: FactorSource;
  dynamicResult: (value: number) => string;
  type: "slider" | "select";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
};

export type FactorSection = {
  id: string;
  title: string;
  definition: string;
  rows: FactorRow[];
};

const fmt = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2);
const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

export const FACTOR_SECTIONS: FactorSection[] = [
  {
    id: "gatekeeper",
    title: "Gatekeeper & Eligibility",
    definition:
      "Hard exclusion criteria that must be cleared before any quantitative scoring begins. " +
      "Covers sanctions lists, exclusion policies (weapons, tobacco, fossil fuels), and " +
      "compliance with the fund's responsible investment charter. A triggered gate forces " +
      "the ESG score to zero and the recommendation to Skip.",
    rows: [
      {
        key: "excl",
        label: "Exclusion & sanctions flag",
        explanation:
          "Does the company appear on any exclusion list (OFAC, EU sanctions, UN Global Compact violations) " +
          "or operate in a sector that the fund's charter prohibits (e.g. controversial weapons, thermal coal)? " +
          "Setting this to 1 (Ineligible) immediately zeroes the ESG score and triggers a dominant Skip vote.",
        formula: "Binary gate: if excl = 1 → ESG score = 0, Skip ≈ 95 %.",
        derivation:
          "A binary gate rather than a scaled penalty because EU sanctions regulations (Regulation 2580/2001) " +
          "and OFAC compliance are legally binding — there is no partial compliance. Any match on a sanctions " +
          "list makes the investment legally impermissible regardless of other merits.",
        source: {
          label: "EU Sanctions Map",
          url: "https://www.sanctionsmap.eu/",
          favicon: fav("sanctionsmap.eu"),
        },
        dynamicResult: (v) =>
          v === 1
            ? "⛔ BLOCKED — ESG forced to 0, dominant Skip vote"
            : "✓ Passed — quantitative scoring proceeds",
        type: "select",
        options: [
          { value: "0", label: "0 — Compliant / not on any list" },
          { value: "1", label: "1 — Ineligible / sanctioned" },
        ],
      },
    ],
  },

  {
    id: "governance",
    title: "Corporate Governance",
    definition:
      "Evaluates the quality and robustness of the company's corporate governance structures: " +
      "board composition and diversity, responsible business conduct (RBC) policies, " +
      "internal controls, whistleblower protections, and transparency of reporting. " +
      "Strong governance reduces operational and reputational risk and signals long-term resilience.",
    rows: [
      {
        key: "pol",
        label: "RBC / Responsible Business Conduct policy completeness",
        explanation:
          "Rate the breadth and depth of the company's responsible business conduct policies on a 0–100 scale. " +
          "This covers anti-corruption, environmental policy, labour standards, supply-chain code of conduct, " +
          "and human rights due diligence. A score of 100 means all OECD RBC guidelines are fully addressed with " +
          "evidence of implementation; 0 means no documented policies exist.",
        formula: "+(pol / 100) × 22 points added to ESG core (base 50).",
        derivation:
          "Carries the highest single governance weight (22 pts) because OECD research across 48 countries shows " +
          "that RBC policy breadth is the strongest leading indicator of ESG incident prevention. The 0–100 " +
          "linear scale maps directly to the percentage of OECD RBC guideline chapters fully addressed.",
        source: {
          label: "OECD MNE Guidelines",
          url: "https://mneguidelines.oecd.org/mneguidelines/",
          favicon: fav("oecd.org"),
        },
        dynamicResult: (v) => {
          const pts = (v / 100) * 22;
          return `${fmt(pts)} ESG pts — (${v}/100) × 22`;
        },
        type: "slider",
        min: 0,
        max: 100,
        step: 1,
      },
      {
        key: "bdiv",
        label: "Board diversity (% women or underrepresented groups)",
        explanation:
          "Percentage of the board of directors that consists of women or underrepresented groups. " +
          "Research consistently shows diverse boards make better strategic decisions and reduce groupthink. " +
          "The Dutch Corporate Governance Code recommends at least 33 % gender diversity on boards.",
        formula: "+(bdiv / 100) × 10 points added to ESG core.",
        derivation:
          "10 pts maximum reflects the EU Women on Boards Directive (2022/2381), which requires 40 % of " +
          "non-executive directors to be the underrepresented sex by 2026. Linear scaling from 0–100 % maps " +
          "percentage completion toward this target.",
        source: {
          label: "Dutch Corporate Governance Code",
          url: "https://www.mccg.nl/",
          favicon: fav("mccg.nl"),
        },
        dynamicResult: (v) => {
          const pts = (v / 100) * 10;
          return `${fmt(pts)} ESG pts — (${v}/100) × 10`;
        },
        type: "slider",
        min: 0,
        max: 100,
        step: 1,
      },
      {
        key: "ceo",
        label: "Leadership diversity bonus",
        explanation:
          "Does the C-suite include gender or ethnic diversity at the CEO / COO / CFO level? " +
          "This binary bonus rewards companies that go beyond board-level diversity into executive leadership.",
        formula: "+ceo × 4 points added to ESG core (0 or 4).",
        derivation:
          "Binary 4-point bonus based on McKinsey's 'Diversity Wins' finding that companies with ethnically " +
          "diverse executive teams are 36 % more likely to achieve above-average profitability. A small " +
          "additive bonus rather than a scaled weight because C-suite diversity is binary in practice.",
        source: {
          label: "McKinsey Diversity Wins",
          url: "https://www.mckinsey.com/featured-insights/diversity-and-inclusion/diversity-wins-how-inclusion-matters",
          favicon: fav("mckinsey.com"),
        },
        dynamicResult: (v) => {
          const pts = v * 4;
          return `${fmt(pts)} ESG pts`;
        },
        type: "select",
        options: [
          { value: "0", label: "0 — No executive diversity bonus" },
          { value: "1", label: "1 — Diversity in C-suite" },
        ],
      },
      {
        key: "whistleblower",
        label: "Whistleblower & grievance mechanism",
        explanation:
          "Rate the maturity of the company's whistleblower and grievance mechanism (1–5). " +
          "1 = no mechanism; 3 = basic hotline exists but limited follow-up; " +
          "5 = independent, anonymous channel with documented case handling, board-level reporting, and non-retaliation policy. " +
          "Required under the EU Whistleblower Directive for companies with 50+ employees.",
        formula: "+((whistleblower − 1) / 4) × 4 points to ESG core.",
        derivation:
          "4 pts reflects the EU Whistleblower Directive (2019/1937) mandatory requirements for internal " +
          "reporting channels. The 1–5 maturity scale maps from non-compliance (1) to best-practice " +
          "implementation (5) as defined by Transparency International's assessment framework.",
        source: {
          label: "EU Whistleblower Directive",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L1937",
          favicon: fav("europa.eu"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 4;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 4`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "audit_quality",
        label: "Audit & internal controls quality",
        explanation:
          "Rate the quality of internal financial controls, audit processes, and risk management (1–5). " +
          "1 = no formal audit process; 3 = annual external audit with basic internal controls; " +
          "5 = Big-4 audit, SOC-2/ISO-27001 certified, active internal audit function, audit committee with independent chair.",
        formula: "+((audit_quality − 1) / 4) × 3 points to ESG core.",
        derivation:
          "3 pts (lower than RBC policy) because audit quality is a supporting control rather than a direct " +
          "ESG signal. Weight aligned with the Institute of Internal Auditors' (IIA) International Professional " +
          "Practices Framework, which positions internal audit as the third line of defence.",
        source: {
          label: "Institute of Internal Auditors",
          url: "https://www.theiia.org/",
          favicon: fav("theiia.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 3;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 3`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "transparency",
        label: "Reporting & disclosure transparency",
        explanation:
          "How transparent is the company in its reporting to investors and stakeholders (1–5)? " +
          "1 = minimal disclosure, no sustainability reporting; 3 = annual report with some ESG data; " +
          "5 = integrated reporting (GRI / CSRD aligned), real-time dashboards, open data on key metrics. " +
          "The EU Corporate Sustainability Reporting Directive (CSRD) mandates detailed ESG disclosure.",
        formula: "+((transparency − 1) / 4) × 4 points to ESG core.",
        derivation:
          "4 pts aligned with the CSRD's principle that transparency enables market discipline. The directive " +
          "(Directive 2022/2464) mandates detailed ESG disclosure for companies meeting size thresholds, using " +
          "the European Sustainability Reporting Standards (ESRS) as the reporting framework.",
        source: {
          label: "EU CSRD",
          url: "https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en",
          favicon: fav("europa.eu"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 4;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 4`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "ai_governance",
    title: "AI & Data Governance",
    definition:
      "Assesses the company's maturity in governing AI systems and data practices. " +
      "Covers AI oversight structures, ethical frameworks, bias monitoring, privacy compliance (GDPR / AI Act), " +
      "and model robustness testing. Critical for AI-for-good proposals where the technology itself " +
      "must be trustworthy, fair, and transparent per the EU AI Act risk tiers.",
    rows: [
      {
        key: "ai_governance",
        label: "AI governance maturity",
        explanation:
          "Rate the overall maturity of AI governance within the company (1–5). " +
          "1 = no AI governance framework; 3 = documented AI principles, ad-hoc review process; " +
          "5 = dedicated AI ethics board, model risk management framework, regular audits, " +
          "alignment with EU AI Act requirements, human-in-the-loop for high-risk applications.",
        formula: "Normalised 1–5 → feeds Investment score average & AI-responsibility axis (12 % weight).",
        derivation:
          "12 % of the AI responsibility composite — the single largest AI-axis weight — because the EU AI Act " +
          "(Regulation 2024/1689) positions governance as the foundation for all other AI risk management " +
          "activities. Article 9 requires a risk management system proportionate to the level of risk.",
        source: {
          label: "EU AI Act",
          url: "https://artificialintelligenceact.eu/",
          favicon: fav("artificialintelligenceact.eu"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} → Inv avg + AI resp (12 %)`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "data_ethics",
        label: "Data ethics framework",
        explanation:
          "Does the company have a data ethics framework that guides data collection, usage, and sharing (1–5)? " +
          "1 = no framework; 3 = privacy policy exists, basic consent management; " +
          "5 = comprehensive data ethics board, purpose limitation enforced, data minimization, " +
          "regular impact assessments, transparent data-sharing agreements.",
        formula: "+((data_ethics − 1) / 4) × 4 ESG pts; feeds AI-responsibility axis (10 %).",
        derivation:
          "Dual-score factor: 4 ESG pts + 10 % AI responsibility. The OECD Principles on AI (2019, updated 2024) " +
          "recommend that AI actors implement mechanisms for responsible stewardship of trustworthy AI, including " +
          "data governance that respects privacy, fairness, and transparency.",
        source: {
          label: "OECD AI Principles",
          url: "https://oecd.ai/en/ai-principles",
          favicon: fav("oecd.org"),
        },
        dynamicResult: (v) => {
          const esg = ((v - 1) / 4) * 4;
          const ai = ((v - 1) / 4) * 10;
          return `${fmt(esg)} ESG pts | ${ai.toFixed(1)} % AI resp weight`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "algo_bias",
        label: "Algorithmic bias risk",
        explanation:
          "How significant is the risk of algorithmic bias in the company's AI systems (1–5)? " +
          "1 = negligible (non-decision systems); 3 = moderate (some user-facing decisions with bias testing); " +
          "5 = severe (high-stakes decisions on individuals with no bias auditing). " +
          "Higher values represent WORSE risk and reduce scores.",
        formula: "−((algo_bias − 1) / 4) × 4 ESG pts; inverse feeds AI-responsibility axis (10 %).",
        derivation:
          "Inverse-weighted (higher value = penalty) because the NIST AI Risk Management Framework (AI RMF 1.0) " +
          "identifies harmful bias as a core AI risk requiring systematic measurement and mitigation. " +
          "4 pts ESG penalty + 10 % inverse AI responsibility reflects that unaddressed bias can cause " +
          "discriminatory harm at scale.",
        source: {
          label: "NIST AI RMF",
          url: "https://airc.nist.gov/home",
          favicon: fav("nist.gov"),
        },
        dynamicResult: (v) => {
          const esg = -((v - 1) / 4) * 4;
          return `${fmt(esg)} ESG pts — higher bias risk = penalty`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "data_privacy",
        label: "Data privacy & GDPR compliance",
        explanation:
          "Rate the company's data privacy and GDPR compliance posture (1–5). " +
          "1 = no DPO, no privacy impact assessments, unclear data processing; " +
          "3 = DPO appointed, basic DPIA process, cookie consent in place; " +
          "5 = privacy-by-design embedded in engineering, automated DSAR handling, " +
          "regular third-party privacy audits, cross-border transfer mechanisms documented.",
        formula: "+((data_privacy − 1) / 4) × 4 ESG pts; feeds AI-responsibility axis (8 %).",
        derivation:
          "4 ESG pts + 8 % AI responsibility. GDPR (Regulation 2016/679) established data protection as a " +
          "fundamental right in the EU. Non-compliance carries fines up to 4 % of global annual turnover or " +
          "€20 M, making privacy a material financial risk alongside an ethical obligation.",
        source: {
          label: "GDPR (EU)",
          url: "https://gdpr.eu/",
          favicon: fav("gdpr.eu"),
        },
        dynamicResult: (v) => {
          const esg = ((v - 1) / 4) * 4;
          return `${fmt(esg)} ESG pts | feeds AI resp (8 %)`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "explainability",
        label: "AI explainability & interpretability",
        explanation:
          "Rate the explainability and interpretability of the company's AI systems (1–5). " +
          "1 = black-box models with no explanations provided; " +
          "3 = post-hoc explanations available (SHAP/LIME), some documentation; " +
          "5 = inherently interpretable models where possible, comprehensive explanation layer, " +
          "user-facing explanations for all decisions, conformity with EU AI Act Article 13 transparency requirements.",
        formula: "+((explainability − 1) / 4) × 3 ESG pts; feeds AI-responsibility axis (5 %).",
        derivation:
          "3 ESG pts + 5 % AI responsibility. EU AI Act Article 13 mandates that high-risk AI systems " +
          "be designed to be sufficiently transparent to enable users to interpret and use the output " +
          "appropriately. The IEEE P7001 standard on Transparency of Autonomous Systems provides " +
          "the technical framework for levels of explainability.",
        source: {
          label: "EU AI Act — Art. 13",
          url: "https://artificialintelligenceact.eu/article/13/",
          favicon: fav("artificialintelligenceact.eu"),
        },
        dynamicResult: (v) => {
          const esg = ((v - 1) / 4) * 3;
          return `${fmt(esg)} ESG pts | feeds AI resp (5 %)`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "model_robustness",
        label: "Model evaluation & red-teaming maturity",
        explanation:
          "Rate the maturity of the company's AI model evaluation and adversarial testing practices (1–5). " +
          "1 = no formal testing; 3 = benchmark evaluations on public datasets; " +
          "5 = systematic red-teaming, adversarial robustness testing, continuous monitoring in production, " +
          "model cards published, and incident response plans for model failures.",
        formula: "Feeds AI-responsibility axis (8 %) and Investment score average.",
        derivation:
          "8 % AI responsibility + Investment average. The NIST AI RMF emphasises that AI systems must be " +
          "tested for robustness, security, and resilience before deployment (MAP and MEASURE functions). " +
          "Model cards (Mitchell et al., 2019) provide the standard documentation format.",
        source: {
          label: "NIST AI RMF",
          url: "https://airc.nist.gov/home",
          favicon: fav("nist.gov"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} → Inv avg + AI resp (8 %)`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "environmental",
    title: "Environmental Footprint",
    definition:
      "Measures the environmental impact of the company's operations and products across " +
      "energy consumption, water usage, circularity, critical raw materials, greenhouse gas emissions, " +
      "and biodiversity. Aligned with the EU Taxonomy's 'Do No Significant Harm' principle " +
      "and the CSRD's environmental reporting requirements.",
    rows: [
      {
        key: "egy",
        label: "Energy efficiency",
        explanation:
          "Rate the energy efficiency of the company's operations and products (1–5). " +
          "1 = highly energy-intensive, no efficiency measures; 3 = industry-average efficiency; " +
          "5 = best-in-class, renewable-powered, energy-positive product (e.g. optimizes energy use for others). " +
          "For AI companies, consider data-centre PUE, model training efficiency, and edge-vs-cloud trade-offs.",
        formula: "+((egy − 1) / 4) × 14 points added to ESG core.",
        derivation:
          "Highest environmental weight (14 pts) because the EU Taxonomy (Regulation 2020/852) identifies " +
          "climate change mitigation — primarily driven by energy performance — as the first of its six " +
          "environmental objectives. Energy is also the largest operational cost driver for AI infrastructure.",
        source: {
          label: "EU Taxonomy",
          url: "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en",
          favicon: fav("europa.eu"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 14;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 14`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "wat",
        label: "Water intensity (higher = worse)",
        explanation:
          "Rate the water intensity of operations (1–5). " +
          "1 = minimal water use; 3 = moderate (standard cooling, office use); " +
          "5 = very high water consumption (data centres with water cooling, agriculture, manufacturing). " +
          "Higher values are WORSE and reduce the ESG score.",
        formula: "−((wat − 1) / 4) × 14 points subtracted from ESG core.",
        derivation:
          "14 pts penalty (matching energy weight) because CDP Water Security research shows water risk " +
          "is systematically underpriced and has equivalent materiality to energy risk, particularly for " +
          "technology infrastructure. Large language model training can consume millions of litres.",
        source: {
          label: "CDP Water Security",
          url: "https://www.cdp.net/en/water",
          favicon: fav("cdp.net"),
        },
        dynamicResult: (v) => {
          const pts = -((v - 1) / 4) * 14;
          return `${fmt(pts)} ESG pts — −((${v}−1)/4) × 14`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "circ",
        label: "Circularity / end-of-life score",
        explanation:
          "Rate the company's circular economy practices (1–5). " +
          "1 = linear take-make-dispose model; 3 = some recycling, refurbishment options; " +
          "5 = fully circular design, product-as-a-service model, materials passport, " +
          "closed-loop recycling. Consider hardware lifecycle for tech companies.",
        formula: "+((circ − 1) / 4) × 12 points added to ESG core.",
        derivation:
          "12 pts based on the Ellen MacArthur Foundation's Material Circularity Indicator (MCI) framework, " +
          "which quantifies how restorative material flows are relative to linear alternatives. Slightly " +
          "below energy/water because circularity metrics are less standardised across sectors.",
        source: {
          label: "Ellen MacArthur Foundation",
          url: "https://www.ellenmacarthurfoundation.org/",
          favicon: fav("ellenmacarthurfoundation.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 12;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 12`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "crm",
        label: "Critical raw material exposure",
        explanation:
          "Does the company depend heavily on critical raw materials (rare earths, cobalt, lithium, etc.)? " +
          "0 = low exposure (software-only, or substitutable materials); " +
          "1 = high exposure (hardware with hard-to-source minerals, single-source suppliers). " +
          "EU Critical Raw Materials Act identifies 34 materials critical for green/digital transitions.",
        formula: "−crm × 8 points subtracted from ESG core (0 or −8).",
        derivation:
          "Binary 8 pts penalty. The EU Critical Raw Materials Act (Regulation 2024/1252) identifies " +
          "34 materials essential for green and digital transitions and mandates supply-chain " +
          "diversification. Binary because exposure is a structural characteristic, not a maturity spectrum.",
        source: {
          label: "EU Critical Raw Materials Act",
          url: "https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials_en",
          favicon: fav("europa.eu"),
        },
        dynamicResult: (v) => {
          const pts = -v * 8;
          return `${fmt(pts)} ESG pts`;
        },
        type: "select",
        options: [
          { value: "0", label: "0 — Low exposure" },
          { value: "1", label: "1 — High risk / single-source" },
        ],
      },
      {
        key: "ghg",
        label: "GHG emissions management (Scope 1-3)",
        explanation:
          "Rate the company's greenhouse gas emissions management across all scopes (1–5). " +
          "1 = no measurement or targets; 3 = Scope 1-2 measured, reduction targets set; " +
          "5 = full Scope 1-2-3 measured and independently verified, science-based targets (SBTi), " +
          "net-zero pathway documented, carbon offsets only for residual emissions.",
        formula: "+((ghg − 1) / 4) × 5 points added to ESG core.",
        derivation:
          "5 pts reflecting the GHG Protocol's three-scope framework — the global standard for corporate " +
          "emissions accounting used by 92 % of Fortune 500 companies. Lower than energy efficiency because " +
          "GHG management is a reporting/target-setting practice, while energy directly affects operations.",
        source: {
          label: "GHG Protocol",
          url: "https://ghgprotocol.org/",
          favicon: fav("ghgprotocol.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 5;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 5`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "biodiversity",
        label: "Biodiversity impact",
        explanation:
          "Rate the company's impact on biodiversity and ecosystems (1–5). " +
          "1 = significant negative impact (habitat destruction, pollution); " +
          "3 = neutral or minor impact with some mitigation; " +
          "5 = net-positive biodiversity impact, active restoration, TNFD-aligned reporting. " +
          "The Taskforce on Nature-related Financial Disclosures (TNFD) framework applies.",
        formula: "+((biodiversity − 1) / 4) × 4 points added to ESG core.",
        derivation:
          "4 pts. TNFD provides the risk management and disclosure framework for nature-related risks. " +
          "Lower weight than energy/water/circularity because biodiversity measurement methodologies " +
          "are still maturing, though the Kunming-Montreal Global Biodiversity Framework (COP15) " +
          "is accelerating standardisation.",
        source: {
          label: "TNFD",
          url: "https://tnfd.global/",
          favicon: fav("tnfd.global"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 4;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 4`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "renewable_pct",
        label: "Renewable energy usage (%)",
        explanation:
          "Rate the proportion of the company's energy consumption that comes from renewable sources (1–5). " +
          "1 = < 20 % renewable; 3 = 40–60 % renewable; " +
          "5 = > 80 % renewable (purchased or self-generated solar, wind, hydro, green PPAs). " +
          "Separate from energy efficiency: a company can be efficient but fossil-powered, or inefficient but 100 % renewable.",
        formula: "+((renewable_pct − 1) / 4) × 6 points added to ESG core.",
        derivation:
          "6 ESG pts. The RE100 initiative (led by the Climate Group and CDP) encourages companies to commit " +
          "to 100 % renewable electricity. The EU Renewable Energy Directive (RED III, 2023/2413) sets a " +
          "binding target of 42.5 % renewable energy by 2030. This factor separates energy source from " +
          "energy efficiency to give credit for decarbonised supply.",
        source: {
          label: "RE100 (Climate Group)",
          url: "https://www.there100.org/",
          favicon: fav("there100.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 6;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 6`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "ghg_intensity",
        label: "GHG intensity per unit of revenue",
        explanation:
          "Rate the carbon intensity of the company's output normalised by revenue (1–5). " +
          "1 = very high intensity (> 500 tCO₂e per M€ revenue); " +
          "3 = moderate (100–500 tCO₂e / M€); " +
          "5 = very low (< 50 tCO₂e / M€) or carbon-negative per unit of output. " +
          "This complements the absolute GHG management factor by measuring efficiency of emissions per economic output.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. The CSRD's European Sustainability Reporting Standards (ESRS E1) " +
          "require disclosure of both absolute and intensity-based GHG metrics. Intensity metrics are critical for " +
          "comparing companies of different sizes and for tracking decarbonisation progress independent of growth.",
        source: {
          label: "ESRS E1 — Climate Change",
          url: "https://www.efrag.org/lab6",
          favicon: fav("efrag.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "social_safety",
    title: "Social, Safety & Human Rights",
    definition:
      "Evaluates dual-use potential, weaponization risk, human rights due diligence in the value chain, " +
      "reputational controversy exposure, and safety testing practices. Heavily weighted because " +
      "AI-for-good investments must demonstrably avoid causing harm. " +
      "Aligned with UN Guiding Principles on Business & Human Rights and the EU AI Act's risk classification.",
    rows: [
      {
        key: "du",
        label: "Dual-use risk level (0–100)",
        explanation:
          "Estimate the percentage risk that the company's technology could be repurposed for harmful " +
          "applications (military, surveillance, social control). 0 = purely beneficial (e.g. medical imaging); " +
          "50 = moderate dual-use potential (e.g. drone technology, facial recognition); " +
          "100 = direct military/surveillance application. This is the heaviest ESG penalty factor.",
        formula: "−(du / 100) × 28 from ESG core; major driver of AI-responsibility axis (20 %).",
        derivation:
          "28 pts max penalty — the heaviest single factor — plus 20 % of the AI responsibility composite. " +
          "The EU AI Act Annex III classifies dual-use AI applications in its highest risk tier. This weight " +
          "reflects that dual-use potential makes an investment fundamentally unsuitable for impact mandates.",
        source: {
          label: "EU AI Act — Annex III",
          url: "https://artificialintelligenceact.eu/annex/3/",
          favicon: fav("artificialintelligenceact.eu"),
        },
        dynamicResult: (v) => {
          const esg = -(v / 100) * 28;
          const ai = (1 - v / 100) * 20;
          return `${fmt(esg)} ESG pts | AI resp: ${ai.toFixed(1)} / 20 pts`;
        },
        type: "slider",
        min: 0,
        max: 100,
        step: 1,
      },
      {
        key: "wpn",
        label: "Weaponization potential (higher = worse)",
        explanation:
          "Rate the ease with which the company's technology could be weaponized (1–5). " +
          "1 = no weaponization pathway; 3 = possible with significant modification; " +
          "5 = directly usable as a weapon or weapon-enabler. " +
          "Consider autonomous weapons, cyber-weapons, surveillance tools, and disinformation systems.",
        formula: "−((wpn − 1) / 4) × 14 from ESG core.",
        derivation:
          "14 pts penalty matching energy/water weight because the Campaign to Stop Killer Robots and " +
          "UN Convention on Certain Conventional Weapons (CCW) discussions reflect growing international " +
          "consensus that weaponisable AI poses existential risks requiring equivalent scrutiny.",
        source: {
          label: "Campaign to Stop Killer Robots",
          url: "https://www.stopkillerrobots.org/",
          favicon: fav("stopkillerrobots.org"),
        },
        dynamicResult: (v) => {
          const pts = -((v - 1) / 4) * 14;
          return `${fmt(pts)} ESG pts — −((${v}−1)/4) × 14`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "hr",
        label: "Human rights risk in value chain (higher = worse)",
        explanation:
          "Rate the human rights risk across the company's value chain (1–5). " +
          "1 = minimal risk (service company in regulated jurisdictions); " +
          "3 = moderate (suppliers in developing countries, some due diligence); " +
          "5 = severe (known labour issues, conflict minerals, lack of due diligence). " +
          "Aligned with the EU Corporate Sustainability Due Diligence Directive (CSDDD).",
        formula: "−((hr − 1) / 4) × 12 from ESG core.",
        derivation:
          "12 pts penalty. The UN Guiding Principles on Business and Human Rights (2011) established " +
          "the authoritative Protect-Respect-Remedy framework. The EU CSDDD (2024) now makes human rights " +
          "due diligence a legal obligation for large companies, with liability for failures.",
        source: {
          label: "UN Guiding Principles on Business & HR",
          url: "https://www.ohchr.org/en/publications/reference-publications/guiding-principles-business-and-human-rights",
          favicon: fav("ohchr.org"),
        },
        dynamicResult: (v) => {
          const pts = -((v - 1) / 4) * 12;
          return `${fmt(pts)} ESG pts — −((${v}−1)/4) × 12`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "rri",
        label: "Controversy / RepRisk-style index (0–100)",
        explanation:
          "Estimate a RepRisk-style controversy index for the company (0–100). " +
          "0 = no media controversies, clean track record; " +
          "50 = occasional negative press, minor regulatory warnings; " +
          "100 = severe, systemic controversies (data breaches, environmental disasters, fraud). " +
          "Based on frequency, severity, and novelty of ESG-related incidents.",
        formula: "−(rri / 100) × 20 from ESG core.",
        derivation:
          "20 pts penalty. RepRisk's ESG risk platform quantifies controversy exposure on a 0–100 " +
          "RepRisk Index (RRI) scale using AI-driven media analysis. Academic research (Kölbel et al., 2017) " +
          "shows that ESG controversies are strong lagging indicators of governance failure and predict " +
          "future financial losses.",
        source: {
          label: "RepRisk",
          url: "https://www.reprisk.com/",
          favicon: fav("reprisk.com"),
        },
        dynamicResult: (v) => {
          const pts = -(v / 100) * 20;
          return `${fmt(pts)} ESG pts — −(${v}/100) × 20`;
        },
        type: "slider",
        min: 0,
        max: 100,
        step: 1,
      },
      {
        key: "safety_testing",
        label: "Safety testing & incident response",
        explanation:
          "Rate the maturity of the company's product safety testing and incident response (1–5). " +
          "1 = no safety testing or incident playbooks; " +
          "3 = standard QA, basic incident response plan; " +
          "5 = comprehensive safety cases, pre-deployment risk assessments, " +
          "24/7 incident response team, post-incident reviews published, kill-switch capability.",
        formula: "+((safety_testing − 1) / 4) × 4 ESG pts; feeds AI-responsibility axis (7 %).",
        derivation:
          "4 ESG pts + 7 % AI responsibility. EU AI Act Article 9 mandates risk management systems " +
          "for high-risk AI including testing, monitoring, and incident reporting. The 7 % AI weight " +
          "reflects that safety testing is a downstream verification activity (lower than governance).",
        source: {
          label: "EU AI Act — Art. 9",
          url: "https://artificialintelligenceact.eu/article/9/",
          favicon: fav("artificialintelligenceact.eu"),
        },
        dynamicResult: (v) => {
          const esg = ((v - 1) / 4) * 4;
          return `${fmt(esg)} ESG pts | feeds AI resp (7 %)`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "sdg",
    title: "SDG & Societal Impact",
    definition:
      "Maps the company's activities to the UN Sustainable Development Goals and assesses " +
      "broader societal benefit. Covers primary SDG alignment, measurable societal outcomes, " +
      "stakeholder engagement quality, and digital inclusion / accessibility. " +
      "Impact-focused mandates target investments with additionality — impact that " +
      "would not occur without public financing.",
    rows: [
      {
        key: "primary_sdg",
        label: "Primary SDG alignment (1–17)",
        explanation:
          "Select the primary UN Sustainable Development Goal that the company's core product or service " +
          "contributes to (1–17). Used for reporting and narrative alignment. " +
          "Common for AI-for-good: SDG 3 (Health), SDG 7 (Energy), SDG 9 (Industry/Innovation), " +
          "SDG 11 (Cities), SDG 13 (Climate), SDG 15 (Life on Land).",
        formula: "Descriptive tag for reporting; no direct scoring impact.",
        derivation:
          "No scoring weight because SDG alignment is qualitative context rather than a quantifiable " +
          "risk/opportunity signal. The UN SDG framework provides 17 goals with 169 targets as a shared " +
          "language for impact classification, but alignment alone does not predict investment outcomes.",
        source: {
          label: "UN SDGs",
          url: "https://sdgs.un.org/goals",
          favicon: fav("un.org"),
        },
        dynamicResult: (v) => `SDG ${v} selected — narrative alignment tag`,
        type: "slider",
        min: 1,
        max: 17,
        step: 1,
      },
      {
        key: "soc",
        label: "Societal benefit (1–5)",
        explanation:
          "Rate the magnitude and breadth of positive societal impact from the company's activities (1–5). " +
          "1 = marginal or no measurable benefit; 3 = moderate, benefits specific communities; " +
          "5 = transformative, large-scale societal benefit (e.g. reducing mortality, eliminating food waste, " +
          "democratizing access to education). Consider additionality — would this impact occur anyway?",
        formula: "+((soc − 1) / 4) × 10 points added to ESG core.",
        derivation:
          "10 pts — highest in the SDG pillar. The GIIN's IRIS+ system provides the leading metrics " +
          "framework for measuring and managing impact. High weight reflects that measurable societal " +
          "benefit is the core thesis for impact investing and justifies concessional capital.",
        source: {
          label: "GIIN IRIS+",
          url: "https://iris.thegiin.org/",
          favicon: fav("thegiin.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 10;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 10`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "stakeholder",
        label: "Stakeholder engagement quality",
        explanation:
          "Rate the quality and depth of stakeholder engagement (1–5). " +
          "1 = no structured engagement; 3 = annual surveys, some community outreach; " +
          "5 = systematic multi-stakeholder dialogue (employees, customers, communities, regulators), " +
          "materiality assessments, public impact reports, co-design with affected populations.",
        formula: "+((stakeholder − 1) / 4) × 3 points added to ESG core.",
        derivation:
          "3 pts. AccountAbility's AA1000 Stakeholder Engagement Standard (SES) establishes a framework " +
          "for systematic stakeholder engagement. Lower weight because engagement is an input to quality " +
          "decision-making rather than a direct outcome measure.",
        source: {
          label: "AccountAbility AA1000",
          url: "https://www.accountability.org/standards/",
          favicon: fav("accountability.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 3;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 3`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "inclusion",
        label: "Digital inclusion & accessibility",
        explanation:
          "Rate how well the company's products serve diverse populations, including those with disabilities, " +
          "low digital literacy, or limited connectivity (1–5). " +
          "1 = excludes significant populations; 3 = standard accessibility compliance (WCAG 2.1 AA); " +
          "5 = designed for inclusion, multi-language, low-bandwidth modes, assistive technology support, " +
          "actively bridges the digital divide.",
        formula: "+((inclusion − 1) / 4) × 3 points added to ESG core.",
        derivation:
          "3 pts. The W3C Web Content Accessibility Guidelines (WCAG 2.1 AA) define the global standard " +
          "for digital accessibility. Weight reflects inclusion as a positive differentiator rather than " +
          "a primary risk factor, consistent with the European Accessibility Act (2019/882).",
        source: {
          label: "W3C WCAG",
          url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
          favicon: fav("w3.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 3;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 3`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "impact_scale",
        label: "Impact scale potential",
        explanation:
          "Rate the potential scale of the company's positive impact if successful (1–5). " +
          "1 = very limited — niche use case, impact stays local even if the company succeeds; " +
          "3 = moderate — useful across several organisations or regions; " +
          "5 = transformative at scale — could benefit millions of people, reshape an industry, " +
          "or materially shift progress on a global challenge.",
        formula: "+((impact_scale − 1) / 4) × 5 points added to ESG core.",
        derivation:
          "5 ESG pts. The Impact Management Project's (IMP) 'How Much' dimension assesses depth, " +
          "breadth, and duration of impact. The GIIN's IRIS+ Catalogue uses 'scale of impact' as a " +
          "primary metric for comparing impact investments. High scale potential justifies the " +
          "deployment of catalytic public capital.",
        source: {
          label: "Impact Management Project",
          url: "https://impactmanagementproject.com/",
          favicon: fav("impactmanagementproject.com"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 5;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 5`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "impact_additionality",
        label: "Impact additionality (1–5)",
        explanation:
          "Rate how additional the company’s SDG impact is compared with what would likely happen without this AI solution or without Invest‑NL’s catalytic capital (1–5). " +
          "1 = low additionality — similar solutions are already widely available and financed, impact would mostly occur anyway; " +
          "3 = moderate — clear added value versus existing solutions (better targeting, cost, speed, reach) but alternatives still exist; " +
          "5 = very high — the AI solution addresses a currently under‑served or unfunded SDG challenge where public/impact capital is crucial to make it happen.",
        formula: "+((impact_additionality − 1) / 4) × 5 points added to ESG core.",
        derivation:
          "5 ESG pts. Additionality is a core principle in impact investing, ensuring that capital drives outcomes that " +
          "would not have occurred otherwise. The GIIN highlights additionality as key to differentiating true impact investments.",
        source: {
          label: "GIIN Additionality",
          url: "https://thegiin.org/",
          favicon: fav("thegiin.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 5;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 5`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "job_impact",
        label: "Net job creation / displacement",
        explanation:
          "Rate the net employment impact of the company's product or service (1–5). " +
          "1 = significant net job displacement with no transition support; " +
          "3 = neutral or mixed — some jobs displaced, some created, transition support offered; " +
          "5 = strong net job creation, up-skilling programmes, creates new economic opportunities " +
          "in underserved communities. Consider both direct and indirect employment effects.",
        formula: "+((job_impact − 1) / 4) × 4 points added to ESG core.",
        derivation:
          "4 ESG pts. The ILO's Future of Work initiative provides the framework for assessing how " +
          "technology affects labour markets. The OECD Employment Outlook tracks automation-driven " +
          "displacement. This factor addresses the xlsx feedback calling for social impact dimensions " +
          "covering both negative (job loss) and positive (productivity gains, new opportunities) effects.",
        source: {
          label: "ILO Future of Work",
          url: "https://www.ilo.org/global/topics/future-of-work/lang--en/index.htm",
          favicon: fav("ilo.org"),
        },
        dynamicResult: (v) => {
          const pts = ((v - 1) / 4) * 4;
          return `${fmt(pts)} ESG pts — ((${v}−1)/4) × 4`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "financial",
    title: "Financial Analysis",
    definition:
      "Deep dive into the company's financial health, sustainability of the business model, " +
      "and valuation. Covers runway versus plan, quality of financial reporting, " +
      "revenue model maturity (recurring vs. one-off), unit economics evidence, " +
      "and whether the proposed valuation is reasonable relative to stage, comps, and risk. " +
      "All factors feed the Investment score (average of 1–5 normalised inputs → 50–100 scale).",
    rows: [
      {
        key: "fin_runway",
        label: "Runway / funding adequacy vs. plan",
        explanation:
          "Does the company have sufficient runway (cash, committed credit) to execute its plan (1–5)? " +
          "1 = < 6 months runway, immediate funding need; 3 = 12–18 months, manageable; " +
          "5 = > 24 months or profitable, fully funded to next inflection point. " +
          "Consider burn rate trajectory and sensitivity to revenue delays.",
        formula: "Normalised (1–5) → averaged into Investment score (50–100).",
        derivation:
          "Equal weight in the 25-factor Investment average. NVCA model term sheets use runway adequacy " +
          "as a primary gating criterion — insufficient runway creates forced dilution or distressed " +
          "fundraising that destroys value for existing investors.",
        source: {
          label: "NVCA Resources",
          url: "https://nvca.org/model-legal-documents/",
          favicon: fav("nvca.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "fin_quality",
        label: "Financial reporting quality & unit economics",
        explanation:
          "Rate the quality and reliability of the company's financial data (1–5). " +
          "1 = unaudited, informal bookkeeping; 3 = audited accounts, basic KPIs tracked; " +
          "5 = IFRS-compliant, granular cohort analysis, clear CAC/LTV, gross margin trajectory, " +
          "detailed financial model with scenario analysis.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. IFRS provides the global financial reporting framework " +
          "that determines the quality and comparability of financial data. Reliable data is a prerequisite " +
          "for all other financial analysis — poor data quality inflates uncertainty across every metric.",
        source: {
          label: "IFRS Foundation",
          url: "https://www.ifrs.org/",
          favicon: fav("ifrs.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "revenue_model",
        label: "Revenue model maturity",
        explanation:
          "How mature and proven is the company's revenue model (1–5)? " +
          "1 = pre-revenue, business model hypothetical; 3 = some revenue, model being validated; " +
          "5 = proven recurring revenue (SaaS, subscriptions), strong retention metrics, " +
          "diversified revenue streams, clear path to profitability.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. Bessemer Venture Partners' Cloud Index established the " +
          "standard SaaS benchmarks (ARR, NRR, CAC/LTV, Rule of 40) for evaluating recurring revenue " +
          "models. Revenue model maturity is the strongest predictor of fundability at growth stage.",
        source: {
          label: "Bessemer Cloud Index",
          url: "https://www.bvp.com/atlas",
          favicon: fav("bvp.com"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "valuation",
        label: "Valuation reasonableness",
        explanation:
          "Is the proposed valuation reasonable relative to stage, comparable transactions, and risk (1–5)? " +
          "1 = significantly overvalued (> 2× comps); 3 = in line with market; " +
          "5 = attractive entry point with margin of safety. " +
          "Consider pre/post-money, implied multiples, and milestone-based valuation adjustments.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. Prof. Aswath Damodaran's valuation framework at NYU Stern " +
          "is the most widely cited academic resource for startup valuation. The 1–5 scale maps from " +
          "significantly overvalued to attractive entry point with margin of safety.",
        source: {
          label: "Damodaran Online (NYU)",
          url: "https://pages.stern.nyu.edu/~adamodar/",
          favicon: fav("nyu.edu"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "market",
    title: "Market & Competition",
    definition:
      "Assesses the market opportunity and competitive dynamics. Covers total addressable market (TAM) " +
      "sizing and realism, competitive positioning, customer concentration risk, and the regulatory " +
      "environment (tailwinds vs. headwinds). Understanding market risk is essential for " +
      "determining whether the investment thesis can deliver returns within the proposed timeline.",
    rows: [
      {
        key: "mkt_tam",
        label: "Market size & adoption realism",
        explanation:
          "Rate the attractiveness and realism of the company's market opportunity (1–5). " +
          "1 = tiny niche market or unrealistic TAM claims; 3 = moderate market, reasonable assumptions; " +
          "5 = large, growing market (> €1B TAM) with bottom-up analysis, clear SAM/SOM, " +
          "and evidence of market pull (waitlists, LOIs, pilot conversions).",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. Standard TAM/SAM/SOM market sizing methodology follows " +
          "McKinsey's bottom-up approach: start from unit economics and customer counts rather than " +
          "top-down percentage-of-GDP estimates. Bottom-up TAM is a core diligence deliverable.",
        source: {
          label: "McKinsey Insights",
          url: "https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights",
          favicon: fav("mckinsey.com"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "competitive",
        label: "Competitive position & differentiation",
        explanation:
          "Rate the company's competitive position and defensibility (1–5). " +
          "1 = undifferentiated, many competitors, no switching costs; " +
          "3 = some differentiation, moderate competition; " +
          "5 = strong competitive moat (network effects, proprietary data, regulatory advantage), " +
          "clear differentiation, high switching costs, first-mover with lock-in.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. Michael Porter's Five Forces framework (HBR, 1979) " +
          "is the foundational model for analysing competitive dynamics: threat of new entrants, " +
          "bargaining power of buyers/suppliers, threat of substitutes, and competitive rivalry.",
        source: {
          label: "Porter's Five Forces (HBR)",
          url: "https://hbr.org/1979/03/how-competitive-forces-shape-strategy",
          favicon: fav("hbr.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "customer_conc",
        label: "Customer concentration risk (higher = worse)",
        explanation:
          "Rate the customer concentration risk (1–5). " +
          "1 = highly diversified customer base; 3 = moderate concentration (top 5 = 40 % revenue); " +
          "5 = extreme concentration (single customer > 50 % revenue). " +
          "High concentration is a risk: losing a key customer could threaten viability. " +
          "Higher values are WORSE and reduce the Investment score.",
        formula: "INVERSE: (5 − customer_conc) normalised → averaged into Investment score.",
        derivation:
          "Inverse-weighted (higher = worse) in the Investment average. SEC Regulation S-K Item 101(c) " +
          "requires disclosure when a single customer exceeds 10 % of revenue. The inverse normalisation " +
          "ensures that high concentration reduces the Investment score proportionally.",
        source: {
          label: "SEC Regulation S-K",
          url: "https://www.sec.gov/",
          favicon: fav("sec.gov"),
        },
        dynamicResult: (v) => {
          const norm = (5 - v) / 4;
          return `Inverse normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "regulatory_env",
        label: "Regulatory environment",
        explanation:
          "Rate the regulatory environment for the company's sector (1–5). " +
          "1 = hostile (pending bans, restrictive regulation); 3 = neutral; " +
          "5 = strong tailwinds (subsidies, mandates, favourable policy — e.g. EU Green Deal, AI Act safe harbour). " +
          "Consider regulatory risk in key markets and likelihood of policy changes.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. The EU Green Deal and associated regulatory framework " +
          "(Fit for 55, REPowerEU) demonstrate how regulation can create material market tailwinds " +
          "or headwinds that shift multi-billion-euro capital flows toward or away from sectors.",
        source: {
          label: "EU Green Deal",
          url: "https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/european-green-deal_en",
          favicon: fav("europa.eu"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "technology",
    title: "Technology & IP",
    definition:
      "Evaluates the technology stack, intellectual property portfolio, and technical maturity. " +
      "Covers defensibility of the core technology, scalability of the architecture, " +
      "data quality and infrastructure, cybersecurity posture, and IP portfolio strength. " +
      "For AI companies, technology risk is particularly important: model performance, " +
      "training data quality, and infrastructure costs can make or break the investment.",
    rows: [
      {
        key: "tech_moat",
        label: "Technology & IP defensibility",
        explanation:
          "Rate the defensibility of the company's core technology (1–5). " +
          "1 = easily replicable, based on open-source with no modifications; " +
          "3 = some proprietary elements, moderate barrier to replication; " +
          "5 = deep proprietary technology, significant R&D advantage, trade secrets, " +
          "or unique architectural approach that would take years to replicate.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. WIPO's technology assessment guidelines provide " +
          "the framework for evaluating technology defensibility through patents, trade secrets, " +
          "and other IP mechanisms. Tech moat is a standard VC diligence dimension.",
        source: {
          label: "WIPO",
          url: "https://www.wipo.int/",
          favicon: fav("wipo.int"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "scalability",
        label: "Technical scalability",
        explanation:
          "Rate the scalability of the company's technical architecture (1–5). " +
          "1 = cannot scale beyond current load, single-server, manual processes; " +
          "3 = scales with linear cost increases, some automation; " +
          "5 = highly scalable architecture (microservices / serverless), sub-linear cost scaling, " +
          "multi-region deployment, automated CI/CD, handles 100× current load.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. The AWS Well-Architected Framework establishes " +
          "the industry standard for evaluating technical scalability across its six pillars: " +
          "operational excellence, security, reliability, performance efficiency, cost optimisation, " +
          "and sustainability.",
        source: {
          label: "AWS Well-Architected",
          url: "https://aws.amazon.com/architecture/well-architected/",
          favicon: fav("aws.amazon.com"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "data_quality",
        label: "Data quality & infrastructure",
        explanation:
          "Rate the quality, governance, and infrastructure of the company's data assets (1–5). " +
          "1 = poor quality, no data pipeline, manual collection; " +
          "3 = structured data, basic ETL, some quality controls; " +
          "5 = enterprise-grade data infrastructure, automated quality monitoring, data lineage tracking, " +
          "well-documented schemas, FAIR principles applied.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. The FAIR Data Principles (Findable, Accessible, " +
          "Interoperable, Reusable) published in Scientific Data (Wilkinson et al., 2016) define " +
          "the standard for data quality assessment. For AI companies, data quality directly " +
          "determines model performance ceiling.",
        source: {
          label: "GO FAIR Principles",
          url: "https://www.go-fair.org/fair-principles/",
          favicon: fav("go-fair.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "cybersecurity",
        label: "Cybersecurity posture",
        explanation:
          "Rate the company's cybersecurity maturity (1–5). " +
          "1 = no security program, unpatched systems; 3 = basic security (firewalls, antivirus, MFA); " +
          "5 = comprehensive security program (SOC-2 Type II, ISO 27001, penetration testing, " +
          "bug bounty, security-by-design, incident response plan, cyber insurance).",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. The NIST Cybersecurity Framework (CSF 2.0) is the " +
          "most widely adopted cybersecurity framework, organising security functions into Govern, " +
          "Identify, Protect, Detect, Respond, and Recover. A data breach can wipe out an entire " +
          "investment — cybersecurity is an existential operational risk.",
        source: {
          label: "NIST Cybersecurity Framework",
          url: "https://www.nist.gov/cyberframework",
          favicon: fav("nist.gov"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "ip_portfolio",
        label: "IP portfolio strength",
        explanation:
          "Rate the strength of the company's intellectual property portfolio (1–5). " +
          "1 = no IP protection, everything is public; 3 = some patents pending, trade secrets documented; " +
          "5 = granted patents in key jurisdictions, comprehensive trade secret program, " +
          "freedom-to-operate analysis completed, IP licensing potential.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. WIPO's IP for Business guidance helps SMEs build " +
          "and value IP portfolios for investment readiness. IP is a key value driver in technology " +
          "M&A — acquirers routinely pay premium multiples for defensible patent portfolios.",
        source: {
          label: "WIPO IP for Business",
          url: "https://www.wipo.int/sme/en/",
          favicon: fav("wipo.int"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "hw_lifespan",
        label: "Hardware lifecycle & lifespan",
        explanation:
          "Rate the expected lifespan and lifecycle management of the company's hardware assets (1–5). " +
          "1 = short lifespan (< 2 years), no lifecycle planning, frequent replacement; " +
          "3 = standard lifespan (3–5 years), basic maintenance; " +
          "5 = extended lifespan (> 5 years) through modular design, firmware updates, " +
          "refurbishment programmes, and planned upgrade paths. " +
          "For software-only companies, rate the lifecycle of the infrastructure they depend on.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. The EU Ecodesign for Sustainable Products Regulation " +
          "(ESPR, 2024) requires digital product passports and mandates longer product lifecycles. " +
          "For AI hardware specifically, the xlsx environmental KPIs identify hardware lifespan " +
          "as a key sustainability metric across all AI verticals.",
        source: {
          label: "EU Ecodesign (ESPR)",
          url: "https://environment.ec.europa.eu/topics/circular-economy/ecodesign-sustainable-products-regulation_en",
          favicon: fav("europa.eu"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "team",
    title: "Team & Execution",
    definition:
      "Assesses the founding / management team's ability to execute the business plan. " +
      "Covers execution track record, strategic theme alignment, " +
      "key-person dependency risk, and the quality of the advisory network. " +
      "Team is often the #1 factor in early-stage investing — a great team can pivot a bad idea, " +
      "but a weak team will fail to execute even a great one.",
    rows: [
      {
        key: "team_exec",
        label: "Team execution track record",
        explanation:
          "Rate the team's demonstrated ability to execute (1–5). " +
          "1 = first-time founders, no relevant track record; " +
          "3 = some startup experience, mixed results; " +
          "5 = serial entrepreneurs with successful exits, deep domain expertise, " +
          "complementary skills across technical/commercial/operational, strong hiring track record.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. Kauffman Foundation research shows team quality is the " +
          "#1 predictor of startup success, particularly the combination of domain expertise and " +
          "execution experience. CB Insights data confirms that 23 % of startups fail due to " +
          "wrong team composition.",
        source: {
          label: "Kauffman Foundation",
          url: "https://www.kauffman.org/",
          favicon: fav("kauffman.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "theme_fit",
        label: "Strategic fit with investment theme mandate",
        explanation:
          "Rate how well the company aligns with the selected strategic theme (1–5). " +
          "1 = tangential connection at best; 3 = reasonable fit, some alignment; " +
          "5 = core fit — directly addresses the theme's key challenges, referenced in the fund's " +
          "published investment criteria, clear additionality story.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. The Impact Management Project's (IMP) five dimensions " +
          "framework — What, Who, How Much, Contribution, Risk — provides the methodology for " +
          "evaluating strategic alignment between an investor's mandate and a company's impact thesis.",
        source: {
          label: "Impact Management Project",
          url: "https://impactmanagementproject.com/",
          favicon: fav("impactmanagementproject.com"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "key_person",
        label: "Key person dependency (higher = worse)",
        explanation:
          "Rate the key-person dependency risk (1–5). " +
          "1 = well-distributed knowledge, strong succession planning; " +
          "3 = moderate dependency on 1–2 people; " +
          "5 = entire operation depends on a single individual, no documentation, no succession plan. " +
          "Higher values are WORSE. Consider tag-along / drag-along provisions.",
        formula: "INVERSE: (5 − key_person) normalised → averaged into Investment score.",
        derivation:
          "Inverse-weighted in Investment average. The ILPA Due Diligence Questionnaire (DDQ) " +
          "specifically assesses key-person risk as a material investment consideration. " +
          "Key-person clauses in fund documents can trigger suspension of the investment period " +
          "if key individuals depart.",
        source: {
          label: "ILPA",
          url: "https://ilpa.org/",
          favicon: fav("ilpa.org"),
        },
        dynamicResult: (v) => {
          const norm = (5 - v) / 4;
          return `Inverse normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "advisory",
        label: "Advisory board & network quality",
        explanation:
          "Rate the quality and relevance of the advisory board and professional network (1–5). " +
          "1 = no advisors or irrelevant connections; 3 = some industry advisors; " +
          "5 = world-class advisory board with relevant expertise, active involvement, " +
          "strong investor syndicate, and valuable industry connections that open doors.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. First Round Capital's research across 300+ portfolio " +
          "companies shows that quality advisory networks correlate with 2.3× better fundraising " +
          "outcomes, faster talent acquisition, and more successful strategic pivots.",
        source: {
          label: "First Round Review",
          url: "https://review.firstround.com/",
          favicon: fav("firstround.com"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "legal",
    title: "Legal & Compliance",
    definition:
      "Reviews the company's legal structure, regulatory compliance status, and litigation exposure. " +
      "Covers corporate structure clarity, compliance with applicable regulations " +
      "(financial, sector-specific, data protection), and outstanding or potential legal liabilities. " +
      "Legal issues can destroy value overnight — thorough legal DD is non-negotiable.",
    rows: [
      {
        key: "legal_structure",
        label: "Legal structure & ownership clarity",
        explanation:
          "Rate the clarity and soundness of the company's legal structure (1–5). " +
          "1 = opaque structure, multiple jurisdictions, unclear beneficial ownership; " +
          "3 = standard structure, some complexity; " +
          "5 = clean corporate structure, clear cap table, no hidden liabilities, " +
          "shareholder agreement in place, standard protective provisions for investors.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. ILPA's Private Equity Principles establish best " +
          "practices for legal structure, cap table clarity, and investor protections. Clean " +
          "legal structure is a prerequisite — complexity creates hidden risks and slows transactions.",
        source: {
          label: "ILPA PE Principles",
          url: "https://ilpa.org/",
          favicon: fav("ilpa.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "regulatory_compliance",
        label: "Regulatory compliance status",
        explanation:
          "Rate the company's compliance with all applicable regulations (1–5). " +
          "1 = non-compliant, pending enforcement actions; " +
          "3 = largely compliant, minor gaps being addressed; " +
          "5 = fully compliant, proactive regulatory engagement, compliance program with monitoring, " +
          "sector-specific licenses obtained, regulatory relationships strong.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. EUR-Lex provides the primary legal database for " +
          "EU regulations. Compliance assessment covers the full regulatory landscape applicable " +
          "to the investee — non-compliance creates regulatory risk that can result in fines, " +
          "operating restrictions, or licence revocation.",
        source: {
          label: "EUR-Lex",
          url: "https://eur-lex.europa.eu/",
          favicon: fav("europa.eu"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "litigation",
        label: "Litigation & liability exposure (higher = worse)",
        explanation:
          "Rate the company's litigation and legal liability exposure (1–5). " +
          "1 = no pending or threatened litigation, clean history; " +
          "3 = minor disputes, manageable exposure; " +
          "5 = material litigation pending, regulatory investigations, potential class actions, " +
          "significant contingent liabilities. Higher values are WORSE.",
        formula: "INVERSE: (5 − litigation) normalised → averaged into Investment score.",
        derivation:
          "Inverse-weighted in Investment average. Standard legal DD practice (Practical Law / " +
          "Thomson Reuters framework) assesses litigation risk by evaluating pending claims, " +
          "threatened actions, and contingent liabilities. Material litigation can destroy " +
          "enterprise value or block exits entirely.",
        source: {
          label: "Practical Law (Thomson Reuters)",
          url: "https://legal.thomsonreuters.com/en/products/practical-law",
          favicon: fav("thomsonreuters.com"),
        },
        dynamicResult: (v) => {
          const norm = (5 - v) / 4;
          return `Inverse normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },

  {
    id: "risk_exit",
    title: "Risk Assessment & Exit",
    definition:
      "Holistic risk assessment and exit feasibility analysis. Covers concentration risk " +
      "(supplier / geography / technology), operational risk maturity, and the feasibility " +
      "of achieving a liquidity event within the investment horizon. " +
      "The exit thesis must be credible before committing capital — if you can't exit, " +
      "the IRR is theoretical.",
    rows: [
      {
        key: "concentration_risk",
        label: "Concentration risk (higher = worse)",
        explanation:
          "Rate the overall concentration risk across suppliers, geographies, and technologies (1–5). " +
          "1 = well-diversified across all dimensions; 3 = moderate concentration in one dimension; " +
          "5 = severe concentration (single supplier, single market, single technology bet). " +
          "Higher values are WORSE.",
        formula: "INVERSE: (5 − concentration_risk) normalised → averaged into Investment score.",
        derivation:
          "Inverse-weighted in Investment average. The COSO Enterprise Risk Management Framework " +
          "systematically assesses concentration across suppliers, geographies, and technology " +
          "dependencies. Concentration amplifies tail risk — a single-point-of-failure can " +
          "cascade into total loss.",
        source: {
          label: "COSO ERM Framework",
          url: "https://www.coso.org/",
          favicon: fav("coso.org"),
        },
        dynamicResult: (v) => {
          const norm = (5 - v) / 4;
          return `Inverse normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "operational_risk",
        label: "Operational risk maturity",
        explanation:
          "Rate the maturity of the company's operational risk management (1–5). " +
          "1 = no risk management, highly ad-hoc operations; 3 = basic risk register, some processes; " +
          "5 = comprehensive operational risk framework, business continuity plan tested, " +
          "disaster recovery proven, key processes documented and automated.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. ISO 31000 provides the international standard for " +
          "risk management, applicable across all organisation types and sizes. The standard's " +
          "risk assessment process (identification, analysis, evaluation) maps directly to the 1–5 " +
          "maturity scale used here.",
        source: {
          label: "ISO 31000",
          url: "https://www.iso.org/iso-31000-risk-management.html",
          favicon: fav("iso.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "exit_feasibility",
        label: "Exit feasibility & timeline",
        explanation:
          "Rate the feasibility of achieving a liquidity event within the investment horizon (1–5). " +
          "1 = no credible exit path, illiquid market; 3 = possible IPO or trade sale, " +
          "but timing uncertain; 5 = multiple credible exit paths (strategic acquirers identified, " +
          "IPO-ready metrics, secondary market activity), timing aligned with fund lifecycle.",
        formula: "Normalised (1–5) → averaged into Investment score.",
        derivation:
          "Equal weight in Investment average. NVCA yearbook exit data and PitchBook analytics " +
          "establish the framework for evaluating liquidity event feasibility, timing, and mechanism " +
          "(IPO, M&A, secondary). Without a credible exit, IRR projections are theoretical.",
        source: {
          label: "NVCA Yearbook",
          url: "https://nvca.org/research/nvca-yearbook/",
          favicon: fav("nvca.org"),
        },
        dynamicResult: (v) => {
          const norm = (v - 1) / 4;
          return `Normalized: ${norm.toFixed(2)} / 1.00 → Investment score average`;
        },
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },
];
