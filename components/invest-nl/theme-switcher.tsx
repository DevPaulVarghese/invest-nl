"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVEST_THEMES, type InvestThemeId } from "@/lib/themes";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "dd-ui-theme";
const THEME_EVENT = "dd-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): InvestThemeId {
  if (typeof window === "undefined") return "TECH";
  return (localStorage.getItem(STORAGE_KEY) as InvestThemeId | null) ?? "TECH";
}

function getServerSnapshot(): InvestThemeId {
  return "TECH";
}

function setTheme(id: InvestThemeId) {
  localStorage.setItem(STORAGE_KEY, id);
  document.documentElement.dataset.theme = id;
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeSwitcher() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <Select
      value={current}
      onValueChange={(v) => {
        if (v) setTheme(v as InvestThemeId);
      }}
    >
      <SelectTrigger className="h-8 w-auto gap-1 border-none bg-transparent text-xs font-medium shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {INVEST_THEMES.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
