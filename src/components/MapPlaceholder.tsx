import { cn } from "@/lib/utils";
import { zoneRisk, type ZoneRisk } from "@/data/mock";
import { MapPin, Truck, AlertTriangle, Loader2 } from "lucide-react";
import { useTeamsQuery, useIncidentsQuery, useVehiclesQuery } from "@/hooks/useQueries";

interface Props {
  className?: string;
  onSelectTeam?: (id: string) => void;
  selectedTeam?: string | null;
  showVehicles?: boolean;
  showTeams?: boolean;
  showIncidents?: boolean;
}

const zones: { label: string; x: number; y: number }[] = [
  { label: "Zone A", x: 18, y: 30 },
  { label: "Zone B", x: 42, y: 50 },
  { label: "Zone C", x: 60, y: 22 },
  { label: "Zone D", x: 78, y: 18 },
  { label: "Zone E", x: 28, y: 78 },
];

const riskTint: Record<ZoneRisk, string> = {
  critical: "bg-primary/20 border-primary/40 text-primary",
  active: "bg-warning/20 border-warning/40 text-warning",
  clear: "bg-success/20 border-success/40 text-success",
};

export function MapPlaceholder({
  className,
  onSelectTeam,
  selectedTeam,
  showVehicles = true,
  showTeams = true,
  showIncidents = true,
}: Props) {
  const { data: teams, isLoading: teamsLoading } = useTeamsQuery();
  const { data: incidents, isLoading: incidentsLoading } = useIncidentsQuery();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehiclesQuery();

  const isLoading = teamsLoading || incidentsLoading || vehiclesLoading;

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border map-grid-lg", className)}>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* compass / scale */}
      <div className="absolute top-3 left-3 z-10 rounded-md bg-card/80 backdrop-blur px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border">
        MUMBAI METRO • LIVE
      </div>
      <div className="absolute top-3 right-3 z-10 rounded-md bg-card/80 backdrop-blur px-2 py-1 text-[10px] font-mono text-muted-foreground border border-border">
        19.07°N · 72.87°E
      </div>

      {/* Zone heat overlays */}
      {zones.map((z) => {
        const risk = zoneRisk[z.label] ?? "clear";
        return (
          <div
            key={z.label}
            className={cn(
              "absolute rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm",
              riskTint[risk]
            )}
            style={{ left: `${z.x}%`, top: `${z.y}%`, minWidth: "70px", textAlign: "center" }}
          >
            {z.label}
          </div>
        );
      })}

      {/* Heat legend */}
      <div className="absolute top-12 right-3 z-10 rounded-md bg-card/80 backdrop-blur px-2 py-1.5 text-[10px] border border-border">
        <div className="uppercase tracking-widest text-muted-foreground mb-1">Zone Heat</div>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-warning" /> Active</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-success" /> Clear</span>
        </div>
      </div>

      {/* Incident pins */}
      {showIncidents &&
        incidents?.filter(i => i.status !== 'Resolved').map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${Math.random() * 60 + 20}%`, top: `${Math.random() * 60 + 20}%` }} // Simplified for demo if no specific coordinates
            title={p.id}
          >
            <div className="relative h-7 w-7">
              <span className="ping-ring bg-primary/50" />
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground pulse-red">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}

      {/* Vehicle pins */}
      {showVehicles &&
        vehicles?.filter(v => v.status === 'Active').map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${Math.random() * 60 + 20}%`, top: `${Math.random() * 60 + 20}%` }}
            title={p.id}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground border-2 border-background">
              <Truck className="h-3 w-3" />
            </div>
          </div>
        ))}

      {/* Team pins */}
      {showTeams &&
        teams?.map((t) => {
          const colorBg =
            t.color === "red" ? "bg-primary" : t.color === "blue" ? "bg-info" : "bg-success";
          const ringColor =
            t.color === "red" ? "bg-primary/50" : t.color === "blue" ? "bg-info/50" : "bg-success/50";
          const isSel = selectedTeam === t.id;
          const showRing = t.color === "red" || t.color === "blue";
          return (
            <button
              key={t.id}
              onClick={() => onSelectTeam?.(t.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${t.pin_x}%`, top: `${t.pin_y}%` }}
            >
              <div className="relative h-6 w-6">
                {showRing && <span className={cn("ping-ring", ringColor)} />}
                <div
                  className={cn(
                    "relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-white transition-transform group-hover:scale-125",
                    colorBg,
                    isSel && "ring-2 ring-offset-2 ring-offset-background ring-white scale-125"
                  )}
                >
                  <MapPin className="h-3 w-3" />
                </div>
              </div>
              <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-card/90 px-1.5 py-0.5 text-[10px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity border border-border">
                {t.name}
              </div>
            </button>
          );
        })}
    </div>
  );
}
