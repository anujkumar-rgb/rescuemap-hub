import { Users, Truck, AlertTriangle, MapPin, Loader2 } from "lucide-react";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { SeverityBadge, severityFromStatus } from "@/components/SeverityBadge";
import { Sparkline } from "@/components/Sparkline";
import { WeatherCard } from "@/components/WeatherCard";
import { FieldUpdates } from "@/components/FieldUpdates";
import { ElapsedTimer } from "@/components/ElapsedTimer";
import { incidentElapsedStart } from "@/data/mock";
import { useState } from "react";
import { useTeamsQuery, useIncidentsQuery } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  {
    label: "Active Teams",
    value: 12,
    icon: Users,
    accent: "text-primary",
    bg: "bg-primary/10",
    trend: [4, 5, 6, 8, 9, 11, 12],
    trendColor: "text-primary",
  },
  {
    label: "Vehicles Deployed",
    value: 28,
    icon: Truck,
    accent: "text-info",
    bg: "bg-info/10",
    trend: [27, 28, 28, 27, 28, 29, 28],
    trendColor: "text-info",
  },
  {
    label: "Incidents Open",
    value: 7,
    icon: AlertTriangle,
    accent: "text-warning",
    bg: "bg-warning/10",
    trend: [14, 13, 12, 11, 10, 8, 7],
    trendColor: "text-success",
  },
  {
    label: "Areas Covered",
    value: 5,
    icon: MapPin,
    accent: "text-success",
    bg: "bg-success/10",
    trend: [2, 2, 3, 3, 4, 5, 5],
    trendColor: "text-success",
  },
];

export default function Dashboard() {
  const [selected, setSelected] = useState<string | null>(null);
  const { data: teams, isLoading: teamsLoading } = useTeamsQuery();
  const { data: incidents, isLoading: incidentsLoading } = useIncidentsQuery();
  const { session } = useAuth();

  console.log("Supabase Session:", session);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of all active rescue operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors shadow-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-3xl font-bold">{s.value}</div>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.bg} ${s.accent}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <Sparkline points={s.trend} className={`mt-3 ${s.trendColor}`} width={120} height={28} />
          </div>
        ))}
      </div>

      {/* Map + Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Field Map</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success pulse-blue" />
                Updated 3s ago
              </div>
            </div>
            <WeatherCard />
          </div>
          <MapPlaceholder
            className="h-[420px] w-full"
            onSelectTeam={setSelected}
            selectedTeam={selected}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Live Team Status</h2>
          {teamsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="space-y-2">
              {teams?.map((t) => (
                <li
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3 cursor-pointer hover:border-primary/40 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        t.color === "red" ? "bg-primary" : t.color === "blue" ? "bg-info" : "bg-success"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{t.zone}</div>
                    </div>
                  </div>
                  <StatusBadge variant={statusVariant(t.status)} dot={false}>
                    {t.status}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Incidents + Field Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Incidents</h2>
            <span className="text-xs text-muted-foreground">Last 24 hours</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium">Incident ID</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned Team</th>
                  <th className="px-4 py-3 text-left font-medium">Severity</th>
                  <th className="px-4 py-3 text-left font-medium">Elapsed</th>
                </tr>
              </thead>
              <tbody>
                {incidentsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2 text-muted-foreground" />
                      Loading incidents...
                    </td>
                  </tr>
                ) : (
                  incidents?.map((i) => (
                    <tr key={i.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{i.id}</td>
                      <td className="px-4 py-3">{i.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.type}</td>
                      <td className="px-4 py-3">{i.team}</td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={severityFromStatus(i.status)} />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <ElapsedTimer startMinutesAgo={incidentElapsedStart[i.id] ?? 0} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <FieldUpdates />
      </div>
    </div>
  );
}
