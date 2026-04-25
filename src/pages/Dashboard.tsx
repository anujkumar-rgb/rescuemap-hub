import { Users, Truck, AlertTriangle, MapPin } from "lucide-react";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { teams, incidents } from "@/data/mock";
import { useState } from "react";

const stats = [
  { label: "Active Teams", value: 12, icon: Users, accent: "text-primary", bg: "bg-primary/10" },
  { label: "Vehicles Deployed", value: 28, icon: Truck, accent: "text-info", bg: "bg-info/10" },
  { label: "Incidents Open", value: 7, icon: AlertTriangle, accent: "text-warning", bg: "bg-warning/10" },
  { label: "Areas Covered", value: 5, icon: MapPin, accent: "text-success", bg: "bg-success/10" },
];

export default function Dashboard() {
  const [selected, setSelected] = useState<string | null>(null);

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
          </div>
        ))}
      </div>

      {/* Map + Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Field Map</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success pulse-blue" />
              Updated 3s ago
            </div>
          </div>
          <MapPlaceholder
            className="h-[420px] w-full"
            onSelectTeam={setSelected}
            selectedTeam={selected}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Live Team Status</h2>
          <ul className="space-y-2">
            {teams.map((t) => (
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
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="rounded-lg border border-border bg-card shadow-card">
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
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{i.id}</td>
                  <td className="px-4 py-3">{i.location}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.type}</td>
                  <td className="px-4 py-3">{i.team}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={statusVariant(i.status)}>{i.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{i.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
