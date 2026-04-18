import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { Users, Eye, MousePointerClick, TrendingUp, Wifi, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────
type Range = "24h" | "7d" | "30d" | "90d";
const RANGES: { label: string; value: Range }[] = [
  { label: "24 ч", value: "24h" },
  { label: "7 дней", value: "7d" },
  { label: "30 дней", value: "30d" },
  { label: "90 дней", value: "90d" },
];

const TEAL = "#13D6D1";
const TEAL_DIM = "#0d9e9a";
const COLORS = [TEAL, "#6366f1", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#ec4899"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtNum(n: number | undefined | null) {
  if (n == null) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
function fmtDuration(ms: number | undefined | null) {
  if (ms == null) return "—";
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}м ${sec}с` : `${sec}с`;
}
function bounceRate(bounces: number | undefined, visits: number | undefined) {
  if (!bounces || !visits) return "—";
  return `${Math.round((bounces / visits) * 100)}%`;
}
function fmtDate(iso: string, range: Range) {
  const d = new Date(iso);
  if (range === "24h") return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  if (range === "90d") return d.toLocaleDateString("ru", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color = TEAL,
}: { icon: React.ElementType; label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MockBadge({ isMock }: { isMock?: boolean }) {
  if (!isMock) return null;
  return (
    <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/40 bg-amber-500/5 ml-2">
      demo
    </Badge>
  );
}

function SectionHeader({ title, isMock }: { title: string; isMock?: boolean }) {
  return (
    <div className="flex items-center gap-1 mb-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <MockBadge isMock={isMock} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("7d");

  const utils = trpc.useUtils();

  const { data: status } = trpc.analytics.getStatus.useQuery();
  const { data: active, refetch: refetchActive } = trpc.analytics.getActiveVisitors.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: stats, isLoading: statsLoading } = trpc.analytics.getStats.useQuery({ range });
  const { data: pageviews, isLoading: pvLoading } = trpc.analytics.getPageviews.useQuery({ range });
  const { data: topPages } = trpc.analytics.getTopPages.useQuery({ range });
  const { data: referrers } = trpc.analytics.getTopReferrers.useQuery({ range });
  const { data: devices } = trpc.analytics.getDevices.useQuery({ range });
  const { data: countries } = trpc.analytics.getCountries.useQuery({ range });
  const { data: browsers } = trpc.analytics.getBrowsers.useQuery({ range });

  const chartData = (pageviews?.pageviews ?? []).map((pv, i) => ({
    date: fmtDate(pv.x, range),
    Просмотры: pv.y,
    Сессии: pageviews?.sessions?.[i]?.y ?? 0,
  }));

  const totalPv = stats?.pageviews ?? 0;
  const totalVisitors = stats?.visitors ?? 0;

  function handleRefresh() {
    utils.analytics.getStats.invalidate();
    utils.analytics.getPageviews.invalidate();
    utils.analytics.getTopPages.invalidate();
    utils.analytics.getTopReferrers.invalidate();
    utils.analytics.getDevices.invalidate();
    utils.analytics.getCountries.invalidate();
    utils.analytics.getBrowsers.invalidate();
    refetchActive();
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Аналитика</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Статистика посещаемости публичного сайта
            {status && !status.configured && (
              <span className="ml-2 text-amber-500">(демо-данные — Umami не подключён)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Range selector */}
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  range === r.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Обновить
          </Button>
        </div>
      </div>

      {/* ─── Config notice ──────────────────────────────────────────────── */}
      {status && !status.configured && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Umami Analytics не настроен</p>
            <p className="text-xs mt-0.5 text-amber-500/80">
              Добавьте переменные окружения <code className="font-mono">UMAMI_URL</code>,{" "}
              <code className="font-mono">UMAMI_USERNAME</code>,{" "}
              <code className="font-mono">UMAMI_PASSWORD</code>,{" "}
              <code className="font-mono">UMAMI_WEBSITE_ID</code> в Settings → Secrets, чтобы видеть реальные данные.
            </p>
          </div>
        </div>
      )}

      {/* ─── Active visitors ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="h-3 w-3" />
          {active?.visitors ?? "—"} онлайн сейчас
          <MockBadge isMock={active?.isMock} />
        </div>
      </div>

      {/* ─── Stats cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardContent className="pt-5 pb-4">
                <div className="h-3 bg-muted rounded w-2/3 mb-3" />
                <div className="h-7 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard icon={Eye} label="Просмотры страниц" value={fmtNum(stats?.pageviews)} />
            <StatCard icon={Users} label="Уникальные посетители" value={fmtNum(stats?.visitors)} color="#6366f1" />
            <StatCard icon={MousePointerClick} label="Сессии" value={fmtNum(stats?.visits)} color="#f59e0b" />
            <StatCard
              icon={TrendingUp}
              label="Ср. время на сайте"
              value={fmtDuration(stats?.totaltime && stats?.visits ? stats.totaltime / stats.visits : null)}
              sub={`Отказы: ${bounceRate(stats?.bounces, stats?.visits)}`}
              color="#10b981"
            />
          </>
        )}
      </div>

      {/* ─── Pageviews chart ────────────────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-semibold">Просмотры и сессии</CardTitle>
              <MockBadge isMock={pageviews?.isMock} />
            </div>
            <span className="text-xs text-muted-foreground">
              {fmtNum(totalPv)} просмотров · {fmtNum(totalVisitors)} посетителей
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {pvLoading ? (
            <div className="h-52 bg-muted/30 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" dataKey="Просмотры" stroke={TEAL} strokeWidth={2} fill="url(#pvGrad)" dot={false} />
                <Area type="monotone" dataKey="Сессии" stroke="#6366f1" strokeWidth={2} fill="url(#sessGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ─── Bottom grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top pages */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardContent className="pt-4 px-4 pb-4">
            <SectionHeader title="Топ страниц" isMock={topPages?.isMock} />
            <div className="space-y-2">
              {(topPages?.data ?? []).slice(0, 8).map((item, i) => {
                const maxY = topPages?.data?.[0]?.y ?? 1;
                const pct = Math.round((item.y / maxY) * 100);
                return (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-foreground truncate max-w-[70%]" title={item.x}>{item.x}</span>
                      <span className="text-muted-foreground font-medium">{fmtNum(item.y)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: TEAL }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardContent className="pt-4 px-4 pb-4">
            <SectionHeader title="Источники трафика" isMock={referrers?.isMock} />
            <div className="space-y-2">
              {(referrers?.data ?? []).slice(0, 8).map((item, i) => {
                const maxY = referrers?.data?.[0]?.y ?? 1;
                const pct = Math.round((item.y / maxY) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-foreground truncate max-w-[70%]">{item.x || "(прямой)"}</span>
                      <span className="text-muted-foreground font-medium">{fmtNum(item.y)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#6366f1" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Devices pie */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardContent className="pt-4 px-4 pb-4">
            <SectionHeader title="Устройства" isMock={devices?.isMock} />
            {devices?.data && devices.data.length > 0 ? (
              <div className="flex flex-col items-center gap-3">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={devices.data}
                      dataKey="y"
                      nameKey="x"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={60}
                      paddingAngle={3}
                    >
                      {devices.data.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                  {devices.data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                      {item.x} <span className="text-foreground font-medium">{fmtNum(item.y)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Нет данных</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Countries + Browsers ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Countries bar */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4 px-4 pb-4">
            <SectionHeader title="Страны" isMock={countries?.isMock} />
            {countries?.data && countries.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={countries.data.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="x" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="y" name="Посетители" radius={[0, 4, 4, 0]}>
                    {countries.data.slice(0, 8).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Browsers bar */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4 px-4 pb-4">
            <SectionHeader title="Браузеры" isMock={browsers?.isMock} />
            {browsers?.data && browsers.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={browsers.data.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="x" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="y" name="Посетители" radius={[0, 4, 4, 0]}>
                    {browsers.data.slice(0, 8).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">Нет данных</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
