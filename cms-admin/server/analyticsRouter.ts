/**
 * Analytics Router — proxies Umami Analytics self-hosted API.
 * Credentials are read from DB settings (umami_url, umami_username, umami_password, umami_website_id)
 * with ENV vars as fallback. Falls back to realistic mock data when not configured.
 */
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { getAllSettings } from "./db";

// ─── Credential resolution ────────────────────────────────────────────────────
interface UmamiCreds {
  url: string;
  username: string;
  password: string;
  websiteId: string;
}

async function getUmamiCreds(): Promise<UmamiCreds> {
  try {
    const rows = await getAllSettings();
    const map: Record<string, string> = {};
    rows.forEach((r) => { map[r.key] = r.value ?? ""; });
    return {
      url: (map["umami_url"] || ENV.umamiUrl || "").replace(/\/$/, ""),
      username: map["umami_username"] || ENV.umamiUsername || "",
      password: map["umami_password"] || ENV.umamiPassword || "",
      websiteId: map["umami_website_id"] || ENV.umamiWebsiteId || "",
    };
  } catch {
    return {
      url: (ENV.umamiUrl || "").replace(/\/$/, ""),
      username: ENV.umamiUsername || "",
      password: ENV.umamiPassword || "",
      websiteId: ENV.umamiWebsiteId || "",
    };
  }
}

function credsConfigured(c: UmamiCreds) {
  return Boolean(c.url && c.username && c.password && c.websiteId);
}

// ─── Umami token cache ────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;
let cachedCredsKey = "";

