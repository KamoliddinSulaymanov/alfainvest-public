import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, Newspaper, Image, ShieldCheck, MapPin, Users,
  Activity, Clock, TrendingUp
} from "lucide-react";

const metricCards = [
  { key: "totalPages", label: "Total Pages", icon: FileText, color: "text-blue-400" },
  { key: "publishedNews", label: "Published Articles", icon: Newspaper, color: "text-green-400" },
  { key: "totalMedia", label: "Media Files", icon: Image, color: "text-purple-400" },
  { key: "totalProducts", label: "Insurance Products", icon: ShieldCheck, color: "text-primary" },
  { key: "totalBranches", label: "Branch Offices", icon: MapPin, color: "text-orange-400" },
  { key: "totalUsers", label: "CMS Users", icon: Users, color: "text-pink-400" },
];

const actionColors: Record<string, string> = {
  created: "bg-green-500/10 text-green-400 border-green-500/20",
  updated: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  deleted: "bg-red-500/10 text-red-400 border-red-500/20",
  published: "bg-primary/10 text-primary border-primary/20",
  unpublished: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  uploaded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  reordered: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  role_changed: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  activated: "bg-green-500/10 text-green-400 border-green-500/20",
  deactivated: "bg-red-500/10 text-red-400 border-red-500/20",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardHome() {
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.getMetrics.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.dashboard.getRecentActivity.useQuery();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome to Alfa Invest CMS Admin Panel</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metricCards.map(({ key, label, icon: Icon, color }) => (
            <Card key={key} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center ${color}`} style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  {metricsLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {metrics?.[key as keyof typeof metrics] ?? 0}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Activity</h2>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {activityLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="divide-y divide-border">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize shrink-0 ${actionColors[item.action] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {item.action}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{item.userName}</span>
                        {" "}
                        <span className="text-muted-foreground">{item.action}</span>
                        {" "}
                        <span className="capitalize text-muted-foreground">{item.entity}</span>
                        {item.entityTitle && (
                          <span className="text-foreground"> "{item.entityTitle}"</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Actions will appear here as you use the CMS</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
