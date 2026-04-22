export function apiBase(): string {
  // Server-side: call backend container directly
  if (typeof window === "undefined" && process.env.NEXT_PRIVATE_API_URL) {
    return process.env.NEXT_PRIVATE_API_URL;
  }
  // Client-side: use same-origin (Next.js rewrites proxy to backend)
  return "";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
