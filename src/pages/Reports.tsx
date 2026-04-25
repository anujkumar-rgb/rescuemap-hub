import { FileBarChart, CheckCircle, Clock, Package } from "lucide-react";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { incidents, zoneStats, supplies } from "@/data/mock";
import { cn } from "@/lib/utils";

const supplyStatusVariant = (s: string): "green" | "amber" | "red" =>
  s === "Sufficient" ? "green" : s === "Low" ? "amber" : "red";

const supplyBarColor = (s: string) =>
  s === "Sufficient" ? "bg-success" : s === "Low" ? "bg-warning" : "bg-primary";

export default function Reports() {
  const total = incidents.length;
  const resolved = incidents.filter((i) => i.status === "Resolved").length;
  const avg = Math.round(incidents.reduce((a, b) => a + b.responseMin, 0) / total);
  const maxZone = Math.max(...zoneStats.map((z) => z.count));

  const cards = [
    { label: "Total Incidents", value: total, icon: FileBarChart, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Resolved", value: resolved, icon: CheckCircle, accent: "text-success", bg: "bg-success/10" },
    { label: "Avg Response Time", value: `${avg} min`, icon: Clock, accent: "text-info", bg: "bg-info/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Incident Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics and incident history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-5 shadow-card hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="mt-1 text-3xl font-bold">{c.value}</div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${c.bg} ${c.accent}`}>
                <c.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detailed Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium">Report ID</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">Team</th>
                  <th className="px-4 py-3 text-left font-medium">Response</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{i.id}</td>
                    <td className="px-4 py-3">{i.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.location}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.team}</td>
                    <td className="px-4 py-3 tabular-nums">{i.responseMin} min</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={statusVariant(i.status)}>{i.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <button className="rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold hover:border-primary/40 hover:text-primary transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bar chart */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Incidents by Zone</h2>
          <p className="text-xs text-muted-foreground mt-1">Past 30 days</p>

          <div className="mt-6 flex items-end justify-between gap-3 h-56">
            {zoneStats.map((z) => {
              const h = (z.count / maxZone) * 100;
              return (
                <div key={z.zone} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-bold tabular-nums">{z.count}</div>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-emergency hover:opacity-80 transition-all cursor-pointer"
                      style={{ height: `${h}%` }}
                      title={`${z.zone}: ${z.count}`}
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{z.zone}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
