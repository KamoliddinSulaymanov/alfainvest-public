// CMS API client — connects to alfainvest-cms-admin tRPC public endpoints
// In dev: Vite proxies /api → localhost:3000 (CMS)
// In production: Nginx proxies /api → cms-admin:3000 (no CORS needed)
const CMS_BASE = (import.meta.env.VITE_CMS_URL as string | undefined) || "";

// tRPC v11 with superjson transformer: input/output are wrapped in {json: ...}
type TrpcResponse<T> = { result: { data: { json: T } } };

async function trpcQuery<T>(procedure: string, input?: unknown): Promise<T> {
  const wrapped = input !== undefined ? { json: input } : undefined;
  const params = wrapped !== undefined
    ? `?input=${encodeURIComponent(JSON.stringify(wrapped))}`
    : "";
  const url = `${CMS_BASE}/api/trpc/${procedure}${params}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`CMS API error: ${res.status} ${procedure}`);
  const json: TrpcResponse<T> = await res.json();
  return json.result.data.json;
}

async function trpcMutation<T>(procedure: string, input: unknown): Promise<T> {
  const url = `${CMS_BASE}/api/trpc/${procedure}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({ json: input }),
  });
  if (!res.ok) throw new Error(`CMS API error: ${res.status} ${procedure}`);
  const json: TrpcResponse<T> = await res.json();
  return json.result.data.json;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Locale = "ru" | "uz" | "en";

export interface Product {
  id: number;
  title: string;
  description: string | null;
  iconUrl: string | null;
  category: string | null;
  tariffs: string | null;
  ctaLink: string | null;
  sortOrder: number | null;
  status: string;
  createdAt: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  category: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  workingHours: string | null;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
}

export type SiteSettings = Record<string, string>;

// ─── API Functions ────────────────────────────────────────────────────────────

export const api = {
  getProducts: (locale: Locale = "ru") =>
    trpcQuery<Product[]>("public.getProducts", { locale }),

  getProductById: (id: number, locale: Locale = "ru") =>
    trpcQuery<Product | null>("public.getProductById", { id, locale }),

  getNews: (params?: { limit?: number; category?: string; locale?: Locale }) =>
    trpcQuery<NewsArticle[]>("public.getNews", {
      limit: params?.limit ?? 10,
      category: params?.category,
      locale: params?.locale ?? "ru",
    }),

  getNewsBySlug: (slug: string, locale: Locale = "ru") =>
    trpcQuery<NewsArticle | null>("public.getNewsBySlug", { slug, locale }),

  getPageBySlug: (slug: string, locale: Locale = "ru") =>
    trpcQuery<Page | null>("public.getPageBySlug", { slug, locale }),

  getBranches: (locale: Locale = "ru") =>
    trpcQuery<Branch[]>("public.getBranches", { locale }),

  getSettings: (locale: Locale = "ru") =>
    trpcQuery<SiteSettings>("public.getSettings", { locale }),

  submitContact: (data: { name: string; phone: string; email?: string; message?: string; type: "claim" | "contact" }) =>
    trpcMutation<{ success: boolean }>("notifications.claimSubmission", data),
};
