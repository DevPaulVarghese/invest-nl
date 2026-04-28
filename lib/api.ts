import { isLicenseValid, validateLicenseSync } from "@/lib/license";

export function apiBase(): string {
  if (typeof window === "undefined" && process.env.NEXT_PRIVATE_API_URL) {
    return process.env.NEXT_PRIVATE_API_URL;
  }
  return "";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (typeof window !== "undefined" && !isLicenseValid()) {
    validateLicenseSync();
    throw new Error("License validation failed");
  }
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
