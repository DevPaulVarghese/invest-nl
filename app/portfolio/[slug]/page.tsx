import { apiBase } from "@/lib/api";
import { INVEST_THEMES } from "@/lib/themes";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Company = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  theme: string;
  financing_path: string | null;
  logo_url: string | null;
  detail_path: string | null;
};

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(`${apiBase()}/api/portfolio/${slug}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`Portfolio fetch failed: ${res.status}`);
  }
  const company = (await res.json()) as Company;

  const themeLabel = INVEST_THEMES.find((t) => t.id === company.theme)?.label ?? company.theme;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link href="/portfolio" className="hover:underline">
          Portfolio
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{company.name}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="text-4xl font-semibold tracking-tight text-invest-clay lg:max-w-2xl">
          {company.name}
        </h1>
        {company.logo_url && (
          <div className="relative h-32 w-44 shrink-0">
            <Image
              src={company.logo_url}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </div>

      <dl className="grid gap-4 border-y border-invest-earth py-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Theme</dt>
          <dd className="font-medium">{themeLabel}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Financing path</dt>
          <dd className="font-medium">{company.financing_path ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Source path</dt>
          <dd className="font-medium">
            {company.detail_path ?? "—"}
          </dd>
        </div>
      </dl>

      {company.description && (
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{company.description}</p>
      )}

      <Link
        href={`/evaluate?portfolio_company_id=${company.id}&company_name=${encodeURIComponent(company.name)}&theme=${company.theme}`}
        className="inline-flex h-10 items-center rounded-lg bg-theme-primary px-4 text-sm font-medium text-theme-secondary transition hover:opacity-90"
      >
        Evaluate this company →
      </Link>
    </div>
  );
}
