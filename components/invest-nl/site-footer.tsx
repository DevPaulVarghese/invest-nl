import { apiBase } from "@/lib/api";

export function SiteFooter() {
  const api = apiBase();
  return (
    <footer className="mt-auto border-t border-invest-earth bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Developed by{" "}
          <a
            href="https://paulvarghese.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Paul Varghese
          </a>
          . Decision-support tool — not investment advice.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a className="text-muted-foreground underline underline-offset-2 hover:text-foreground" href={`${api}/docs`}>
            API docs
          </a>
          <a className="text-muted-foreground underline underline-offset-2 hover:text-foreground" href={`${api}/api/framework`}>
            Framework
          </a>
          <a className="text-muted-foreground underline underline-offset-2 hover:text-foreground" href={`${api}/health`}>
            Health
          </a>
        </div>
      </div>
    </footer>
  );
}