async function getUmamiToken(creds: UmamiCreds): Promise<string | null> {
  const credsKey = `${creds.url}|${creds.username}|${creds.password}`;
  // Invalidate cache if credentials changed
  if (credsKey !== cachedCredsKey) {
    cachedToken = null;
    tokenExpiry = 0;
    cachedCredsKey = credsKey;
  }
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  try {
    const res = await fetch(`${creds.url}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: creds.username, password: creds.password }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token: string };
    cachedToken = data.token;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 hours
    return cachedToken;
  } catch {
    return null;
  }
}

async function umamiGet<T>(creds: UmamiCreds, path: string): Promise<T | null> {
  const token = await getUmamiToken(creds);
  if (!token) return null;
  try {
    const res = await fetch(`${creds.url}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────
interface StatsResult {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  isMock: boolean;
}

function getMockStats(range: string): StatsResult {
  const m = range === "7d" ? 1 : range === "30d" ? 4 : range === "90d" ? 12 : 0.3;
  return {
    pageviews: Math.round(4820 * m),
    visitors: Math.round(1340 * m),
    visits: Math.round(1780 * m),
    bounces: Math.round(820 * m),
    totaltime: Math.round(3240000 * m),
    isMock: true,
  };
}

function getMockPageviews(range: string) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 1;
  const now = Date.now();
  const pageviews: { x: string; y: number }[] = [];
  const sessions: { x: string; y: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const t = new Date(now - i * 86400000).toISOString().split("T")[0] + "T00:00:00Z";
    const base = 120 + Math.round(Math.random() * 180);
    pageviews.push({ x: t, y: base + Math.round(Math.random() * 60) });
    sessions.push({ x: t, y: Math.round(base * 0.35 + Math.random() * 30) });
  }
  return { pageviews, sessions, isMock: true };
}

function getMockTopPages() {
  return { data: [
    { x: "/", y: 1820 }, { x: "/services", y: 943 }, { x: "/about", y: 612 },
    { x: "/news", y: 487 }, { x: "/contacts", y: 321 },
    { x: "/news/strakhovanie-vyezzhayushchikh", y: 198 }, { x: "/services/kasko", y: 154 },
  ], isMock: true };
}

function getMockReferrers() {
  return { data: [
    { x: "google.com", y: 734 }, { x: "yandex.ru", y: 312 }, { x: "t.me", y: 198 },
    { x: "instagram.com", y: 143 }, { x: "facebook.com", y: 87 }, { x: "(direct)", y: 421 },
  ], isMock: true };
}

function getMockDevices() {
  return { data: [
    { x: "Mobile", y: 612 }, { x: "Desktop", y: 589 }, { x: "Tablet", y: 139 },
  ], isMock: true };
}

function getMockCountries() {
  return { data: [
    { x: "UZ", y: 980 }, { x: "RU", y: 187 }, { x: "KZ", y: 94 },
    { x: "US", y: 43 }, { x: "DE", y: 36 },
  ], isMock: true };
}

function getMockBrowsers() {
  return { data: [
    { x: "Chrome", y: 821 }, { x: "Safari", y: 287 },
    { x: "Firefox", y: 143 }, { x: "Edge", y: 89 },
  ], isMock: true };
}

function getMockActiveVisitors() {
  return { visitors: Math.floor(Math.random() * 8) + 1, isMock: true };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rangeToTimestamps(range: string): { startAt: number; endAt: number } {
  const endAt = Date.now();
  const days = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return { startAt: endAt - days * 86400000, endAt };
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const analyticsRouter = router({
  /** Overall stats */
  getStats: protectedProcedure
    .input(z.object({ range: z.enum(["24h", "7d", "30d", "90d"]).default("7d") }))
    .query(async ({ input }): Promise<StatsResult> => {
      const creds = await getUmamiCreds();
      if (!credsConfigured(creds)) return getMockStats(input.range);
      const { startAt, endAt } = rangeToTimestamps(input.range);
      const data = await umamiGet<{ pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number }>(
        creds, `/api/websites/${creds.websiteId}/stats?startAt=${startAt}&endAt=${endAt}`
      );
      if (!data) return getMockStats(input.range);
      return { pageviews: data.pageviews ?? 0, visitors: data.visitors ?? 0, visits: data.visits ?? 0, bounces: data.bounces ?? 0, totaltime: data.totaltime ?? 0, isMock: false };
    }),

  /** Pageviews & sessions time series */
  getPageviews: protectedProcedure
    .input(z.object({ range: z.enum(["24h", "7d", "30d", "90d"]).default("7d") }))
    .query(async ({ input }) => {
      const creds = await getUmamiCreds();
      if (!credsConfigured(creds)) return getMockPageviews(input.range);
      const { startAt, endAt } = rangeToTimestamps(input.range);
      const unit = input.range === "24h" ? "hour" : input.range === "90d" ? "month" : "day";
      const data = await umamiGet<{ pageviews: { x: string; y: number }[]; sessions: { x: string; y: number }[] }>(
        creds, `/api/websites/${creds.websiteId}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=${unit}&timezone=Asia/Tashkent`
      );
      if (!data) return getMockPageviews(input.range);
      return { ...data, isMock: false };
    }),

  /** Top pages */
  getTopPages: protectedProcedure
    .input(z.object({ range: z.enum(["24h", "7d", "30d", "90d"]).default("7d"), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const creds = await getUmamiCreds();
      if (!credsConfigured(creds)) return getMockTopPages();
      const { startAt, endAt } = rangeToTimestamps(input.range);
      const data = await umamiGet<{ x: string; y: number }[]>(
        creds, `/api/websites/${creds.websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=path&limit=${input.limit}`
      );
      if (!data) return getMockTopPages();
      return { data, isMock: false };
    }),

  /** Top referrers */
  getTopReferrers: protectedProcedure
    .input(z.object({ range: z.enum(["24h", "7d", "30d", "90d"]).default("7d"), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const creds = await getUmamiCreds();
      if (!credsConfigured(creds)) return getMockReferrers();
      const { startAt, endAt } = rangeToTimestamps(input.range);
      const data = await umamiGet<{ x: string; y: number }[]>(
        creds, `/api/websites/${creds.websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=referrer&limit=${input.limit}`
      );
      if (!data) return getMockReferrers();
      return { data, isMock: false };
    }),

  /** Device breakdown */
  getDevices: protectedProcedure
    .input(z.object({ range: z.enum(["24h", "7d", "30d", "90d"]).default("7d") }))
    .query(async ({ input }) => {
      const creds = await getUmamiCreds();
      if (!credsConfigured(creds)) return getMockDevices();
      const { startAt, endAt } = rangeToTimestamps(input.range);
      const data = await umamiGet<{ x: string; y: number }[]>(
        creds, `/api/websites/${creds.websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=device`
      );
      if (!data) return getMockDevices();
      return { data, isMock: false };
    }),

  /** Country breakdown */
  getCountries: protectedProcedure
    .input(z.object({ range: z.enum(["24h", "7d", "30d", "90d"]).default("7d") }))
    .query(async ({ input }) => {
      const creds = await getUmamiCreds();
      if (!credsConfigured(creds)) return getMockCountries();
      const { startAt, endAt } = rangeToTimestamps(input.range);
      const data = await umamiGet<{ x: string; y: number }[]>(
        creds, `/api/websites/${creds.websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=country`
      );
      if (!data) return getMockCountries();
      return { data, isMock: false };
    }),

  /** Browser breakdown */
  getBrowsers: protectedProcedure
    .input(z.object({ range: z.enum(["24h", "7d", "30d", "90d"]).default("7d") }))
    .query(async ({ input }) => {
      const creds = await getUmamiCreds();
      if (!credsConfigured(creds)) return getMockBrowsers();
      const { startAt, endAt } = rangeToTimestamps(input.range);
      const data = await umamiGet<{ x: string; y: number }[]>(
        creds, `/api/websites/${creds.websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=browser`
      );
      if (!data) return getMockBrowsers();
      return { data, isMock: false };
    }),

  /** Active visitors right now */
  getActiveVisitors: protectedProcedure.query(async () => {
    const creds = await getUmamiCreds();
    if (!credsConfigured(creds)) return getMockActiveVisitors();
    const data = await umamiGet<{ visitors: number }>(creds, `/api/websites/${creds.websiteId}/active`);
    if (!data) return getMockActiveVisitors();
    return { ...data, isMock: false };
  }),

  /** Whether Umami is configured */
  getStatus: protectedProcedure.query(async () => {
    const creds = await getUmamiCreds();
    return {
      configured: credsConfigured(creds),
      umamiUrl: creds.url || null,
      websiteId: creds.websiteId || null,
    };
  }),

  /** Test connection with given credentials (used from Settings page) */
  testConnection: protectedProcedure
    .input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      websiteId: z.string(),
    }))
    .mutation(async ({ input }): Promise<{ ok: boolean; message: string }> => {
      const url = input.url.replace(/\/$/, "");
      if (!url || !input.username || !input.password || !input.websiteId) {
        return { ok: false, message: "Заполните все поля" };
      }
      try {
        // Step 1: authenticate
        const loginRes = await fetch(`${url}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: input.username, password: input.password }),
        });
        if (!loginRes.ok) {
          const txt = await loginRes.text().catch(() => "");
          return { ok: false, message: `Ошибка авторизации (${loginRes.status}): ${txt.slice(0, 120)}` };
        }
        const loginData = (await loginRes.json()) as { token?: string };
        if (!loginData.token) {
          return { ok: false, message: "Сервер не вернул токен — проверьте логин/пароль" };
        }
        // Step 2: verify website ID
        const siteRes = await fetch(`${url}/api/websites/${input.websiteId}`, {
          headers: { Authorization: `Bearer ${loginData.token}` },
        });
        if (!siteRes.ok) {
          return { ok: false, message: `Авторизация OK, но Website ID не найден (${siteRes.status}). Проверьте UUID.` };
        }
        const siteData = (await siteRes.json()) as { name?: string; domain?: string };
        // Invalidate cached token so next query uses the new credentials
        cachedToken = null;
        tokenExpiry = 0;
        cachedCredsKey = "";
        return {
          ok: true,
          message: `Подключено успешно${siteData.name ? ` · Сайт: ${siteData.name}` : ""}${siteData.domain ? ` (${siteData.domain})` : ""}`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, message: `Ошибка сети: ${msg.slice(0, 120)}` };
      }
    }),
});
