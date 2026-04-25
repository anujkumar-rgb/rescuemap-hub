import { useMemo, useState } from "react";
import { Search, MapPin, Phone, Users as UsersIcon } from "lucide-react";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { teams, vehicles } from "@/data/mock";

const zones = ["All Zones", "Zone A (Dharavi)", "Zone B (Kurla)", "Zone C (Andheri)", "Zone D (Thane)", "Zone E (Borivali)"];
const statuses = ["All Status", "On Site", "En Route", "Returning", "Standby"];

export default function Teams() {
  const [q, setQ] = useState("");
  const [zone, setZone] = useState(zones[0]);
  const [status, setStatus] = useState(statuses[0]);

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      if (q && !`${t.name} ${t.leader}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (zone !== zones[0] && t.zone !== zone) return false;
      if (status !== statuses[0] && t.status !== status) return false;
      return true;
    });
  }, [q, zone, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rescue Teams &amp; Vehicles</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage active units and relief vehicles across all operational zones</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-card grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search team or leader..."
            className="w-full rounded-md bg-background border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="rounded-md bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {zones.map((z) => <option key={z}>{z}</option>)}
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-border bg-card p-5 shadow-card hover:border-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{t.id}</div>
                <h3 className="text-lg font-bold mt-0.5">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Led by {t.leader}</p>
              </div>
              <StatusBadge variant={statusVariant(t.status)}>{t.status}</StatusBadge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UsersIcon className="h-4 w-4" />
                <span><span className="text-foreground font-medium">{t.members}</span> members</span>
              </div>
              <div className="text-muted-foreground">
                <span className="text-foreground font-medium">{t.vehicle}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{t.zone}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                View on Map
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold hover:border-primary/40 transition-colors">
                <Phone className="h-3.5 w-3.5" /> Contact
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground text-sm">
            No teams match your filters.
          </div>
        )}
      </div>

      {/* Vehicles */}
      <div className="rounded-lg border border-border bg-card shadow-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Relief Vehicles</h2>
          <span className="text-xs text-muted-foreground">{vehicles.length} units</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium">Vehicle ID</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Driver</th>
                <th className="px-4 py-3 text-left font-medium">Current Location</th>
                <th className="px-4 py-3 text-left font-medium w-48">Fuel Status</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const fuelColor =
                  v.fuel < 25 ? "bg-primary" : v.fuel < 50 ? "bg-warning" : "bg-success";
                return (
                  <tr key={v.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{v.id}</td>
                    <td className="px-4 py-3">{v.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.driver}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${fuelColor} transition-all`} style={{ width: `${v.fuel}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">{v.fuel}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={statusVariant(v.status)}>{v.status}</StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
