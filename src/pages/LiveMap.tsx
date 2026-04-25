import { useState } from "react";
import { Search, Plus, MapPin, Users as UsersIcon, Truck, AlertTriangle } from "lucide-react";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { StatusBadge, statusVariant } from "@/components/StatusBadge";
import { teams } from "@/data/mock";
import { cn } from "@/lib/utils";

type Filter = "all" | "teams" | "vehicles" | "incidents";

const filters: { id: Filter; label: string; icon: any }[] = [
  { id: "all", label: "All", icon: MapPin },
  { id: "teams", label: "Rescue Teams", icon: UsersIcon },
  { id: "vehicles", label: "Vehicles", icon: Truck },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
];

export default function LiveMap() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("T-01");
  const selected = teams.find((t) => t.id === selectedId) ?? teams[0];

  const show = {
    teams: filter === "all" || filter === "teams",
    vehicles: filter === "all" || filter === "vehicles",
    incidents: filter === "all" || filter === "incidents",
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-card flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location, zone, or team..."
            className="w-full rounded-md bg-background border border-border pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium border transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary shadow-glow-red"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-glow-red transition-opacity">
          <Plus className="h-4 w-4" />
          Add Incident
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 relative">
          <MapPlaceholder
            className="h-[600px] w-full"
            onSelectTeam={setSelectedId}
            selectedTeam={selectedId}
            showTeams={show.teams}
            showVehicles={show.vehicles}
            showIncidents={show.incidents}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 rounded-lg border border-border bg-card/90 backdrop-blur p-3 shadow-card">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Legend</div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Incident</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-info" /> Rescue Team</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Vehicle</li>
            </ul>
          </div>
        </div>

        {/* Selected team panel */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-card h-fit">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Selected Unit</div>
          <h3 className="mt-1 text-xl font-bold">{selected.name}</h3>
          <div className="mt-1">
            <StatusBadge variant={statusVariant(selected.status)}>{selected.status}</StatusBadge>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Team Leader</dt>
              <dd className="font-medium">{selected.leader}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Members</dt>
              <dd className="font-medium">{selected.members} personnel</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Vehicle</dt>
              <dd className="font-medium">{selected.vehicle}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Current Location</dt>
              <dd className="font-medium">19.0{selected.pin.x}°N · 72.8{selected.pin.y}°E</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Assigned Zone</dt>
              <dd className="font-medium">{selected.zone}</dd>
            </div>
          </dl>

          <button className="mt-5 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-glow-red transition-opacity">
            Assign Route
          </button>
        </div>
      </div>
    </div>
  );
}
