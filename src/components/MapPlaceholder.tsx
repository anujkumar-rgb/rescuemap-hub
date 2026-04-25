import { cn } from "@/lib/utils";
import { teams, incidents, zoneRisk, type ZoneRisk } from "@/data/mock";
import { MapPin, Truck, AlertTriangle } from "lucide-react";

interface Props {
  className?: string;
  onSelectTeam?: (id: string) => void;
  selectedTeam?: string | null;
  showVehicles?: boolean;
  showTeams?: boolean;
  showIncidents?: boolean;
}

const incidentPins = [
  { id: "INC-1043", x: 25, y: 42 },
  { id: "INC-1042", x: 60, y: 28 },
  { id: "INC-1039", x: 32, y: 72 },
];

const vehiclePins = [
  { id: "V-201", x: 45, y: 50 },
  { id: "V-202", x: 62, y: 35 },
  { id: "V-204", x: 28, y: 68 },
];

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
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border map-grid-lg", className)}>
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
        incidentPins.map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
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
        vehiclePins.map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            title={p.id}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground border-2 border-background">
              <Truck className="h-3 w-3" />
            </div>
          </div>
        ))}

      {/* Team pins */}
      {showTeams &&
        teams.map((t) => {
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
              style={{ left: `${t.pin.x}%`, top: `${t.pin.y}%` }}
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
