import Link from "next/link";
import { ThemeSwitcher } from "@/components/invest-nl/theme-switcher";
import { DarkModeToggle } from "@/components/invest-nl/dark-mode-toggle";

const nav = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/evaluate", label: "Evaluate" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/compare", label: "Compare" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-invest-earth bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight text-invest-clay">
            Decision Lab
          </Link>
          <nav className="hidden gap-4 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link
            href="/evaluate"
            className="inline-flex h-8 items-center rounded-lg bg-foreground px-3 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            Start evaluation
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
