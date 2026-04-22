import { PortfolioBrowser } from "@/app/portfolio/portfolio-browser";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-invest-clay">Portfolio</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Sample portfolio cards with logos. Filter by strategic theme.
        </p>
      </div>
      <PortfolioBrowser />
    </div>
  );
}
