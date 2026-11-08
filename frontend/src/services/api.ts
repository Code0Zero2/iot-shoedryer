import { DEMO, demoApi, demoCsv } from "./demo";

const BASE: string = import.meta.env.VITE_API_URL ?? "";
const KEY = "shoedryer_token";

export const tokenStore = {
  get(): string | null { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(t: string) { try { localStorage.setItem(KEY, t); } catch { /* abaikan */ } },
  clear() { try { localStorage.removeItem(KEY); } catch { /* abaikan */ } },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const token = tokenStore.get();
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && token) window.dispatchEvent(new Event("unauthorized"));
    throw new ApiError(body.error ?? "Terjadi kesalahan, coba lagi", res.status);
  }
  return res;
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  if (DEMO) return demoApi(path, body) as Promise<T>;
  const res = await request(path, body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return res.json() as Promise<T>;
}

export async function downloadCsv(path: string, filename: string) {
  const blob = DEMO ? demoCsv() : await (await request(path)).blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const socketUrl = BASE || undefined;