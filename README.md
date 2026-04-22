# Decision Lab

A web application for structured investment due-diligence assessments. It helps evaluators systematically score opportunities across environmental, social, governance, financial, and technology dimensions using a consistent, transparent framework.

## What it does

The app walks users through a multi-step evaluation of a company or investment opportunity. There are 50 questions organised into 12 pillars — from corporate governance and AI ethics to financial analysis and exit feasibility. Every question comes with an explanation of what it means and why it matters, and each shows in real-time how the current answer affects the overall scores.

Three scores are computed:

- **ESG Score** (0–100) — measures responsibility across governance, environment, social, and safety factors.
- **Investment Score** (50–100) — measures commercial viability across financial, market, technology, team, legal, and risk factors.
- **AI Responsibility** (0–100) — focuses on AI-specific governance, bias, privacy, safety, and dual-use risk.

These scores place each opportunity into one of four quadrants: Win-win, Impact-first, Caution, or Decline. A 500-dot "forest" visualisation and Invest / Watch / Skip vote split provide additional perspective.

Evaluations can be saved to a database and revisited later. A portfolio browser lets users explore sample companies for reference.

## Repository layout

The canonical copy of this app is tracked inside the **paulvarghese.com** monorepo at `projects/invest-nl/` (same Azure DevOps Git repository as the main site). Clone that repository and open this folder, or work from a standalone checkout if you maintain a separate mirror.

## How to run it

You need Node.js and Docker Desktop installed.

1. Copy `.env.example` to `.env.local`
2. Run `npm run docker:up` to start the database and API
3. Run `npm install` then `npm run dev` to start the web interface
4. Open http://localhost:3000

The API runs at http://localhost:8000 with interactive documentation at http://localhost:8000/docs.

## Licence

MIT — see [LICENSE](LICENSE).
